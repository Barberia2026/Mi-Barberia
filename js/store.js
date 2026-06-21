/* ============================================================
   ALMACENAMIENTO DE DATOS

   Tiene dos modos, y elige uno automáticamente según CONFIG:

   • MODO NUBE (CONFIG.sheetApiUrl tiene un link):
     Las citas, descansos y horarios de comida se guardan en una
     Hoja de Cálculo de Google (gratis), a través de un script
     (Apps Script) que actúa como mini-servidor. Así, cuando un
     cliente pide una cita, aparece "Ocupado" para TODOS los demás
     clientes que entren después (no solo en su propio celular).
     Ver LEEME-CITAS-EN-LINEA.md para configurarlo.

   • MODO LOCAL (CONFIG.sheetApiUrl vacío, como venía por defecto):
     Todo se guarda solo en este navegador (localStorage), igual
     que antes. Sirve para probar la app sin configurar nada.

   El resto de la app (client.js, admin.js, dates.js) usa "Store"
   exactamente igual sin importar el modo, así que no hay que
   tocar nada más al activar el modo nube.
   ============================================================ */

const KEYS = {
  appointments: "citas_appointments_v1",
  restDays: "citas_restdays_v1",
  breaks: "citas_breaks_v1",
};

const useCloud = !!(CONFIG.sheetApiUrl && CONFIG.sheetApiUrl.trim());

// ---------------------------------------------------------------
// MODO NUBE — caché en memoria + sincronización con Google Sheets
// ---------------------------------------------------------------
let _cache = { appointments: [], restDays: [], breaks: [] };

async function _cloudFetchAll() {
  try {
    const res = await fetch(CONFIG.sheetApiUrl, { cache: "no-store" });
    const data = await res.json();
    _cache.appointments = data.appointments || [];
    _cache.restDays = data.restDays || [];
    _cache.breaks = data.breaks || [];
  } catch (err) {
    console.error("No se pudo conectar con la hoja de citas:", err);
  }
}

// Content-Type "text/plain" a propósito: evita que el navegador mande
// una petición de pre-vuelo (CORS preflight) que Apps Script no contesta.
function _cloudPost(payload) {
  return fetch(CONFIG.sheetApiUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  })
    .then((r) => r.json())
    .catch((err) => {
      console.error("No se pudo guardar en la hoja de citas:", err);
      return { error: "sin-conexion" };
    });
}

// Si dos clientes piden la MISMA hora casi al mismo tiempo, el script de
// Google solo deja pasar al primero. client.js puede registrar aquí qué
// hacer cuando el navegador se entera de que llegó tarde (avisarle al
// cliente y refrescar los horarios).
let _onBookingConflict = function () {};
function setBookingConflictHandler(fn) {
  _onBookingConflict = fn;
}

const Store = {
  // Trae los datos más recientes desde la nube (no hace nada en modo local).
  // Llamar al cargar la página, y de vez en cuando (polling), para que un
  // horario se vea "Ocupado" apenas alguien más lo toma.
  async refresh() {
    if (useCloud) await _cloudFetchAll();
  },

  isCloud() {
    return useCloud;
  },

  // ---------- CITAS ----------
  getAppointments() {
    if (useCloud) return _cache.appointments;
    const raw = localStorage.getItem(KEYS.appointments);
    return raw ? JSON.parse(raw) : [];
  },

  saveAppointments(list) {
    localStorage.setItem(KEYS.appointments, JSON.stringify(list));
  },

  addAppointment(appt) {
    appt.id = "a_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    appt.status = "pendiente";

    if (useCloud) {
      // Optimista: se muestra "Ocupado" de inmediato en este navegador,
      // mientras se confirma con el servidor en segundo plano.
      _cache.appointments.push(appt);
      _cloudPost({ action: "addAppointment", ...appt }).then((result) => {
        if (result && result.error === "ocupado") {
          // Alguien más se adeló y tomó esa misma hora primero.
          _cache.appointments = _cache.appointments.filter((a) => a.id !== appt.id);
          _onBookingConflict(appt);
        }
      });
    } else {
      const list = this.getAppointments();
      list.push(appt);
      this.saveAppointments(list);
    }
    return appt;
  },

  updateAppointmentStatus(id, status) {
    if (useCloud) {
      const item = _cache.appointments.find((a) => a.id === id);
      if (item) item.status = status;
      _cloudPost({ action: "updateAppointmentStatus", id, status });
      return item;
    }
    const list = this.getAppointments();
    const idx = list.findIndex((a) => a.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      this.saveAppointments(list);
    }
    return list[idx];
  },

  // Citas activas (pendiente o confirmada) para una fecha dada
  getAppointmentsForDate(dateKey) {
    return this.getAppointments().filter(
      (a) => a.date === dateKey && a.status !== "rechazada"
    );
  },

  // ---------- DÍAS DE DESCANSO ----------
  getRestDays() {
    if (useCloud) return _cache.restDays;
    const raw = localStorage.getItem(KEYS.restDays);
    let days = raw ? JSON.parse(raw) : [];
    days = this._migrateRestDays(days);
    return days;
  },

  _migrateRestDays(days) {
    if (days.length > 0 && typeof days[0] === "string") {
      const migrated = days.map((date) => ({ date, reason: "" }));
      localStorage.setItem(KEYS.restDays, JSON.stringify(migrated));
      return migrated;
    }
    return days;
  },

  saveRestDays(list) {
    localStorage.setItem(KEYS.restDays, JSON.stringify(list));
  },

  isRestDay(dateKey) {
    return this.getRestDays().some((d) => d.date === dateKey);
  },

  getRestDay(dateKey) {
    return this.getRestDays().find((d) => d.date === dateKey) || null;
  },

  // Marca dateKey como descanso de día completo, con un motivo opcional.
  setRestDay(dateKey, reason) {
    const cleaned = (reason || "").trim();
    if (useCloud) {
      const existing = _cache.restDays.find((d) => d.date === dateKey);
      if (existing) existing.reason = cleaned;
      else _cache.restDays.push({ date: dateKey, reason: cleaned });
      _cloudPost({ action: "setRestDay", date: dateKey, reason: cleaned });
      return _cache.restDays;
    }
    const days = this.getRestDays().filter((d) => d.date !== dateKey);
    days.push({ date: dateKey, reason: cleaned });
    this.saveRestDays(days);
    return days;
  },

  removeRestDay(dateKey) {
    if (useCloud) {
      _cache.restDays = _cache.restDays.filter((d) => d.date !== dateKey);
      _cloudPost({ action: "removeRestDay", date: dateKey });
      return _cache.restDays;
    }
    const days = this.getRestDays().filter((d) => d.date !== dateKey);
    this.saveRestDays(days);
    return days;
  },

  // ---------- HORARIOS DE COMIDA (desayuno / almuerzo / otro descanso) ----------
  getBreaks() {
    if (useCloud) return _cache.breaks;
    const raw = localStorage.getItem(KEYS.breaks);
    return raw ? JSON.parse(raw) : [];
  },

  saveBreaks(list) {
    localStorage.setItem(KEYS.breaks, JSON.stringify(list));
  },

  addBreak(brk) {
    brk.id = "b_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    if (useCloud) {
      _cache.breaks.push(brk);
      _cloudPost({ action: "addBreak", ...brk });
    } else {
      const list = this.getBreaks();
      list.push(brk);
      this.saveBreaks(list);
    }
    return brk;
  },

  deleteBreak(id) {
    if (useCloud) {
      _cache.breaks = _cache.breaks.filter((b) => b.id !== id);
      _cloudPost({ action: "deleteBreak", id });
      return _cache.breaks;
    }
    const list = this.getBreaks().filter((b) => b.id !== id);
    this.saveBreaks(list);
    return list;
  },

  // Horarios de comida que aplican a una fecha dada, ordenados por hora
  getBreaksForDate(dateKey) {
    return this.getBreaks()
      .filter((b) => dateKey >= b.startDate && dateKey <= b.endDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  },
};