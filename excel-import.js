/* Parse personnel-card workbooks and employee tables (الكل 2, generic Excel). */
(function (global) {
  const AR_DIGITS = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4", "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
  };

  function toEnDigits(s) {
    return String(s || "").replace(/[٠-٩۰-۹]/g, (ch) => AR_DIGITS[ch] || ch);
  }
  function arNorm(s) {
    return toEnDigits(s)
      .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  function digits(s) {
    return toEnDigits(s).replace(/\D/g, "");
  }
  function pad2(n) {
    return String(n).padStart(2, "0");
  }
  function formatDate(v) {
    if (!v) return "";
    if (v instanceof Date && !isNaN(v.getTime())) {
      return pad2(v.getDate()) + "/" + pad2(v.getMonth() + 1) + "/" + v.getFullYear();
    }
    const t = toEnDigits(String(v).trim());
    let m = t.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
    if (m) {
      let y = m[3];
      if (y.length === 2) y = (+y > 50 ? "19" : "20") + y;
      return pad2(m[1]) + "/" + pad2(m[2]) + "/" + y;
    }
    m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return m[3] + "/" + m[2] + "/" + m[1];
    return t;
  }
  function cellText(cell) {
    if (!cell) return "";
    let v = cell.value;
    if (v == null || v === "") {
      try {
        const tx = cell.text;
        if (tx != null && String(tx).trim()) return String(tx).trim();
      } catch (e) {}
      return "";
    }
    if (typeof v === "object") {
      if (v instanceof Date) return formatDate(v);
      if (v.result != null) return cellText({ value: v.result, text: v.text });
      if (v.richText) return v.richText.map((x) => x.text || "").join("");
      if (v.text != null) return String(v.text).trim();
      if (v.hyperlink && v.text) return String(v.text).trim();
    }
    if (typeof v === "number") {
      if (v > 20000 && v < 60000 && !Number.isInteger(v)) {
        const epoch = new Date(Date.UTC(1899, 11, 30));
        const d = new Date(epoch.getTime() + v * 86400000);
        return formatDate(d);
      }
      if (Math.abs(v) >= 1e12) return String(Math.round(v));
      if (Number.isInteger(v)) return String(v);
      return String(v);
    }
    return String(v).trim();
  }
  function sheetBlob(ws, maxR, maxC) {
    let s = "";
    const rows = Math.min(ws.rowCount || maxR, maxR);
    const cols = Math.min(ws.columnCount || maxC, maxC);
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) s += cellText(ws.getRow(r).getCell(c)) + " ";
    }
    return s;
  }
  function isCardSheet(ws) {
    const b = sheetBlob(ws, 4, 8);
    return b.indexOf("البطاقة الذاتية") >= 0 || b.indexOf("السجل العام للعاملين") >= 0;
  }
  function isCategory(t) {
    return /أولى|اولى|ثانية|ثانيه|ثالثة|رابع|خامس|الفئة|خامسة|الثانية|الاولى|الأولى/.test(t || "");
  }
  function findLabel(ws, needle, maxR, maxC) {
    const n = arNorm(needle);
    const rows = Math.min(ws.rowCount || maxR, maxR);
    const cols = Math.min(ws.columnCount || maxC, maxC);
    for (let r = 1; r <= rows; r++) {
      const row = ws.getRow(r);
      for (let c = 1; c <= cols; c++) {
        const t = arNorm(cellText(row.getCell(c)));
        if (n && t.indexOf(n) >= 0) return { r, c, text: cellText(row.getCell(c)) };
      }
    }
    return null;
  }
  function emptyCard() {
    return {
      agency: "", nationalId: "", selfId: "", insuranceId: "",
      fullName: "", fatherName: "", motherName: "", birthPlaceDate: "",
      registryPlaceNo: "", gender: "", nationality: "", foreignLang: "",
      qualification: "", courses: "", residence: "",
      decreeNo: "", decreeDate: "", appointmentType: "",
      notifyDate: "", endServiceDate: "", registrarPrivate: "", registrarAuditor: "",
      jobs: [],
    };
  }
  function parseCardSheet(ws, sourceFile) {
    if (!isCardSheet(ws)) return null;
    const card = emptyCard();
    card.sourceFile = sourceFile || "";
    const maxR = Math.min(ws.rowCount || 60, 80);
    const maxC = Math.min(ws.columnCount || 14, 16);
    for (let r = 1; r <= 8; r++) {
      const row = ws.getRow(r);
      for (let c = 1; c <= 10; c++) {
        const v = cellText(row.getCell(c));
        if (!v) continue;
        const nv = arNorm(v);
        if ((v.indexOf("مديرية") >= 0 || v.indexOf("وزارة") >= 0) && !card.agency) {
          if (v.indexOf("رئاسة") < 0 && v.indexOf("الجمهورية") < 0) card.agency = v;
        }
        const d = digits(v);
        if (d.length === 11 && !card.nationalId) card.nationalId = d;
        if (nv.indexOf("الرقم الوطني") >= 0) {
          for (let cc = c; cc <= c + 3; cc++) {
            for (let rr = r; rr <= r + 1; rr++) {
              const dd = digits(cellText(ws.getRow(rr).getCell(cc)));
              if (dd.length === 11) card.nationalId = dd;
            }
          }
        }
        if (nv.indexOf("الرقم الذاتي") >= 0) {
          for (let cc = c; cc <= c + 3; cc++) {
            for (let rr = r; rr <= r + 1; rr++) {
              const dd = digits(cellText(ws.getRow(rr).getCell(cc)));
              if (dd.length >= 4 && dd.length <= 10 && dd !== card.nationalId) card.selfId = dd;
            }
          }
        }
        if (nv.indexOf("الرقم التاميني") >= 0) {
          for (let cc = c; cc <= c + 3; cc++) {
            for (let rr = r; rr <= r + 1; rr++) {
              const dd = digits(cellText(ws.getRow(rr).getCell(cc)));
              if (dd.length >= 4 && dd.length <= 12 && dd !== card.nationalId) card.insuranceId = dd;
            }
          }
        }
      }
    }
    const nameH = findLabel(ws, "الاسم والنسبة", 12, 10);
    if (nameH) {
      const vr = ws.getRow(nameH.r + 1);
      card.fullName = cellText(vr.getCell(1));
      card.fatherName = cellText(vr.getCell(2));
      card.motherName = cellText(vr.getCell(3));
      card.birthPlaceDate = formatDate(cellText(vr.getCell(4))) || cellText(vr.getCell(4));
      card.registryPlaceNo = cellText(vr.getCell(5));
      card.gender = cellText(vr.getCell(6));
      card.nationality = cellText(vr.getCell(7)) || "ع.س";
      card.foreignLang = cellText(vr.getCell(8));
    }
    const qH = findLabel(ws, "المؤهل العلمي", 14, 10);
    if (qH) {
      const vr = ws.getRow(qH.r + 1);
      const qv = cellText(vr.getCell(1));
      if (qv && qv.indexOf("وضع") < 0 && qv.indexOf("مركز العمل") < 0) card.qualification = qv;
      card.courses = cellText(vr.getCell(3));
      if (arNorm(card.courses).indexOf("الدورات") >= 0) card.courses = "";
      card.residence = cellText(vr.getCell(6));
      if (arNorm(card.residence).indexOf("مكان الاقامه") >= 0) card.residence = "";
    }
    for (let r = 9; r <= 15; r++) {
      let rowtxt = "";
      for (let c = 1; c <= 12; c++) rowtxt += cellText(ws.getRow(r).getCell(c)) + " ";
      if (!card.decreeNo) {
        const m = toEnDigits(rowtxt).match(/رقم\s*[:\-]?\s*(\d+)/);
        if (m) card.decreeNo = m[1];
      }
      if (!card.decreeDate) {
        const d = formatDate(rowtxt);
        if (/\d{2}\/\d{2}\/\d{4}/.test(d) && rowtxt.indexOf("تاريخ") >= 0) card.decreeDate = d.match(/\d{2}\/\d{2}\/\d{4}/)[0];
      }
      if (rowtxt.indexOf("وكال") >= 0) card.appointmentType = "تعييناً بالوكالة";
      else if (rowtxt.indexOf("أصال") >= 0 || rowtxt.indexOf("اصال") >= 0) card.appointmentType = "تعييناً أصالة";
      else if (rowtxt.indexOf("تثبيت") >= 0) card.appointmentType = "تثبيتاً";
      else if (rowtxt.indexOf("مؤقت") >= 0 && !card.appointmentType) card.appointmentType = "تعييناً بالوكالة";
    }
    const jh = findLabel(ws, "مركز العمل", 20, 8);
    let wageCol = 4, catCol = 5;
    if (jh) {
      for (let c = 1; c <= 13; c++) {
        const t = arNorm(cellText(ws.getRow(jh.r).getCell(c)));
        if (t.indexOf("اجر") >= 0) wageCol = c;
        if (t.indexOf("فئه") >= 0) catCol = c;
      }
      let start = jh.r + 1;
      let sub = "";
      for (let c = 1; c <= 12; c++) sub += cellText(ws.getRow(start).getCell(c)) + " ";
      if (sub.indexOf("التاريخ") >= 0 || sub.indexOf("السبب") >= 0 || sub.indexOf("نوعه") >= 0) start += 1;
      let emptyRun = 0;
      for (let r = start; r <= Math.min(jh.r + 40, maxR); r++) {
        const vals = [];
        for (let c = 1; c <= 13; c++) vals.push(cellText(ws.getRow(r).getCell(c)));
        const blob = vals.join(" ");
        if (/اسم وتوقيع|تاريخ التبليغ|تاريخ نهاية|مدير السجل/.test(blob)) break;
        if (!blob.trim()) {
          emptyRun += 1;
          if (emptyRun >= 3) break;
          continue;
        }
        emptyRun = 0;
        let wage = vals[3], category = vals[4];
        if (wageCol === 5 && catCol === 4) {
          category = vals[3];
          wage = vals[4];
        } else if (isCategory(vals[3]) && !isCategory(vals[4])) {
          category = vals[3];
          wage = vals[4];
        } else if (isCategory(vals[4])) {
          wage = vals[3];
          category = vals[4];
        }
        if (!vals[0] && !vals[1] && !vals[2] && !wage && !category && !vals[5] && !vals[6] && !vals[7] && !vals[9]) continue;
        card.jobs.push({
          workplace: vals[0], title: vals[1], jobType: vals[2], category: category, wage: wage,
          startDate: formatDate(vals[5]) || vals[5],
          changeDate: formatDate(vals[6]) || vals[6],
          reason: vals[7], docType: vals[8], docNo: vals[9], docYear: vals[10],
          registrarName: vals[11], registrarSign: vals[12],
        });
      }
    }
    if (!card.fullName && !card.nationalId) return null;
    return card;
  }

  const HEADER_ALIASES = {
    "عمود1": "sourceId",
    "الرقم الوطني": "nationalId",
    "الاسم الثلاثي": "fullName",
    "الاسم والنسبه": "fullName",
    "اسم الام الكامل": "motherName",
    "اسم الام والكنيه": "motherName",
    "اسم الام": "motherName",
    "التولد": "birthDate",
    "تاريخ الولاده": "birthDate",
    "محل الولاده": "birthPlace",
    "القيد": "registryPlaceNo",
    "رقم القيد": "registryNo",
    "الفئه الوظيفيه": "category",
    "الفئه": "category",
    "مسمى العمل": "jobTitle",
    "المسمى الوظيفي": "jobTitle",
    "الاسم": "firstName",
    "اسم الاب": "fatherName",
    "النسبه": "familyName",
    "السويه التنظيميه الاولى": "orgLevel1",
    "الوزاره": "orgLevel1",
    "السويه التنظيميه الثالثه": "unit",
    "المديرية التي تتبع للوزاره": "unit",
    "الوحده": "unit",
    "الملاك الاصل": "originCadre",
    "السويه التنظيميه الرابعه": "orgLevel4",
    "الرقم الشخصي": "personalNo",
    "الرقم الذاتي": "selfId",
    "مثبت او متعاقد": "contractType",
    "الحاله": "status",
    "الجنس": "gender",
    "الوضع العائلي": "maritalStatus",
    "عدد الزوجات": "wivesCount",
    "عدد الابناء": "childrenCount",
    "المحافظه": "governorate",
    "المنطقه المدينه": "district",
    "الناحيه": "subdistrict",
    "الحاله الصحيه": "healthStatus",
    "تفصيل الاصابه او المرض": "healthDetail",
    "تاريخ الاصابه": "injuryDate",
    "زمره الدم": "bloodType",
    "السكن الحالي ( المحافظه )": "residenceGov",
    "السكن الحالي (المحافظه )": "residenceGov",
    "السكن الحالي (المنطقه المدينه )": "residencePlace",
    "نوع السكن": "housingType",
    "مصدر معلومات السكن": "housingSource",
    "رقم الهاتف": "phone",
    "نوع الشهاده": "certType",
    "التحصيل العلمي": "certType",
    "الكليه/ المعهد": "college",
    "الكليه المعهد": "college",
    "الكليه - المعهد": "college",
    "الاختصاص": "specialization",
    "عام الحصول على الشهاده": "certYear",
    "وجود الوثيقه": "hasDocument",
    "المعدل بالنسبه المئويه": "gradePercent",
    "الجامعه1": "university1",
    "المرحله": "studyStage",
    "الكليه او المعهد 2": "college2",
    "القسم2": "dept2",
    "السنه التي اتمها 2": "yearDone2",
    "جامعه2": "university2",
    "معلومات اضافيه بالدراسه": "studyExtra",
    "مستوى التمكن من اللغه الانكليزيه": "englishLevel",
    "مستوى التمكن من اللغه التركيه": "turkishLevel",
    "لغات آخرى": "otherLang",
    "لغات اخرى": "otherLang",
    "درجه التمكن منها": "otherLangLevel",
    "تصنيف التخصص الدراسي": "studyClass",
    "المؤهل العلمي المعين على اساسه": "qualForAppointment",
    "مصدر معلومات المؤهل العلمي": "qualSource",
    "اللام او الزوجه الإسم الثلاثي": "spouseOrMotherName",
    "اللام او الزوجه الاسم الثلاثي": "spouseOrMotherName",
    "اللام او الزوجه الجهه": "spouseOrMotherOrg",
    "نمط التعيين او التعاقد": "appointmentMode",
    "تحديد (تعليم)": "educationFlag",
    "تاريخ تفريغ الذاتيه": "selfFormDate",
    "نمط العمل": "workMode",
    "التخصص": "specialty",
    "الرقم الوظيفي": "jobNumber",
    "تاريخ التعيين": "appointmentDate",
    "تاريخ العمل بالدوله": "stateWorkDate",
    "حساب شام كاش": "shamCash",
    "تاريخ تعديل الفئه": "categoryChangeDate",
    "العمر (سنه)": "age",
    "العمر سنه": "age",
    "سنوات الخدمه": "serviceYears",
    "المتبقي للتقاعد": "yearsToRetire",
    "تاريخ الفصل من العمل؟": "dismissalDate",
    "تاريخ الفصل": "dismissalDate",
    "سبب الفصل": "dismissalReason",
    "هل ترغب في العوده للعمل ؟": "wantsReturn",
    "تاريخ آخر راتب": "lastSalaryDate",
    "تاريخ اخر راتب": "lastSalaryDate",
    "ملاحظات": "notes",
    "personalno": "personalno",
    "اسم الام": "motherShort",
  };

  function mapHeader(h) {
    const n = arNorm(h);
    if (!n) return null;
    if (HEADER_ALIASES[n]) return HEADER_ALIASES[n];
    for (const k of Object.keys(HEADER_ALIASES)) {
      if (n.indexOf(k) >= 0 || k.indexOf(n) >= 0) return HEADER_ALIASES[k];
    }
    return null;
  }

  function parseTableSheet(ws, sourceName) {
    const colCount = Math.min(ws.columnCount || 90, 90);
    const rowCount = Math.min(ws.rowCount || 2000, 5000);
    const headerRow = ws.getRow(1);
    const cols = [];
    for (let c = 1; c <= colCount; c++) {
      const raw = cellText(headerRow.getCell(c));
      const key = mapHeader(raw);
      cols.push({ c, raw, key });
    }
    const mapped = cols.filter((x) => x.key);
    if (mapped.length < 3) return [];
    const rows = [];
    for (let r = 2; r <= rowCount; r++) {
      const row = ws.getRow(r);
      const rec = { source: sourceName || ws.name || "Excel" };
      let any = false;
      cols.forEach((col) => {
        if (!col.key) return;
        let v = cellText(row.getCell(col.c));
        if (col.key === "nationalId" || col.key === "selfId") v = digits(v);
        if (col.key.indexOf("Date") >= 0 || col.key === "birthDate") v = formatDate(v) || v;
        rec[col.key] = v;
        if (v) any = true;
      });
      if (!any) continue;
      if (!rec.fullName && !rec.nationalId) continue;
      rec.birthPlaceDate = [rec.birthPlace, rec.birthDate].filter(Boolean).join(" ");
      rec.residence = [rec.residenceGov, rec.residencePlace].filter(Boolean).join(" ");
      rec.qualification = rec.qualForAppointment || rec.certType || "";
      if (rec.dismissalDate || rec.dismissalReason) {
        rec.dismissed = "نعم";
        if (!rec.status) rec.status = "مفصول";
      }
      rows.push(rec);
    }
    return rows;
  }

  function pickTableSheets(wb) {
    const names = wb.worksheets.map((w) => w.name);
    const exact = names.find((n) => /الكل\s*\(\s*2\s*\)/.test(n) || n === "الكل (2)" || n === "الكل 2");
    if (exact) return [wb.getWorksheet(exact)];
    const anyAll = names.find((n) => n.indexOf("الكل") >= 0);
    if (anyAll) return [wb.getWorksheet(anyAll)];
    return wb.worksheets.filter((w) => !isCardSheet(w) && (w.rowCount || 0) > 1);
  }

  async function readWorkbook(file) {
    if (!global.ExcelJS) throw new Error("ExcelJS غير محمّل");
    const buf = await file.arrayBuffer();
    const wb = new global.ExcelJS.Workbook();
    await wb.xlsx.load(buf);
    return wb;
  }

  async function importFiles(fileList) {
    const cards = [];
    const roster = [];
    const errors = [];
    const files = Array.from(fileList || []).filter((f) => {
      if (!/\.xlsx?$/i.test(f.name) || f.name.startsWith("~$")) return false;
      if (/نموذج_v|ذاتية_الموظف_نموذج/.test(f.name)) return false;
      return true;
    });
    for (const file of files) {
      try {
        const wb = await readWorkbook(file);
        let cardHit = false;
        wb.worksheets.forEach((ws) => {
          if (isCardSheet(ws)) {
            const c = parseCardSheet(ws, file.name);
            if (c) {
              cards.push(c);
              cardHit = true;
            }
          }
        });
        if (!cardHit) {
          pickTableSheets(wb).forEach((ws) => {
            const rows = parseTableSheet(ws, file.name + " / " + ws.name);
            rows.forEach((r) => roster.push(r));
          });
        }
      } catch (e) {
        errors.push(file.name + ": " + (e.message || e));
      }
    }
    return { cards, roster, errors, files: files.length };
  }

  global.FormSYImport = {
    importFiles,
    parseCardSheet,
    parseTableSheet,
    arNorm,
    digits,
    formatDate,
  };
})(window);
