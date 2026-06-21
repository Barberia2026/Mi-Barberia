# Agenda de Citas

Prototipo funcional de una página para agendar citas, con panel para el
dueño del negocio. Está pensado para que lo revises, lo pruebes y me digas
qué cambiar.

## ¿Qué hace ya?

- **`index.html`** (lo que ve el cliente):
  - Tira de fechas con los próximos días.
  - Al elegir un día, muestra las horas del día como un "tablero" (disponible
    / ocupado).
  - Si el día está marcado como **descanso**, no deja agendar ahí y sugiere
    automáticamente el próximo día disponible.
  - Al elegir una hora, pide nombre y WhatsApp, guarda la cita como
    **pendiente** y abre WhatsApp con el mensaje ya escrito para enviártelo
    a ti.

- **`admin.html`** (tu panel, protegido con PIN):
  - Calendario donde tocas cualquier día (incluidos los domingos, ya
    disponibles por defecto) y se abre una ventana para decidir:
    - **Día normal** (se puede agendar) o **descanso todo el día**, con un
      motivo opcional (ej: "Vacaciones", "Día personal", "Festivo").
    - Si el día queda normal, puedes además **bloquear horas sueltas**
      dentro de ese mismo día (desayuno, almuerzo, una cita médica,
      un mandado, etc.), indicando de qué hora a qué hora y el motivo.
      Esa franja aparece bloqueada en la página del cliente con el motivo
      y cuántas horas dura, así nadie agenda justo ahí.
    - En el calendario, los días en rojo son descanso completo y los días
      con borde dorado tienen alguna hora bloqueada ese día.
  - Lista de **solicitudes pendientes**: puedes **Aceptar** (le abre
    WhatsApp al cliente con la confirmación) o **Rechazar** (le abre
    WhatsApp sugiriéndole el próximo día disponible).
  - Lista de **citas confirmadas**.

## Cómo probarlo ahora mismo

1. Abre `index.html` en el navegador (haciendo doble clic).
2. Elige un día y una hora, llena el formulario y dale a "Enviar por
   WhatsApp".
3. Abre `admin.html`, entra con el PIN `1234` y verás esa solicitud en
   "Solicitudes pendientes".

## Cómo personalizarlo

Casi todo lo básico está en **`js/config.js`**:

```js
businessName: "Agenda de Citas",   // nombre que aparece arriba
tagline: "Reserva tu hora en segundos",
whatsappNumber: "573001234567",    // TU número, sin "+" ni espacios
workDays: [0, 1, 2, 3, 4, 5, 6],   // todos los días disponibles (0=domingo); quita números si quieres cerrar algún día de la semana siempre
startHour: 8,
endHour: 18,
slotMinutes: 60,                   // duración de cada cita
daysAhead: 21,                     // cuántos días se muestran
adminUser: "admin",                // usuario para entrar al panel
adminPassword: "1234",             // contraseña, cámbiala por una tuya
```

## Importante: la limitación actual (y cómo la resolvemos)

Ahora mismo los datos (citas y días de descanso) se guardan con
**`localStorage`**, es decir, **dentro del navegador donde se usa**. Esto
significa:

- Si el cliente agenda desde su celular y tú revisas `admin.html` desde tu
  computador, **no van a ver la misma información**, porque cada uno tiene
  su propio almacenamiento.
- Es perfecto para que veas y pruebes cómo se ve y se siente la app.

Para que funcione de verdad con varios dispositivos al mismo tiempo (lo
normal para tu negocio), el siguiente paso es conectar una base de datos
gratuita en la nube, por ejemplo **Firebase** (de Google) o **Google
Sheets** como me mencionaste. El código ya está organizado para que ese
cambio sea sencillo: toda la app habla con los datos a través del archivo
`js/store.js`, así que solo hay que cambiar ese archivo, sin tocar el
resto.

También sobre WhatsApp: ahora los mensajes se abren con tu número o el del
cliente ya escritos, pero los tienes que enviar tú con un clic (eso no
requiere servidor ni costo). Si más adelante quieres que los mensajes se
envíen **solos sin que nadie toque nada**, eso ya requiere la API oficial
de WhatsApp Business, que sí necesita un servidor o un servicio como
Twilio.

## Cómo publicarlo para tener un link

Cuando estés conforme con cómo funciona, podemos subir esta carpeta a un
servicio gratuito como **Netlify**, **Vercel** o **GitHub Pages**, y ahí te
queda un link real para compartir con tus clientes.

## Estructura de archivos

```
citas-app/
├── index.html        Página del cliente
├── admin.html        Panel del dueño
├── css/style.css     Estilos
└── js/
    ├── config.js     Datos del negocio (edítalo primero)
    ├── dates.js      Funciones de fechas y horarios
    ├── store.js      Guardado de datos (hoy: localStorage)
    ├── client.js     Lógica de index.html
    └── admin.js      Lógica de admin.html
```

---

Dime qué quieres ajustar (colores, horarios, textos, el flujo de
rechazo/reprogramación, etc.) y lo vamos modificando.
