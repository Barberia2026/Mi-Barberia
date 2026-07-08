/* ============================================================
   ALMACENAMIENTO DE DATOS
   ============================================================ */

const KEYS = {
  appointments: "citas_appointments_v1",
  restDays: "citas_restdays_v1",
  breaks: "citas_breaks_v1",
};

const useCloud = !!(CONFIG.sheetApiUrl && CONFIG.sheetApiUrl.trim());

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

let _onBookingConflict = function () {};
function setBookingConflictHandler(fn) {
  _onBookingConflict = fn;
}

const Store = {
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
      _cache.appointments.push(appt);
      _cloudPost({ action: "addAppointment", ...appt }).then((result) => {
        if (result && result.error === "ocupado") {
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

  // CAMBIO 2: Borrar cita permanentemente de la hoja
  deleteAppointment(id) {
    if (useCloud) {
      _cache.appointments = _cache.appointments.filter((a) => a.id !== id);
      _cloudPost({ action: "deleteAppointment", id });
      return _cache.appointments;
    }
    const list = this.getAppointments().filter((a) => a.id !== id);
    this.saveAppointments(list);
    return list;
  },

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

  // ---------- BREAKS ----------
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

  getBreaksForDate(dateKey) {
    return this.getBreaks()
      .filter((b) => dateKey >= b.startDate && dateKey <= b.endDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  },
};