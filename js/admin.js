<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Panel del Due&#241;o &middot; Barber&#237;a</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/style.css" />
  <style>
    /* ── ADMIN EXTRA ── */
    .admin-header {
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 12px;
      margin-bottom: 28px; padding-bottom: 20px;
      border-bottom: 1px solid var(--line);
    }
    .admin-header-left { display: flex; flex-direction: column; gap: 4px; }
    .admin-header-left h1 {
      font-family: var(--font-serif); font-size: 32px; font-weight: 900;
      margin: 0;
      background: linear-gradient(135deg, var(--paper) 40%, var(--gold-lt) 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .admin-header-left p {
      font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.16em;
      text-transform: uppercase; color: var(--gold); margin: 0;
    }
    .admin-header-right { display: flex; align-items: center; gap: 10px; }

    /* Lock screen */
    .lock-wrap {
      max-width: 360px; margin: 40px auto 0;
    }
    .lock-wrap .sheet {
      border-top: 4px solid var(--gold);
    }
    .lock-icon {
      font-size: 40px; text-align: center; margin-bottom: 12px; display: block;
    }
    .lock-wrap h2 {
      font-family: var(--font-serif); font-size: 24px; text-align: center;
      margin: 0 0 4px; color: var(--ink);
    }
    .lock-wrap .sub { text-align: center; }

    /* Sección sheet con acento */
    .sheet-admin {
      background: var(--paper); color: var(--ink);
      border-radius: var(--radius); padding: 26px 22px;
      margin-bottom: 20px; box-shadow: var(--shadow-md);
      border-left: 4px solid var(--gold);
    }
    .sheet-admin h2 {
      font-family: var(--font-serif); font-size: 20px; font-weight: 700;
      margin: 0 0 4px; color: var(--ink);
      display: flex; align-items: center; gap: 8px;
    }
    .sheet-admin .sub {
      color: var(--ink-mid); font-size: 13px; margin: 0 0 18px;
      font-family: var(--font-mono); letter-spacing: 0.03em;
    }

    /* Calendar header */
    .cal-header-row {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 6px;
    }
    .cal-header-row h2 {
      font-family: var(--font-serif); font-size: 20px; font-weight: 700;
      margin: 0; color: var(--ink);
    }
    .cal-nav { display: flex; gap: 6px; }

    /* Cita card mejorada */
    .appt {
      border: 1.5px solid var(--paper-dim);
      border-radius: var(--radius-sm);
      padding: 14px 16px; margin-bottom: 10px;
      display: flex; align-items: center; justify-content: space-between;
      gap: 10px; flex-wrap: wrap; background: #fff;
      transition: box-shadow 0.15s, border-color 0.15s;
    }
    .appt:hover { box-shadow: var(--shadow-sm); border-color: var(--gold); }
    .appt .who {
      font-family: var(--font-display); font-weight: 700;
      font-size: 14px; color: var(--ink);
    }
    .appt .when {
      font-family: var(--font-mono); font-size: 12px; color: var(--ink-soft);
      margin-top: 3px;
    }
    .appt-left { display: flex; align-items: center; gap: 12px; }
    .appt-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, var(--gold), var(--gold-lt));
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-serif); font-size: 16px; font-weight: 700;
      color: var(--gold-dk); flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(212,168,67,0.3);
    }

    /* Stats bar */
    .stats-bar {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 12px; margin-bottom: 20px;
    }
    .stat-card {
      background: var(--paper); border-radius: var(--radius-sm);
      padding: 16px; text-align: center;
      box-shadow: var(--shadow-sm);
      border-top: 3px solid var(--gold);
    }
    .stat-card .stat-num {
      font-family: var(--font-serif); font-size: 28px; font-weight: 900;
      color: var(--gold-dk); line-height: 1;
    }
    .stat-card .stat-label {
      font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em;
      text-transform: uppercase; color: var(--ink-soft); margin-top: 4px;
    }

    /* Footer */
    .admin-foot {
      text-align: center; font-size: 12px; color: var(--ink-soft);
      margin-top: 32px; padding-top: 16px;
      border-top: 1px solid var(--line);
    }
    .admin-foot a { color: var(--gold); text-decoration: none; }
    .admin-foot .sep { margin: 0 8px; opacity: 0.3; }

    @media (max-width: 440px) {
      .stats-bar { grid-template-columns: repeat(2, 1fr); }
      .admin-header-left h1 { font-size: 24px; }
    }
  </style>
</head>
<body class="barber-bg page-fade">
  <div class="page">

    <!-- Header -->
    <header class="admin-header">
      <div class="admin-header-left">
        <p id="bizTagline">Panel de Barber&#237;a</p>
        <h1>Panel del Due&#241;o</h1>
      </div>
      <div class="admin-header-right">
        <span class="badge" style="background:rgba(212,168,67,0.15);color:var(--gold-dk);border:1px solid var(--line-warm);font-family:var(--font-mono);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;padding:5px 12px;border-radius:999px;">&#128274; Privado</span>
        <button class="btn btn-ghost btn-small" id="btnLogout" style="display:none;">Cerrar sesi&#243;n</button>
      </div>
    </header>

    <!-- Lock screen -->
    <div class="lock-wrap" id="lockScreen">
      <div class="sheet">
        <span class="lock-icon">&#128136;</span>
        <h2>Acceso al panel</h2>
        <p class="sub">Inicia sesi&#243;n para gestionar tus citas</p>
        <div class="field" style="margin-top:20px;">
          <label for="userInput">Usuario</label>
          <input type="text" id="userInput" autocomplete="username" placeholder="admin" />
        </div>
        <div class="field">
          <label for="passInput">Contrase&#241;a</label>
          <input type="password" id="passInput" autocomplete="current-password" placeholder="&#8226;&#8226;&#8226;&#8226;" />
        </div>
        <button class="btn btn-primary" id="btnUnlock" style="margin-top:8px;">Entrar al panel</button>
      </div>
    </div>

    <!-- Panel -->
    <div id="panel" style="display:none;">

      <!-- Stats -->
      <div class="stats-bar" id="statsBar">
        <div class="stat-card">
          <div class="stat-num" id="statPending">0</div>
          <div class="stat-label">Pendientes</div>
        </div>
        <div class="stat-card">
          <div class="stat-num" id="statConfirmed">0</div>
          <div class="stat-label">Confirmadas</div>
        </div>
        <div class="stat-card">
          <div class="stat-num" id="statToday">0</div>
          <div class="stat-label">Hoy</div>
        </div>
      </div>

      <!-- Calendario -->
      <div class="sheet-admin">
        <div class="cal-header-row">
          <h2 id="calTitle">&#8212;</h2>
          <div class="cal-nav">
            <button class="btn btn-ghost btn-small" id="btnPrevMonth">&#9664;</button>
            <button class="btn btn-ghost btn-small" id="btnNextMonth">&#9654;</button>
          </div>
        </div>
        <p class="sub">Toca un d&#237;a para marcar descanso completo, bloquear horas, o quitar lo que ten&#237;as puesto.</p>
        <div class="cal-grid" id="calGrid"></div>
        <div class="cal-legend">
          <span><i class="dot dot-normal"></i> D&#237;a normal</span>
          <span><i class="dot dot-rest"></i> Descanso</span>
          <span><i class="dot dot-partial"></i> Horas bloqueadas</span>
        </div>
      </div>

      <!-- Pendientes -->
      <div class="sheet-admin" style="border-left-color:var(--gold);">
        <h2>&#9203; Solicitudes pendientes</h2>
        <p class="sub">Acepta o rechaza lo que lleg&#243; por la p&#225;gina</p>
        <div id="pendingList"></div>
      </div>

      <!-- Confirmadas -->
      <div class="sheet-admin" style="border-left-color:var(--sage);">
        <h2>&#9989; Citas confirmadas</h2>
        <p class="sub">Las citas que ya quedaron agendadas</p>
        <div id="confirmedList"></div>
      </div>

    </div>

    <footer class="admin-foot">
      <a href="bienvenida.html">&#8592; Inicio</a>
      <span class="sep">&#183;</span>
      <a href="agenda.html">Ver p&#225;gina de citas</a>
    </footer>
  </div>

  <!-- Modal disponibilidad -->
  <div class="overlay" id="dayOverlay">
    <div class="modal">
      <button class="modal-close" id="btnDayClose" aria-label="Cerrar">&#10005;</button>
      <h3>Disponibilidad del d&#237;a</h3>
      <p class="modal-sub" id="dayModalDate">&#8212;</p>

      <div class="field">
        <label>&#191;Vas a trabajar este d&#237;a?</label>
        <div class="scope-grid" id="dayModeGrid" style="grid-template-columns:repeat(2,1fr);">
          <div class="scope-card is-active" data-mode="open">S&#237;, d&#237;a normal</div>
          <div class="scope-card" data-mode="closed">No, descanso</div>
        </div>
      </div>

      <div class="field" id="dayClosedReasonField" style="display:none;">
        <label for="dayClosedReason">Motivo (opcional)</label>
        <input type="text" id="dayClosedReason" placeholder="Ej: Vacaciones, festivo..." />
      </div>

      <div id="dayHourBlocksSection">
        <div class="field" style="margin-top:4px;">
          <label>&#191;Hay horas bloqueadas?</label>
          <p class="sub" style="margin:-2px 0 12px;">Ej: desayuno, almuerzo, cita personal...</p>
        </div>
        <div id="dayBreaksList" style="margin-bottom:14px;"></div>
        <div class="field">
          <label>Tipo</label>
          <div class="meal-type-grid" id="breakTypeGrid">
            <div class="meal-type-card is-active" data-type="desayuno">
              <span class="icon">&#127859;</span><span class="label">Desayuno</span>
            </div>
            <div class="meal-type-card" data-type="almuerzo">
              <span class="icon">&#127869;&#65039;</span><span class="label">Almuerzo</span>
            </div>
            <div class="meal-type-card" data-type="descanso">
              <span class="icon">&#9749;</span><span class="label">Otro</span>
            </div>
          </div>
        </div>
        <div class="field" id="breakCustomLabelField" style="display:none;">
          <label for="breakCustomLabel">&#191;Cu&#225;l es el motivo?</label>
          <input type="text" id="breakCustomLabel" placeholder="Ej: Mandado, reuni&#243;n..." />
        </div>
        <div class="field">
          <label>&#191;De qu&#233; hora a qu&#233; hora?</label>
          <div style="display:flex;gap:10px;">
            <input type="time" id="breakStart" value="08:00" style="flex:1;" />
            <input type="time" id="breakEnd" value="09:00" style="flex:1;" />
          </div>
        </div>
        <button class="btn btn-ghost" id="btnAddBreak" type="button" style="width:100%;">+ Agregar bloqueo de horas</button>
      </div>

      <div class="modal-actions">
        <button class="btn btn-ghost" id="btnDayCancel" type="button">Cancelar</button>
        <button class="btn btn-primary" id="btnDaySave" type="button">Guardar</button>
      </div>
    </div>
  </div>

  <script src="js/config.js"></script>
  <script src="js/dates.js"></script>
  <script src="js/store.js"></script>
  <script src="js/admin.js"></script>
  <script>
    // Stats
    function updateStats() {
      const all = Store.getAppointments();
      const today = new Date().toISOString().substring(0, 10);
      document.getElementById('statPending').textContent = all.filter(a => a.status === 'pendiente').length;
      document.getElementById('statConfirmed').textContent = all.filter(a => a.status === 'confirmada').length;
      document.getElementById('statToday').textContent = all.filter(a => String(a.date).substring(0,10) === today && a.status !== 'rechazada').length;
    }
    const _origUnlock = window.unlock;
    document.addEventListener('DOMContentLoaded', () => {
      setInterval(updateStats, 2000);
    });
  </script>
</body>
</html>