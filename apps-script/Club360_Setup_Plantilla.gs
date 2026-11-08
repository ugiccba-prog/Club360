/**
 * ============================================================================
 * CLUB 360 · GENERADOR AUTOMÁTICO DE PLANILLA CASCARÓN
 * ============================================================================
 * Este script se ejecuta UNA SOLA VEZ sobre una planilla de Google en blanco
 * para crear la "Plantilla Base" que luego compartirás con el enlace /copy.
 *
 * CÓMO USARLO:
 * 1. Creá un Google Sheet nuevo en blanco: "Club 360 · Sistema de Gestión [Plantilla Base]"
 * 2. Andá a Extensiones > Apps Script.
 * 3. Pegá este archivo y seleccioná la función: inicializarPlantillaBase
 * 4. Tocá ▶ Ejecutar.
 * 5. ¡Listo! En 3 segundos tu planilla queda 100% configurada y formateada.
 * ============================================================================
 */

function inicializarPlantillaBase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var colorHeader = '#0b2545';
  var textoHeader = '#ffffff';

  // 1. PESTAÑA: CONFIGURACIÓN
  var shConf = ss.getSheetByName('Configuración') || ss.insertSheet('Configuración');
  shConf.clear();
  
  var datosConfig = [
    ['PARÁMETRO', 'VALOR', 'DESCRIPCIÓN / INSTRUCCIONES PARA EL COORDINADOR'],
    ['Nombre del Club', 'Club Atlético Ejemplo', 'Nombre de tu institución que aparecerá en la web y reportes'],
    ['URL del Escudo / Logo', 'https://cdn-icons-png.flaticon.com/512/857/857418.png', 'Enlace directo de la imagen del escudo de tu club (Drive, web, etc.)'],
    ['Color Primario (Hex)', '#0b2545', 'Color principal de la cabecera e identidad (ej: #0b2545 o #1e3a8a)'],
    ['Color Secundario (Hex)', '#00a8e8', 'Color de acento para botones y alertas (ej: #00a8e8 o #f59e0b)'],
    ['Clave Coordinación', 'coord360', 'Contraseña para acceder a estadísticas, padrón y legajos'],
    ['Clave Entrenadores', 'profe360', 'Contraseña que usarán los profes para pasar lista y evaluar'],
    ['Email de Notificaciones', 'coordinacion@tudominio.com', 'Donde se enviarán las auditorías semanales y alertas'],
    ['Deportes y Disciplinas', 'Fútbol Caballeros, Fútbol Damas, Básquet, Vóley, Hockey, Tenis, Natación, Patín, Rugby, Gimnasia', 'Separados por comas. Podés agregar o quitar las que use tu club'],
    ['Estado de Licencia', 'ACTIVA', 'Controlado automáticamente por el servidor central de Club 360']
  ];

  shConf.getRange(1, 1, datosConfig.length, 3).setValues(datosConfig);
  shConf.getRange('A1:C1').setBackground(colorHeader).setFontColor(textoHeader).setFontWeight('bold');
  shConf.getRange('A2:A10').setFontWeight('bold');
  shConf.getRange('C2:C10').setFontColor('#64748b').setFontStyle('italic');
  shConf.setColumnWidth(1, 220);
  shConf.setColumnWidth(2, 280);
  shConf.setColumnWidth(3, 420);
  shConf.setFrozenRows(1);

  // 2. PESTAÑA: PADRÓN
  var shPadron = ss.getSheetByName('Padron') || ss.insertSheet('Padron');
  shPadron.clear();
  var cabPadron = ['Deporte', 'Categoría', 'Equipo', 'Jugador', 'DNI'];
  shPadron.appendRow(cabPadron);
  // Datos de ejemplo
  var ejemploPadron = [
    ['Fútbol Caballeros', 'Sub 15', 'A', 'Gómez, Lucas', '44123456'],
    ['Fútbol Caballeros', 'Sub 15', 'A', 'Rodríguez, Mateo', '44234567'],
    ['Fútbol Damas', 'Primera', 'Tira Única', 'Fernández, Sofía', '42345678'],
    ['Básquet', 'U17', 'Rojo', 'Martínez, Lautaro', '43456789'],
    ['Hockey', 'Quinta', 'Blanco', 'Alonso, Valentina', '45678901'],
    ['Vóley', 'Mayores', 'A', 'López, Camila', '41234567']
  ];
  shPadron.getRange(2, 1, ejemploPadron.length, 5).setValues(ejemploPadron);
  formatearEncabezado(shPadron, cabPadron.length, colorHeader, textoHeader);
  shPadron.setColumnWidth(1, 180);
  shPadron.setColumnWidth(2, 120);
  shPadron.setColumnWidth(3, 120);
  shPadron.setColumnWidth(4, 220);
  shPadron.setColumnWidth(5, 120);

  // 3. PESTAÑA: ASISTENCIA
  var shAsis = ss.getSheetByName('Asistencia') || ss.insertSheet('Asistencia');
  shAsis.clear();
  var cabAsis = ['Fecha', 'Deporte', 'Categoría', 'Equipo', 'Jugador', 'Estado'];
  shAsis.appendRow(cabAsis);
  var hoy = Utilities.formatDate(new Date(), 'America/Argentina/Buenos_Aires', 'yyyy-MM-dd');
  var ejemploAsis = [
    [hoy, 'Fútbol Caballeros', 'Sub 15', 'A', 'Gómez, Lucas', 'P'],
    [hoy, 'Fútbol Caballeros', 'Sub 15', 'A', 'Rodríguez, Mateo', 'P'],
    [hoy, 'Fútbol Damas', 'Primera', 'Tira Única', 'Fernández, Sofía', 'A']
  ];
  shAsis.getRange(2, 1, ejemploAsis.length, 6).setValues(ejemploAsis);
  formatearEncabezado(shAsis, cabAsis.length, colorHeader, textoHeader);
  shAsis.setColumnWidth(1, 110);
  shAsis.setColumnWidth(2, 180);
  shAsis.setColumnWidth(3, 120);
  shAsis.setColumnWidth(4, 120);
  shAsis.setColumnWidth(5, 220);
  shAsis.setColumnWidth(6, 120);

  // 4. PESTAÑA: EVALUACIONES
  var shEval = ss.getSheetByName('Evaluaciones') || ss.insertSheet('Evaluaciones');
  shEval.clear();
  var cabEval = ['Fecha', 'Deporte', 'Categoría', 'Equipo', 'Jugador', 'Detalle Notas', 'Promedio'];
  shEval.appendRow(cabEval);
  var ejemploEval = [
    [hoy, 'Fútbol Caballeros', 'Sub 15', 'A', 'Gómez, Lucas', 'Técnica: 8 | Táctica: 7 | Físico: 9', 8],
    [hoy, 'Fútbol Caballeros', 'Sub 15', 'A', 'Rodríguez, Mateo', 'Técnica: 9 | Táctica: 8 | Físico: 8', 8.33],
    [hoy, 'Fútbol Damas', 'Primera', 'Tira Única', 'Fernández, Sofía', 'Técnica: 10 | Táctica: 9 | Físico: 8', 9]
  ];
  shEval.getRange(2, 1, ejemploEval.length, 7).setValues(ejemploEval);
  formatearEncabezado(shEval, cabEval.length, colorHeader, textoHeader);
  shEval.setColumnWidth(1, 110);
  shEval.setColumnWidth(2, 180);
  shEval.setColumnWidth(3, 120);
  shEval.setColumnWidth(4, 120);
  shEval.setColumnWidth(5, 220);
  shEval.setColumnWidth(6, 320);
  shEval.setColumnWidth(7, 90);

  // 5. PESTAÑA: GESTOS
  var shGest = ss.getSheetByName('Gestos') || ss.insertSheet('Gestos');
  shGest.clear();
  var cabGest = ['Deporte', 'Gesto'];
  shGest.appendRow(cabGest);
  var ejemploGestos = [
    ['Fútbol Caballeros', 'Pase Corto'],
    ['Fútbol Caballeros', 'Control Orientado'],
    ['Fútbol Caballeros', 'Remate'],
    ['Básquet', 'Tiro Libre'],
    ['Básquet', 'Bandeja'],
    ['Hockey', 'Push'],
    ['Hockey', 'Barrida'],
    ['Vóley', 'Saque'],
    ['Vóley', 'Remate']
  ];
  shGest.getRange(2, 1, ejemploGestos.length, 2).setValues(ejemploGestos);
  formatearEncabezado(shGest, cabGest.length, colorHeader, textoHeader);
  shGest.setColumnWidth(1, 180);
  shGest.setColumnWidth(2, 250);

  // Eliminar Hoja 1 por defecto si quedó
  var hojaDefecto = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (hojaDefecto && ss.getSheets().length > 1) {
    try { ss.deleteSheet(hojaDefecto); } catch (_) {}
  }

  // Activar pestaña Configuración al abrir
  ss.setActiveSheet(shConf);
  console.log('Planilla Base de Club 360 creada con éxito.');
}

function formatearEncabezado(hoja, columnas, bg, fg) {
  hoja.getRange(1, 1, 1, columnas)
    .setBackground(bg)
    .setFontColor(fg)
    .setFontWeight('bold');
  hoja.setFrozenRows(1);
}
