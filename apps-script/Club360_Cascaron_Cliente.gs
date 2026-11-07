/**
 * ============================================================================
 * CLUB 360 · CONECTOR DE PLANILLA CASCARÓN
 * ============================================================================
 * Este es el ÚNICO código que vive en la planilla del Coordinador.
 * Todo el cerebro, la seguridad, la lógica de negocio y la interfaz gráfica
 * residen en la librería protegida 'Club360Core'.
 *
 * Instrucciones:
 * 1. En Extensiones > Apps Script > Bibliotecas (+), pegar este ID de biblioteca:
 *    1cW7lNtXiSKCnhbQqo63NdR94iuuci8ilGCNBSwB9WTGNcs77ln-JsFRm
 *    Y asignarle exactamente el identificador: Club360Core
 * 2. Tocar: Implementar > Nueva implementación > Tipo: Aplicación web
 *    - Ejecutar como: Yo (El Coordinador)
 *    - Quién tiene acceso: Cualquier persona
 * 3. Copiar la URL pública resultante y enviarla a los entrenadores.
 * ============================================================================
 */

function doGet(e) {
  // Llama a la librería blindada y le indica cuál es la planilla del cliente
  return Club360Core.renderizarWeb(e, SpreadsheetApp.getActiveSpreadsheet().getId());
}

function doPost(e) {
  // Procesa las solicitudes de login, asistencias y evaluaciones
  return Club360Core.procesarDatos(e, SpreadsheetApp.getActiveSpreadsheet().getId());
}
