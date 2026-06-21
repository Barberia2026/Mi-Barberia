# Citas en línea (gratis) — paso a paso

Esto hace que cuando un cliente pida una hora, esa hora se vea
**"Ocupado"** para todos los demás clientes que entren después
(no solo en el celular del que la pidió), y que tú veas todas las
solicitudes en tu panel admin sin importar desde qué celular las
pidieron.

Es gratis para siempre y no pide tarjeta. Son 3 pasos.

---

## Paso 1 — Crear la Hoja de Cálculo

1. Entra a [sheets.google.com](https://sheets.google.com) y crea una hoja nueva.
2. Ponle de nombre, por ejemplo, **"Citas Barbería Estilo"**.
3. Por defecto tiene una pestaña llamada "Hoja 1". Crea en total **3 pestañas**
   (clic derecho en la pestaña de abajo → "Cambiar nombre", o el botón **+**
   para agregar una nueva), con estos nombres **exactos**:

   - `Appointments`
   - `RestDays`
   - `Breaks`

4. En la **fila 1** de cada pestaña, escribe estos encabezados (una palabra
   por celda, en este orden):

   **Appointments:**
   `id` | `date` | `time` | `name` | `phone` | `service` | `status` | `createdAt`

   **RestDays:**
   `date` | `reason`

   **Breaks:**
   `id` | `type` | `customLabel` | `startTime` | `endTime` | `startDate` | `endDate`

---

## Paso 2 — Pegar el script y publicarlo

1. En la misma Hoja, ve al menú **Extensiones → Apps Script**.
2. Borra el código de ejemplo que aparece (`function myFunction()...`) y
   pega todo el contenido del archivo **`google-apps-script/Code.gs`**
   que viene en este proyecto.
3. Guarda (ícono de disquete o `Ctrl+S`).
4. Arriba a la derecha, clic en **Implementar → Nueva implementación**.
5. En "Selecciona el tipo", elige **Aplicación web**.
6. Configura:
   - **Ejecutar como:** Yo (tu cuenta)
   - **Quién tiene acceso:** Cualquier usuario
7. Clic en **Implementar**. Google te va a pedir autorizar permisos la
   primera vez (clic en "Avanzado" → "Ir a [nombre del proyecto] (no seguro)"
   si sale esa advertencia — es normal, es tu propio script).
8. Te va a dar una **URL que termina en `/exec`**. Cópiala completa.

---

## Paso 3 — Pegar la URL en tu proyecto

1. Abre el archivo `js/config.js` de este proyecto.
2. Busca la línea `sheetApiUrl: ""` y pega tu URL entre las comillas:

   ```js
   sheetApiUrl: "https://script.google.com/macros/s/AKfycb.../exec",
   ```

3. Guarda y sube los archivos a donde tengas alojada la página (o ábrela
   localmente para probar). Listo — desde ese momento, las citas se
   guardan en tu Hoja de Google y se comparten entre todos.

---

## ¿Cómo sé que funcionó?

- Pide una cita de prueba desde `index.html`.
- Entra a tu Hoja de Google: debe aparecer una fila nueva en la pestaña
  `Appointments`.
- Entra a `admin.html` en otro navegador o celular distinto: esa cita
  debe aparecer en "Solicitudes pendientes" también ahí.

## Si algo no funciona

- Revisa que los 3 nombres de pestaña y los encabezados estén escritos
  **exactamente** igual (mayúsculas/minúsculas incluidas).
- Cada vez que edites el código en Apps Script, tienes que volver a
  **Implementar → Administrar implementaciones → ✏️ → Nueva versión**
  para que los cambios queden activos en la URL.
- Mientras `sheetApiUrl` esté vacío en `config.js`, la app sigue
  funcionando como antes (cada celular guarda sus propias citas), así
  que nunca se rompe nada por no tener esto configurado.
