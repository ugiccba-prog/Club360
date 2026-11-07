# CLUB 360 · MANUAL MAESTRO DE ARQUITECTURA B2B
## Modelo de "Librería Blindada + Planilla Cascarón" con Control Remoto de Licencias

> **Propiedad Intelectual y Confidencialidad:** Este manual y el código fuente del "Cerebro" pertenecen exclusivamente a **Juan Machado / Club 360**. Ningún cliente ni coordinador tiene acceso al código fuente.

---

## 1. Visión General de la Arquitectura B2B

El modelo **Librería Blindada + Planilla Cascarón** resuelve los tres grandes desafíos de vender software deportivo construido sobre el ecosistema de Google:

1. **Privacidad Total de los Datos del Cliente:** El Coordinador es el dueño absoluto de su base de datos. Su Google Sheet vive en su propio Google Drive; ni los otros clubes ni intermediarios pueden ver sus deportistas o notas.
2. **Protección Total de tu Propiedad Intelectual:** Tu código fuente (cientos de líneas de HTML, CSS, JavaScript y algoritmos pedagógicos) reside en **tu propia cuenta de Google**. El cliente solo recibe un script de 6 líneas que hace de "puente".
3. **Control Remoto de Licencias (Kill-Switch Central):** Si un cliente deja de pagar la suscripción mensual o anual, podés suspender su acceso desde tu propia planilla privada en 1 clic. Al instante, la aplicación en los celulares de todos los entrenadores de ese club se bloquea y muestra una pantalla roja de "Licencia Inactiva" con enlace directo a tu WhatsApp.

```
       +-------------------------------------------------------+
       |           TU CUENTA DE GOOGLE (PROPIETARIO)           |
       |                                                       |
       |   [Planilla Maestra de Licencias]                     |
       |   - ID Planilla Cliente                               |
       |   - Nombre del Club                                   |
       |   - Estado (ACTIVA / INACTIVA)                        |
       |   - Vencimiento                                       |
       |                                                       |
       |   [Cerebro / Librería: Club360Core]                   |
       |   - Club360_Cerebro_Libreria.gs                       |
       |   - Club360_App_Frontend.html                         |
       |   - Validador DRM y CacheService                      |
       |   - Motor de Marca Blanca Dinámica                    |
       +-------------------------------------------------------+
                                  ▲
                                  │ Conexión vía Biblioteca
                                  │ (Script ID Privado)
                                  ▼
       +-------------------------------------------------------+
       |          CUENTA DE GOOGLE DEL COORDINADOR             |
       |                                                       |
       |   [Google Sheet del Club] (Planilla Cascarón)         |
       |   - Pestaña "Configuración" (Nombre, Logo, Colores)   |
       |   - Pestaña "Padron"                                  |
       |   - Pestaña "Asistencia"                              |
       |   - Pestaña "Evaluaciones"                            |
       |   - Pestaña "Gestos"                                  |
       |                                                       |
       |   [Apps Script Cascarón] (Solo 6 líneas de código)    |
       |   function doGet(e)  --> Club360Core.renderizarWeb()  |
       |   function doPost(e) --> Club360Core.procesarDatos()  |
       +-------------------------------------------------------+
                                  │
                  Despliegue Web: Ejecutar como "Yo"
                  Acceso: "Cualquier persona"
                                  ▼
       +-------------------------------------------------------+
       |               CELULARES DE LOS ENTRENADORES           |
       |                                                       |
       |   URL: script.google.com/macros/s/.../exec            |
       |   - Ven la app con el logo y colores de SU club       |
       |   - Toman lista y evalúan en 1 toque en la cancha     |
       |   - Impacta en tiempo real en el Sheet del Coord.     |
       +-------------------------------------------------------+
```

---

## 2. Paso a Paso: Puesta en Marcha del Sistema

### Paso 1: Crear y Publicar "El Cerebro" (Tu Librería Blindada)
1. Abrí [script.google.com](https://script.google.com/) con tu cuenta de Google.
2. Tocá **Nuevo proyecto** y nombralo: `Club360_Cerebro_Core`.
3. En el archivo `Código.gs`, borrá todo y pegá el contenido de:
   `apps-script/Club360_Cerebro_Libreria.gs`.
4. Creá un archivo HTML tocando el botón **+ > HTML**, nombralo `Club360_App_Frontend` y pegá el contenido de:
   `apps-script/Club360_App_Frontend.html`.
5. Guardá los cambios (💾).
6. Andá a **Configuración del proyecto** (ícono de engranaje ⚙️ a la izquierda) y copiá el **ID de la secuencia de comandos** (ej: `1A2B3C4D5E6F...`). *Este es el ID que usarán las planillas cascarón.*
7. Tocá **Implementar > Nueva implementación**:
   - Tipo: **Biblioteca**.
   - Descripción: `Versión 1 - Core Oficial Club 360`.
   - Tocá **Implementar**.

> [!NOTE]
> Para que los clientes puedan usar tu librería sin ver tu código:
> Tocá el botón **Compartir** en la esquina superior derecha del proyecto en script.google.com y configuralo como:
> **"Cualquier persona que tenga el vínculo puede ver" (Lector)**.
> Al estar como "Lector", Apps Script permite que otras planillas la invoquen como Biblioteca, pero nadie puede editar tu código. Y los usuarios que solo entran a la web mediante la URL `/exec` de su coordinador **ni siquiera necesitan ver el script**.

---

### Paso 2: Crear tu Planilla Maestra de Licencias
1. En tu Google Drive, creá una nueva planilla llamada:
   `Club 360 · Maestro de Licencias y Clientes`.
2. Andá a **Extensiones > Apps Script**, pegá el contenido de `apps-script/Club360_Control_Licencias.gs` y guardá.
3. En la función seleccioná `setupHojaLicencias` y tocá **▶ Ejecutar**. Autorizá los permisos.
4. Volvé a tu planilla: verás la pestaña **Licencias** creada y un nuevo menú superior **🔐 Club 360 Licencias**.
5. Copiá el **ID de esta planilla** de tu navegador (lo que está entre `/d/` y `/edit`).
6. Pegalo en tu archivo `Club360_Cerebro_Libreria.gs` en la línea:
   ```javascript
   ID_PLANILLA_LICENCIAS: 'PEGAR_AQUI_EL_ID_DE_TU_PLANILLA_DE_LICENCIAS',
   ```
7. En el Cerebro tocá **Implementar > Administrar implementaciones > Editar (✏️) > Versión: Nueva versión > Implementar**.

---

### Paso 3: Crear la "Planilla Cascarón" (El Producto que Venderás)
1. En tu Google Drive, creá una planilla llamada:
   `Club 360 · Sistema de Gestión [Plantilla Base]`.
2. Andá a **Extensiones > Apps Script**.
3. Pegá temporalmente el contenido de `apps-script/Club360_Setup_Plantilla.gs`.
4. Ejecutá la función `inicializarPlantillaBase`.
   - En 3 segundos, se crean las 5 pestañas (`Configuración`, `Padron`, `Asistencia`, `Evaluaciones`, `Gestos`) con estilo profesional, anchos de columna y datos de muestra.
5. Ahora borrá el código de ese script y dejá **únicamente** las 6 líneas del conector cascarón:
   ```javascript
   function doGet(e) {
     return Club360Core.renderizarWeb(e, SpreadsheetApp.getActiveSpreadsheet().getId());
   }

   function doPost(e) {
     return Club360Core.procesarDatos(e, SpreadsheetApp.getActiveSpreadsheet().getId());
   }
   ```
6. En el panel izquierdo de Apps Script, tocá el **+** al lado de **Bibliotecas**:
   - Pegá tu **ID de la secuencia de comandos**: `1cW7lNtXiSKCnhbQqo63NdR94iuuci8ilGCNBSwB9WTGNcs77ln-JsFRm`
   - En **Identificador**, escribí exactamente: `Club360Core`.
   - Seleccioná la **Versión 1** (o la más reciente).
   - Tocá **Agregar**.
7. Guardá (💾).
8. Volvé a la planilla de Google Sheets y cambiá el final de la URL en la barra de tu navegador:
   Reemplazá `/edit?usp=sharing` por `/copy`.
   
   **Ejemplo:**
   `https://docs.google.com/spreadsheets/d/1XyZ.../copy`

**¡Este enlace `/copy` es tu producto comercial final!**

---

## 3. El Flujo de Venta y Onboarding (En 60 Segundos)

Cuando un nuevo club te compra la plataforma:

1. **El Cliente Copia el Sistema:**
   Le enviás el enlace `/copy` junto con el PDF de Bienvenida. Al tocarlo, Google le muestra el botón azul: *"¿Deseas crear una copia de Club 360 · Sistema de Gestión [Plantilla Base]?"*.
   Al aceptar, la planilla se duplica dentro del Google Drive del cliente.
2. **El Cliente Personaliza su Institución:**
   El Coordinador abre la pestaña `Configuración` y escribe:
   - Nombre de su Club (ej: "Club Social y Deportivo Belgrano").
   - Link de su escudo (subido a Google Drive o web).
   - Sus colores institucionales (ej: Azul y Amarillo).
   - Sus claves (para coordinadores y profes).
   - Los deportes que tiene su club.
3. **El Cliente Activa la Web para sus Entrenadores:**
   Va a **Extensiones > Apps Script > Implementar > Nueva implementación**:
   - Tipo: **Aplicación web**.
   - Ejecutar como: **Yo (el Coordinador)**.
   - Quién tiene acceso: **Cualquier persona**.
   - Toca **Implementar** y autoriza los permisos con su propia cuenta de Google.
4. **Activación de Licencia:**
   - La primera vez que el coordinador o sus profes abren el enlace resultante, verán la pantalla de bienvenida con su **ID de Planilla**.
   - El coordinador te pasa ese ID por WhatsApp.
   - Abrís tu planilla privada de licencias, tocás **🔐 Club 360 Licencias > Activar Nuevo Cliente**, pegás el ID, la cantidad de meses y listo.
   - Al recargar la página, la plataforma queda 100% activa e interactiva con su logo, colores y deportes.

---

## 4. Control Remoto de Clientes y Suscripciones

En tu planilla privada `Club 360 · Maestro de Licencias y Clientes` tenés el control total:

| Acción | Cómo se hace | Qué pasa en la cancha |
| :--- | :--- | :--- |
| **Activar nuevo cliente** | Menú > Activar Nuevo Cliente | La web se desbloquea al instante. |
| **Suspender por falta de pago** | Menú > Suspender / Bloquear Cliente | La app se bloquea de inmediato. Los entrenadores ven la pantalla roja de "Licencia Inactiva" y el botón para contactarte. |
| **Renovar mensualidad** | Editás la fecha de vencimiento | Continúa operando con normalidad. |
| **Control de versiones** | Publicás nueva versión en tu Cerebro | **Todos los clientes del mundo se actualizan automáticamente** sin que tengan que tocar nada. |

---

## 5. Garantías de Seguridad y Propiedad Intelectual

1. **¿Puede el cliente ver tu código HTML o Apps Script?**
   No. El proyecto del cliente solo contiene la llamada `Club360Core.renderizarWeb()`. Todo el código fuente vive en tu proyecto privado de Apps Script.
2. **¿Puede un cliente compartir el link de su planilla con otro club sin pagarte?**
   No. Cada nueva copia en Google Drive genera un `Spreadsheet ID` único y diferente. Si ese nuevo ID no está dado de alta en tu Planilla Maestra de Licencias, el sistema permanece bloqueado.
3. **¿Tus servidores se caen o consumen costos de hosting?**
   Cero costos de hosting. Toda la infraestructura corre sobre los servidores de Google (Apps Script + Google Drive + Google Sheets), con disponibilidad 24/7 y certificado SSL gratuito.
