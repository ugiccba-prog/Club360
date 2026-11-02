/* ==========================================================================
   CCBA HOCKEY — Apps Script de la Selectividad Menores 2027
   --------------------------------------------------------------------------
   Base de datos en vivo de la app /Hockeysc/ (Modo Cancha, Comité, Padrón).
     · doGet  → devuelve todas las jugadoras (array JSON) para la app
     · doPost → guarda los cambios de los entrenadores en la hoja "Jugadoras"

   Por qué una HOJA y no PropertiesService: PropertiesService corta en ~9 KB
   por valor y el padrón (47 jugadoras con asistencia y notas) ya pesa ~22 KB.
   Ahí el guardado fallaba en silencio. En la hoja no hay límite práctico y,
   además, el comité puede mirar (y corregir) los datos directo en Sheets.

   CÓMO INSTALARLO / ACTUALIZARLO (5 minutos)
   1. Abrí la planilla de Google de la Selectividad → Extensiones → Apps Script.
   2. Borrá TODO lo que haya en Código.gs y pegá este archivo completo. Guardá (💾).
   3. Si YA tenías una implementación (la URL .../exec que usa la app):
        Implementar → Gestionar implementaciones → lápiz ✏️ →
        Versión: "Nueva versión" → Implementar.   (la URL NO cambia)
      Si es la primera vez:
        Implementar → Nueva implementación → ⚙️ Aplicación web
          · Ejecutar como:      Yo
          · Quién tiene acceso: Cualquier persona   ← imprescindible
        Autorizá con tu cuenta y copiá la URL .../exec en Hockeysc/index.html
        (constante FIXED_GOOGLE_SCRIPT_URL).
   4. Probá abriendo la URL .../exec?accion=ping en el navegador: tiene que
      mostrar {"ok":true,...}. Si dice "No se encontró la función doGet",
      no se publicó la versión nueva (repetí el paso 3).

   Concurrencia: varios entrenadores guardan a la vez. Cada jugadora lleva
   "updatedAt"; el script mezcla por id y se queda con el cambio más nuevo,
   con LockService para que dos guardados simultáneos no se pisen.
   ========================================================================== */

var HOJA = 'Jugadoras';
var PROPIEDAD_VIEJA = 'CCBA_PLAYERS_2027';   // donde guardaba la versión anterior

/* Orden de columnas al crear la hoja. Se lee y escribe POR NOMBRE de columna,
   así que si alguien reordena columnas en Sheets no se rompe nada. */
var COLUMNAS = [
  'id', 'cat', 'sec', 'apellido', 'nombre', 'year', 'eq2026',
  'tecnica', 'tactica', 'fisica', 'psico', 'promedio', 'semaforo',
  'target2027', 'asistencia_pct', 'notes',
  'recepcion', 'definicion', 'attendance', 'updatedAt'
];

/* Columnas calculadas solo para que la planilla sea legible: no se leen. */
var CALCULADAS = { promedio: true, asistencia_pct: true };
var NUMERICAS = { sec: true, year: true, tecnica: true, tactica: true, fisica: true,
                  psico: true, recepcion: true, definicion: true, updatedAt: true };
var ORDEN_CAT = { '7MAS': 1, '6TAS': 2, '5TAS': 3, 'PRUEBA': 4, '8VAS': 5 };

/* ------------------------------ LEER ------------------------------ */
function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    var jugadoras = leerJugadoras();
    if (p.accion === 'ping') {
      return json({ ok: true, hoja: HOJA, total: jugadoras.length, version: 2 }, p.callback);
    }
    return json(jugadoras, p.callback);   // la app espera el array directo
  } catch (err) {
    return json({ ok: false, error: String(err) }, p.callback);
  }
}

/* ----------------------------- GUARDAR ----------------------------- */
/* Cuerpo aceptado:
     { accion: 'actualizar', jugadoras: [...] }  → mezcla por id (lo normal)
     { accion: 'sembrar',    jugadoras: [...] }  → solo si la hoja está vacía
     { accion: 'reemplazar', jugadoras: [...] }  → pisa todo (restaurar padrón)
     [ ...jugadoras ]                            → versión vieja: se mezcla   */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
    var cuerpo = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var accion = Array.isArray(cuerpo) ? 'actualizar' : (cuerpo.accion || 'actualizar');
    var entrantes = Array.isArray(cuerpo) ? cuerpo : (cuerpo.jugadoras || []);
    entrantes = entrantes.filter(function (j) { return j && j.id; });

    var actuales = leerJugadoras();
    var resultado;

    if (accion === 'sembrar') {
      if (actuales.length) return json({ ok: true, sembrado: false, total: actuales.length });
      resultado = entrantes;
    } else if (accion === 'reemplazar') {
      resultado = entrantes;
    } else {
      resultado = mezclar(actuales, entrantes);
    }

    escribirJugadoras(resultado);
    return json({ ok: true, accion: accion, recibidas: entrantes.length, total: resultado.length });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function mezclar(actuales, entrantes) {
  var porId = {};
  var orden = [];
  actuales.forEach(function (j) { porId[j.id] = j; orden.push(j.id); });
  entrantes.forEach(function (j) {
    var previa = porId[j.id];
    if (!previa) { porId[j.id] = j; orden.push(j.id); return; }
    // Gana el cambio más reciente; si no traen fecha, gana lo que llega.
    if ((Number(j.updatedAt) || 0) >= (Number(previa.updatedAt) || 0)) porId[j.id] = j;
  });
  return orden.map(function (id) { return porId[id]; });
}

/* ------------------------------ HOJA ------------------------------ */
function obtenerHoja() {
  var libro = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = libro.getSheetByName(HOJA);
  if (!hoja) hoja = libro.insertSheet(HOJA);
  if (hoja.getLastRow() === 0) {
    hoja.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS])
      .setFontWeight('bold').setBackground('#1e3a8a').setFontColor('#ffffff');
    hoja.setFrozenRows(1);
  } else {
    var cab = cabecera(hoja);
    var faltan = COLUMNAS.filter(function (c) { return cab.indexOf(c) === -1; });
    if (faltan.length) {
      hoja.getRange(1, cab.length + 1, 1, faltan.length).setValues([faltan])
        .setFontWeight('bold').setBackground('#1e3a8a').setFontColor('#ffffff');
    }
  }
  return hoja;
}

function cabecera(hoja) {
  return hoja.getRange(1, 1, 1, Math.max(1, hoja.getLastColumn())).getValues()[0]
    .map(function (c) { return String(c).trim(); });
}

function leerJugadoras() {
  var hoja = obtenerHoja();
  if (hoja.getLastRow() < 2) return migrarVersionVieja();

  var valores = hoja.getRange(1, 1, hoja.getLastRow(), hoja.getLastColumn()).getValues();
  var cab = valores.shift().map(function (c) { return String(c).trim(); });

  return valores.map(function (fila) {
    var j = {};
    cab.forEach(function (col, i) {
      if (!col || CALCULADAS[col]) return;
      var v = fila[i];
      if (col === 'attendance') {
        try { v = v ? JSON.parse(v) : {}; } catch (x) { v = {}; }
      } else if (NUMERICAS[col]) {
        v = (v === '' || v === null || isNaN(Number(v))) ? (col === 'updatedAt' ? 0 : v) : Number(v);
      } else {
        v = (v === null || v === undefined) ? '' : String(v);
      }
      j[col] = v;
    });
    return j;
  }).filter(function (j) { return j.id; });
}

function escribirJugadoras(lista) {
  var hoja = obtenerHoja();
  var cab = cabecera(hoja);

  lista = lista.slice().sort(function (a, b) {
    var ca = ORDEN_CAT[a.cat] || 9, cb = ORDEN_CAT[b.cat] || 9;
    if (ca !== cb) return ca - cb;
    return (Number(a.sec) || 999) - (Number(b.sec) || 999);
  });

  var filas = lista.map(function (j) {
    return cab.map(function (col) {
      if (col === 'promedio') return promedio(j);
      if (col === 'asistencia_pct') return asistencia(j);
      if (col === 'attendance') return JSON.stringify(j.attendance || {});
      var v = j[col];
      if (v === undefined || v === null) return '';
      if (NUMERICAS[col]) return isNaN(Number(v)) ? '' : Number(v);
      return comoTexto(v);
    });
  });

  // Limpiamos los datos viejos (no la cabecera) y escribimos todo de una vez.
  var ultima = hoja.getLastRow();
  if (ultima > 1) hoja.getRange(2, 1, ultima - 1, Math.max(1, hoja.getLastColumn())).clearContent();
  if (filas.length) hoja.getRange(2, 1, filas.length, cab.length).setValues(filas);
}

/* Un texto que empieza con = + - @ Sheets lo toma como fórmula
   ("+ Recepción revés" daba #ERROR!). El apóstrofo lo fuerza a texto y
   no aparece al leerlo. */
function comoTexto(v) {
  var s = String(v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function promedio(j) {
  var vals = [j.tecnica, j.tactica, j.fisica, j.psico].map(Number);
  if (vals.some(isNaN)) return '';
  return Math.round((vals[0] + vals[1] + vals[2] + vals[3]) / 4 * 10) / 10;
}

function asistencia(j) {
  var a = j.attendance || {};
  var claves = Object.keys(a);
  if (!claves.length) return 0;
  var presentes = claves.filter(function (k) { return a[k]; }).length;
  return Math.round(presentes / 15 * 100);   // 15 sesiones de la planilla de noviembre
}

/* Si existía la versión anterior (todo en PropertiesService), la pasamos a la
   hoja la primera vez para no perder nada de lo que se haya cargado. */
function migrarVersionVieja() {
  var props = PropertiesService.getScriptProperties();
  var viejo = props.getProperty(PROPIEDAD_VIEJA);
  if (!viejo) return [];
  try {
    var lista = JSON.parse(viejo);
    if (Array.isArray(lista) && lista.length) {
      escribirJugadoras(lista);
      props.deleteProperty(PROPIEDAD_VIEJA);
      return lista;
    }
  } catch (x) {}
  return [];
}

/* JSONP opcional con ?callback=; sin callback, JSON normal. */
function json(obj, callback) {
  var texto = JSON.stringify(obj);
  if (callback && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + texto + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(texto).setMimeType(ContentService.MimeType.JSON);
}

