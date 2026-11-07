/**
 * ============================================================================
 * CLUB 360 · CONTROL CENTRAL DE LICENCIAS Y SUSCRIPCIONES
 * ============================================================================
 * Este script se instala en TU planilla privada de administración de ventas:
 * "Club 360 · Maestro de Licencias y Clientes".
 *
 * Te permite:
 * - Activar nuevos clientes en 1 click
 * - Suspender morosos al instante (bloquea la app en los celulares de sus profes)
 * - Manejar planes mensuales, anuales o demos de prueba gratuita
 * ============================================================================
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🔐 Club 360 Licencias')
    .addItem('1. Inicializar Planilla de Licencias', 'setupHojaLicencias')
    .addSeparator()
    .addItem('➕ Activar Nuevo Cliente', 'menuActivarCliente')
    .addItem('⛔ Suspender / Bloquear Cliente', 'menuSuspenderCliente')
    .addItem('🔍 Auditar Vencimientos', 'auditarVencimientos')
    .addToUi();
}

/**
 * Crea la estructura inicial de la planilla privada de licencias de Juan
 */
function setupHojaLicencias() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Licencias') || ss.insertSheet('Licencias');
  
  var cabeceras = [
    'ID_Planilla_Cliente (Sheet ID)',
    'Nombre del Club / Institución',
    'Contacto / WhatsApp',
    'Plan (Mensual/Anual/Demo)',
    'Fecha Alta',
    'Vencimiento',
    'Estado (ACTIVA / INACTIVA / DEMO)',
    'Notas / Pagos'
  ];

  if (sh.getLastRow() === 0) {
    sh.appendRow(cabeceras);
    sh.getRange(1, 1, 1, cabeceras.length)
      .setBackground('#0f172a')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    sh.setFrozenRows(1);
    
    // Fila de ejemplo
    sh.appendRow([
      '1EjemploID_De_Planilla_Del_Coordinador_xyz123',
      'Club Social y Deportivo Demo',
      '+54 9 11 1234-5678',
      'Mensual',
      new Date(),
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 días
      'ACTIVA',
      'Pago mensual recibido vía transferencia'
    ]);

    sh.setColumnWidth(1, 320);
    sh.setColumnWidth(2, 220);
    sh.setColumnWidth(3, 160);
    sh.setColumnWidth(4, 120);
    sh.setColumnWidth(5, 110);
    sh.setColumnWidth(6, 110);
    sh.setColumnWidth(7, 130);
    sh.setColumnWidth(8, 260);

    SpreadsheetApp.getUi().alert('✅ Planilla de Licencias inicializada correctamente.');
  } else {
    SpreadsheetApp.getUi().alert('ℹ️ La hoja "Licencias" ya contiene datos.');
  }
}

/**
 * Menú interactivo para registrar y activar un nuevo cliente
 */
function menuActivarCliente() {
  var ui = SpreadsheetApp.getUi();
  var respId = ui.prompt('Paso 1 de 4', 'Pegá el ID de la Planilla del Cliente (lo que está entre /d/ y /edit en su URL):', ui.ButtonSet.OK_CANCEL);
  if (respId.getSelectedButton() !== ui.Button.OK) return;
  var idPlanilla = respId.getResponseText().trim();
  if (!idPlanilla) return;

  var respClub = ui.prompt('Paso 2 de 4', 'Nombre del Club o Colegio:', ui.ButtonSet.OK_CANCEL);
  if (respClub.getSelectedButton() !== ui.Button.OK) return;
  var nombreClub = respClub.getResponseText().trim();

  var respContacto = ui.prompt('Paso 3 de 4', 'Número de WhatsApp o email de contacto:', ui.ButtonSet.OK_CANCEL);
  if (respContacto.getSelectedButton() !== ui.Button.OK) return;
  var contacto = respContacto.getResponseText().trim();

  var respMeses = ui.prompt('Paso 4 de 4', '¿Cuántos meses de vigencia le otorgás? (Ej: 1, 3, 12):', ui.ButtonSet.OK_CANCEL);
  if (respMeses.getSelectedButton() !== ui.Button.OK) return;
  var meses = parseInt(respMeses.getResponseText().trim(), 10) || 1;

  activarClienteDirecto(idPlanilla, nombreClub, contacto, 'Suscripción ' + meses + 'M', meses);
  ui.alert('🎉 ¡Cliente activado con éxito!\n\nClub: ' + nombreClub + '\nVigencia: ' + meses + ' mes(es).\nYa puede usar la plataforma.');
}

/**
 * Función que inscribe o actualiza el registro en la hoja y limpia la caché
 */
function activarClienteDirecto(idPlanilla, nombreClub, contacto, plan, meses) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Licencias') || ss.getSheets()[0];
  var datos = sh.getDataRange().getValues();

  var hoy = new Date();
  var vencimiento = new Date();
  vencimiento.setMonth(vencimiento.getMonth() + (meses || 1));

  var filaIndex = -1;
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][0]).trim() === idPlanilla) {
      filaIndex = i + 1;
      break;
    }
  }

  if (filaIndex !== -1) {
    // Actualizar registro existente
    sh.getRange(filaIndex, 2).setValue(nombreClub || datos[filaIndex - 1][1]);
    sh.getRange(filaIndex, 3).setValue(contacto || datos[filaIndex - 1][2]);
    sh.getRange(filaIndex, 4).setValue(plan);
    sh.getRange(filaIndex, 6).setValue(vencimiento);
    sh.getRange(filaIndex, 7).setValue('ACTIVA');
  } else {
    // Nueva fila
    sh.appendRow([
      idPlanilla,
      nombreClub,
      contacto,
      plan,
      hoy,
      vencimiento,
      'ACTIVA',
      'Alta inicial ' + Utilities.formatDate(hoy, 'America/Argentina/Buenos_Aires', 'dd/MM/yyyy')
    ]);
  }

  // Si este script tiene acceso a la caché, invalidamos
  try {
    CacheService.getScriptCache().remove('lic_' + idPlanilla);
  } catch (_) {}
}

/**
 * Menú interactivo para suspender a un cliente por falta de pago
 */
function menuSuspenderCliente() {
  var ui = SpreadsheetApp.getUi();
  var resp = ui.prompt('Bloquear Licencia', 'Pegá el ID de la Planilla que deseás suspender:', ui.ButtonSet.OK_CANCEL);
  if (resp.getSelectedButton() !== ui.Button.OK) return;
  var idPlanilla = resp.getResponseText().trim();

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Licencias') || ss.getSheets()[0];
  var datos = sh.getDataRange().getValues();

  var encontrado = false;
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][0]).trim() === idPlanilla) {
      sh.getRange(i + 1, 7).setValue('INACTIVA');
      sh.getRange(i + 1, 8).setValue('Suspendido el ' + Utilities.formatDate(new Date(), 'America/Argentina/Buenos_Aires', 'dd/MM/yyyy') + ' por falta de pago');
      encontrado = true;
      break;
    }
  }

  if (encontrado) {
    try { CacheService.getScriptCache().remove('lic_' + idPlanilla); } catch (_) {}
    ui.alert('⛔ La licencia ha sido suspendida. Si los entrenadores entran, verán la pantalla roja de Licencia Inactiva con el botón a tu WhatsApp.');
  } else {
    ui.alert('❌ No se encontró ningún club registrado con ese ID de planilla.');
  }
}

/**
 * Revisa fechas de vencimiento y colorea en rojo los vencidos
 */
function auditarVencimientos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Licencias') || ss.getSheets()[0];
  var datos = sh.getDataRange().getValues();
  var hoy = new Date().getTime();
  var vencidos = 0;

  for (var i = 1; i < datos.length; i++) {
    var v = datos[i][5];
    if (v instanceof Date) {
      if (v.getTime() < hoy) {
        sh.getRange(i + 1, 7).setValue('VENCIDA').setBackground('#fee2e2').setFontColor('#dc2626');
        vencidos++;
      } else {
        var estado = String(datos[i][6]).trim().toUpperCase();
        if (estado === 'ACTIVA') {
          sh.getRange(i + 1, 7).setBackground('#dcfce7').setFontColor('#15803d');
        }
      }
    }
  }

  SpreadsheetApp.getUi().alert('Auditoría completada. Clientes vencidos encontrados: ' + vencidos);
}
