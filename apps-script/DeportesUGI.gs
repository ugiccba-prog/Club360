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

// Mismos Sheets por deporte que usaba la app de asistencia + alias Muni 360
var SHEET_IDS = {
  'Colonia':                         '1XVCzrTXXq7cpMSV15rVlx0O-uhFaOs2gS9KHgYCTGkc',
  'COYFD':                           '1XVCzrTXXq7cpMSV15rVlx0O-uhFaOs2gS9KHgYCTGkc',
  'Hockey sobre Patines':            '109ntfFXi8DGTXwpZYchCkJ0ofc0abnr8qEMe1IFby8I',
  'Hockey sobre Patines Caballeros': '109ntfFXi8DGTXwpZYchCkJ0ofc0abnr8qEMe1IFby8I',
  'Hockey sobre Patines Damas':      '109ntfFXi8DGTXwpZYchCkJ0ofc0abnr8qEMe1IFby8I',
  'Hockey sobre Césped':             '16vL1zIzeF4tWZkJe41QosvVNU8bJTVdM2m0a9qWs2bI',
  'Hockey sobre Césped Caballeros':  '16vL1zIzeF4tWZkJe41QosvVNU8bJTVdM2m0a9qWs2bI',
  'Hockey sobre Césped Damas':       '16vL1zIzeF4tWZkJe41QosvVNU8bJTVdM2m0a9qWs2bI',
  'Básquet':                         '1JFm28VIHTcOWQ58ph2rKtpOnNeWA9LLr3RF8IKEBoFk',
  'Básquet Caballeros':              '1JFm28VIHTcOWQ58ph2rKtpOnNeWA9LLr3RF8IKEBoFk',
  'Básquet Damas':                   '1JFm28VIHTcOWQ58ph2rKtpOnNeWA9LLr3RF8IKEBoFk',
  'Cestoball':                       '1JFm28VIHTcOWQ58ph2rKtpOnNeWA9LLr3RF8IKEBoFk',
  'Fútbol':                          '1Jiva_ezTw2qlfTZCFo3XlMAcavWoAz5C7FVzJm987EE',
  'Fútbol Caballeros':               '1Jiva_ezTw2qlfTZCFo3XlMAcavWoAz5C7FVzJm987EE',
  'Fútbol Damas':                    '1Jiva_ezTw2qlfTZCFo3XlMAcavWoAz5C7FVzJm987EE',
  'Vóley':                           '1no8JOKm6HBdVbjALJL2zaRnSrXWH2O02O-ZPZrlU_kU',
  'Vóley Caballeros':                '1no8JOKm6HBdVbjALJL2zaRnSrXWH2O02O-ZPZrlU_kU',
  'Vóley Damas':                     '1no8JOKm6HBdVbjALJL2zaRnSrXWH2O02O-ZPZrlU_kU',
  'Rugby':                           '1XU-OgRu-KQX4prqhd0SFkKSm4Ib_dscf1ig1bQpsbGA',
  'Rugby Caballeros':                '1XU-OgRu-KQX4prqhd0SFkKSm4Ib_dscf1ig1bQpsbGA',
  'Rugby Damas':                     '1XU-OgRu-KQX4prqhd0SFkKSm4Ib_dscf1ig1bQpsbGA',
  'Natación':                        '1UPItmf59MxruW_BHHYosnZpcnHzhg6VcbSFSvIkTEDU',
  'Natación Artística':              '1UPItmf59MxruW_BHHYosnZpcnHzhg6VcbSFSvIkTEDU',
  'Tenis':                           '1ECprPSNP7HaI9xCt_PkL7tj99vMSqZYaX4V1h2W11SQ',
  'Golf':                            '1ECprPSNP7HaI9xCt_PkL7tj99vMSqZYaX4V1h2W11SQ',
  'Pelota Paleta':                   '1ECprPSNP7HaI9xCt_PkL7tj99vMSqZYaX4V1h2W11SQ',
  'Handball':                        '132KRNWOd5iY5OEwumbTPMAfVztlkFWEvUvGGMuSBSb8',
  'Gimnasia':                        '1j8yYiHAGnLmA6vpm6E9NYXIRnTlt8sKq49eXWGi6A6E',
  'Gimnasia Artística':              '1j8yYiHAGnLmA6vpm6E9NYXIRnTlt8sKq49eXWGi6A6E',
  'Gimnasia Rítmica':                '1j8yYiHAGnLmA6vpm6E9NYXIRnTlt8sKq49eXWGi6A6E',
  'Judo':                            '1j8yYiHAGnLmA6vpm6E9NYXIRnTlt8sKq49eXWGi6A6E',
  'Karate':                          '1j8yYiHAGnLmA6vpm6E9NYXIRnTlt8sKq49eXWGi6A6E',
  'Patín Artístico':                 '1V4-OO6UwvPYRPojcbIzRgn4fkFmSBc2yD-XynB4q-QM'
};

// Claves seguras por actividad para Profesores y Coordinación
var CLAVES_SEGURAS = {
  'Colonia':                         { profe: 'colonia2025', coord: 'coloniacoord' },
  'COYFD':                           { profe: 'coyfd2025',   coord: 'coyfdcoord' },
  'Hockey sobre Patines':            { profe: 'patinesmuni',   coord: 'patinescoord' },
  'Hockey sobre Patines Caballeros': { profe: 'patinesmuni',   coord: 'patinescoord' },
  'Hockey sobre Patines Damas':      { profe: 'patinesmuni',   coord: 'patinescoord' },
  'Hockey sobre Césped':             { profe: 'hockeymuni',    coord: 'hockeycoord' },
  'Hockey sobre Césped Caballeros':  { profe: 'hockeymuni',    coord: 'hockeycoord' },
  'Hockey sobre Césped Damas':       { profe: 'hockeymuni',    coord: 'hockeycoord' },
  'Básquet':                         { profe: 'basquetmuni',   coord: 'basquetcoord' },
  'Básquet Caballeros':              { profe: 'basquetmuni',   coord: 'basquetcoord' },
  'Básquet Damas':                   { profe: 'basquetmuni',   coord: 'basquetcoord' },
  'Cestoball':                       { profe: 'cestomuni',     coord: 'cestocoord' },
  'Fútbol':                          { profe: 'futbolmuni',    coord: 'futbolcoord' },
  'Fútbol Caballeros':               { profe: 'futbolmuni',    coord: 'futbolcoord' },
  'Fútbol Damas':                    { profe: 'futbolmuni',    coord: 'futbolcoord' },
  'Vóley':                           { profe: 'voleymuni',     coord: 'voleycoord' },
  'Vóley Caballeros':                { profe: 'voleymuni',     coord: 'voleycoord' },
  'Vóley Damas':                     { profe: 'voleymuni',     coord: 'voleycoord' },
  'Rugby':                           { profe: 'rugbymuni',     coord: 'rugbycoord' },
  'Rugby Caballeros':                { profe: 'rugbymuni',     coord: 'rugbycoord' },
  'Rugby Damas':                     { profe: 'rugbymuni',     coord: 'rugbycoord' },
  'Natación':                        { profe: 'natacionmuni',  coord: 'natacioncoord' },
  'Natación Artística':              { profe: 'natacionmuni',  coord: 'natacioncoord' },
  'Tenis':                           { profe: 'tenismuni',     coord: 'teniscoord' },
  'Golf':                            { profe: 'golfmuni',      coord: 'golfcoord' },
  'Pelota Paleta':                   { profe: 'paletamuni',    coord: 'paletacoord' },
  'Handball':                        { profe: 'handballmuni',  coord: 'handballcoord' },
  'Gimnasia':                        { profe: 'gimnasiamuni',  coord: 'gimnasiacoord' },
  'Gimnasia Artística':              { profe: 'gimnasiamuni',  coord: 'gimnasiacoord' },
  'Gimnasia Rítmica':                { profe: 'gimnasiamuni',  coord: 'gimnasiacoord' },
  'Judo':                            { profe: 'judomuni',      coord: 'judocoord' },
  'Karate':                          { profe: 'karatemuni',    coord: 'karatecoord' },
  'Patín Artístico':                 { profe: 'patinmuni',     coord: 'patincoord' }
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

// --- 1. RECIBE LOS DATOS DESDE LA WEB -----------------------------------------
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var data = JSON.parse(e.postData.contents);

    // 0. AUTENTICACIÓN SEGURA MUNI 360
    if (data.tipo === 'LOGIN') {
      var clave = String(data.clave || '').trim().toLowerCase();
      var deporte = String(data.deporte || '').trim();
      var celular = String(data.celular || '').trim();

      // Claves maestras UGI (Acceso Total a todos los deportes + Colonia + COYFD)
      if (clave === 'ugi2025' || clave === 'ugi2026' || clave === 'muni360' || clave === 'adminugi') {
        return respuesta({ ok: true, rol: 'Dirección UGI', esAdminTotal: true, deporte: deporte, celular: celular, token: Utilities.getUuid() });
      }

      var reg = CLAVES_SEGURAS[deporte];
      // Clave de coordinación específica o global
      if ((reg && clave === reg.coord.toLowerCase()) || (clave === '2001' && deporte === 'Colonia') || (clave === '2002' && deporte === 'COYFD') || clave === 'coordugi') {
        return respuesta({ ok: true, rol: 'Coordinación', esAdminTotal: false, deporte: deporte, celular: celular, token: Utilities.getUuid() });
      }

      // Clave de profesor específica, universal o PIN heredado
      if ((reg && clave === reg.profe.toLowerCase()) ||
          clave === 'profeugi' || clave === 'muni2025' ||
          (clave === '1001' && deporte === 'Colonia') ||
          (clave === '1002' && deporte === 'COYFD') ||
          clave === deporte.toLowerCase().replace(/\s+/g, '') ||
          clave === deporte.toLowerCase().replace(/\s+/g, '') + 'muni') {
        return respuesta({ ok: true, rol: 'Profe', esAdminTotal: false, deporte: deporte, celular: celular, token: Utilities.getUuid() });
      }

      return respuesta({ ok: false, error: 'Contraseña incorrecta para ' + deporte + '.' });
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

// --- 3. AUDITORÍA AUTOMÁTICA DE ASISTENCIA (VIERNES 9 AM) ----------------------
function verificarAsistenciaSemanal() {
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

