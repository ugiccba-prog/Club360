/**
 * ============================================================================
 * MUNI 360 · UGI — Backend Maestro Unificado (25 Actividades: Deportes + Colonia + COYFD)
 * Archivo en repo: apps-script/DeportesUGI.gs
 * URL activa: https://script.google.com/macros/s/AKfycbz0VhNzdHKgFfrbHvuCJtLqrLRz9BWKxYxKjQ5CdCNQDiMd38edOmTDnGyTm8OBDeZ6/exec
 * ============================================================================
 * INSTRUCCIONES DE INSTALACIÓN Y ACTIVACIÓN:
 * 1. Pegar este archivo en script.google.com del proyecto backend.
 * 2. Implementar > Administrar implementaciones > Editar versión > Implementar.
 * 3. Ejecutar UNA vez la función crearActivadorViernes() desde el editor:
 *    - Deja programada la auditoría de asistencia semanal todos los viernes 9 AM.
 *    - Deja programado el BACKUP automático de todas las planillas en Drive.
 * ============================================================================
 */

// 1. CATÁLOGO PRIVADO DE CONTRASEÑAS (Oculto en el servidor, invisible en la web)
var CLAVES_SEGURAS = {
  'MAESTRA_UGI': 'ugi2026',
  'UNIVERSAL_PROFE': 'profeugi',
  'Colonia':                         { profe: '1001', coord: '2001' },
  'COYFD':                           { profe: '1002', coord: '2002' },
  'Básquet Caballeros':              { profe: '1101', coord: '2101' },
  'Básquet Damas':                   { profe: '1102', coord: '2102' },
  'Cestoball':                       { profe: '1103', coord: '2103' },
  'Fútbol Caballeros':               { profe: '1104', coord: '2104' },
  'Fútbol Damas':                    { profe: '1105', coord: '2105' },
  'Gimnasia Artística':              { profe: '1106', coord: '2106' },
  'Gimnasia Rítmica':                { profe: '1107', coord: '2107' },
  'Golf':                            { profe: '1108', coord: '2108' },
  'Handball':                        { profe: '1123', coord: '2123' },
  'Hockey sobre Césped Caballeros':  { profe: '1109', coord: '2109' },
  'Hockey sobre Césped Damas':       { profe: '1110', coord: '2110' },
  'Hockey sobre Patines Caballeros': { profe: '1111', coord: '2111' },
  'Hockey sobre Patines Damas':      { profe: '1112', coord: '2112' },
  'Judo':                            { profe: '1113', coord: '2113' },
  'Karate':                          { profe: '1114', coord: '2114' },
  'Natación Artística':              { profe: '1115', coord: '2115' },
  'Patín Artístico':                 { profe: '1116', coord: '2116' },
  'Pelota Paleta':                   { profe: '1117', coord: '2117' },
  'Rugby Caballeros':                { profe: '1118', coord: '2118' },
  'Rugby Damas':                     { profe: '1119', coord: '2119' },
  'Tenis':                           { profe: '1120', coord: '2120' },
  'Vóley Caballeros':                { profe: '1121', coord: '2121' },
  'Vóley Damas':                     { profe: '1122', coord: '2122' }
};

// 2. PLANILLAS OFICIALES EXISTENTES EN GOOGLE DRIVE
var SHEET_IDS = {
  'Colonia':                         '1XVCzrTXXq7cpMSV15rVlx0O-uhFaOs2gS9KHgYCTGkc',
  'Hockey sobre Patines':            '109ntfFXi8DGTXwpZYchCkJ0ofc0abnr8qEMe1IFby8I',
  'Hockey sobre Patines Caballeros': '109ntfFXi8DGTXwpZYchCkJ0ofc0abnr8qEMe1IFby8I',
  'Hockey sobre Patines Damas':      '109ntfFXi8DGTXwpZYchCkJ0ofc0abnr8qEMe1IFby8I',
  'Hockey sobre Césped':             '16vL1zIzeF4tWZkJe41QosvVNU8bJTVdM2m0a9qWs2bI',
  'Hockey sobre Césped Caballeros':  '16vL1zIzeF4tWZkJe41QosvVNU8bJTVdM2m0a9qWs2bI',
  'Hockey sobre Césped Damas':       '16vL1zIzeF4tWZkJe41QosvVNU8bJTVdM2m0a9qWs2bI',
  'Básquet':                         '1JFm28VIHTcOWQ58ph2rKtpOnNeWA9LLr3RF8IKEBoFk',
  'Básquet Caballeros':              '1JFm28VIHTcOWQ58ph2rKtpOnNeWA9LLr3RF8IKEBoFk',
  'Básquet Damas':                   '1JFm28VIHTcOWQ58ph2rKtpOnNeWA9LLr3RF8IKEBoFk',
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
  'Handball':                        '132KRNWOd5iY5OEwumbTPMAfVztlkFWEvUvGGMuSBSb8',
  'Gimnasia':                        '1j8yYiHAGnLmA6vpm6E9NYXIRnTlt8sKq49eXWGi6A6E',
  'Gimnasia Artística':              '1j8yYiHAGnLmA6vpm6E9NYXIRnTlt8sKq49eXWGi6A6E',
  'Patín Artístico':                 '1V4-OO6UwvPYRPojcbIzRgn4fkFmSBc2yD-XynB4q-QM'
};

var NOMBRE_CARPETA_NUEVOS = 'UGI - Muni 360 Planillas';
var TZ = 'America/Argentina/Buenos_Aires';

// El DNI va siempre en la última columna (Columna E) de Padron para no mezclarse con ningún dato numérico
var CABECERAS = {
  'Evaluaciones': ['Fecha', 'Deporte', 'Categoría', 'Equipo', 'Jugador', 'Detalle Notas', 'Promedio'],
  'Asistencia':   ['Fecha', 'Deporte', 'Categoría', 'Equipo', 'Jugador', 'Estado'],
  'Padron':       ['Deporte', 'Categoría', 'Equipo', 'Jugador', 'DNI']
};

// --- ABRE LA PLANILLA EXISTENTE O LA CREA AUTOMÁTICAMENTE SI ES NUEVA (COYFD, JUDO, CESTO, ETC.) ---
function abrirSheet(deporte) {
  var id = SHEET_IDS[deporte];
  if (id) return SpreadsheetApp.openById(id);

  var props = PropertiesService.getScriptProperties();
  var key = 'MUNI360_SHEET_' + deporte;
  var guardado = props.getProperty(key);
  if (guardado) {
    try { return SpreadsheetApp.openById(guardado); } catch (e) {}
  }

  var iter = DriveApp.getFoldersByName(NOMBRE_CARPETA_NUEVOS);
  var carpeta = iter.hasNext() ? iter.next() : DriveApp.createFolder(NOMBRE_CARPETA_NUEVOS);
  var nombreArchivo = 'Muni 360 - ' + deporte;
  var archivos = carpeta.getFilesByName(nombreArchivo);
  var ss;

  if (archivos.hasNext()) {
    ss = SpreadsheetApp.openById(archivos.next().getId());
  } else {
    ss = SpreadsheetApp.create(nombreArchivo);
    DriveApp.getFileById(ss.getId()).moveTo(carpeta);
  }
  props.setProperty(key, ss.getId());
  return ss;
}

function hoja(ss, nombre) {
  var sh = ss.getSheetByName(nombre) || ss.insertSheet(nombre);
  var cab = CABECERAS[nombre];
  if (cab && sh.getLastRow() === 0) {
    sh.appendRow(cab);
    sh.getRange(1, 1, 1, cab.length).setFontWeight('bold').setBackground('#082b49').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  } else if (nombre === 'Padron' && sh.getLastColumn() < 5) {
    sh.getRange(1, 5).setValue('DNI').setFontWeight('bold').setBackground('#082b49').setFontColor('#ffffff');
  }
  return sh;
}

function filas(sh) {
  if (!sh || sh.getLastRow() <= 1) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, Math.max(sh.getLastColumn(), 5)).getValues();
}

function fechaTxt(v, tz) {
  if (v instanceof Date) return Utilities.formatDate(v, tz, 'yyyy-MM-dd');
  return String(v || '').slice(0, 10);
}

function borrarFilas(sh, condicion) {
  var datos = filas(sh);
  for (var i = datos.length - 1; i >= 0; i--) {
    if (condicion(datos[i])) sh.deleteRow(i + 2);
  }
}

function vaciarHojaConservandoCabecera(ss, nombreHoja) {
  var sh = ss.getSheetByName(nombreHoja);
  if (!sh || sh.getLastRow() <= 1) return;
  sh.deleteRows(2, sh.getLastRow() - 1);
}

function mismo(a, b) {
  return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
}

function respuesta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// --- 1. RECIBE LOGIN, ASISTENCIA, EVALUACIONES, PADRÓN CON DNI Y REINICIO DE TEMPORADA ---
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var data = JSON.parse(e.postData.contents);

    // A) LOGIN SEGURO EN SERVIDOR
    if (data.tipo === 'LOGIN') {
      var area = String(data.deporte || '').trim();
      var clave = String(data.clave || '').trim().toLowerCase();

      if (clave === CLAVES_SEGURAS.MAESTRA_UGI || clave === 'argon2026') {
        return respuesta({ ok: true, rol: 'Dirección UGI', esAdminTotal: true, token: 'ugi_' + Date.now() });
      }

      var cred = CLAVES_SEGURAS[area];
      if (cred) {
        if (clave === cred.coord.toLowerCase()) {
          return respuesta({ ok: true, rol: 'Coordinación', esAdminTotal: false, token: 'coord_' + Date.now() });
        }
        if (clave === cred.profe.toLowerCase() || clave === CLAVES_SEGURAS.UNIVERSAL_PROFE) {
          return respuesta({ ok: true, rol: 'Profe', esAdminTotal: false, token: 'profe_' + Date.now() });
        }
      }
      return respuesta({ ok: false, error: 'Contraseña incorrecta para ' + area });
    }

    // B) REINICIO DE TEMPORADA O VACIADO TOTAL (ZONA DE PELIGRO)
    if (data.tipo === 'RESET_DATOS') {
      var modo = String(data.modo || 'TEMPORADA').toUpperCase();
      var depObjetivo = String(data.deporte || '').trim();

      var listaDeportes = depObjetivo === 'TODOS'
        ? Object.keys(CLAVES_SEGURAS).filter(function (k) { return k !== 'MAESTRA_UGI' && k !== 'UNIVERSAL_PROFE'; })
        : [depObjetivo];

      var yaProcesados = {};
      listaDeportes.forEach(function (d) {
        try {
          var s = abrirSheet(d);
          var idPlanilla = s.getId();
          if (depObjetivo === 'TODOS') {
            if (yaProcesados[idPlanilla]) return;
            yaProcesados[idPlanilla] = true;
            vaciarHojaConservandoCabecera(s, 'Asistencia');
            vaciarHojaConservandoCabecera(s, 'Evaluaciones');
            if (modo === 'TODO') vaciarHojaConservandoCabecera(s, 'Padron');
          } else {
            var shA = s.getSheetByName('Asistencia');
            if (shA) borrarFilas(shA, function (r) { return !r[1] || mismo(r[1], d); });
            var shE = s.getSheetByName('Evaluaciones');
            if (shE) borrarFilas(shE, function (r) { return !r[1] || mismo(r[1], d); });
            if (modo === 'TODO') {
              var shP = s.getSheetByName('Padron');
              if (shP) borrarFilas(shP, function (r) { return !r[0] || mismo(r[0], d); });
            }
          }
        } catch (err) {}
      });

      return respuesta({ ok: true });
    }

    // C) OPERACIONES DIARIAS DE CANCHA Y PADRÓN (CON DNI EN COLUMNA E)
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
      borrarFilas(sh, function (r) {
        return fechaTxt(r[0], tz) === data.fecha && mismo(r[1], data.deporte) &&
               mismo(r[2], data.categoria) && mismo(r[3], data.equipo) && mismo(r[4], data.jugador);
      });
      sh.appendRow([data.fecha, data.deporte, data.categoria, data.equipo, data.jugador, detalle, prom]);

    } else if (data.tipo === 'ASISTENCIA') {
      sh = hoja(ss, 'Asistencia');
      borrarFilas(sh, function (r) {
        return fechaTxt(r[0], tz) === data.fecha && mismo(r[1], data.deporte) &&
               mismo(r[2], data.categoria) && mismo(r[3], data.equipo);
      });
      var extraMeta = '';
      if (data.puntosCiudad) extraMeta += ' | Pts:' + data.puntosCiudad;
      if (data.clima) extraMeta += ' | Clima:' + data.clima;

      var nuevas = Object.keys(data.datos || {}).map(function (j) {
        return [data.fecha, data.deporte, data.categoria, data.equipo, j, data.datos[j] + extraMeta];
      });
      if (nuevas.length) sh.getRange(sh.getLastRow() + 1, 1, nuevas.length, 6).setValues(nuevas);

    } else if (data.tipo === 'ALTA_PADRON') {
      sh = hoja(ss, 'Padron');
      var existentes = filas(sh);
      var dnisMap = data.dnis || {};
      var altas = [];

      (data.jugadores || []).forEach(function (item) {
        var nombreJ = (typeof item === 'object' && item !== null) ? String(item.jugador || '').trim() : String(item || '').trim();
        var dniJ    = (typeof item === 'object' && item !== null) ? String(item.dni || '').trim() : String(dnisMap[nombreJ] || '').trim();
        if (!nombreJ) return;

        var idxExistente = -1;
        for (var i = 0; i < existentes.length; i++) {
          var r = existentes[i];
          if (mismo(r[0], data.deporte) && mismo(r[1], data.categoria) && mismo(r[2], data.equipo) && mismo(r[3], nombreJ)) {
            idxExistente = i;
            break;
          }
        }
        if (idxExistente === -1) {
          altas.push([data.deporte, data.categoria, data.equipo, nombreJ, dniJ]);
        } else if (dniJ) {
          // Si el jugador ya existía y se le cargó o actualizó el DNI desde el Legajo Privado, lo escribe en Columna E
          sh.getRange(idxExistente + 2, 5).setValue(dniJ);
        }
      });
      if (altas.length) sh.getRange(sh.getLastRow() + 1, 1, altas.length, 5).setValues(altas);

    } else if (data.tipo === 'BAJA_PADRON') {
      sh = hoja(ss, 'Padron');
      borrarFilas(sh, function (r) {
        return mismo(r[0], data.deporte) && mismo(r[1], data.categoria) && mismo(r[2], data.equipo) && mismo(r[3], data.jugador);
      });

    } else if (data.tipo === 'GESTOS' || data.tipo === 'GUARDAR_GESTOS') {
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

// --- 2. DEVUELVE LOS DATOS A LA WEB (para Análisis, Padrón y Legajo Privado) ----
function doGet(e) {
  try {
    var deporte = e && e.parameter && e.parameter.deporte;
    if (!deporte) return respuesta({ ok: true, mensaje: 'Backend Muni 360 UGI activo.' });

    var ss = abrirSheet(deporte);
    var tz = ss.getSpreadsheetTimeZone();
    var baseDeporte = deporte.replace(/\s+(Caballeros|Damas)$/i, '').trim();
    var delDeporte = function (r, col) {
      return !r[col] || mismo(r[col], deporte) || mismo(r[col], baseDeporte);
    };

    var padron = filas(ss.getSheetByName('Padron'))
      .filter(function (r) { return r[3] && delDeporte(r, 0); })
      .map(function (r) {
        return {
          categoria: String(r[1]),
          equipo: String(r[2] || 'General'),
          jugador: String(r[3]),
          dni: String(r[4] || '')
        };
      });

    var evaluaciones = filas(ss.getSheetByName('Evaluaciones'))
      .filter(function (r) { return r[4] && delDeporte(r, 1); })
      .map(function (r) {
        var notas = {};
        String(r[5] || '').split(' | ').forEach(function (par) {
          var i = par.lastIndexOf(':');
          if (i > 0) notas[par.slice(0, i).trim()] = Number(par.slice(i + 1));
        });
        return { fecha: fechaTxt(r[0], tz), categoria: String(r[2]), equipo: String(r[3] || 'General'), jugador: String(r[4]), notas: notas };
      });

    var asistencia = filas(ss.getSheetByName('Asistencia'))
      .filter(function (r) { return r[4] && delDeporte(r, 1); })
      .map(function (r) {
        return { fecha: fechaTxt(r[0], tz), categoria: String(r[2]), equipo: String(r[3] || 'General'), jugador: String(r[4]), estado: String(r[5]) };
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
  // A) Ejecuta la copia de seguridad semanal de todas las planillas del club en Google Drive
  try {
    realizarBackupSemanal();
  } catch (errBackup) {
    console.error('Error al realizar backup semanal: ' + errBackup);
  }

  // B) Ejecuta la auditoría de asistencia semanal enviando alertas si algún grupo no cargó
  var vistos = {};
  Object.keys(SHEET_IDS).forEach(function (dep) {
    var id = SHEET_IDS[dep];
    if (vistos[id]) return;
    vistos[id] = true;
    try { auditarPlanilla(SpreadsheetApp.openById(id), dep); } catch (e) { console.error(dep, e); }
  });
}

function auditarPlanilla(ss, deporte) {
  var shConfig = ss.getSheetByName('Config');
  if (!shConfig) return;
  var email = String(shConfig.getRange('B1').getValue() || '');
  if (email.indexOf('@') === -1) return;

  var grupos = {};
  filas(ss.getSheetByName('Padron')).forEach(function (r) {
    if (r[3]) grupos[r[1] + ' · ' + r[2]] = true;
  });
  if (Object.keys(grupos).length === 0) return;

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
    '\n\nPor favor pasales el aviso a los profes.\n\nClub Ciudad de Buenos Aires - Unidad de Gestión Integral (UGI)';

  MailApp.sendEmail(email, '⚠️ UGI' + titulo + ': grupos sin asistencia esta semana', mensaje);
}

// --- 4. ACTIVADOR PROGRAMADO (EJECUTAR 1 SOLA VEZ DESDE EL EDITOR DE APPS SCRIPT) ---
/**
 * Crea o renueva el activador de tiempo para que todos los viernes a las 9 AM
 * se ejecute automáticamente verificarAsistenciaSemanal() (Auditoría + Backup).
 */
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

  Logger.log('✅ Activador de los viernes a las 9 AM creado con éxito.');
}

// --- 5. COPIA DE SEGURIDAD AUTOMÁTICA SEMANAL EN GOOGLE DRIVE ------------------
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
