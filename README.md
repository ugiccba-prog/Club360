# ⚡ Deportes 360 · Store & Plataforma B2B
### [deportes360.store](https://deportes360.store)

Plataforma comercial y de distribución del ecosistema **Club 360 / Deportes 360**: software de gestión deportiva integral, herramientas de cancha en tiempo real y módulos pedagógicos/cognitivos para clubes, colegios, academias y coordinadores deportivos.

---

## 🎯 Propuesta de Valor

**Deportes 360** resuelve la gestión diaria de las instituciones deportivas combinando simplicidad en cancha con control centralizado:
* **Asistencia en 1 Toque:** Registro ágil desde el celular del entrenador en la cancha, sin papeles ni demoras.
* **Evaluaciones Técnicas y Pedagógicas:** Rúbricas personalizadas por disciplina con seguimiento evolutivo de cada deportista.
* **Padrón Inteligente:** Ficha unificada de deportistas, categorías y contactos de emergencia.
* **Gimnasio Cognitivo & Mental:** Batería interactiva de tests (tiempo de reacción, agilidad visual, atención selectiva) para potenciar la toma de decisiones.
* **Banco Metodológico:** Variantes y recursos de entrenamiento para elevar el estándar formativo del cuerpo técnico.

---

## 🛡️ Arquitectura Técnica y Privacidad

Diseñado bajo el modelo **"Librería Blindada + Planilla Cascarón"**:
1. **Control de Datos del Cliente:** Los datos de deportistas, notas y asistencias viven 100% en el Google Drive privado del club o coordinador.
2. **Propiedad Intelectual:** La lógica central, algoritmos y componentes se ejecutan desde el núcleo de Deportes 360.
3. **Gestión Remota de Licencias:** Activación y administración de suscripciones centralizada con kill-switch por club.

---

## 📂 Estructura del Repositorio

* **`index.html`**: Tienda oficial y landing comercial de venta en [deportes360.store](https://deportes360.store).
* **`muni360/`**: Interfaz de aplicación para cuerpo técnico y coordinadores.
* **`apps/training/`**: Módulos interactivos de neuroentrenamiento deportivo (reacción, visión, stroop).
* **`ansiedad/`**: Espacio de autorregulación y foco para deportistas.
* **`apps-script/`**: Código del backend y conectores Google Apps Script.
* **`MANUAL_ARQUITECTURA_B2B.md`**: Guía técnica completa sobre el despliegue del modelo B2B y licenciamiento.
* **`GUIA_BIENVENIDA_COORDINADOR.md`**: Manual de inducción para nuevos coordinadores y clientes.

---

## 🌐 Despliegue y Dominio

* **Dominio Principal:** `deportes360.store`
* **Configuración DNS:** GitHub Pages apuntado mediante `CNAME`.
