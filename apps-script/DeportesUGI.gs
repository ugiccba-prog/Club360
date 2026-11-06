/**
 * ============================================================================
 * UGI · Unidad de Gestión Integral — Backend de www.ugiccba.com.ar/deportes
 * Evaluaciones + Asistencia + Padrón, escribiendo en el Google Sheet de cada
 * deporte (los mismos Excel de la app de asistencia anterior).
 * ============================================================================
 * INSTALACIÓN RECOMENDADA (1 solo script para los 12 deportes):
 *  1. script.google.com > Nuevo proyecto > pegar este archivo completo.
 *  2. Implementar > Nueva implementación > Tipo "Aplicación web"
 *       - Ejecutar como: Yo
 *       - Quién tiene acceso: Cualquier persona
 *  3. Copiar la URL que termina en /exec y pegarla en SCRIPT_URL dentro de
 *     deportes/index.html.
 *  4. Ejecutar UNA vez la función crearActivadorViernes() (menú ▶ Ejecutar)
 *     para que el control de asistencia corra solo todos los viernes 9 AM.
 *
 * ALTERNATIVA: también funciona pegado dentro de cada Sheet (Extensiones >
 * Apps Script). Si el deporte no está en SHEET_IDS usa la planilla activa.
 *
 * PESTAÑAS que crea en cada Sheet (no toca las pestañas viejas):
 *   Evaluaciones | Asistencia | Padron | Gestos (opcional) | Config (B1 = mail)
 * ============================================================================
 */

// Planillas Oficiales UGI (1 Sheet único e independiente por actividad/rama)
var SHEET_IDS = {
  // Base Formativa
  'Colonia':                         '1-w0WjJf0YR4zqeWnBVZRecNJly8zxbSAf6rqv4ggsyw',
  'COYFD':                           '1HsnJHTrtVMCe1IFpHfqUbTEp47oQUs_kPgqkndgln8A',

  // Deportes con ambas ramas (Caballeros y Damas)
  'Básquet Caballeros':              '1cmiPDyrZd-TAeQ9Z7xToKoYuF3bM0kd1SRbZfDiCnQo',
  'Básquet Damas':                   '11MLFBdL7waV9QkBW8aVHCLz_OF6TiSrfL9GUc_F17X4',
  'Fútbol Caballeros':               '1x-z1aP8kp1hh5hRn1_Wki4YyAy0jSnljlcqdqBZUdfw',
  'Fútbol Damas':                    '1EX8-epHSr4mEs1Oat0AxxsLtT22H1t__MCUf8hgLLkU',
  'Hockey sobre Césped Caballeros':  '1v7Cf5RNem2ODp7ur89vpIOd-nbM5SW7lt1FaMmSDBhY',
  'Hockey sobre Césped Damas':       '1xWDEgu0B7ynkpmqsXXGu867iEV8k9SrSsUKLcwfz4V8',
  'Hockey sobre Patines Caballeros': '1VDefMM_YDCI6R1GN_JLZyVQ_aCy8ffboiyJOKM3OfCE',
  'Hockey sobre Patines Damas':      '11j0zlHUvxLSTfLmka3gTXyf7HTN6vCdWGFPyxQ7KA8c',
  'Rugby Caballeros':                '1uyggm-jpLQtviYo7IdGOtq7m_J29jha8NzN-0stdsG0',
  'Rugby Damas':                     '1IQVLBXgjbM-FVIxZIVN-z2JVHTWUV43xXpUkEBewzy4',
  'Vóley Caballeros':                '1z77zSAeyQMFSWI50A1Dkq7ub4HJiXFi1pig2ZiJOs_g',
  'Vóley Damas':                     '1zF5Dm6evdfr8qawSpWvNuZaRr4YajOVznvmhItoGMrc',

  // Disciplinas únicas
  'Cestoball':                       '1AO-6fLY-32xl3fKcVunjEsj6BenSJx9In9Zbqzp2M90',
  'Gimnasia Artística':              '1Wi_n5njUWwBN3zKPjQc8mtmFBeyQJfcPaRByVJolQYU',
  'Gimnasia Rítmica':                '1KChP0LbG_ctR9Sy2o93kkYomPnzGfjb-PCpdLcPQJD8',
  'Golf':                            '1MapTB4pBetMTX70SgKLe-d5kr56KXodWvIoLsfuBDyg',
  'Handball':                        '1Uxpf121uhivTs4gT3emOVS0FMemYnhplxsJ7bvmFlDY',
  'Judo':                            '1n9brmqUDMJJFC_Ao1GBx7KzAal6SvgnJAAERlJtC0IQ',
  'Karate':                          '16YQrvGLas9wVr3z1wst8HP9dW0t-RvsRHDZwk-v_gOU',
  'Natación Artística':              '19raBjP5wjh-evu6niJIUXzBLcfg5c2AI963lzsJjEmI',
  'Patín Artístico':                 '1UCmnBbC13r21rc9aZHHWTqmNvPWNL6TaEI8RwxCB7LQ',
  'Pelota Paleta':                   '1ZLHCIORGJXO9gGDqLtyMB9Y9ufF7Ihm0dp88dmP3yV2U',
  'Tenis':                           '1BVc8meP2RZuZOA0BDfyEZ050TAUp3T75tzov2lmi8Io'
};

// Claves seguras por actividad para Profesores y Coordinación
var CLAVES_SEGURAS = {
  // Base Formativa
  'Colonia':                         { profe: 'colonia2025', coord: 'coloniacoord' },
  'COYFD':                           { profe: 'coyfd2025',   coord: 'coyfdcoord' },

  // Deportes con ambas ramas
  'Básquet Caballeros':              { profe: 'basquetmuni',   coord: 'basquetcoord' },
  'Básquet Damas':                   { profe: 'basquetmuni',   coord: 'basquetcoord' },
  'Fútbol Caballeros':               { profe: 'futbolmuni',    coord: 'futbolcoord' },
  'Fútbol Damas':                    { profe: 'futbolmuni',    coord: 'futbolcoord' },
  'Hockey sobre Césped Caballeros':  { profe: 'hockeymuni',    coord: 'hockeycoord' },
  'Hockey sobre Césped Damas':       { profe: 'hockeymuni',    coord: 'hockeycoord' },
  'Hockey sobre Patines Caballeros': { profe: 'patinesmuni',   coord: 'patinescoord' },
  'Hockey sobre Patines Damas':      { profe: 'patinesmuni',   coord: 'patinescoord' },
  'Rugby Caballeros':                { profe: 'rugbymuni',     coord: 'rugbycoord' },
  'Rugby Damas':                     { profe: 'rugbymuni',     coord: 'rugbycoord' },
  'Vóley Caballeros':                { profe: 'voleymuni',     coord: 'voleycoord' },
  'Vóley Damas':                     { profe: 'voleymuni',     coord: 'voleycoord' },

  // Disciplinas únicas
  'Cestoball':                       { profe: 'cestomuni',     coord: 'cestocoord' },
  'Gimnasia Artística':              { profe: 'gimnasiamuni',  coord: 'gimnasiacoord' },
  'Gimnasia Rítmica':                { profe: 'gimnasiamuni',  coord: 'gimnasiacoord' },
  'Golf':                            { profe: 'golfmuni',      coord: 'golfcoord' },
  'Handball':                        { profe: 'handballmuni',  coord: 'handballcoord' },
  'Judo':                            { profe: 'judomuni',      coord: 'judocoord' },
  'Karate':                          { profe: 'karatemuni',    coord: 'karatecoord' },
  'Natación Artística':              { profe: 'natacionmuni',  coord: 'natacioncoord' },
  'Patín Artístico':                 { profe: 'patinmuni',     coord: 'patincoord' },
  'Pelota Paleta':                   { profe: 'paletamuni',    coord: 'paletacoord' },
  'Tenis':                           { profe: 'tenismuni',     coord: 'teniscoord' }
};

var TZ = 'America/Argentina/Buenos_Aires';

var CABECERAS = {
  'Evaluaciones': ['Fecha', 'Deporte', 'Categoría', 'Equipo', 'Jugador', 'Detalle Notas', 'Promedio'],
  'Asistencia':   ['Fecha', 'Deporte', 'Categoría', 'Equipo', 'Jugador', 'Estado'],
  'Padron':       ['Deporte', 'Categoría', 'Equipo', 'Jugador']
};

// --- UTILIDADES ---------------------------------------------------------------
function abrirSheet(deporte) {
  var id = SHEET_IDS[deporte];
  // Si no está en el código, busca en las propiedades guardadas automáticamente
  if (!id) {
    try {
      id = PropertiesService.getScriptProperties().getProperty('SHEET_' + deporte) ||
           PropertiesService.getScriptProperties().getProperty(deporte);
    } catch (_) {}
  }
  if (id) return SpreadsheetApp.openById(id);
  var activa = SpreadsheetApp.getActiveSpreadsheet();
  if (activa) return activa;
  throw new Error('No hay planilla configurada para: ' + deporte);
}

function hoja(ss, nombre) {
  var sh = ss.getSheetByName(nombre) || ss.insertSheet(nombre);
  var cab = CABECERAS[nombre];
  if (cab && sh.getLastRow() === 0) {
    sh.appendRow(cab);
    sh.getRange(1, 1, 1, cab.length).setFontWeight('bold').setBackground('#082b49').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  }
  return sh;
}

function filas(sh) {
  if (!sh || sh.getLastRow() <= 1) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
}

function fechaTxt(v, tz) {
  if (v instanceof Date) return Utilities.formatDate(v, tz, 'yyyy-MM-dd');
  return String(v || '').slice(0, 10);
}

// Borra (de abajo hacia arriba) las filas de datos que cumplan la condición
function borrarFilas(sh, condicion) {
  var datos = filas(sh);
  for (var i = datos.length - 1; i >= 0; i--) {
    if (condicion(datos[i])) sh.deleteRow(i + 2);
  }
}

function mismo(a, b) {
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

function respuesta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// --- GESTIÓN DE SESIONES Y TOKENS SEGUROS (CacheService) -----------------------
// Genera un token único válido por 6 horas (21600 seg, límite máximo de CacheService)
function emitirToken(rol, area) {
  var token = 'tok_' + Utilities.getUuid();
  CacheService.getScriptCache().put(token, JSON.stringify({ rol: rol, area: area }), 21600);
  return token;
}

// Verifica si el token existe y sigue vigente en la memoria del servidor
function tokenValido(token) {
  if (!token) return null;
  var raw = CacheService.getScriptCache().get(String(token));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

// --- 1. RECIBE LOS DATOS DESDE LA WEB -----------------------------------------
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var data = JSON.parse(e.postData.contents);

    // 0. AUTENTICACIÓN SEGURA MUNI 360 (Emite token temporal en servidor)
    if (data.tipo === 'LOGIN') {
      var clave = String(data.clave || '').trim().toLowerCase();
      var deporte = String(data.deporte || '').trim();
      var celular = String(data.celular || '').trim();

      // Claves maestras UGI (Acceso Total a todos los deportes + Colonia + COYFD)
      if (clave === 'ugi2025' || clave === 'ugi2026' || clave === 'muni360' || clave === 'adminugi') {
        return respuesta({
          ok: true,
          rol: 'Dirección UGI',
          esAdminTotal: true,
          deporte: deporte,
          celular: celular,
          token: emitirToken('Dirección UGI', 'TODOS')
        });
      }

      var reg = CLAVES_SEGURAS[deporte];
      // Clave de coordinación específica o global
      if ((reg && clave === reg.coord.toLowerCase()) || (clave === '2001' && deporte === 'Colonia') || (clave === '2002' && deporte === 'COYFD') || clave === 'coordugi') {
        return respuesta({
          ok: true,
          rol: 'Coordinación',
          esAdminTotal: false,
          deporte: deporte,
          celular: celular,
          token: emitirToken('Coordinación', deporte)
        });
      }

      // Clave de profesor específica, universal o PIN heredado
      if ((reg && clave === reg.profe.toLowerCase()) ||
          clave === 'profeugi' || clave === 'muni2025' ||
          (clave === '1001' && deporte === 'Colonia') ||
          (clave === '1002' && deporte === 'COYFD') ||
          clave === deporte.toLowerCase().replace(/\s+/g, '') ||
          clave === deporte.toLowerCase().replace(/\s+/g, '') + 'muni') {
        return respuesta({
          ok: true,
          rol: 'Profe',
          esAdminTotal: false,
          deporte: deporte,
          celular: celular,
          token: emitirToken('Profe', deporte)
        });
      }

      return respuesta({ ok: false, error: 'Contraseña incorrecta para ' + deporte + '.' });
    }

    // CANDADO DE ESCRITURA: Rebota cualquier intento de guardar o modificar sin token válido
    var sesionToken = tokenValido(data.token);
    if (!sesionToken) {
      return respuesta({ ok: false, error: 'Sesión vencida o no autorizada. Por favor volvé a ingresar tu clave.' });
    }

    // 0.1 REINICIO DE TEMPORADA Y VACIADO DE DATOS (POR DEPORTE O GENERAL)
    if (data.tipo === 'RESET_DATOS') {
      if (sesionToken.rol !== 'Dirección UGI' && sesionToken.rol !== 'Coordinación') {
        return respuesta({ ok: false, error: 'No tenés permisos de coordinación para reiniciar datos.' });
      }

      var modo = String(data.modo || '').toUpperCase(); // 'TEMPORADA' o 'TODO'
      var dep = String(data.deporte || '').trim();

      if (dep === 'TODOS' && sesionToken.rol !== 'Dirección UGI') {
        return respuesta({ ok: false, error: 'Solo Dirección UGI puede reiniciar todo el club.' });
      }

      var limpiarFilasHoja = function (ssObj, nombreHoja) {
        var shObj = ssObj.getSheetByName(nombreHoja);
        if (shObj && shObj.getLastRow() > 1) {
          shObj.deleteRows(2, shObj.getLastRow() - 1);
        }
      };

      var procesarSs = function (ssObj) {
        limpiarFilasHoja(ssObj, 'Asistencia');
        limpiarFilasHoja(ssObj, 'Evaluaciones');
        if (modo === 'TODO') {
          limpiarFilasHoja(ssObj, 'Padron');
        }
      };

      if (dep === 'TODOS') {
        var procesados = {};
        Object.keys(SHEET_IDS).forEach(function (k) {
          try {
            var ssObj = abrirSheet(k);
            var idSs = ssObj.getId();
            if (!procesados[idSs]) {
              procesados[idSs] = true;
              procesarSs(ssObj);
            }
          } catch (e) {
            console.error('Error al resetear ' + k, e);
          }
        });
        return respuesta({ ok: true, mensaje: 'Reinicio general (' + modo + ') completado en todo el club.' });
      } else {
        var ssTarget = abrirSheet(dep);
        procesarSs(ssTarget);
        return respuesta({ ok: true, mensaje: 'Reinicio (' + modo + ') completado para ' + dep + '.' });
      }
    }

    var ss = abrirSheet(data.deporte);
    var tz = ss.getSpreadsheetTimeZone();
    var sh;

    if (data.tipo === 'EVALUACION') {
      sh = hoja(ss, 'Evaluaciones');
      var notas = data.notas || {};
      var claves = Object.keys(notas);
      var detalle = claves.map(function (k) { return k + ': ' + notas[k]; }).join(' | ');
      var suma = claves.reduce(function (a, k) { return a + Number(notas[k]); }, 0);
      var prom = claves.length ? Math.round((suma / claves.length) * 100) / 100 : '';
      // Si el profe re-evalúa al mismo jugador el mismo día, se reemplaza
      borrarFilas(sh, function (r) {
        return fechaTxt(r[0], tz) === data.fecha && mismo(r[2], data.categoria) &&
               mismo(r[3], data.equipo) && mismo(r[4], data.jugador);
      });
      sh.appendRow([data.fecha, data.deporte, data.categoria, data.equipo, data.jugador, detalle, prom]);

    } else if (data.tipo === 'ASISTENCIA') {
      sh = hoja(ss, 'Asistencia');
      // Si se vuelve a tomar lista del mismo día/equipo, se reemplaza (no duplica)
      borrarFilas(sh, function (r) {
        return fechaTxt(r[0], tz) === data.fecha && mismo(r[2], data.categoria) && mismo(r[3], data.equipo);
      });
      var nuevas = Object.keys(data.datos || {}).map(function (j) {
        return [data.fecha, data.deporte, data.categoria, data.equipo, j, data.datos[j]];
      });
      if (nuevas.length) sh.getRange(sh.getLastRow() + 1, 1, nuevas.length, 6).setValues(nuevas);

    } else if (data.tipo === 'ALTA_PADRON') {
      sh = hoja(ss, 'Padron');
      var existentes = filas(sh);
      var altas = (data.jugadores || []).filter(function (j) {
        return !existentes.some(function (r) {
          return mismo(r[1], data.categoria) && mismo(r[2], data.equipo) && mismo(r[3], j);
        });
      }).map(function (j) { return [data.deporte, data.categoria, data.equipo, j]; });
      if (altas.length) sh.getRange(sh.getLastRow() + 1, 1, altas.length, 4).setValues(altas);

    } else if (data.tipo === 'BAJA_PADRON') {
      sh = hoja(ss, 'Padron');
      borrarFilas(sh, function (r) {
        return mismo(r[1], data.categoria) && mismo(r[2], data.equipo) && mismo(r[3], data.jugador);
      });

    } else if (data.tipo === 'GESTOS') {
      sh = hoja(ss, 'Gestos');
      sh.clear();
      var lista = [['Gesto / Variable']].concat((data.gestos || []).map(function (g) { return [g]; }));
      sh.getRange(1, 1, lista.length, 1).setValues(lista);
      sh.getRange(1, 1).setFontWeight('bold');

    } else if (data.tipo === 'CONFIG') {
      sh = hoja(ss, 'Config');
      sh.getRange('A1:B1').setValues([['Email coordinador', data.email || '']]);

    } else {
      return respuesta({ ok: false, error: 'Tipo desconocido: ' + data.tipo });
    }

    return respuesta({ ok: true });
  } catch (err) {
    return respuesta({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// --- 2. DEVUELVE LOS DATOS A LA WEB (para Análisis y listas) -------------------
function doGet(e) {
  try {
    var deporte = e && e.parameter && e.parameter.deporte;
    if (!deporte) return respuesta({ ok: true, mensaje: 'Backend UGI Deportes activo.' });

    // CANDADO DE LECTURA: Nadie puede descargar las listas ni padrones sin token válido
    var token = e && e.parameter && e.parameter.token;
    if (!tokenValido(token)) {
      return respuesta({ ok: false, error: 'Sesión no autorizada o vencida.' });
    }

    var ss = abrirSheet(deporte);
    var tz = ss.getSpreadsheetTimeZone();
    var delDeporte = function (r, col) { return !r[col] || mismo(r[col], deporte); };

    var padron = filas(ss.getSheetByName('Padron'))
      .filter(function (r) { return r[3] && delDeporte(r, 0); })
      .map(function (r) { return { categoria: String(r[1]), equipo: String(r[2]), jugador: String(r[3]) }; });

    var evaluaciones = filas(ss.getSheetByName('Evaluaciones'))
      .filter(function (r) { return r[4] && delDeporte(r, 1); })
      .map(function (r) {
        var notas = {};
        String(r[5] || '').split(' | ').forEach(function (par) {
          var i = par.lastIndexOf(':');
          if (i > 0) notas[par.slice(0, i).trim()] = Number(par.slice(i + 1));
        });
        return { fecha: fechaTxt(r[0], tz), categoria: String(r[2]), equipo: String(r[3]), jugador: String(r[4]), notas: notas };
      });

    var asistencia = filas(ss.getSheetByName('Asistencia'))
      .filter(function (r) { return r[4] && delDeporte(r, 1); })
      .map(function (r) {
        return { fecha: fechaTxt(r[0], tz), categoria: String(r[2]), equipo: String(r[3]), jugador: String(r[4]), estado: String(r[5]) };
      });

    var shG = ss.getSheetByName('Gestos');
    var gestos = shG && shG.getLastRow() > 1
      ? shG.getRange(2, 1, shG.getLastRow() - 1, 1).getValues().map(function (r) { return String(r[0]).trim(); }).filter(String)
      : null;

    var shC = ss.getSheetByName('Config');
    var email = shC ? String(shC.getRange('B1').getValue() || '') : '';

    return respuesta({ ok: true, padron: padron, evaluaciones: evaluaciones, asistencia: asistencia, gestos: gestos, email: email });
  } catch (err) {
    return respuesta({ ok: false, error: String(err) });
  }
}

// --- 3. AUDITORÍA AUTOMÁTICA DE ASISTENCIA Y BACKUP (VIERNES 9 AM) -------------
function verificarAsistenciaSemanal() {
  // Ejecuta la copia de seguridad semanal de todas las planillas del club
  try {
    realizarBackupSemanal();
  } catch (errBackup) {
    console.error('Error al realizar backup semanal: ' + errBackup);
  }

  var deportes = Object.keys(SHEET_IDS);
  if (deportes.length === 0) {
    auditarPlanilla(SpreadsheetApp.getActiveSpreadsheet(), '');
    return;
  }
  deportes.forEach(function (dep) {
    try { auditarPlanilla(SpreadsheetApp.openById(SHEET_IDS[dep]), dep); } catch (e) { console.error(dep, e); }
  });
}

function auditarPlanilla(ss, deporte) {
  var shConfig = ss.getSheetByName('Config');
  if (!shConfig) return;
  var email = String(shConfig.getRange('B1').getValue() || '');
  if (email.indexOf('@') === -1) return;

  // Grupos registrados en el padrón (Categoría · Equipo)
  var grupos = {};
  filas(ss.getSheetByName('Padron')).forEach(function (r) {
    if (r[3]) grupos[r[1] + ' · ' + r[2]] = true;
  });
  if (Object.keys(grupos).length === 0) return; // deporte sin padrón todavía

  // Grupos que cargaron asistencia en los últimos 7 días
  var unaSemanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  var cargados = {};
  filas(ss.getSheetByName('Asistencia')).forEach(function (r) {
    var f = r[0] instanceof Date ? r[0] : new Date(r[0]);
    if (f >= unaSemanaAtras) cargados[r[2] + ' · ' + r[3]] = true;
  });

  var sinCargar = Object.keys(grupos).filter(function (g) { return !cargados[g]; });
  if (sinCargar.length === 0) return;

  var titulo = deporte ? ' (' + deporte + ')' : '';
  var mensaje = 'Hola Coordinador,\n\nEl sistema detectó que estos grupos' + titulo +
    ' NO registraron asistencia en los últimos 7 días:\n\n' +
    sinCargar.map(function (g) { return '• ' + g; }).join('\n') +
    '\n\nPor favor pasales el aviso a los profes.\n\nClub Ciudad de Buenos Aires - Unidad de Gestión Integral';

  MailApp.sendEmail(email, '⚠️ UGI' + titulo + ': grupos sin asistencia esta semana', mensaje);
}

// Ejecutar UNA sola vez: crea el activador de los viernes a las 9 AM
function crearActivadorViernes() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'verificarAsistenciaSemanal') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('verificarAsistenciaSemanal')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY)
    .atHour(9)
    .inTimezone(TZ)
    .create();
}

// --- 4. CREADOR AUTOMÁTICO DE PLANILLAS SEPARADAS (COLONIA Y COYFD) -------------
/**
 * Crea automáticamente un Google Sheet nuevo e independiente para COYFD en tu Google Drive
 * con todas las pestañas ('Padron', 'Asistencia', 'Evaluaciones', 'Gestos', 'Config') formateadas.
 *
 * CÓMO EJECUTARLO:
 * 1. En script.google.com, seleccioná la función "crearSheetCOYFD" en la barra superior.
 * 2. Hacé clic en ▶ Ejecutar.
 * 3. En la consola inferior verás el ID generado y el enlace a la nueva planilla.
 * 4. Copiá ese ID y pegalo en la línea 28 de este archivo (SHEET_IDS['COYFD']).
 */
function crearSheetCOYFD() {
  var ss = SpreadsheetApp.create('UGI · COYFD - Control y Padrón');

  // Inicializar pestañas con cabeceras institucionales
  hoja(ss, 'Padron');
  hoja(ss, 'Asistencia');
  hoja(ss, 'Evaluaciones');
  hoja(ss, 'Gestos');
  hoja(ss, 'Config');

  // Gestos específicos para desarrollo motor en COYFD
  var shG = ss.getSheetByName('Gestos');
  var gestos = [
    ['Gesto / Variable'],
    ['Coordinación óculo-manual'],
    ['Coordinación óculo-pédica'],
    ['Equilibrio y desplazamientos'],
    ['Giro y salto'],
    ['Cooperación en juego'],
    ['Comprensión de reglas'],
    ['Tolerancia al contacto']
  ];
  shG.getRange(1, 1, gestos.length, 1).setValues(gestos);
  shG.getRange(1, 1).setFontWeight('bold').setBackground('#082b49').setFontColor('#ffffff');

  // Eliminar la 'Hoja 1' por defecto si existe
  var hojaDefecto = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (hojaDefecto && ss.getSheets().length > 1) {
    try { ss.deleteSheet(hojaDefecto); } catch (e) {}
  }

  var id = ss.getId();
  var url = ss.getUrl();

  Logger.log('========================================================');
  Logger.log('✅ NUEVA PLANILLA CREADA PARA COYFD:');
  Logger.log('ID: ' + id);
  Logger.log('URL: ' + url);
  Logger.log('Pegá este ID en SHEET_IDS["COYFD"] en DeportesUGI.gs');
  Logger.log('========================================================');

  return { id: id, url: url };
}

// --- 6. COPIA DE SEGURIDAD AUTOMÁTICA SEMANAL EN GOOGLE DRIVE ------------------
/**
 * Crea o utiliza la carpeta "_BACKUP_SEMANAL_UGI" en Google Drive y guarda
 * una copia fechada de cada una de las planillas oficiales.
 * Corre automáticamente todos los viernes junto con la auditoría de las 9 AM.
 */
function realizarBackupSemanal() {
  var nombreCarpeta = '_BACKUP_SEMANAL_UGI';
  var iter = DriveApp.getFoldersByName(nombreCarpeta);
  var carpetaBackup = iter.hasNext() ? iter.next() : DriveApp.createFolder(nombreCarpeta);
  var fechaHoy = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');

  var idsCopiados = {};

  // 1. Copia todas las planillas definidas en SHEET_IDS
  Object.keys(SHEET_IDS).forEach(function (dep) {
    var id = SHEET_IDS[dep];
    if (!id || idsCopiados[id]) return;
    idsCopiados[id] = true;
    try {
      var archivo = DriveApp.getFileById(id);
      archivo.makeCopy('BACKUP_' + fechaHoy + '_' + archivo.getName(), carpetaBackup);
    } catch (e) {
      console.error('Error backup ' + dep + ' (' + id + '): ' + e);
    }
  });

  // 2. Copia también planillas dinámicas guardadas en PropertiesService
  try {
    var props = PropertiesService.getScriptProperties().getProperties();
    Object.keys(props).forEach(function (k) {
      var id = props[k];
      if (!id || idsCopiados[id] || typeof id !== 'string' || id.length < 20) return;
      idsCopiados[id] = true;
      try {
        var archivo = DriveApp.getFileById(id);
        archivo.makeCopy('BACKUP_' + fechaHoy + '_' + archivo.getName(), carpetaBackup);
      } catch (_) {}
    });
  } catch (_) {}

  Logger.log('========================================================');
  Logger.log('✅ BACKUP SEMANAL FINALIZADO CON ÉXITO');
  Logger.log('Carpeta: ' + nombreCarpeta + ' (' + carpetaBackup.getUrl() + ')');
  Logger.log('Fecha: ' + fechaHoy);
  Logger.log('========================================================');
}

// --- 5. CREADOR MASIVO DE TODAS LAS PLANILLAS OFICIALES ------------------------
/**
 * Crea en tu Google Drive una carpeta organizada llamada:
 * "📁 UGI · Planillas Oficiales MUNI 360 (Club Ciudad)"
 * y adentro genera todas las planillas nuevas e independientes por deporte y base formativa,
 * con sus pestañas y gestos técnicos precargados.
 *
 * CÓMO EJECUTARLO:
 * 1. En script.google.com, seleccioná la función "crearTodasLasPlanillasOficiales" arriba.
 * 2. Hacé clic en ▶ Ejecutar.
 * 3. En pocos segundos tendrás una carpeta limpia en tu Google Drive con todas las planillas oficiales.
 * 4. El script guarda automáticamente todos los IDs nuevos en su memoria interna, por lo que
 *    Muni 360 empieza a guardar en las nuevas planillas inmediatamente.
 */
function crearTodasLasPlanillasOficiales() {
  var NOMBRE_CARPETA = '📁 UGI · Planillas Oficiales MUNI 360 (Club Ciudad)';
  var carpetas = DriveApp.getFoldersByName(NOMBRE_CARPETA);
  var folder = carpetas.hasNext() ? carpetas.next() : DriveApp.createFolder(NOMBRE_CARPETA);

  var ACTIVIDADES = [
    {
      clave: 'Colonia',
      titulo: 'UGI · Colonia de Verano - Planilla Oficial',
      gestos: ['Participación y entusiasmo', 'Respeto de consignas', 'Trabajo en equipo', 'Coordinación motriz', 'Adaptación al agua', 'Autonomía personal', 'Resolución de conflictos']
    },
    {
      clave: 'COYFD',
      titulo: 'UGI · COYFD (Iniciación Deportiva) - Planilla Oficial',
      gestos: ['Coordinación óculo-manual', 'Coordinación óculo-pédica', 'Equilibrio y desplazamientos', 'Giro y salto', 'Cooperación en juego', 'Comprensión de reglas', 'Tolerancia al contacto']
    },
    {
      clave: 'Básquet Caballeros',
      titulo: 'UGI · Básquet Caballeros - Planilla Oficial',
      gestos: ['Dribbling con ambas manos', 'Mecánica de tiro', 'Bandeja / finalización', 'Pase', 'Postura defensiva', 'Rebote', 'Juego sin pelota', 'Toma de decisión']
    },
    {
      clave: 'Básquet Damas',
      titulo: 'UGI · Básquet Damas - Planilla Oficial',
      gestos: ['Dribbling con ambas manos', 'Mecánica de tiro', 'Bandeja / finalización', 'Pase', 'Postura defensiva', 'Rebote', 'Juego sin pelota', 'Toma de decisión']
    },
    {
      clave: 'Cestoball',
      titulo: 'UGI · Cestoball - Planilla Oficial',
      gestos: ['Pase y recepción en movimiento', 'Tiro al aro y precisión', 'Desmarque y ocupación de espacios', 'Defensa e intercepción', 'Rebote y recupero', 'Transición rápida', 'Toma de decisión']
    },
    {
      clave: 'Fútbol Caballeros',
      titulo: 'UGI · Fútbol Caballeros - Planilla Oficial',
      gestos: ['Control orientado', 'Pase corto', 'Pase largo / cambio de frente', 'Conducción', 'Remate', 'Juego aéreo', 'Marca y recuperación', 'Perfil y lectura de juego']
    },
    {
      clave: 'Fútbol Damas',
      titulo: 'UGI · Fútbol Damas - Planilla Oficial',
      gestos: ['Control orientado', 'Pase corto', 'Pase largo / cambio de frente', 'Conducción', 'Remate', 'Juego aéreo', 'Marca y recuperación', 'Perfil y lectura de juego']
    },
    {
      clave: 'Gimnasia Artística',
      titulo: 'UGI · Gimnasia Artística - Planilla Oficial',
      gestos: ['Flexibilidad y movilidad', 'Fuerza postural y core', 'Acrobacia de suelo (roles/vertical/medialuna)', 'Salto y recepción segura', 'Trabajo en aparatos (viga/paralelas)', 'Alineación corporal', 'Memoria coreográfica']
    },
    {
      clave: 'Gimnasia Rítmica',
      titulo: 'UGI · Gimnasia Rítmica - Planilla Oficial',
      gestos: ['Manejo técnico de aparato (cuerda/aro/pelota/cinta)', 'Flexibilidad y amplitud articular', 'Equilibrios y giros', 'Saltos rítmicos', 'Musicalidad y ritmo', 'Expresión corporal', 'Coordinación espacio-temporal']
    },
    {
      clave: 'Golf',
      titulo: 'UGI · Golf - Planilla Oficial',
      gestos: ['Grip, stance y alineación', 'Full swing (maderas e hierros)', 'Juego corto (approach / chipping)', 'Putting (lectura y control de distancia)', 'Salida de bunker', 'Estrategia de cancha', 'Etiqueta, reglas y ritmo de juego']
    },
    {
      clave: 'Hockey sobre Césped Caballeros',
      titulo: 'UGI · Hockey sobre Césped Caballeros - Planilla Oficial',
      gestos: ['Conducción (derecha y revés)', 'Pase (push / slap)', 'Recepción', 'Barrida / hit', 'Tackle y marca', 'Ubicación en cancha', 'Toma de decisión']
    },
    {
      clave: 'Hockey sobre Césped Damas',
      titulo: 'UGI · Hockey sobre Césped Damas - Planilla Oficial',
      gestos: ['Conducción (derecha y revés)', 'Pase (push / slap)', 'Recepción', 'Barrida / hit', 'Tackle y marca', 'Ubicación en cancha', 'Toma de decisión']
    },
    {
      clave: 'Hockey sobre Patines Caballeros',
      titulo: 'UGI · Hockey sobre Patines Caballeros - Planilla Oficial',
      gestos: ['Patinaje y equilibrio', 'Frenado y cambios de dirección', 'Conducción de bocha', 'Pase y recepción', 'Tiro al arco', 'Posición defensiva', 'Lectura de juego']
    },
    {
      clave: 'Hockey sobre Patines Damas',
      titulo: 'UGI · Hockey sobre Patines Damas - Planilla Oficial',
      gestos: ['Patinaje y equilibrio', 'Frenado y cambios de dirección', 'Conducción de bocha', 'Pase y recepción', 'Tiro al arco', 'Posición defensiva', 'Lectura de juego']
    },
    {
      clave: 'Judo',
      titulo: 'UGI · Judo - Planilla Oficial',
      gestos: ['Ukemi (caídas seguras)', 'Kumi-kata (agarres y desplazamientos)', 'Nage-waza (proyecciones de pie)', 'Ne-waza (inmovilizaciones y control en suelo)', 'Equilibrio y desequilibrio (Kuzushi)', 'Transición pie-suelo', 'Autocontrol y etiqueta (Rei)']
    },
    {
      clave: 'Karate',
      titulo: 'UGI · Karate - Planilla Oficial',
      gestos: ['Kihon (posiciones y técnicas básicas)', 'Kata (forma, ritmo y foco)', 'Kumite (distancia, timing y marcación)', 'Velocidad y coordinación', 'Control del impacto (Zanshin)', 'Equilibrio y desplazamientos', 'Disciplina y etiqueta (Dojo Kun)']
    },
    {
      clave: 'Natación Artística',
      titulo: 'UGI · Natación Artística - Planilla Oficial',
      gestos: ['Flotación y sculling (propulsión de manos)', 'Figuras y posiciones básicas', 'Control respiratorio y apnea', 'Flexibilidad en el agua', 'Sincronización grupal', 'Musicalidad y cuenta rítmica', 'Resistencia específica']
    },
    {
      clave: 'Patín Artístico',
      titulo: 'UGI · Patín Artístico - Planilla Oficial',
      gestos: ['Postura y equilibrio', 'Patinaje adelante y atrás', 'Filos y curvas', 'Saltos y aterrizaje', 'Trompos y giros', 'Trabajo de pies y figuras', 'Expresión y musicalidad']
    },
    {
      clave: 'Pelota Paleta',
      titulo: 'UGI · Pelota Paleta - Planilla Oficial',
      gestos: ['Golpe de derecha y revés', 'Lectura de rebote en frontón y pared', 'Desplazamiento y ubicación en cancha', 'Saque y devolución', 'Definición y colocación', 'Coordinación con el compañero', 'Uso de ambas manos']
    },
    {
      clave: 'Handball',
      titulo: 'UGI · Handball - Planilla Oficial',
      gestos: ['Pase y recepción en movimiento', 'Ciclo de pasos', 'Lanzamiento (apoyo y suspensión)', 'Bote y fintas', 'Defensa individual y basculación', 'Repliegue defensivo', 'Toma de decisión']
    },
    {
      clave: 'Rugby Caballeros',
      titulo: 'UGI · Rugby Caballeros - Planilla Oficial',
      gestos: ['Pase', 'Recepción', 'Tackle (técnica segura)', 'Ruck / contacto', 'Apoyo y línea de ventaja', 'Evasión', 'Patada']
    },
    {
      clave: 'Rugby Damas',
      titulo: 'UGI · Rugby Damas - Planilla Oficial',
      gestos: ['Pase', 'Recepción', 'Tackle (técnica segura)', 'Ruck / contacto', 'Apoyo y línea de ventaja', 'Evasión', 'Patada']
    },
    {
      clave: 'Tenis',
      titulo: 'UGI · Tenis - Planilla Oficial',
      gestos: ['Drive', 'Revés', 'Saque', 'Volea y smash', 'Desplazamiento y apoyos', 'Devolución', 'Consistencia y táctica']
    },
    {
      clave: 'Vóley Caballeros',
      titulo: 'UGI · Vóley Caballeros - Planilla Oficial',
      gestos: ['Saque', 'Recepción (antebrazos)', 'Armado (dedos)', 'Ataque / remate', 'Bloqueo', 'Defensa y desplazamiento', 'Comunicación en cancha']
    },
    {
      clave: 'Vóley Damas',
      titulo: 'UGI · Vóley Damas - Planilla Oficial',
      gestos: ['Saque', 'Recepción (antebrazos)', 'Armado (dedos)', 'Ataque / remate', 'Bloqueo', 'Defensa y desplazamiento', 'Comunicación en cancha']
    }
  ];

  var nuevoMapeo = {};
  var propsParaGuardar = {};

  ACTIVIDADES.forEach(function (act) {
    var ss = SpreadsheetApp.create(act.titulo);
    var file = DriveApp.getFileById(ss.getId());
    folder.addFile(file);
    try { DriveApp.getRootFolder().removeFile(file); } catch (_) {}

    // Formatear pestañas institucionales
    hoja(ss, 'Padron');
    hoja(ss, 'Asistencia');
    hoja(ss, 'Evaluaciones');
    hoja(ss, 'Gestos');
    hoja(ss, 'Config');

    // Cargar gestos específicos del deporte
    var shG = ss.getSheetByName('Gestos');
    var filasG = [['Gesto / Variable']].concat(act.gestos.map(function (g) { return [g]; }));
    shG.getRange(1, 1, filasG.length, 1).setValues(filasG);
    shG.getRange(1, 1).setFontWeight('bold').setBackground('#082b49').setFontColor('#ffffff');

    // Eliminar 'Hoja 1'
    var hDef = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
    if (hDef && ss.getSheets().length > 1) {
      try { ss.deleteSheet(hDef); } catch (_) {}
    }

    var id = ss.getId();
    nuevoMapeo[act.clave] = id;
    propsParaGuardar[act.clave] = id;
    propsParaGuardar['SHEET_' + act.clave] = id;
  });

  // Guardar en PropertiesService para que el sistema funcione de inmediato
  PropertiesService.getScriptProperties().setProperties(propsParaGuardar);

  // Formatear bloque para copiar y pegar en SHEET_IDS
  var lineasCodigo = ['var SHEET_IDS = {'];
  var clavesOrdenadas = Object.keys(nuevoMapeo).sort();
  clavesOrdenadas.forEach(function (k, i) {
    var fin = (i === clavesOrdenadas.length - 1) ? '' : ',';
    var padding = ' '.repeat(Math.max(1, 35 - k.length));
    lineasCodigo.push("  '" + k + "':" + padding + "'" + nuevoMapeo[k] + "'" + fin);
  });
  lineasCodigo.push('};');

  var codigoCompleto = lineasCodigo.join('\n');

  Logger.log('========================================================================');
  Logger.log('✅ TODAS LAS PLANILLAS FUERON CREADAS CON ÉXITO EN TU GOOGLE DRIVE');
  Logger.log('📁 Carpeta: ' + folder.getName() + ' (' + folder.getUrl() + ')');
  Logger.log('⚡ Los IDs ya quedaron guardados automáticamente en la memoria del Script.');
  Logger.log('Si querés dejarlos fijados en el archivo DeportesUGI.gs, copiá y pegá esto:');
  Logger.log('\n' + codigoCompleto);
  Logger.log('========================================================================');

  return { folderUrl: folder.getUrl(), ids: nuevoMapeo, codigo: codigoCompleto };
}

/**
 * Crea automáticamente un Google Sheet nuevo e independiente para Colonia en tu Google Drive.
 */
function crearSheetColonia() {
  var ss = SpreadsheetApp.create('UGI · Colonia de Verano - Control y Padrón');

  hoja(ss, 'Padron');
  hoja(ss, 'Asistencia');
  hoja(ss, 'Evaluaciones');
  hoja(ss, 'Gestos');
  hoja(ss, 'Config');

  var shG = ss.getSheetByName('Gestos');
  var gestos = [
    ['Gesto / Variable'],
    ['Participación y entusiasmo'],
    ['Respeto de consignas'],
    ['Trabajo en equipo'],
    ['Coordinación motriz'],
    ['Adaptación al agua'],
    ['Autonomía personal'],
    ['Resolución de conflictos']
  ];
  shG.getRange(1, 1, gestos.length, 1).setValues(gestos);
  shG.getRange(1, 1).setFontWeight('bold').setBackground('#082b49').setFontColor('#ffffff');

  var hojaDefecto = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (hojaDefecto && ss.getSheets().length > 1) {
    try { ss.deleteSheet(hojaDefecto); } catch (e) {}
  }

  var id = ss.getId();
  var url = ss.getUrl();

  Logger.log('========================================================');
  Logger.log('✅ NUEVA PLANILLA CREADA PARA COLONIA:');
  Logger.log('ID: ' + id);
  Logger.log('URL: ' + url);
  Logger.log('Pegá este ID en SHEET_IDS["Colonia"] en DeportesUGI.gs');
  Logger.log('========================================================');

  return { id: id, url: url };
}

