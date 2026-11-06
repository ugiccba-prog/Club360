# 🏆 UGI - Unidad de Gestión Integral 
### Club Ciudad de Buenos Aires

Repositorio oficial del sitio web de la **UGI (Unidad de Gestión Integral)** del **Club Ciudad de Buenos Aires**, plataforma transversal dedicada a la formación integral, la convivencia deportiva y el desarrollo de deportistas, familias y entrenadores.

> *"El entrenamiento que no se ve también se entrena."*

---

## 🎯 Objetivo de la Plataforma
Centralizar los recursos pedagógicos, las herramientas de convivencia y el sistema unificado de gestión de cancha del Club Ciudad de Buenos Aires, garantizando un marco formativo compartido entre deportistas, familias y cuerpo técnico.

---

## 🏛️ Ecosistema y Estructura del Sitio

### 1. Portada y Portales Públicos
* **`index.html`**: Portada principal institucional, con presentación del propósito, programas y acceso a los portales formativos.
* **`pages/jugadores.html`**: Portal de Jugadores con Gimnasio Mental, toma de decisiones, check-in emocional con el Semáforo UGI y guías de desarrollo formativo.
* **`pages/familias.html`**: Portal de Familias con pautas de convivencia deportiva, recomendaciones para acompañar sin presionar y descarga de la guía *"El Otro Equipo"*.
* **`pages/`**:
  * `semaforo-ugi.html`: Guía visual de autorregulación y convivencia en cancha.
  * `deportehijos.html`: El rol de los adultos en el proceso deportivo formativo.
  * `entrenamiento-mental.html`: Manejo de emociones, calma bajo presión y liderazgo (Escuela de Capitanes).
  * `ciudad-integrado.html`: Programa de inclusión, deporte adaptado y pertenencia institucional.

### 2. Gestión Deportiva: Muni 360
* **`muni360/index.html`**: Plataforma unificada de gestión deportiva para el cuerpo técnico (25 disciplinas activas: Colonia, COYFD y las 23 ramas y deportes del club).
  * Registro de Asistencia en vivo (con opción de comedor en Colonia).
  * Evaluaciones técnicas y pedagógicas con gestos específicos por disciplina.
  * Carga y administración del Padrón de deportistas.
  * Banco de 50 variantes metodológicas UGI para entrenamientos.
  * Herramientas de Dirección UGI: Cierre de temporada y vaciado de planillas por rol.

### 3. Aplicaciones Interactivas
* **`apps/training/`**: Módulos interactivos de entrenamiento cognitivo para deportistas:
  * `reaccion.html`: Test de tiempo de reacción e inhibición motriz.
  * `stroop.html`: Test de atención selectiva y agilidad mental.
  * `vision.html`: Test de visión periférica y atención dividida.
* **`ansiedad/index.html`**: Zona de respiración guiada, foco y autorregulación emocional.
* **`hockeysc/index.html`**: Plataforma de Selectividad de Menores para Hockey CCBA.

---

## ⚙️ Backend (Google Apps Script)

Ubicado en la carpeta **`apps-script/`**:
* **`DeportesUGI.gs`**: Backend maestro de **Muni 360**. Conecta con las 25 planillas Google Sheets oficiales en Drive, valida roles con tokens temporales (`CacheService`), gestiona asistencias/evaluaciones y ejecuta de forma autónoma:
  * Copia de seguridad semanal automática en la carpeta `_BACKUP_SEMANAL_UGI` de Google Drive.
  * Auditoría de asistencias cada viernes a las 9 AM con alertas por correo a los coordinadores.
* **`Codigo.gs`**: Backend de persistencia y tabla de posiciones de los juegos cognitivos (`apps/training/`).
* **`HockeySelectividad.gs`**: Backend de gestión para la selectividad de hockey.

---

## 🎨 Identidad Visual y Tecnologías
* **Paleta Oficial:** Azul Marino (`#082b49`), Celeste Institucional (`#59bde9`) y Fondo Papel (`#fffdf8`).
* **Tipografías:** *Outfit* (títulos de gran impacto) y *Plus Jakarta Sans* (lectura nítida y moderna).
* **Tecnología:** HTML5 semántico, CSS3 nativo y JavaScript Vanilla sin dependencias pesadas.
* **Hosting:** GitHub Pages con dominio propio configurado en `CNAME` (`www.ugiccba.com.ar`).
