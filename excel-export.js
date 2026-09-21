/* Excel export: 2 official sheets per employee + auto tables on sheets 3 and 4 */
(function (global) {
  const NAVY = "002060";
  const RED = "9C0006";
  const BLACK = "000000";

  function thin() {
    return { style: "thin", color: { argb: "FF000000" } };
  }
  function medium() {
    return { style: "medium", color: { argb: "FF000000" } };
  }
  function box(cell, style) {
    const b = style || thin();
    cell.border = { top: b, bottom: b, left: b, right: b };
  }
  function font(cell, opts) {
    cell.font = Object.assign(
      { name: "Arial", size: 9, color: { argb: "FF" + NAVY }, bold: false },
      opts || {}
    );
  }
  function align(cell, h, v, wrap) {
    cell.alignment = { horizontal: h || "center", vertical: v || "middle", wrapText: !!wrap };
  }
  function label(cell, text, size) {
    cell.value = text;
    font(cell, { size: size || 9, color: { argb: "FF" + NAVY } });
    align(cell);
  }
  function valueCell(cell, text, size) {
    cell.value = text == null ? "" : text;
    font(cell, { size: size || 10, color: { argb: "FF" + BLACK } });
    align(cell);
  }
  function sugCell(cell, text, size) {
    cell.value = text == null ? "" : text;
    font(cell, { size: size || 8, color: { argb: "FF" + RED } });
    align(cell, "center", "middle", true);
  }
  function safeSheetName(name) {
    const cleaned = String(name || "موظف")
      .replace(/[:\\/?*\[\]]/g, " ")
      .trim()
      .slice(0, 28);
    return cleaned || "موظف";
  }
  function uniqueName(wb, base, reserved) {
    let n = base;
    let i = 2;
    while (wb.getWorksheet(n) || (reserved && reserved.has(n))) {
      n = (base.slice(0, 26) + " " + i).slice(0, 31);
      i += 1;
    }
    if (reserved) reserved.add(n);
    return n;
  }

  function setCols(ws, widths) {
    widths.forEach((w, i) => {
      ws.getColumn(i + 1).width = w;
    });
  }

  function fillRangeBorder(ws, r1, c1, r2, c2, style) {
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        box(ws.getCell(r, c), style);
      }
    }
  }

  function buildFace1(wb, card, sheetName) {
    const ws = wb.addWorksheet(sheetName, {
      views: [{ rightToLeft: true, showGridLines: false }],
      pageSetup: {
        paperSize: 9,
        orientation: "portrait",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 1,
        margins: { left: 0.25, right: 0.25, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
      },
      properties: { defaultRowHeight: 14.25 },
    });

    setCols(ws, [10.6, 7.75, 5.4, 4, 5.5, 6.75, 7.6, 4.25, 3.5, 4.1, 3.9, 4.75, 7]);

    const merges = [
      "A1:B1", "C1:M3", "A2:B2", "A3:B3",
      "B4:C4", "D4:E4", "F4:G4", "H4:I4", "J4:K4",
      "A5:B5", "D5:E5", "F5:G5", "H5:I5", "L5:M5",
      "A6:B6", "D6:E6", "F6:G6", "H6:I6", "L6:M6",
      "A7:E7", "F7:I7", "J7:M7",
      "A8:E8", "F8:I8", "J8:M8",
      "A9:M9",
      "A10:B10", "F10:G10", "I10:J10", "K10:L10",
      "A11:A12", "B11:B12", "C11:C12", "D11:D12", "E11:E12", "F11:F12",
      "G11:H11", "I11:K11", "L11:L12", "M11:M12",
      "A45:B45", "C45:D45", "G45:J45", "K45:L45",
      "A47:C47", "G47:J47", "A48:C49", "G48:J49", "J50:M50",
    ];
    merges.forEach((m) => ws.mergeCells(m));

    [14.25, 14.25, 17.25, 23.25, 15, 18.75, 15, 23.25, 22.5, 16, 16, 16].forEach((h, i) => {
      ws.getRow(i + 1).height = h;
    });
    for (let r = 13; r <= 43; r++) ws.getRow(r).height = 14.2;
    ws.getRow(45).height = 14;
    ws.getRow(47).height = 14;
    ws.getRow(48).height = 16;
    ws.getRow(49).height = 16;
    ws.getRow(50).height = 16;
    ws.getRow(51).height = 14;
    ws.getRow(52).height = 14;

    label(ws.getCell("A1"), "الجمهورية العربية السورية", 10);
    label(ws.getCell("A2"), "رئاسة مجلس الوزراء", 10);
    label(ws.getCell("A3"), "السجل العام للعاملين في الدولة", 10);
    const title = ws.getCell("C1");
    title.value = "البطــاقة الذاتيـــة";
    font(title, { name: "A Thuluth", size: 18, bold: true, color: { argb: "FF" + NAVY } });
    align(title, "center", "middle");

    label(ws.getCell("A4"), "الجهة العامة :", 10);
    valueCell(ws.getCell("B4"), card.agency, 10);
    label(ws.getCell("D4"), "الرقم الوطني", 9);
    valueCell(ws.getCell("F4"), card.nationalId, 10);
    label(ws.getCell("H4"), "الرقم الذاتي", 8);
    valueCell(ws.getCell("J4"), card.selfId, 10);
    label(ws.getCell("L4"), "الرقم التأميني", 8);
    valueCell(ws.getCell("M4"), card.insuranceId, 10);

    label(ws.getCell("A5"), "الاسم والنسبة", 8);
    label(ws.getCell("C5"), "اسم الاب", 10);
    label(ws.getCell("D5"), "اسم الام ونسبتها", 8);
    label(ws.getCell("F5"), "مكــــان وتاريـــخ الولادة", 8);
    label(ws.getCell("H5"), "محل ورقم القيد", 8);
    label(ws.getCell("J5"), "الجنس", 8);
    label(ws.getCell("K5"), "الجنسية", 8);
    label(ws.getCell("L5"), "اللغة الاجنبيــة", 9);

    valueCell(ws.getCell("A6"), card.fullName, 11);
    valueCell(ws.getCell("C6"), card.fatherName, 10);
    valueCell(ws.getCell("D6"), card.motherName, 10);
    valueCell(ws.getCell("F6"), card.birthPlaceDate, 9);
    valueCell(ws.getCell("H6"), card.registryPlaceNo, 9);
    valueCell(ws.getCell("J6"), card.gender, 9);
    valueCell(ws.getCell("K6"), card.nationality, 9);
    valueCell(ws.getCell("L6"), card.foreignLang, 9);

    label(ws.getCell("A7"), "المؤهل العلمي أو المهني", 9);
    label(ws.getCell("F7"), "الدورات والدراسات التدريبية و المسلكية:", 9);
    label(ws.getCell("J7"), "مكان الاقامة الحالي", 9);
    valueCell(ws.getCell("A8"), card.qualification, 10);
    valueCell(ws.getCell("F8"), card.courses, 9);
    valueCell(ws.getCell("J8"), card.residence, 9);

    const jt = ws.getCell("A9");
    jt.value = "الوضع الوظيفي";
    font(jt, { size: 18, color: { argb: "FF" + NAVY } });
    align(jt);

    label(ws.getCell("A10"), "عملاً بالقــرار", 9);
    label(ws.getCell("C10"), "رقم", 9);
    valueCell(ws.getCell("D10"), card.decreeNo || "1503", 9);
    ws.getCell("D10").font = { name: "Arial", size: 9, color: { argb: "FF" + NAVY } };
    label(ws.getCell("E10"), "تاريخ", 9);
    valueCell(ws.getCell("F10"), card.decreeDate || "24/12/1995", 9);
    ws.getCell("F10").font = { name: "Arial", size: 9, color: { argb: "FF" + NAVY } };
    label(ws.getCell("I10"), "نثبت مايلي:", 9);
    valueCell(ws.getCell("K10"), card.appointmentType || "تعييناً بالوكالة", 9);
    ws.getCell("K10").font = { name: "Arial", size: 9, color: { argb: "FF" + NAVY } };

    [
      ["A11", "مركز العمل"],
      ["B11", "المسمى الوظيفي"],
      ["C11", "نوع الوظيفة"],
      ["D11", "الفئة"],
      ["E11", "الاجر"],
      ["F11", "تاريخ المباشرة"],
      ["G11", "التبدلات الطارئة"],
      ["I11", "المستند"],
      ["L11", "اسم المسجل"],
      ["M11", "توقيع المسجل"],
      ["G12", "التاريخ"],
      ["H12", "السبب"],
      ["I12", "نوعه"],
      ["J12", "رقمه"],
      ["K12", "تاريخه"],
    ].forEach(([a, t]) => label(ws.getCell(a), t, 9));

    const rows = card.jobs || [];
    for (let i = 0; i < 31; i++) {
      const r = 13 + i;
      const row = rows[i] || {};
      valueCell(ws.getCell(r, 1), row.workplace, 8);
      valueCell(ws.getCell(r, 2), row.title, 8);
      valueCell(ws.getCell(r, 3), row.jobType, 8);
      valueCell(ws.getCell(r, 4), row.category, 8);
      valueCell(ws.getCell(r, 5), row.wage, 8);
      valueCell(ws.getCell(r, 6), row.startDate, 8);
      sugCell(ws.getCell(r, 7), row.changeDate, 8);
      sugCell(ws.getCell(r, 8), row.reason, 8);
      sugCell(ws.getCell(r, 9), row.docType, 8);
      sugCell(ws.getCell(r, 10), row.docNo, 8);
      sugCell(ws.getCell(r, 11), row.docYear, 8);
      valueCell(ws.getCell(r, 12), row.registrarName, 8);
      valueCell(ws.getCell(r, 13), row.registrarSign, 8);
    }

    label(ws.getCell("A45"), "تـــــاريخ التبليــــــــــــغ:", 8);
    valueCell(ws.getCell("C45"), card.notifyDate, 9);
    label(ws.getCell("G45"), "تاريــــــخ نهــــاية الخــدمة :", 8);
    valueCell(ws.getCell("K45"), card.endServiceDate, 9);
    label(ws.getCell("A47"), "اسم وتوقيع مسؤول السجل الخاص مع الختم", 9);
    valueCell(ws.getCell("A48"), card.registrarPrivate, 9);
    label(ws.getCell("G47"), "اسم وتوقيع مدقق السجل العام للعاملين في الدولة", 8);
    valueCell(ws.getCell("G48"), card.registrarAuditor, 9);
    label(ws.getCell("J50"), "مدير السجل العام للعاملين في الدولة", 9);

    fillRangeBorder(ws, 4, 1, 8, 13, medium());
    fillRangeBorder(ws, 9, 1, 43, 13, thin());
    fillRangeBorder(ws, 45, 3, 45, 4, thin());
    fillRangeBorder(ws, 45, 11, 45, 12, thin());
    return ws;
  }

  function buildFace2(wb, card, sheetName) {
    const ws = wb.addWorksheet(sheetName, {
      views: [{ rightToLeft: true, showGridLines: false }],
      pageSetup: {
        paperSize: 9,
        orientation: "portrait",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 1,
        margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
      },
    });
    setCols(ws, [4.6, 4.25, 4.6, 7.6, 5, 4.25, 5.4, 5.9, 5.1, 8, 4.9, 5.1, 4.5, 6.9]);

    [
      "A1:H1", "I1:N1",
      "A2:A3", "B2:B3", "C2:C3", "D2:D3", "E2:G2", "H2:H3",
      "I2:I3", "J2:J3", "K2:M2", "N2:N3",
      "I15:N15",
    ].forEach((m) => ws.mergeCells(m));
    for (let r = 33; r <= 44; r++) {
      ws.mergeCells(r, 1, r, 3);
      ws.mergeCells(r, 5, r, 8);
      ws.mergeCells(r, 10, r, 13);
    }

    ws.getRow(1).height = 25.5;
    ws.getRow(2).height = 20;
    ws.getRow(3).height = 16;
    ws.getRow(15).height = 18.75;
    ws.getRow(33).height = 28;
    for (let r = 4; r <= 32; r++) if (r !== 15) ws.getRow(r).height = 14;
    for (let r = 34; r <= 44; r++) ws.getRow(r).height = 15.75;

    function head(addr, text, size) {
      const c = ws.getCell(addr);
      c.value = text;
      font(c, { size: size || 10, bold: true, color: { argb: "FF" + NAVY } });
      align(c, "center", "middle", true);
    }

    head("A1", "الاجـــازات الخاصـــة بلا اجر", 10);
    head("I1", "المكـــافأت", 10);
    head("A2", "مدتها"); head("B2", "البدء"); head("C2", "النهاية");
    head("D2", "الأسباب"); head("E2", "المســــتند"); head("H2", "اسم المسجل وتوقيعه", 9);
    head("E3", "نوعه"); head("F3", "رقمه"); head("G3", "تاريخه");
    head("I2", "نوعها"); head("J2", "أسبابها"); head("K2", "المســـتند");
    head("N2", "اسم المسجل وتوقيعه", 9);
    head("K3", "نوعه"); head("L3", "رقمه"); head("M3", "تاريخه");
    head("I15", "العقــــوبـــات", 10);
    head("A33", "مراحل الوضع التأميني");
    head("D33", "اسم المسجل\nوتوقيعه", 8);
    head("E33", "الحالة الصحية", 11);
    head("I33", "اسم المسجل\nوتوقيعه", 8);
    head("J33", "براءة الذمة", 11);
    head("N33", "اسم المسجل\nو توقيعه", 8);

    const leaves = card.leaves || [];
    for (let i = 0; i < 29; i++) {
      const r = 4 + i;
      const row = leaves[i] || {};
      ["duration", "start", "end", "reasons", "docType", "docNo", "docDate", "registrar"].forEach((k, ci) => {
        valueCell(ws.getCell(r, ci + 1), row[k], 8);
      });
    }
    const rewards = card.rewards || [];
    for (let i = 0; i < 11; i++) {
      const r = 4 + i;
      const row = rewards[i] || {};
      ["type", "reasons", "docType", "docNo", "docDate", "registrar"].forEach((k, ci) => {
        valueCell(ws.getCell(r, 9 + ci), row[k], 8);
      });
    }
    const penalties = card.penalties || [];
    for (let i = 0; i < 17; i++) {
      const r = 16 + i;
      const row = penalties[i] || {};
      ["type", "reasons", "docType", "docNo", "docDate", "registrar"].forEach((k, ci) => {
        valueCell(ws.getCell(r, 9 + ci), row[k], 8);
      });
    }
    const ins = card.insurance || [];
    const hea = card.health || [];
    const clr = card.clearance || [];
    for (let i = 0; i < 11; i++) {
      const r = 34 + i;
      valueCell(ws.getCell(r, 1), (ins[i] || {}).text, 8);
      valueCell(ws.getCell(r, 4), (ins[i] || {}).registrar, 8);
      valueCell(ws.getCell(r, 5), (hea[i] || {}).text, 8);
      valueCell(ws.getCell(r, 9), (hea[i] || {}).registrar, 8);
      valueCell(ws.getCell(r, 10), (clr[i] || {}).text, 8);
      valueCell(ws.getCell(r, 14), (clr[i] || {}).registrar, 8);
    }

    fillRangeBorder(ws, 1, 1, 44, 14, thin());
    return ws;
  }

  function headerRow(ws, row, values) {
    values.forEach((t, i) => {
      const c = ws.getCell(row, i + 1);
      c.value = t;
      font(c, { size: 10, bold: true, color: { argb: "FF" + NAVY } });
      align(c, "center", "middle", true);
      box(c, medium());
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEEF3F8" } };
    });
  }

  function buildChangesTable(wb, cards) {
    const ws = wb.addWorksheet("جدول التبدلات", {
      views: [{ rightToLeft: true }],
      pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    });
    setCols(ws, [6, 18, 16, 16, 14, 12, 12, 12, 12, 14, 16]);
    ws.mergeCells("A1:K1");
    const t = ws.getCell("A1");
    t.value = "السجل العام للعاملين في الدولة — جدول التبدلات الطارئة";
    font(t, { size: 16, bold: true, color: { argb: "FF" + NAVY } });
    align(t);
    ws.getRow(1).height = 24;
    headerRow(ws, 2, [
      "ت", "اسم الموظف", "الرقم الوطني", "الجهة العامة",
      "مركز العمل", "المسمى الوظيفي",
      "تاريخ التبدل", "السبب", "نوع المستند", "رقمه", "تاريخه",
    ]);
    let r = 3;
    let n = 1;
    cards.forEach((card) => {
      (card.jobs || []).forEach((row) => {
        const has =
          row.changeDate || row.reason || row.docType || row.docNo || row.docYear;
        if (!has) return;
        const vals = [
          n++,
          card.fullName,
          card.nationalId,
          card.agency,
          row.workplace,
          row.title,
          row.changeDate,
          row.reason,
          row.docType,
          row.docNo,
          row.docYear,
        ];
        vals.forEach((v, i) => {
          const c = ws.getCell(r, i + 1);
          if (i >= 6 && i <= 10) sugCell(c, v, 9);
          else valueCell(c, v, 9);
          box(c);
        });
        r += 1;
      });
    });
    if (r === 3) {
      valueCell(ws.getCell("A3"), "لا توجد تبدلات مسجّلة بعد", 10);
      ws.mergeCells("A3:K3");
    }
    return ws;
  }

  function buildLeaveTable(wb, cards) {
    const ws = wb.addWorksheet("جدول الإجازات والعقوبات", {
      views: [{ rightToLeft: true }],
      pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    });
    setCols(ws, [5, 16, 14, 12, 14, 14, 18, 12, 12, 12, 16]);
    ws.mergeCells("A1:K1");
    const t = ws.getCell("A1");
    t.value = "السجل العام للعاملين في الدولة — الإجازات والمكافآت والعقوبات";
    font(t, { size: 16, bold: true, color: { argb: "FF" + NAVY } });
    align(t);
    ws.getRow(1).height = 24;
    headerRow(ws, 2, [
      "ت", "اسم الموظف", "الرقم الوطني", "النوع",
      "التفاصيل / الأسباب", "المدة / الحالة",
      "من", "إلى", "نوع المستند", "رقمه", "تاريخه",
    ]);
    let r = 3;
    let n = 1;
    function add(card, kind, row, extra) {
      const vals = [
        n++,
        card.fullName,
        card.nationalId,
        kind,
        extra.detail || "",
        extra.mid || "",
        extra.start || "",
        extra.end || "",
        extra.docType || "",
        extra.docNo || "",
        extra.docDate || "",
      ];
      vals.forEach((v, i) => {
        const c = ws.getCell(r, i + 1);
        valueCell(c, v, 9);
        box(c);
      });
      r += 1;
    }
    cards.forEach((card) => {
      (card.leaves || []).forEach((row) => {
        if (!row.duration && !row.start && !row.reasons) return;
        add(card, "إجازة بلا أجر", row, {
          detail: row.reasons, mid: row.duration, start: row.start, end: row.end,
          docType: row.docType, docNo: row.docNo, docDate: row.docDate,
        });
      });
      (card.rewards || []).forEach((row) => {
        if (!row.type && !row.reasons) return;
        add(card, "مكافأة", row, {
          detail: row.reasons, mid: row.type,
          docType: row.docType, docNo: row.docNo, docDate: row.docDate,
        });
      });
      (card.penalties || []).forEach((row) => {
        if (!row.type && !row.reasons) return;
        add(card, "عقوبة", row, {
          detail: row.reasons, mid: row.type,
          docType: row.docType, docNo: row.docNo, docDate: row.docDate,
        });
      });
      (card.insurance || []).forEach((row) => {
        if (!row.text) return;
        add(card, "وضع تأميني", row, { detail: row.text });
      });
      (card.health || []).forEach((row) => {
        if (!row.text) return;
        add(card, "حالة صحية", row, { detail: row.text });
      });
      (card.clearance || []).forEach((row) => {
        if (!row.text) return;
        add(card, "براءة ذمة", row, { detail: row.text });
      });
    });
    if (r === 3) {
      valueCell(ws.getCell("A3"), "لا توجد قيود مسجّلة بعد", 10);
      ws.mergeCells("A3:K3");
    }
    return ws;
  }

  const MASTER_NAME = "البطاقات الذاتية.xlsx";
  const DB_NAME = "formSY-master";
  const DB_STORE = "files";
  const DB_KEY = "workbook";

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function idbPut(buf) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put(buf, DB_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  function downloadBuffer(buf, filename) {
    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  async function writeSameFile(buf) {
    if (global.showSaveFilePicker) {
      try {
        const handle = await global.showSaveFilePicker({
          suggestedName: MASTER_NAME,
          types: [
            {
              description: "Excel",
              accept: {
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
              },
            },
          ],
        });
        const w = await handle.createWritable();
        await w.write(buf);
        await w.close();
        return true;
      } catch (e) {
        if (e && e.name === "AbortError") return false;
      }
    }
    downloadBuffer(buf, MASTER_NAME);
    return true;
  }

  async function exportCards(cards) {
    if (!global.ExcelJS) throw new Error("ExcelJS not loaded");
    const wb = new global.ExcelJS.Workbook();
    wb.creator = "أخطبوط للحلول البرمجية — م. حسن الزعبي";
    wb.created = new Date();

    const reserved = new Set();
    (cards || []).forEach((card) => {
      const base = safeSheetName(card.fullName || "موظف");
      const a = uniqueName(wb, base + " وجه 1", reserved);
      const b = uniqueName(wb, base + " وجه 2", reserved);
      buildFace1(wb, card, a);
      buildFace2(wb, card, b);
    });
    buildChangesTable(wb, cards || []);
    buildLeaveTable(wb, cards || []);

    const buf = await wb.xlsx.writeBuffer();
    try { await idbPut(buf); } catch (e) {}
    await writeSameFile(buf);
    return MASTER_NAME;
  }

  global.FormSYExport = { exportCards, MASTER_NAME };
})(window);
