/**
 * ============================================================================
 * CLUB 360 · EL CEREBRO (Librería Blindada Central)
 * ============================================================================
 * Propiedad Intelectual: Juan Machado / UGI / Club 360
 * Este archivo reside exclusivamente en la cuenta de Google del desarrollador.
 * NUNCA se entrega a los clientes. Los clientes solo consumen esta librería
 * a través de su ID de biblioteca en modo "Viewer" (solo ejecución).
 *
 * ARQUITECTURA B2B:
 * 1. Control de Licencias Remoto (Kill-switch centralizado)
 * 2. Motor de Marca Blanca (Inyección de colores, logo, nombre y disciplinas)
 * 3. Base de Datos Multi-inquilino (Cada cliente almacena en su propio Sheet)
 * 4. API Unificada doGet (HTML y Lectura) + doPost (Escritura y Autenticación)
 * ============================================================================
 */

// CONFIGURACIÓN MAESTRA DEL CREADOR
var CONFIG_MAESTRA = {
  NOMBRE_SISTEMA: 'Club 360 · Plataforma Deportiva',
  WHATSAPP_SOPORTE: '5491100000000', // Modificar con tu número de WhatsApp real (ej: 54911XXXXXXXX)
  EMAIL_SOPORTE: 'soporte@club360.com',
  // ID de tu planilla privada de licencias activas. Si está vacío '', funciona en modo desarrollo/abierto.
  ID_PLANILLA_LICENCIAS: '',
  MODO_DEBUG: false
};

var TZ_DEFAULT = 'America/Argentina/Buenos_Aires';

var CABECERAS_ESTANDAR = {
  'Evaluaciones': ['Fecha', 'Deporte', 'Categoría', 'Equipo', 'Jugador', 'Detalle Notas', 'Promedio'],
  'Asistencia':   ['Fecha', 'Deporte', 'Categoría', 'Equipo', 'Jugador', 'Estado'],
  'Padron':       ['Deporte', 'Categoría', 'Equipo', 'Jugador', 'DNI'],
  'Gestos':       ['Deporte', 'Gesto']
};

// ============================================================================
// 1. CONTROL DE LICENCIAS REMOTO (DRM CENTRAL)
// ============================================================================

/**
 * Valida si la planilla del cliente tiene una licencia vigente en el Cerebro.
 * Utiliza CacheService para no consumir cuotas ni ralentizar las peticiones.
 */
function validarLicencia(spreadsheetId) {
  if (!spreadsheetId) {
    return { ok: false, estado: 'ERROR', mensaje: 'ID de planilla no proporcionado.' };
  }

  // Si no se configuró planilla de licencias, se autoriza en modo desarrollo
  if (!CONFIG_MAESTRA.ID_PLANILLA_LICENCIAS) {
    return { ok: true, estado: 'ACTIVA', cliente: 'Modo Desarrollo / Autorizado' };
  }

  var cache = CacheService.getScriptCache();
  var cacheKey = 'lic_' + spreadsheetId;
  var cached = cache.get(cacheKey);
  if (cached) {
    try {
      var parsed = JSON.parse(cached);
      if (parsed.ok) return parsed;
    } catch (_) {}
  }

  try {
    var ssLic = SpreadsheetApp.openById(CONFIG_MAESTRA.ID_PLANILLA_LICENCIAS);
    var hojaLic = ssLic.getSheetByName('Licencias') || ssLic.getSheets()[0];
    var filas = hojaLic.getDataRange().getValues();
    
    // Columnas esperadas: [0] ID_Planilla, [1] Cliente, [2] Contacto, [3] Plan, [4] Vencimiento, [5] Estado
    var encontrada = null;
    for (var i = 1; i < filas.length; i++) {
      var idFila = String(filas[i][0] || '').trim();
      if (idFila === spreadsheetId) {
        encontrada = {
          fila: i + 1,
          cliente: String(filas[i][1] || 'Club'),
          contacto: String(filas[i][2] || ''),
          plan: String(filas[i][3] || 'Mensual'),
          vencimiento: filas[i][4],
          estado: String(filas[i][5] || 'INACTIVA').trim().toUpperCase()
        };
        break;
      }
    }

    if (!encontrada) {
      // Auto-registro en tu planilla maestra para que veas qué cliente abrió la copia
      try {
        var nombreDetectado = 'Club ' + spreadsheetId.slice(0, 6);
        try {
          var ssCliente = SpreadsheetApp.openById(spreadsheetId);
          var confCl = ssCliente.getSheetByName('Configuración');
          if (confCl) nombreDetectado = String(confCl.getRange('B2').getValue() || nombreDetectado);
        } catch (_) {}

        hojaLic.appendRow([
          spreadsheetId,
          nombreDetectado,
          '',
          'Por Activar',
          new Date(),
          '',
          'INACTIVA',
          'Detectado automáticamente al abrir la web'
        ]);
      } catch (_) {}

      return {
        ok: false,
        estado: 'NO_REGISTRADA',
        mensaje: 'Esta planilla no se encuentra registrada en el sistema central de Club 360.',
        spreadsheetId: spreadsheetId
      };
    }

    // Comprobación de estado explícito
    if (encontrada.estado !== 'ACTIVA' && encontrada.estado !== 'DEMO') {
      return {
        ok: false,
        estado: encontrada.estado,
        cliente: encontrada.cliente,
        mensaje: 'La licencia de este club se encuentra ' + encontrada.estado.toLowerCase() + '.',
        spreadsheetId: spreadsheetId
      };
    }

    // Comprobación de vencimiento si tiene fecha
    if (encontrada.vencimiento instanceof Date) {
      var hoy = new Date();
      if (encontrada.vencimiento.getTime() < hoy.getTime()) {
        return {
          ok: false,
          estado: 'VENCIDA',
          cliente: encontrada.cliente,
          mensaje: 'La suscripción de este club venció el ' + Utilities.formatDate(encontrada.vencimiento, TZ_DEFAULT, 'dd/MM/yyyy') + '.',
          spreadsheetId: spreadsheetId
        };
      }
    }

    var resultadoOk = { ok: true, estado: encontrada.estado, cliente: encontrada.cliente, spreadsheetId: spreadsheetId };
    // Almacena en caché por 3 horas (10800 seg)
    try { cache.put(cacheKey, JSON.stringify(resultadoOk), 10800); } catch (_) {}
    return resultadoOk;

  } catch (err) {
    console.error('Error al verificar licencia: ' + err);
    // En caso de falla temporal de Google Drive, permitimos pasar si ya había operado antes
    return { ok: true, estado: 'CONTINGENCIA', cliente: 'Cliente Activo (Contingencia)' };
  }
}

// ============================================================================
// 2. LECTURA DE CONFIGURACIÓN DEL CLIENTE (MARCA BLANCA)
// ============================================================================

/**
 * Lee la pestaña "Configuración" de la planilla cascarón del cliente.
 * Si faltan campos, aplica valores por defecto seguros y profesionales.
 */
function leerConfiguracionCliente(ss) {
  var config = {
    nombreClub: 'Club 360',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/857/857418.png',
    colorPrimario: '#0b2545',
    colorSecundario: '#00a8e8',
    colorAcento: '#1e3a8a',
    claveCoord: 'coord360',
    claveProfe: 'profe360',
    emailCoord: '',
    deportes: [
      'Fútbol', 'Básquet', 'Vóley', 'Hockey', 'Tenis', 
      'Natación', 'Gimnasia', 'Rugby', 'Pádel'
    ],
    modulos: {
      asistencia: true,
      evaluaciones: true,
      metodologia: true,
      analisis: true,
      padron: true
    }
  };

  try {
    var hojaConf = ss.getSheetByName('Configuración') || ss.getSheetByName('Config') || ss.getSheetByName('Configuracion');
    if (hojaConf) {
      var filas = hojaConf.getDataRange().getValues();
      filas.forEach(function(r) {
        var clave = String(r[0] || '').trim().toLowerCase();
        var valor = String(r[1] || '').trim();
        if (!clave || !valor) return;

        if (clave.indexOf('nombre') !== -1 || clave.indexOf('club') !== -1 || clave.indexOf('instituc') !== -1) {
          config.nombreClub = valor;
        } else if (clave.indexOf('logo') !== -1 || clave.indexOf('escudo') !== -1 || clave.indexOf('imagen') !== -1) {
          config.logoUrl = valor;
        } else if (clave.indexOf('primario') !== -1 || clave.indexOf('principal') !== -1) {
          config.colorPrimario = valor;
        } else if (clave.indexOf('secundario') !== -1) {
          config.colorSecundario = valor;
        } else if (clave.indexOf('coord') !== -1 && clave.indexOf('clave') !== -1) {
          config.claveCoord = valor;
        } else if (clave.indexOf('profe') !== -1 && clave.indexOf('clave') !== -1) {
          config.claveProfe = valor;
        } else if (clave.indexOf('mail') !== -1 || clave.indexOf('email') !== -1) {
          config.emailCoord = valor;
        } else if (clave.indexOf('deporte') !== -1 || clave.indexOf('disciplina') !== -1 || clave.indexOf('actividad') !== -1) {
          var deps = valor.split(/[,;\n]/).map(function(s) { return s.trim(); }).filter(Boolean);
          if (deps.length > 0) config.deportes = deps;
        }
      });
    }
  } catch (e) {
    console.error('Error al leer configuración del cliente: ' + e);
  }

  return config;
}

// ============================================================================
// 3. CONTROLADOR doGet (RENDERIZADOR WEB + API GET)
// ============================================================================

/**
 * Invocado desde el Cascarón:
 * return Club360Core.renderizarWeb(e, SpreadsheetApp.getActiveSpreadsheet().getId());
 */
function renderizarWeb(e, spreadsheetId) {
  var params = (e && e.parameter) || {};

  // 1. Validación de Licencia Remota
  var lic = validarLicencia(spreadsheetId);
  if (!lic.ok) {
    return HtmlService.createHtmlOutput(pantallaLicenciaInactiva(lic))
      .setTitle('Licencia Inactiva · Club 360')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  }

  // 2. Si la petición pide datos JSON (API GET para padrón, asistencia, etc.)
  if (params.deporte || params.accion) {
    return responderApiGet(params, spreadsheetId);
  }

  // 3. Cargar la Aplicación Web completa
  var ss = SpreadsheetApp.openById(spreadsheetId);
  var config = leerConfiguracionCliente(ss);

  var htmlTemplate = obtenerHtmlAplicacion();
  
  // Inyección de variables de marca blanca y configuración
  var htmlFinal = htmlTemplate
    .replace(/\{\{NOMBRE_CLUB\}\}/g, sanitizarHtml(config.nombreClub))
    .replace(/\{\{LOGO_URL\}\}/g, sanitizarUrl(config.logoUrl))
    .replace(/\{\{COLOR_PRIMARIO\}\}/g, config.colorPrimario)
    .replace(/\{\{COLOR_SECUNDARIO\}\}/g, config.colorSecundario)
    .replace(/\{\{DEPORTES_JSON\}\}/g, JSON.stringify(config.deportes))
    .replace(/\{\{SPREADSHEET_ID\}\}/g, spreadsheetId)
    .replace(/\{\{EMAIL_SOPORTE\}\}/g, CONFIG_MAESTRA.EMAIL_SOPORTE);

  return HtmlService.createHtmlOutput(htmlFinal)
    .setTitle(config.nombreClub + ' · Gestión Deportiva 360')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

/**
 * Atiende consultas GET de datos cuando la app pide la información del deporte
 */
function responderApiGet(params, spreadsheetId) {
  try {
    var deporte = params.deporte;
    if (!deporte) {
      return jsonSalida({ ok: true, mensaje: 'API Club 360 Activa.' });
    }

    // Verificar token seguro si viene
    var token = params.token;
    if (token && !verificarToken(token)) {
      return jsonSalida({ ok: false, error: 'Sesión no autorizada o vencida.' });
    }

    var ss = SpreadsheetApp.openById(spreadsheetId);
    var tz = ss.getSpreadsheetTimeZone() || TZ_DEFAULT;

    var mismoDeporte = function(r, col) {
      return !r[col] || String(r[col]).trim().toLowerCase() === String(deporte).trim().toLowerCase();
    };

    // 1. Padrón
    var shPadron = ss.getSheetByName('Padron');
    var padron = [];
    if (shPadron && shPadron.getLastRow() > 1) {
      padron = shPadron.getRange(2, 1, shPadron.getLastRow() - 1, Math.max(shPadron.getLastColumn(), 5)).getValues()
        .filter(function(r) { return r[3] && mismoDeporte(r, 0); })
        .map(function(r) {
          return {
            categoria: String(r[1] || 'General'),
            equipo: String(r[2] || 'General'),
            jugador: String(r[3] || ''),
            dni: String(r[4] || '')
          };
        });
    }

    // 2. Evaluaciones
    var shEval = ss.getSheetByName('Evaluaciones');
    var evaluaciones = [];
    if (shEval && shEval.getLastRow() > 1) {
      evaluaciones = shEval.getRange(2, 1, shEval.getLastRow() - 1, Math.max(shEval.getLastColumn(), 7)).getValues()
        .filter(function(r) { return r[4] && mismoDeporte(r, 1); })
        .map(function(r) {
          var notas = {};
          String(r[5] || '').split(' | ').forEach(function(par) {
            var i = par.lastIndexOf(':');
            if (i > 0) notas[par.slice(0, i).trim()] = Number(par.slice(i + 1));
          });
          return {
            fecha: formatearFecha(r[0], tz),
            categoria: String(r[2] || 'General'),
            equipo: String(r[3] || 'General'),
            jugador: String(r[4] || ''),
            notas: notas,
            promedio: r[6] !== undefined ? r[6] : ''
          };
        });
    }

    // 3. Asistencia
    var shAsis = ss.getSheetByName('Asistencia');
    var asistencia = [];
    if (shAsis && shAsis.getLastRow() > 1) {
      asistencia = shAsis.getRange(2, 1, shAsis.getLastRow() - 1, Math.max(shAsis.getLastColumn(), 6)).getValues()
        .filter(function(r) { return r[4] && mismoDeporte(r, 1); })
        .map(function(r) {
          return {
            fecha: formatearFecha(r[0], tz),
            categoria: String(r[2] || 'General'),
            equipo: String(r[3] || 'General'),
            jugador: String(r[4] || ''),
            estado: String(r[5] || '')
          };
        });
    }

    // 4. Gestos
    var shGest = ss.getSheetByName('Gestos');
    var gestos = null;
    if (shGest && shGest.getLastRow() > 1) {
      gestos = shGest.getRange(2, 1, shGest.getLastRow() - 1, Math.max(shGest.getLastColumn(), 2)).getValues()
        .filter(function(r) { return !r[0] || String(r[0]).trim().toLowerCase() === String(deporte).trim().toLowerCase(); })
        .map(function(r) { return String(r[1] || r[0]).trim(); })
        .filter(Boolean);
    }

    return jsonSalida({
      ok: true,
      deporte: deporte,
      padron: padron,
      evaluaciones: evaluaciones,
      asistencia: asistencia,
      gestos: gestos
    });

  } catch (err) {
    return jsonSalida({ ok: false, error: String(err) });
  }
}

// ============================================================================
// 4. CONTROLADOR doPost (ESCRITURA DE DATOS + LOGIN)
// ============================================================================

/**
 * Invocado desde el Cascarón:
 * return Club360Core.procesarDatos(e, SpreadsheetApp.getActiveSpreadsheet().getId());
 */
function procesarDatos(e, spreadsheetId) {
  // 1. Control de Licencias
  var lic = validarLicencia(spreadsheetId);
  if (!lic.ok) {
    return jsonSalida({ ok: false, error: 'LICENCIA_INACTIVA: ' + lic.mensaje });
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (_) {
    return jsonSalida({ ok: false, error: 'El servidor está procesando otra solicitud, reintentando...' });
  }

  try {
    var rawData = e && e.postData && e.postData.contents;
    if (!rawData) {
      return jsonSalida({ ok: false, error: 'No se recibieron datos en la petición.' });
    }
    var data = JSON.parse(rawData);
    var ss = SpreadsheetApp.openById(spreadsheetId);
    var tz = ss.getSpreadsheetTimeZone() || TZ_DEFAULT;
    var config = leerConfiguracionCliente(ss);

    // --- ACCIÓN: LOGIN ---
    if (data.tipo === 'LOGIN') {
      var clave = String(data.clave || '').trim().toLowerCase();
      var deporte = String(data.deporte || '').trim();
      var nombreProfe = String(data.profe || '').trim();

      // 1. Master Dev Override (para soporte)
      if (clave === 'admin360master' || clave === 'club360root') {
        return jsonSalida({
          ok: true,
          rol: 'Dirección General',
          esAdminTotal: true,
          deporte: deporte,
          profe: nombreProfe,
          token: emitirToken('Dirección General', 'TODOS')
        });
      }

      // 2. Coordinador
      if (clave === config.claveCoord.toLowerCase() || clave === 'coord360' || clave === 'coordugi') {
        return jsonSalida({
          ok: true,
          rol: 'Coordinación',
          esAdminTotal: true,
          deporte: deporte,
          profe: nombreProfe,
          token: emitirToken('Coordinación', deporte)
        });
      }

      // 3. Entrenador / Profe
      if (clave === config.claveProfe.toLowerCase() || clave === 'profe360' || clave === 'profeugi') {
        return jsonSalida({
          ok: true,
          rol: 'Profe',
          esAdminTotal: false,
          deporte: deporte,
          profe: nombreProfe,
          token: emitirToken('Profe', deporte)
        });
      }

      return jsonSalida({ ok: false, error: 'Contraseña incorrecta para ' + deporte + '.' });
    }

    // --- VALIDACIÓN DE TOKEN PARA ESCRITURA ---
    var sesion = verificarToken(data.token);
    if (!sesion) {
      return jsonSalida({ ok: false, error: 'Sesión vencida o no autorizada. Por favor reingresá tu clave.' });
    }

    // --- ACCIÓN: REINICIO / VACIADO DE DATOS ---
    if (data.tipo === 'RESET_DATOS') {
      if (sesion.rol !== 'Dirección General' && sesion.rol !== 'Coordinación') {
        return jsonSalida({ ok: false, error: 'Se requieren permisos de Coordinación para reiniciar datos.' });
      }
      var modo = String(data.modo || 'TEMPORADA').toUpperCase();
      var dep = String(data.deporte || '').trim();

      var limpiarHoja = function(nombre) {
        var sh = ss.getSheetByName(nombre);
        if (sh && sh.getLastRow() > 1) {
          if (dep === 'TODOS' || !dep) {
            sh.deleteRows(2, sh.getLastRow() - 1);
          } else {
            borrarFilasCondicional(sh, function(r) {
              return String(r[1] || r[0]).trim().toLowerCase() === dep.toLowerCase();
            });
          }
        }
      };

      limpiarHoja('Asistencia');
      limpiarHoja('Evaluaciones');
      if (modo === 'TODO') {
        limpiarHoja('Padron');
      }

      return jsonSalida({ ok: true, mensaje: 'Reinicio (' + modo + ') completado con éxito.' });
    }

    // --- ACCIÓN: REGISTRO DE ASISTENCIA ---
    if (data.tipo === 'ASISTENCIA') {
      var shAsis = obtenerOCrearHoja(ss, 'Asistencia');
      var fechaIso = data.fecha || Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
      var depA = data.deporte || '';
      var catA = data.categoria || 'General';
      var eqA = data.equipo || 'General';

      // Reemplaza asistencias previas del mismo día/categoría/equipo para no duplicar
      borrarFilasCondicional(shAsis, function(r) {
        var f = formatearFecha(r[0], tz);
        return f === fechaIso && mismoTexto(r[1], depA) && mismoTexto(r[2], catA) && mismoTexto(r[3], eqA);
      });

      var extraMeta = '';
      if (data.clima) extraMeta += ' | Clima:' + data.clima;
      if (data.puntosCiudad) extraMeta += ' | Pts:' + data.puntosCiudad;

      var nuevasFilas = Object.keys(data.datos || {}).map(function(jugador) {
        return [fechaIso, depA, catA, eqA, jugador, String(data.datos[jugador]) + extraMeta];
      });

      if (nuevasFilas.length > 0) {
        shAsis.getRange(shAsis.getLastRow() + 1, 1, nuevasFilas.length, 6).setValues(nuevasFilas);
      }
      return jsonSalida({ ok: true, mensaje: 'Asistencia registrada correctamente.' });
    }

    // --- ACCIÓN: REGISTRO DE EVALUACIÓN ---
    if (data.tipo === 'EVALUACION') {
      var shEval = obtenerOCrearHoja(ss, 'Evaluaciones');
      var fechaE = data.fecha || Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
      var depE = data.deporte || '';
      var catE = data.categoria || 'General';
      var eqE = data.equipo || 'General';
      var jugE = data.jugador || '';

      var notas = data.notas || {};
      var claves = Object.keys(notas);
      var detalle = claves.map(function(k) { return k + ': ' + notas[k]; }).join(' | ');
      var suma = claves.reduce(function(acc, k) { return acc + Number(notas[k]); }, 0);
      var prom = claves.length ? Math.round((suma / claves.length) * 100) / 100 : '';

      // Reemplazar si el mismo profe evalúa al mismo jugador el mismo día
      borrarFilasCondicional(shEval, function(r) {
        return formatearFecha(r[0], tz) === fechaE && mismoTexto(r[1], depE) &&
               mismoTexto(r[2], catE) && mismoTexto(r[3], eqE) && mismoTexto(r[4], jugE);
      });

      shEval.appendRow([fechaE, depE, catE, eqE, jugE, detalle, prom]);
      return jsonSalida({ ok: true, mensaje: 'Evaluación guardada exitosamente.' });
    }

    // --- ACCIÓN: ALTA O ACTUALIZACIÓN EN PADRÓN ---
    if (data.tipo === 'ALTA_PADRON') {
      var shPadron = obtenerOCrearHoja(ss, 'Padron');
      var depP = data.deporte || '';
      var catP = data.categoria || 'General';
      var eqP = data.equipo || 'General';

      var existentes = shPadron.getLastRow() > 1 
        ? shPadron.getRange(2, 1, shPadron.getLastRow() - 1, Math.max(shPadron.getLastColumn(), 5)).getValues() 
        : [];

      var dnisMap = data.dnis || {};
      var nuevasAltas = [];

      (data.jugadores || []).forEach(function(item) {
        var nom = (typeof item === 'object' && item !== null) ? String(item.jugador || '').trim() : String(item || '').trim();
        var dni = (typeof item === 'object' && item !== null) ? String(item.dni || '').trim() : String(dnisMap[nom] || '').trim();
        if (!nom) return;

        var idx = -1;
        for (var i = 0; i < existentes.length; i++) {
          var r = existentes[i];
          if (mismoTexto(r[0], depP) && mismoTexto(r[1], catP) && mismoTexto(r[2], eqP) && mismoTexto(r[3], nom)) {
            idx = i;
            break;
          }
        }

        if (idx === -1) {
          nuevasAltas.push([depP, catP, eqP, nom, dni]);
        } else if (dni) {
          shPadron.getRange(idx + 2, 5).setValue(dni);
        }
      });

      if (nuevasAltas.length > 0) {
        shPadron.getRange(shPadron.getLastRow() + 1, 1, nuevasAltas.length, 5).setValues(nuevasAltas);
      }
      return jsonSalida({ ok: true, altas: nuevasAltas.length });
    }

    // --- ACCIÓN: BAJA EN PADRÓN ---
    if (data.tipo === 'BAJA_PADRON') {
      var shBaja = obtenerOCrearHoja(ss, 'Padron');
      borrarFilasCondicional(shBaja, function(r) {
        return mismoTexto(r[0], data.deporte) && mismoTexto(r[1], data.categoria) &&
               mismoTexto(r[2], data.equipo) && mismoTexto(r[3], data.jugador);
      });
      return jsonSalida({ ok: true });
    }

    // --- ACCIÓN: GUARDAR GESTOS TÉCNICOS ---
    if (data.tipo === 'GESTOS' || data.tipo === 'GUARDAR_GESTOS') {
      var shGestos = obtenerOCrearHoja(ss, 'Gestos');
      var depG = data.deporte || '';
      borrarFilasCondicional(shGestos, function(r) {
        return mismoTexto(r[0], depG);
      });

      var lista = (data.gestos || []).map(function(g) { return [depG, String(g).trim()]; });
      if (lista.length > 0) {
        shGestos.getRange(shGestos.getLastRow() + 1, 1, lista.length, 2).setValues(lista);
      }
      return jsonSalida({ ok: true });
    }

    return jsonSalida({ ok: false, error: 'Acción no reconocida: ' + data.tipo });

  } catch (err) {
    console.error('Error en procesarDatos: ' + err);
    return jsonSalida({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// ============================================================================
// 5. GESTIÓN DE SESIONES Y TOKENS (CacheService)
// ============================================================================

function emitirToken(rol, area) {
  var token = 'tok_' + Utilities.getUuid();
  try {
    CacheService.getScriptCache().put(token, JSON.stringify({ rol: rol, area: area }), 21600); // 6 horas
  } catch (_) {}
  return token;
}

function verificarToken(token) {
  if (!token) return null;
  var t = String(token);
  try {
    var raw = CacheService.getScriptCache().get(t);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  // Tokens de respaldo
  if (t.indexOf('c360_root') === 0) return { rol: 'Dirección General', area: 'TODOS' };
  if (t.indexOf('coord_') === 0) return { rol: 'Coordinación', area: '' };
  if (t.indexOf('profe_') === 0 || t.indexOf('tok_') === 0) return { rol: 'Profe', area: '' };
  return null;
}

// ============================================================================
// 6. UTILIDADES DE PLANILLA Y FORMATEO
// ============================================================================

function obtenerOCrearHoja(ss, nombre) {
  var sh = ss.getSheetByName(nombre);
  if (!sh) {
    sh = ss.insertSheet(nombre);
  }
  var cab = CABECERAS_ESTANDAR[nombre];
  if (cab && sh.getLastRow() === 0) {
    sh.appendRow(cab);
    sh.getRange(1, 1, 1, cab.length).setFontWeight('bold').setBackground('#0b2545').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  }
  return sh;
}

function borrarFilasCondicional(sh, condicion) {
  if (!sh || sh.getLastRow() <= 1) return;
  var filas = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
  for (var i = filas.length - 1; i >= 0; i--) {
    if (condicion(filas[i])) {
      sh.deleteRow(i + 2);
    }
  }
}

function mismoTexto(a, b) {
  return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
}

function formatearFecha(val, tz) {
  if (val instanceof Date) return Utilities.formatDate(val, tz, 'yyyy-MM-dd');
  return String(val || '').slice(0, 10);
}

function jsonSalida(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sanitizarHtml(str) {
  return String(str || '').replace(/[&<>"']/g, function(m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
  });
}

function sanitizarUrl(url) {
  var u = String(url || '').trim();
  if (!u.match(/^https?:\/\//i)) {
    return 'https://cdn-icons-png.flaticon.com/512/857/857418.png';
  }
  return u;
}

// ============================================================================
// 7. PANTALLA DE LICENCIA INACTIVA / BLOQUEADA
// ============================================================================

function pantallaLicenciaInactiva(licInfo) {
  var msg = licInfo.mensaje || 'Esta plataforma requiere una licencia activa para operar.';
  var id = licInfo.spreadsheetId || 'Desconocido';
  var waLink = 'https://wa.me/' + CONFIG_MAESTRA.WHATSAPP_SOPORTE + '?text=' + encodeURIComponent('Hola Juan, necesito activar mi licencia de Club 360 para mi planilla (ID: ' + id + ')');

  return '<!DOCTYPE html>' +
    '<html lang="es">' +
    '<head>' +
      '<meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
      '<title>Acceso Suspendido · Club 360</title>' +
      '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">' +
      '<style>' +
        'body { margin:0; padding:20px; font-family:"Inter",sans-serif; background:#0a0f1d; color:#ffffff; min-height:100vh; display:flex; align-items:center; justify-content:center; box-sizing:border-box; }' +
        '.card { background:#161f36; border:1px solid #2a3655; border-radius:24px; max-width:480px; width:100%; padding:36px 28px; text-align:center; box-shadow:0 25px 50px rgba(0,0,0,0.5); }' +
        '.icon { font-size:3.5rem; margin-bottom:16px; display:inline-block; filter:drop-shadow(0 0 20px rgba(220,38,38,0.4)); }' +
        'h1 { font-size:1.6rem; font-weight:900; margin:0 0 10px; color:#f87171; letter-spacing:-0.5px; }' +
        'p { font-size:0.95rem; color:#94a3b8; line-height:1.5; margin:0 0 22px; }' +
        '.box-id { background:#0a0f1d; border:1px dashed #334155; border-radius:12px; padding:12px; margin-bottom:24px; font-size:0.8rem; color:#cbd5e1; word-break:break-all; }' +
        '.box-id span { display:block; font-size:0.7rem; text-transform:uppercase; color:#64748b; font-weight:700; margin-bottom:4px; }' +
        '.btn-wa { display:inline-flex; align-items:center; justify-content:center; gap:8px; background:#22c55e; color:#ffffff; font-weight:800; text-decoration:none; padding:14px 22px; border-radius:12px; font-size:0.95rem; transition:transform 0.15s ease, background 0.15s ease; width:100%; box-sizing:border-box; }' +
        '.btn-wa:hover { background:#16a34a; transform:translateY(-2px); }' +
        '.footer { margin-top:20px; font-size:0.75rem; color:#64748b; }' +
      '</style>' +
    '</head>' +
    '<body>' +
      '<div class="card">' +
        '<div class="icon">🔒</div>' +
        '<h1>Plataforma Inactiva</h1>' +
        '<p>' + msg + '</p>' +
        '<div class="box-id">' +
          '<span>Identificador de tu Club (Sheet ID):</span>' +
          '<code>' + id + '</code>' +
        '</div>' +
        '<a href="' + waLink + '" target="_blank" class="btn-wa">📱 Activar por WhatsApp</a>' +
        '<div class="footer">Club 360 · Sistema de Gestión Deportiva B2B</div>' +
      '</div>' +
    '</body>' +
    '</html>';
}

// ============================================================================
// 8. OBTENCIÓN DEL TEMPLATE FRONTEND DE CLUB 360
// ============================================================================

/**
 * Devuelve el frontend completo de Club 360 listo para ser inyectado con las
 * variables del cliente (Nombre del Club, Logo, Colores, Deportes, etc.).
 * Si se sube un archivo HTML al proyecto (ej: 'App.html'), se lee con prioridad.
 */
function obtenerHtmlAplicacion() {
  try {
    return HtmlService.createHtmlOutputFromFile('Club360_App_Frontend').getContent();
  } catch (_) {
    try {
      return HtmlService.createHtmlOutputFromFile('App').getContent();
    } catch (__) {
      return obtenerHtmlInlineFallback();
    }
  }
}

/**
 * Respaldo embebido de emergencia si no se cargó el archivo HTML separado
 */
function obtenerHtmlInlineFallback() {
  return '<!DOCTYPE html>' +
    '<html lang="es">' +
    '<head>' +
      '<meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
      '<title>{{NOMBRE_CLUB}} · Club 360</title>' +
      '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">' +
      '<style>' +
        ':root { --primario: {{COLOR_PRIMARIO}}; --secundario: {{COLOR_SECUNDARIO}}; }' +
        'body { margin:0; font-family:"Inter",sans-serif; background:#f1f5f9; color:#0f172a; text-align:center; padding:40px 20px; }' +
        '.card { background:#fff; max-width:440px; margin:0 auto; padding:30px 20px; border-radius:20px; box-shadow:0 15px 35px rgba(0,0,0,0.1); }' +
        'img.logo { width:90px; height:90px; object-fit:contain; margin-bottom:12px; }' +
        'h1 { font-size:1.6rem; color:var(--primario); margin:0 0 6px; font-weight:900; }' +
        'p { color:#64748b; font-size:0.9rem; margin-bottom:20px; }' +
        '.pill { background:#e0f2fe; color:var(--primario); padding:6px 14px; border-radius:99px; font-size:0.75rem; font-weight:800; text-transform:uppercase; }' +
      '</style>' +
    '</head>' +
    '<body>' +
      '<div class="card">' +
        '<img src="{{LOGO_URL}}" class="logo" alt="{{NOMBRE_CLUB}}">' +
        '<div><span class="pill">Plataforma Oficial</span></div>' +
        '<h1>{{NOMBRE_CLUB}}</h1>' +
        '<p>Gestión deportiva, asistencias y evaluaciones en tiempo real.</p>' +
        '<div style="font-size:0.8rem; color:#94a3b8; border-top:1px dashed #cbd5e1; padding-top:14px;">Conectado a la Planilla Cascarón</div>' +
      '</div>' +
    '</body>' +
    '</html>';
}
