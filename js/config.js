/* ============================================================
   CONFIGURACIÓN DEL NEGOCIO
   Edita estos valores con tus datos. No necesitas tocar nada
   más para personalizar lo básico.
   ============================================================ */

const CONFIG = {
  // Nombre que se muestra en el encabezado de la página
  businessName: "Barbería Estilo",

  // Frase corta debajo del nombre
  tagline: "Corte, barba y estilo",

  // Frase larga del banner principal (página de bienvenida)
  heroPhrase: "Cortes modernos, barba y estilo profesional",

  // Tu número de WhatsApp SIN signos, espacios ni el "+"
  // Ejemplo Colombia: 57 + número -> "573001234567"
  whatsappNumber: "573239523623",

  // Mensaje que se escribe automáticamente al tocar el botón
  // flotante de WhatsApp (el de "contacto rápido", no el de citas)
  floatingWhatsappMessage: "Hola, quiero más información 💈",

  // ── CITAS COMPARTIDAS EN LA NUBE (opcional, gratis) ──
  // Si dejas esto vacío (""), la app funciona igual que antes: cada
  // celular guarda sus propias citas por separado.
  //
  // Si pegas aquí el link de tu Google Apps Script (termina en /exec),
  // las citas se guardan en una Hoja de Google compartida: cuando un
  // cliente pide una hora, esa hora aparece "Ocupado" para TODOS los
  // demás clientes que entren después, y tú la ves en tu panel admin
  // sin importar desde qué celular o computador la pidieron.
  // Instrucciones paso a paso: LEEME-CITAS-EN-LINEA.md
  sheetApiUrl: "https://script.google.com/macros/s/AKfycbyyF6GkdjBH9taNmbYutHlyO0FriZmKZ2GJtaD30jCPVZ_AaFPvbZhFmFMpQ-qKQjJP/exec",

  // Días que trabajas. 0 = domingo, 1 = lunes ... 6 = sábado
  // Ahora TODOS los días están disponibles por defecto, incluido el
  // domingo. El dueño decide día por día (o por horas) cuándo descansa
  // desde el panel de administración (calendario → "Marcar descanso").
  workDays: [0, 1, 2, 3, 4, 5, 6],

  // Hora de inicio y fin de la jornada (formato 24h) — 7am a 8pm
  startHour: 7,
  endHour: 20,

  // Duración de cada cita en minutos
  slotMinutes: 30,

  // Cuántos días hacia adelante se muestran para agendar
  daysAhead: 21,

  // Usuario y contraseña para entrar al panel de administración
  adminUser: "Barberia2026**",
  adminPassword: "123456",
};
