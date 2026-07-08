/* ============================================================
   PÁGINA DEL CLIENTE
   ============================================================ */

let selectedDateKey = null;
let selectedService = "Corte de pelo";
let pendingBooking = null;
let clientCalMonth = new Date();

async function init() {
  document.getElementById("bizName").textContent = CONFIG.businessName;
  document.getElementById("bizTagline").textContent = CONFIG.tagline;

  initServiceSelector();

  setBookingConflictHandler(() => {
    alert("Uy, alguien más acaba de tomar ese horario. Por favor elige otro 🙏");
    Store.refresh().then(() => {
      renderCalendar();
      if (selectedDateKey) renderDay();
    });
  });

  await Store.refresh();

  clientCalMonth = new Date();
  clientCalMonth.setDate(1);
  renderCalendar();

  document.getElementById("btnCalPrev").addEventListener("click", () => {
    clientCalMonth.setMonth(clientCalMonth.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById("btnCalNext").addEventListener("click", () => {
    clientCalMonth.setMonth(clientCalMonth.getMonth() + 1);
    renderCalendar();
  });

  document.getElementById("calCollapsedBar").addEventListener("click", () => {
    const split = document.getElementById("scheduleSplit");
    split.classList.remove("has-day");
    selectedDateKey = null;
    renderCalendar();
  });

  document.getElementById("btnCancel").addEventListener("click", closeModal);
  document.getElementById("btnConfirm").addEventListener("click", confirmBooking);
  document.getElementById("overlay").addEventListener("click", (e) => {
    if (e.target.id === "overlay") closeModal();
  });

  const homeLink = document.getElementById("btnGoHome");
  if (homeLink) {
    homeLink.addEventListener("click", (e) => {
      e.preventDefault();
      const href = e.currentTarget.getAttribute("href");
      const overlay = document.getElementById("cutTransition");
      if (overlay) {
        overlay.classList.add("is-visible");
        setTimeout(() => { window.location.href = href; }, 2500);
      } else {
        document.body.classList.add("page-fade-out");
        setTimeout(() => { window.location.href = href; }, 280);
      }
    });
  }

  if (Store.isCloud()) {
    setInterval(async () => {
      await Store.refresh();
      renderCalendar();
      if (selectedDateKey) renderDay();
    }, 20000);
  }
}

/* ---------------- SELECTOR DE SERVICIO ---------------- */

function initServiceSelector() {
  const grid = document.getElementById("serviceGrid");
  if (!grid) return;
  grid.querySelectorAll(".service-card").forEach((card) => {
    card.addEventListener("click", () => {
      grid.querySelectorAll(".service-card").forEach((c) => c.classList.remove("is-active"));
      card.classList.add("is-active");
      selectedService = card.dataset.service;
      revealContactFields();
    });
  });
}

function resetServiceSelector() {
  const grid = document.getElementById("serviceGrid");
  if (!grid) return;
  grid.querySelectorAll(".service-card").forEach((c) => c.classList.remove("is-active"));
  selectedService = null;
  hideContactFields();
}

function revealContactFields() {
  const reveal = document.getElementById("contactReveal");
  reveal.classList.add("is-open");
  setTimeout(() => document.getElementById("inputName").focus(), 350);
}

function hideContactFields() {
  document.getElementById("contactReveal").classList.remove("is-open");
}

/* ---------------- CALENDARIO ---------------- */

function calendarBounds() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + CONFIG.daysAhead - 1);
  return {
    today,
    maxDate,
    minMonth: new Date(today.getFullYear(), today.getMonth(), 1),
    maxMonth: new Date(maxDate.getFullYear(), maxDate.getMonth(), 1),
  };
}

function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function renderCalendar() {
  const { today, maxDate, minMonth, maxMonth } = calendarBounds();

  const title = `${MESES[clientCalMonth.getMonth()]} ${clientCalMonth.getFullYear()}`;
  document.getElementById("calMonthLabel").textContent =
    title.charAt(0).toUpperCase() + title.slice(1);

  document.getElementById("btnCalPrev").disabled = isSameMonth(clientCalMonth, minMonth);
  document.getElementById("btnCalNext").disabled = isSameMonth(clientCalMonth, maxMonth);

  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";

  DOW_HEAD.forEach((d) => {
    const head = document.createElement("div");
    head.className = "calendar-cell is-head";
    head.textContent = d;
    grid.appendChild(head);
  });

  const firstDay = new Date(clientCalMonth.getFullYear(), clientCalMonth.getMonth(), 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(
    clientCalMonth.getFullYear(),
    clientCalMonth.getMonth() + 1,
    0
  ).getDate();

  for (let i = 0; i < startOffset; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-cell is-empty";
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(clientCalMonth.getFullYear(), clientCalMonth.getMonth(), day);
    const key = toDateKey(date);
    const outOfRange = date < today || date > maxDate;

    const cell = document.createElement("div");
    cell.className = "calendar-cell";

    if (outOfRange) {
      cell.classList.add("is-disabled");
      cell.innerHTML = `<span class="cal-day-num">${day}</span>`;
    } else {
      const isClosed = Store.isRestDay(key) || !isWorkDay(date);
      const hasMeal = !isClosed && Store.getBreaksForDate(key).length > 0;

      if (isClosed) cell.classList.add("is-closed");
      if (key === toDateKey(today)) cell.classList.add("is-today");
      if (key === selectedDateKey) cell.classList.add("is-selected");

      cell.tabIndex = 0;
      cell.innerHTML = `
        <span class="cal-day-num">${day}</span>
        ${hasMeal ? `<span class="cal-meal-dot" title="Hay horario de comida">🍴</span>` : ""}
        ${isClosed ? `<span class="cal-closed-dot" title="Cerrado"></span>` : ""}
      `;
      cell.addEventListener("click", () => selectDate(key));
    }

    grid.appendChild(cell);
  }
}

/* ---------------- CONTENIDO DEL DÍA ---------------- */

function selectDate(dateKey) {
  selectedDateKey = dateKey;
  const d = fromDateKey(dateKey);
  clientCalMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  renderCalendar();
  renderDay();

  document.getElementById("scheduleSplit").classList.add("has-day");

  const { MESES } = window;
  const mesNombre = MESES ? MESES[d.getMonth()] : d.toLocaleString("es", { month: "long" });
  const mesLabel = mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1) + " " + d.getFullYear();
  document.getElementById("ccbLabel").textContent = "📅 " + mesLabel + " — ver calendario";
}

function renderDay() {
  const date = fromDateKey(selectedDateKey);
  const todayKey = toDateKey(new Date());
  const now = new Date();

  document.getElementById("selectedDayLabel").textContent = formatLong(date);

  const content = document.getElementById("dayContent");
  content.innerHTML = "";

  const restInfo = Store.getRestDay(selectedDateKey);
  const closed = !isWorkDay(date) || !!restInfo;

  if (closed) {
    const next = findNextAvailableDay(date);
    const notice = document.createElement("div");
    notice.className = "rest-notice";
    notice.innerHTML = `
      <strong>Ese día no hay atención</strong>
      ${restInfo && restInfo.reason ? `<span class="rest-reason">Motivo: ${escapeHtmlClient(restInfo.reason)}</span>` : ""}
      Pero el ${formatLong(next)} sí hay horarios disponibles.
    `;
    const btn = document.createElement("button");
    btn.className = "btn btn-primary";
    btn.style.marginTop = "12px";
    btn.textContent = `Ver horarios del ${formatLong(next)}`;
    btn.addEventListener("click", () => selectDate(toDateKey(next)));
    notice.appendChild(document.createElement("br"));
    notice.appendChild(btn);
    content.appendChild(notice);
    return;
  }

  const dayBreaks = Store.getBreaksForDate(selectedDateKey);
  const grid = document.createElement("div");
  grid.className = "slots-grid";

  const busy = Store.getAppointmentsForDate(selectedDateKey).map((a) => a.time);
  const slots = buildSlots();

  // CAMBIO 1: Para hoy, ocultar slots que ya pasaron
  const isToday = selectedDateKey === todayKey;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  let i = 0;
  while (i < slots.length) {
    const time = slots[i];
    const slotStart = timeToMinutes(time);
    const slotEnd = slotStart + CONFIG.slotMinutes;

    // Si es hoy y la hora ya pasó, saltar
    if (isToday && slotStart <= nowMinutes) {
      i++;
      continue;
    }

    const covering = dayBreaks.find(
      (b) => slotStart < timeToMinutes(b.endTime) && slotEnd > timeToMinutes(b.startTime)
    );

    if (covering) {
      // Si es hoy y el break ya pasó, saltarlo
      if (isToday && timeToMinutes(covering.endTime) <= nowMinutes) {
        while (i < slots.length) {
          const s = timeToMinutes(slots[i]);
          const e = s + CONFIG.slotMinutes;
          if (s < timeToMinutes(covering.endTime) && e > timeToMinutes(covering.startTime)) {
            i++;
          } else { break; }
        }
        continue;
      }
      const flap = document.createElement("div");
      flap.className = "flap-compact is-break";
      flap.innerHTML = `
        <span class="fc-time">${mealIcon(covering.type)} ${formatTime12h(covering.startTime)} – ${formatTime12h(covering.endTime)}</span>
        <span class="fc-status">${mealLabel(covering)} · ${formatDurationHours(covering.startTime, covering.endTime)}</span>
      `;
      grid.appendChild(flap);
      while (i < slots.length) {
        const s = timeToMinutes(slots[i]);
        const e = s + CONFIG.slotMinutes;
        if (s < timeToMinutes(covering.endTime) && e > timeToMinutes(covering.startTime)) {
          i++;
        } else { break; }
      }
      continue;
    }

    const isBusy = busy.includes(time);
    const flap = document.createElement("div");
    flap.className = "flap-compact " + (isBusy ? "is-busy" : "");
    flap.tabIndex = isBusy ? -1 : 0;
    flap.innerHTML = `
      <span class="fc-time">${formatTime12h(time)}</span>
      <span class="fc-status">${isBusy ? "Ocupado" : "Disponible"}</span>
    `;
    if (!isBusy) {
      flap.addEventListener("click", () => openModal(selectedDateKey, time));
    }
    grid.appendChild(flap);
    i++;
  }

  content.appendChild(grid);
}

function renderMealFlap(b) {
  const flap = document.createElement("div");
  flap.className = "flap is-break";
  flap.tabIndex = -1;
  flap.innerHTML = `
    <span class="time">${mealIcon(b.type)} ${formatTime12h(b.startTime)} – ${formatTime12h(b.endTime)}</span>
    <span class="flap-right"><span class="status status-break">${mealLabel(b)} · ${formatDurationHours(b.startTime, b.endTime)}</span></span>
  `;
  return flap;
}

/* ---------------- MODAL DE RESERVA ---------------- */

function openModal(dateKey, time) {
  pendingBooking = { dateKey, time };
  document.getElementById("modalSummary").textContent =
    `${formatLong(fromDateKey(dateKey))} · ${formatTime12h(time)}`;
  resetServiceSelector();
  document.getElementById("inputName").value = "";
  document.getElementById("inputPhone").value = "";

  document.getElementById("formContent").style.display = "";
  document.getElementById("successScreen").classList.remove("is-visible");

  document.getElementById("overlay").classList.add("is-open");

  setTimeout(() => {
    const modal = document.querySelector(".modal");
    if (modal) modal.scrollTop = 0;
  }, 50);
}

function closeModal() {
  document.getElementById("overlay").classList.remove("is-open");
  pendingBooking = null;
}

function confirmBooking() {
  const name = document.getElementById("inputName").value.trim();
  const phone = document.getElementById("inputPhone").value.trim();

  if (!selectedService) {
    alert("Por favor elige qué servicio quieres.");
    return;
  }
  if (!name || !phone) {
    alert("Por favor escribe tu nombre y tu número de WhatsApp.");
    return;
  }

  const { dateKey, time } = pendingBooking;

  Store.addAppointment({ date: dateKey, time, name, phone, service: selectedService });

  const message =
    `Hola, soy ${name} (${phone}).\n` +
    `Quiero pedir una cita para el ${formatLong(fromDateKey(dateKey))} a las ${formatTime12h(time)}.\n` +
    `Servicio: ${selectedService}`;

  const url = `https://api.whatsapp.com/send?phone=${CONFIG.whatsappNumber}&text=${encodeURIComponent(message)}`;

  const formContentEl = document.getElementById("formContent");
  const successScreenEl = document.getElementById("successScreen");
  formContentEl.style.display = "none";
  successScreenEl.classList.add("is-visible");

  function goToWhatsapp() {
    closeModal();
    renderDay();
    window.location.href = url;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimeout(goToWhatsapp, 1100);
    });
  });
}

function escapeHtmlClient(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", init);