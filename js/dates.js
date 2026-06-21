/* ============================================================
   UTILIDADES DE FECHAS Y HORARIOS
   ============================================================ */

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const DOW_HEAD = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

// Convierte un Date a 'YYYY-MM-DD' usando hora local (evita líos de zona horaria)
function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Devuelve un Date a partir de 'YYYY-MM-DD'
function fromDateKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Texto largo: "lunes 13 de junio"
function formatLong(date) {
  return `${DIAS[date.getDay()]} ${date.getDate()} de ${MESES[date.getMonth()]}`;
}

// Texto corto para la tira de fechas: "LUN" / "13"
function formatShort(date) {
  return {
    dow: DIAS[date.getDay()].slice(0, 3).toUpperCase(),
    day: String(date.getDate()).padStart(2, "0"),
  };
}

// Convierte "HH:MM" (24h) a "h:MM AM/PM", ej: "07:00" -> "7:00 AM"
function formatTime12h(time) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

// Lista de los próximos N días (incluye hoy) como objetos Date
function nextDays(n) {
  const out = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push(d);
  }
  return out;
}

// Genera las franjas horarias del día según CONFIG, ej: ["08:00","09:00",...]
function buildSlots() {
  const slots = [];
  let minutes = CONFIG.startHour * 60;
  const end = CONFIG.endHour * 60;
  while (minutes < end) {
    const h = String(Math.floor(minutes / 60)).padStart(2, "0");
    const m = String(minutes % 60).padStart(2, "0");
    slots.push(`${h}:${m}`);
    minutes += CONFIG.slotMinutes;
  }
  return slots;
}

// ¿Este día de la semana es laboral según CONFIG?
function isWorkDay(date) {
  return CONFIG.workDays.includes(date.getDay());
}

/* ---------------- HORARIOS DE COMIDA (desayuno / almuerzo) ---------------- */

// Fecha lejana usada para representar un horario "de siempre" (sin fin)
const FOREVER_END = "2099-12-31";

// Convierte "HH:MM" a minutos desde medianoche, ej: "08:30" -> 510
function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Texto de duración entre dos horas "HH:MM", ej: "1 hora", "2 horas", "1 h 30 min"
function formatDurationHours(startTime, endTime) {
  const mins = timeToMinutes(endTime) - timeToMinutes(startTime);
  if (mins <= 0) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return h === 1 ? "1 hora" : `${h} horas`;
  return `${h} h ${m} min`;
}

// 'YYYY-MM' -> primer día del mes como 'YYYY-MM-DD'
function firstDayOfMonthKey(yearMonth) {
  return `${yearMonth}-01`;
}

// 'YYYY-MM' -> último día del mes como 'YYYY-MM-DD'
function lastDayOfMonthKey(yearMonth) {
  const [y, m] = yearMonth.split("-").map(Number);
  const last = new Date(y, m, 0); // día 0 del mes siguiente = último día de este mes
  return toDateKey(last);
}

// Ícono según el tipo de horario de comida
function mealIcon(type) {
  if (type === "desayuno") return "🍳";
  if (type === "almuerzo") return "🍽️";
  return "☕";
}

// Nombre que se muestra para un horario de comida
function mealLabel(brk) {
  if (brk.type === "desayuno") return "Desayuno";
  if (brk.type === "almuerzo") return "Almuerzo";
  return brk.customLabel && brk.customLabel.trim() ? brk.customLabel.trim() : "Descanso";
}

// Busca el siguiente día hábil (que no sea descanso) después de fromDate
function findNextAvailableDay(fromDate) {
  const d = new Date(fromDate);
  for (let i = 0; i < 60; i++) {
    d.setDate(d.getDate() + 1);
    if (isWorkDay(d) && !Store.isRestDay(toDateKey(d))) return new Date(d);
  }
  return new Date(fromDate);
}
