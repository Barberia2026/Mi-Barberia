/* ============================================================
   MINI-SERVIDOR GRATIS PARA "BARBERÍA ESTILO"
   ============================================================ */

function doGet(e) {
  return _respond({
    appointments: _rowsToObjects(_sheet("Appointments")),
    restDays: _rowsToObjects(_sheet("RestDays")),
    breaks: _rowsToObjects(_sheet("Breaks")),
  });
}

function doPost(e) {
  var body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return _respond({ error: "json-invalido" });
  }

  var action = body.action;
  var result;
  try {
    if (action === "addAppointment") result = _addAppointment(body);
    else if (action === "updateAppointmentStatus") result = _updateAppointmentStatus(body);
    else if (action === "deleteAppointment") result = _deleteAppointment(body);
    else if (action === "setRestDay") result = _setRestDay(body);
    else if (action === "removeRestDay") result = _removeRestDay(body);
    else if (action === "addBreak") result = _addBreak(body);
    else if (action === "deleteBreak") result = _deleteBreak(body);
    else result = { error: "accion-desconocida" };
  } catch (err) {
    result = { error: String(err) };
  }
  return _respond(result);
}

/* ---------------- CITAS ---------------- */

function _addAppointment(body) {
  var sh = _sheet("Appointments");
  var existing = _rowsToObjects(sh);

  var clash = existing.some(function (a) {
    return a.date === body.date && a.time === body.time && a.status !== "rechazada";
  });
  if (clash) return { error: "ocupado" };

  var id = body.id || ("a_" + Date.now() + "_" + Math.floor(Math.random() * 1000));
  var createdAt = Utilities.formatDate(new Date(), "America/Bogota", "dd/MM/yyyy HH:mm");
  sh.appendRow([id, body.date, body.time, body.name, body.phone, body.service, "pendiente", createdAt]);
  return { id: id, date: body.date, time: body.time, name: body.name, phone: body.phone, service: body.service, status: "pendiente", createdAt: createdAt };
}

function _updateAppointmentStatus(body) {
  var sh = _sheet("Appointments");
  var data = sh.getDataRange().getValues();
  for (var r = 1; r < data.length; r++) {
    if (String(data[r][0]) === String(body.id)) {
      sh.getRange(r + 1, 7).setValue(body.status);
      return { ok: true };
    }
  }
  return { error: "no-encontrado" };
}

// CAMBIO 3: Borrar cita permanentemente de la hoja
function _deleteAppointment(body) {
  var sh = _sheet("Appointments");
  var data = sh.getDataRange().getValues();
  for (var r = data.length - 1; r >= 1; r--) {
    if (String(data[r][0]) === String(body.id)) {
      sh.deleteRow(r + 1);
      return { ok: true };
    }
  }
  return { error: "no-encontrado" };
}

/* ---------------- DÍAS DE DESCANSO ---------------- */

function _setRestDay(body) {
  var sh = _sheet("RestDays");
  var data = sh.getDataRange().getValues();
  for (var r = 1; r < data.length; r++) {
    if (data[r][0] === body.date) {
      sh.getRange(r + 1, 2).setValue(body.reason || "");
      return { ok: true };
    }
  }
  sh.appendRow([body.date, body.reason || ""]);
  return { ok: true };
}

function _removeRestDay(body) {
  var sh = _sheet("RestDays");
  var data = sh.getDataRange().getValues();
  for (var r = data.length - 1; r >= 1; r--) {
    if (data[r][0] === body.date) sh.deleteRow(r + 1);
  }
  return { ok: true };
}

/* ---------------- BREAKS ---------------- */

function _addBreak(body) {
  var sh = _sheet("Breaks");
  var id = body.id || ("b_" + Date.now() + "_" + Math.floor(Math.random() * 1000));
  sh.appendRow([id, body.type, body.customLabel || "", body.startTime, body.endTime, body.startDate, body.endDate]);
  return { id: id, type: body.type, customLabel: body.customLabel || "", startTime: body.startTime, endTime: body.endTime, startDate: body.startDate, endDate: body.endDate };
}

function _deleteBreak(body) {
  var sh = _sheet("Breaks");
  var data = sh.getDataRange().getValues();
  for (var r = data.length - 1; r >= 1; r--) {
    if (data[r][0] === body.id) sh.deleteRow(r + 1);
  }
  return { ok: true };
}

/* ---------------- AYUDANTES ---------------- */

function _sheet(name) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh) throw new Error('No existe la pestaña "' + name + '". Revisa LEEME-CITAS-EN-LINEA.md');
  return sh;
}

function _rowsToObjects(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  var out = [];
  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    if (row[0] === "" || row[0] === null) continue;
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      var val = row[c];
      if (val instanceof Date) {
        var h = headers[c];
        if (h === "date" || h === "startDate" || h === "endDate") {
          var y = val.getFullYear();
          var m = String(val.getMonth() + 1).padStart(2, "0");
          var d = String(val.getDate()).padStart(2, "0");
          val = y + "-" + m + "-" + d;
        } else if (h === "time" || h === "startTime" || h === "endTime") {
          var hh = String(val.getHours()).padStart(2, "0");
          var mm = String(val.getMinutes()).padStart(2, "0");
          val = hh + ":" + mm;
        } else {
          val = val.toISOString();
        }
      }
      obj[headers[c]] = val;
    }
    out.push(obj);
  }
  return out;
}

function _respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}