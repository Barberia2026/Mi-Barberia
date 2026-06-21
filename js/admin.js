/* ============================================================
   PANEL DEL DUEÑO
   ============================================================ */

let calMonth = new Date();

function init() {
  document.getElementById("bizTagline").textContent =
    "Panel de " + CONFIG.businessName;

  document.getElementById("btnUnlock").addEventListener("click", tryUnlock);
  document.getElementById("passInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryUnlock();
  });
  document.getElementById("btnLogout").addEventListener("click", logout);

  document.getElementById("btnPrevMonth").addEventListener("click", () => {
    calMonth.setMonth(calMonth.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById("btnNextMonth").addEventListener("click", () => {
    calMonth.setMonth(calMonth.getMonth() + 1);
    renderCalendar();
  });

  initDayModal();

  if (sessionStorage.getItem("admin_ok") === "1") unlock();
}

function tryUnlock() {
  const user = document.getElementById("userInput").value.trim();
  const pass = document.getElementById("passInput").value.trim();
  if (user === CONFIG.adminUser && pass === CONFIG.adminPassword) {
    sessionStorage.setItem("admin_ok", "1");
    unlock();
  } else {
    alert("Usuario o contraseña incorrectos.");
  }
}

async function unlock() {
  document.getElementById("lockScreen").style.display = "none";
  document.getElementById("panel").style.display = "block";
  document.getElementById("btnLogout").style.display = "inline-flex";
  calMonth = new Date();
  calMonth.setDate(1);

  // Trae las citas/descansos más recientes (solo hace algo si
  // CONFIG.sheetApiUrl está configurado).
  await Store.refresh();
  renderCalendar();
  renderAppointments();

  // Revisa cada 20s si llegó una solicitud nueva de algún cliente.
  if (Store.isCloud() && !window._citasPolling) {
    window._citasPolling = true;
    setInterval(async () => {
      await Store.refresh();
      renderCalendar();
      renderAppointments();
    }, 20000);
  }
}

function logout() {
  sessionStorage.removeItem("admin_ok");
  window.location.href = "bienvenida.html";
}

/* ---------------- CALENDARIO DE DISPONIBILIDAD ---------------- */

function renderCalendar() {
  const title = `${MESES[calMonth.getMonth()]} ${calMonth.getFullYear()}`;
  document.getElementById("calTitle").textContent =
    title.charAt(0).toUpperCase() + title.slice(1);

  const grid = document.getElementById("calGrid");
  grid.innerHTML = "";

  DOW_HEAD.forEach((d) => {
    const head = document.createElement("div");
    head.className = "cal-cell is-off";
    head.textContent = d;
    grid.appendChild(head);
  });

  const firstDay = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < startOffset; i++) {
    const empty = document.createElement("div");
    empty.className = "cal-cell is-off";
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(calMonth.getFullYear(), calMonth.getMonth(), day);
    const key = toDateKey(date);
    const cell = document.createElement("div");
    cell.textContent = day;

    const isPast = date < today;

    if (isPast) {
      cell.className = "cal-cell is-off";
    } else {
      const isRest = Store.isRestDay(key);
      const hasBreak = Store.getBreaksForDate(key).length > 0;
      cell.className =
        "cal-cell" +
        (isRest ? " is-rest" : "") +
        (!isRest && hasBreak ? " is-partial" : "");
      cell.tabIndex = 0;
      cell.addEventListener("click", () => openDayModal(key, date));
    }
    grid.appendChild(cell);
  }
}

/* ---------------- MODAL: DISPONIBILIDAD DE UN DÍA ---------------- */

let dayModalDateKey = null;
let dayModalMode = "open";
let dayModalBreaks = [];
let selectedBreakType = "desayuno";

function openDayModal(dateKey, date) {
  dayModalDateKey = dateKey;
  dayModalBreaks = Store.getBreaksForDate(dateKey);

  const restInfo = Store.getRestDay(dateKey);
  dayModalMode = restInfo ? "closed" : "open";

  document.getElementById("dayModalDate").textContent = formatLong(date);
  document.getElementById("dayClosedReason").value = restInfo ? restInfo.reason || "" : "";

  setDayMode(dayModalMode);
  resetBreakFormFields();
  renderDayBreaksList();

  document.getElementById("dayOverlay").classList.add("is-open");
}

function closeDayModal() {
  document.getElementById("dayOverlay").classList.remove("is-open");
  dayModalDateKey = null;
}

function setDayMode(mode) {
  dayModalMode = mode;
  document.querySelectorAll("#dayModeGrid .scope-card").forEach((c) => {
    c.classList.toggle("is-active", c.dataset.mode === mode);
  });
  document.getElementById("dayClosedReasonField").style.display = mode === "closed" ? "" : "none";
  document.getElementById("dayHourBlocksSection").style.display = mode === "closed" ? "none" : "";
}

function resetBreakFormFields() {
  selectedBreakType = "desayuno";
  document.querySelectorAll("#breakTypeGrid .meal-type-card").forEach((c) =>
    c.classList.toggle("is-active", c.dataset.type === "desayuno")
  );
  document.getElementById("breakCustomLabelField").style.display = "none";
  document.getElementById("breakCustomLabel").value = "";
  document.getElementById("breakStart").value = "08:00";
  document.getElementById("breakEnd").value = "09:00";
}

function renderDayBreaksList() {
  const box = document.getElementById("dayBreaksList");
  box.innerHTML = "";

  if (dayModalBreaks.length === 0) {
    box.innerHTML = `<p class="empty" style="padding:8px 0;">Todavía no has bloqueado ninguna hora este día</p>`;
    return;
  }

  dayModalBreaks
    .slice()
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .forEach((b) => {
      const row = document.createElement("div");
      row.className = "meal-row";
      row.innerHTML = `
        <div class="meal-info">
          <span class="meal-title">${mealIcon(b.type)} ${escapeHtml(mealLabel(b))}</span>
          <span class="meal-time">${formatTime12h(b.startTime)} – ${formatTime12h(b.endTime)} · ${formatDurationHours(b.startTime, b.endTime)}</span>
        </div>
      `;
      const delBtn = document.createElement("button");
      delBtn.className = "btn-delete-small";
      delBtn.setAttribute("aria-label", "Quitar este bloqueo de horas");
      delBtn.textContent = "✕";
      delBtn.addEventListener("click", () => {
        Store.deleteBreak(b.id);
        dayModalBreaks = dayModalBreaks.filter((x) => x.id !== b.id);
        renderDayBreaksList();
        renderCalendar();
      });
      row.appendChild(delBtn);
      box.appendChild(row);
    });
}

function addBreakToDay() {
  const start = document.getElementById("breakStart").value;
  const end = document.getElementById("breakEnd").value;

  if (!start || !end) { alert("Elige la hora de inicio y la hora final."); return; }
  if (timeToMinutes(end) <= timeToMinutes(start)) {
    alert("La hora final debe ser después de la hora de inicio.");
    return;
  }

  let customLabel = "";
  if (selectedBreakType === "descanso") {
    customLabel = document.getElementById("breakCustomLabel").value.trim();
    if (!customLabel) { alert("Escribe el motivo de este bloqueo."); return; }
  }

  const brk = Store.addBreak({
    type: selectedBreakType,
    customLabel,
    startTime: start,
    endTime: end,
    startDate: dayModalDateKey,
    endDate: dayModalDateKey,
  });

  dayModalBreaks.push(brk);
  renderDayBreaksList();
  renderCalendar();
  resetBreakFormFields();
}

function saveDayModal() {
  if (!dayModalDateKey) return;

  if (dayModalMode === "closed") {
    const reason = document.getElementById("dayClosedReason").value.trim();
    Store.setRestDay(dayModalDateKey, reason);
    Store.getBreaksForDate(dayModalDateKey).forEach((b) => Store.deleteBreak(b.id));
  } else {
    Store.removeRestDay(dayModalDateKey);
  }

  closeDayModal();
  renderCalendar();
}

function initDayModal() {
  document.querySelectorAll("#dayModeGrid .scope-card").forEach((card) => {
    card.addEventListener("click", () => setDayMode(card.dataset.mode));
  });

  document.querySelectorAll("#breakTypeGrid .meal-type-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll("#breakTypeGrid .meal-type-card").forEach((c) => c.classList.remove("is-active"));
      card.classList.add("is-active");
      selectedBreakType = card.dataset.type;
      document.getElementById("breakCustomLabelField").style.display =
        selectedBreakType === "descanso" ? "" : "none";
    });
  });

  document.getElementById("btnAddBreak").addEventListener("click", addBreakToDay);
  document.getElementById("btnDaySave").addEventListener("click", saveDayModal);
  document.getElementById("btnDayCancel").addEventListener("click", closeDayModal);
  document.getElementById("btnDayClose").addEventListener("click", closeDayModal);
  document.getElementById("dayOverlay").addEventListener("click", (e) => {
    if (e.target.id === "dayOverlay") closeDayModal();
  });
}

/* ---------------- LISTAS DE CITAS ---------------- */

function renderAppointments() {
  const all = Store.getAppointments().sort((a, b) =>
    (a.date + a.time).localeCompare(b.date + b.time)
  );

  const pending   = all.filter((a) => a.status === "pendiente");
  const confirmed = all.filter((a) => a.status === "confirmada");

  const pendingBox = document.getElementById("pendingList");
  pendingBox.innerHTML = "";
  if (pending.length === 0) {
    pendingBox.innerHTML = `<p class="empty">No hay solicitudes nuevas</p>`;
  }
  pending.forEach((a) => pendingBox.appendChild(renderApptCard(a, true)));

  const confirmedBox = document.getElementById("confirmedList");
  confirmedBox.innerHTML = "";
  if (confirmed.length === 0) {
    confirmedBox.innerHTML = `<p class="empty">Todavía no tienes citas confirmadas</p>`;
  }
  confirmed.forEach((a) => confirmedBox.appendChild(renderApptCard(a, false)));
}

function renderApptCard(appt, withActions) {
  const card = document.createElement("div");
  card.className = "appt";

  const info = document.createElement("div");
  info.innerHTML = `
    <div class="who">${escapeHtml(appt.name)} · ${escapeHtml(appt.phone)}</div>
    <div class="when">${formatLong(fromDateKey(appt.date))} · ${formatTime12h(appt.time)}${appt.service ? " · " + escapeHtml(appt.service) : ""}</div>
  `;

  const right = document.createElement("div");
  right.style.cssText = "display:flex;align-items:center;gap:8px;flex-wrap:wrap;";

  const tag = document.createElement("span");
  tag.className = "tag tag-" + appt.status;
  tag.textContent =
    appt.status === "pendiente"  ? "Pendiente"  :
    appt.status === "confirmada" ? "Confirmada" : "Rechazada";
  right.appendChild(tag);

  if (withActions) {
    const actions = document.createElement("div");
    actions.className = "appt-actions";

    // ── ACEPTAR: confirma la cita y abre WhatsApp al cliente ──
    const acceptBtn = document.createElement("button");
    acceptBtn.className = "btn btn-accept btn-small";
    acceptBtn.textContent = "✅ Aceptar";
    acceptBtn.addEventListener("click", () => acceptAppointment(appt));

    // ── RECHAZAR: marca como rechazada y abre WhatsApp al cliente ──
    const rejectBtn = document.createElement("button");
    rejectBtn.className = "btn btn-reject btn-small";
    rejectBtn.textContent = "❌ Rechazar";
    rejectBtn.addEventListener("click", () => rejectAppointment(appt));

    actions.appendChild(acceptBtn);
    actions.appendChild(rejectBtn);
    right.appendChild(actions);
  }

  card.appendChild(info);
  card.appendChild(right);
  return card;
}

/* ---------------- ACCIONES SOBRE UNA CITA ---------------- */

function acceptAppointment(appt) {
  // 1. Marca como confirmada en el store
  Store.updateAppointmentStatus(appt.id, "confirmada");

  // 2. Mensaje de confirmación para el cliente
  const msg =
    `✅ Hola ${appt.name}, tu cita en *${CONFIG.businessName}* quedó *confirmada* para el ` +
    `*${formatLong(fromDateKey(appt.date))}* a las *${formatTime12h(appt.time)}*.` +
    (appt.service ? `\nServicio: ${appt.service}.` : "") +
    `\n\n¡Te esperamos! 💈`;

  // 3. Abre WhatsApp al número del cliente
  openWhatsAppToClient(appt.phone, msg);

  // 4. Refresca la lista
  renderAppointments();
}

function rejectAppointment(appt) {
  // 1. Marca como rechazada en el store
  Store.updateAppointmentStatus(appt.id, "rechazada");

  // 2. Mensaje de rechazo — le dice el motivo y lo invita a buscar otro horario
  const msg =
    `❌ Hola ${appt.name}, te escribe *${CONFIG.businessName}*.\n\n` +
    `Lo sentimos, tu cita para el *${formatLong(fromDateKey(appt.date))}* ` +
    `a las *${formatTime12h(appt.time)}* no pudo ser confirmada en ese horario.\n\n` +
    `Por favor ingresa a nuestra página y elige otro horario disponible:\n` +
    `👉 ${window.location.origin}/index.html\n\n` +
    `¡Quedamos atentos! 💈`;

  // 3. Abre WhatsApp al número del cliente con el mensaje de rechazo
  openWhatsAppToClient(appt.phone, msg);

  // 4. Refresca la lista
  renderAppointments();
}

/* ---------------- ENVÍO DE WHATSAPP ---------------- */
function openWhatsAppToClient(phone, message) {
  const digits = phone.replace(/[^0-9]/g, "");
  const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  const win = window.open(url, "_blank");
  if (!win) window.location.href = url;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", init);
