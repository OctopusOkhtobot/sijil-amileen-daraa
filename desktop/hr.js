/* Employee registry: search, edit, stats, printable reports, link to personnel cards. */
(function (global) {
  const ROSTER_KEY = "formSY.roster.v1";
  const PRINT_FIELDS_KEY = "formSY.report.fields";
  const CURRENT_KEY = "formSY.roster.current";

  const GROUPS = [
    { id: "id", label: "الهوية والأحوال" },
    { id: "job", label: "الوضع الوظيفي" },
    { id: "contact", label: "السكن والاتصال" },
    { id: "family", label: "الوضع العائلي" },
    { id: "health", label: "الحالة الصحية" },
    { id: "edu", label: "التحصيل العلمي واللغات" },
    { id: "service", label: "الخدمة والتقاعد" },
    { id: "dismiss", label: "الفصل والملاحظات" },
  ];

  const FIELDS = [
    { key: "fullName", label: "الاسم الثلاثي", group: "id", card: "fullName", print: true },
    { key: "firstName", label: "الاسم", group: "id" },
    { key: "fatherName", label: "اسم الأب", group: "id", card: "fatherName" },
    { key: "familyName", label: "النسبة", group: "id" },
    { key: "motherName", label: "اسم الأم الكامل", group: "id", card: "motherName" },
    { key: "nationalId", label: "الرقم الوطني", group: "id", card: "nationalId", print: true },
    { key: "selfId", label: "الرقم الذاتي", group: "id", card: "selfId", print: true },
    { key: "personalNo", label: "الرقم الشخصي", group: "id" },
    { key: "jobNumber", label: "الرقم الوظيفي", group: "id" },
    { key: "gender", label: "الجنس", group: "id", card: "gender", print: true, list: "list-gender" },
    { key: "birthDate", label: "التولد", group: "id" },
    { key: "birthPlace", label: "محل الولادة", group: "id" },
    { key: "registryPlaceNo", label: "محل ورقم القيد", group: "id", card: "registryPlaceNo" },
    { key: "category", label: "الفئة الوظيفية", group: "job", print: true, list: "list-category" },
    { key: "jobTitle", label: "مسمى العمل", group: "job", print: true },
    { key: "unit", label: "الوحدة / المركز", group: "job", print: true },
    { key: "orgLevel1", label: "الوزارة / السوية الأولى", group: "job" },
    { key: "orgLevel4", label: "السوية الرابعة", group: "job" },
    { key: "originCadre", label: "الملاك الأصل", group: "job" },
    { key: "contractType", label: "مثبت أو متعاقد", group: "job", print: true, list: "list-contract" },
    { key: "status", label: "الحالة", group: "job", print: true, list: "list-status" },
    { key: "appointmentMode", label: "نمط التعيين أو التعاقد", group: "job" },
    { key: "workMode", label: "نمط العمل", group: "job" },
    { key: "appointmentDate", label: "تاريخ التعيين", group: "job" },
    { key: "stateWorkDate", label: "تاريخ العمل بالدولة", group: "job" },
    { key: "categoryChangeDate", label: "تاريخ تعديل الفئة", group: "job" },
    { key: "specialty", label: "التخصص", group: "job" },
    { key: "phone", label: "رقم الهاتف", group: "contact", print: true },
    { key: "shamCash", label: "حساب شام كاش", group: "contact" },
    { key: "governorate", label: "المحافظة", group: "contact" },
    { key: "district", label: "المنطقة / المدينة", group: "contact" },
    { key: "subdistrict", label: "الناحية", group: "contact" },
    { key: "residenceGov", label: "السكن الحالي — المحافظة", group: "contact" },
    { key: "residencePlace", label: "السكن الحالي — المنطقة", group: "contact" },
    { key: "housingType", label: "نوع السكن", group: "contact" },
    { key: "maritalStatus", label: "الوضع العائلي", group: "family", list: "list-marital" },
    { key: "wivesCount", label: "عدد الزوجات", group: "family" },
    { key: "childrenCount", label: "عدد الأبناء", group: "family" },
    { key: "spouseOrMotherName", label: "الأم أو الزوجة — الاسم", group: "family" },
    { key: "spouseOrMotherOrg", label: "الأم أو الزوجة — الجهة", group: "family" },
    { key: "healthStatus", label: "الحالة الصحية", group: "health", list: "list-health" },
    { key: "healthDetail", label: "تفصيل الإصابة أو المرض", group: "health" },
    { key: "injuryDate", label: "تاريخ الإصابة", group: "health" },
    { key: "bloodType", label: "زمرة الدم", group: "health" },
    { key: "certType", label: "نوع الشهادة", group: "edu" },
    { key: "college", label: "الكلية / المعهد", group: "edu" },
    { key: "specialization", label: "الاختصاص", group: "edu" },
    { key: "certYear", label: "عام الحصول على الشهادة", group: "edu" },
    { key: "hasDocument", label: "وجود الوثيقة", group: "edu" },
    { key: "gradePercent", label: "المعدل %", group: "edu" },
    { key: "university1", label: "الجامعة", group: "edu" },
    { key: "studyStage", label: "المرحلة", group: "edu" },
    { key: "qualForAppointment", label: "المؤهل المعيَّن على أساسه", group: "edu" },
    { key: "englishLevel", label: "اللغة الإنكليزية", group: "edu" },
    { key: "turkishLevel", label: "اللغة التركية", group: "edu" },
    { key: "otherLang", label: "لغات أخرى", group: "edu" },
    { key: "age", label: "العمر (سنة)", group: "service" },
    { key: "serviceYears", label: "سنوات الخدمة", group: "service" },
    { key: "yearsToRetire", label: "المتبقي للتقاعد", group: "service" },
    { key: "dismissed", label: "مفصول؟", group: "dismiss", list: "list-yesno" },
    { key: "dismissalDate", label: "تاريخ الفصل", group: "dismiss" },
    { key: "dismissalReason", label: "سبب الفصل", group: "dismiss" },
    { key: "wantsReturn", label: "يرغب في العودة", group: "dismiss" },
    { key: "lastSalaryDate", label: "تاريخ آخر راتب", group: "dismiss" },
    { key: "notes", label: "ملاحظات", group: "dismiss" },
    { key: "source", label: "مصدر السجل", group: "dismiss" },
  ];

  const FILTERS = [
    { key: "category", label: "الفئة" },
    { key: "status", label: "الحالة" },
    { key: "gender", label: "الجنس" },
    { key: "contractType", label: "مثبت / متعاقد" },
    { key: "unit", label: "الوحدة" },
    { key: "appointmentMode", label: "نمط التعيين" },
    { key: "healthStatus", label: "الحالة الصحية" },
    { key: "dismissed", label: "الفصل" },
  ];

  const app = {
    roster: [],
    currentId: null,
    q: "",
    filters: {},
    printKeys: [],
    dirty: false,
    bridge: null,
  };

  function uid() {
    return "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function digits(s) {
    return String(s || "").replace(/[٠-٩]/g, (d) => "0123456789"["٠١٢٣٤٥٦٧٨٩".indexOf(d)]).replace(/\D/g, "");
  }
  function arNorm(s) {
    return String(s || "")
      .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
      .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي")
      .replace(/\s+/g, " ").trim();
  }
  function blankRecord() {
    const r = { id: uid(), updatedAt: new Date().toISOString(), source: "إدخال يدوي" };
    FIELDS.forEach((f) => { r[f.key] = r[f.key] || ""; });
    return r;
  }
  function hydrate(raw) {
    const r = blankRecord();
    Object.keys(raw || {}).forEach((k) => {
      if (raw[k] != null && raw[k] !== "") r[k] = String(raw[k]);
    });
    if (raw && raw.id) r.id = raw.id;
    else if (r.nationalId) r.id = "nid-" + r.nationalId;
    else if (raw && raw.sourceId) r.id = "sid-" + raw.sourceId;
    return r;
  }

  function load() {
    try {
      const raw = localStorage.getItem(ROSTER_KEY);
      app.roster = raw ? JSON.parse(raw).map(hydrate) : [];
    } catch (e) {
      app.roster = [];
    }
    app.currentId = localStorage.getItem(CURRENT_KEY) || (app.roster[0] && app.roster[0].id);
    try {
      const pf = JSON.parse(localStorage.getItem(PRINT_FIELDS_KEY) || "null");
      app.printKeys = Array.isArray(pf) && pf.length ? pf : FIELDS.filter((f) => f.print).map((f) => f.key);
    } catch (e) {
      app.printKeys = FIELDS.filter((f) => f.print).map((f) => f.key);
    }
  }
  function persist(opts) {
    localStorage.setItem(ROSTER_KEY, JSON.stringify(app.roster));
    if (app.currentId) localStorage.setItem(CURRENT_KEY, app.currentId);
    localStorage.setItem(PRINT_FIELDS_KEY, JSON.stringify(app.printKeys));
    if (opts && opts.sync === false) return;
    if (global.FormSYCloud) global.FormSYCloud.queue("roster", scopeList());
  }
  function current() {
    const rec = app.roster.find((r) => r.id === app.currentId) || null;
    if (!rec) return null;
    if (!seesAll()) {
      const u = global.FormSYAuth && global.FormSYAuth.user();
      if (rec.owner !== u) return null;
    }
    return rec;
  }
  function setStatus(msg, ok) {
    if (app.bridge && app.bridge.setStatus) app.bridge.setStatus(msg, ok);
  }

  function matchScore(card, rec) {
    const cn = digits(card && card.nationalId);
    const rn = digits(rec.nationalId);
    if (cn && rn && cn === rn) return 100;
    if (cn && rn && cn !== rn) return 0;
    const a = arNorm(card && card.fullName);
    const b = arNorm(rec.fullName);
    const fa = arNorm(card && card.fatherName);
    const fb = arNorm(rec.fatherName);
    if (a && b && fa && fb && a === b && fa === fb) return 95;
    return 0;
  }
  function seesAll() {
    if (!global.FormSYAuth || !global.FormSYAuth.seesAll) return true;
    return global.FormSYAuth.seesAll();
  }
  function scopeList() {
    if (seesAll()) return app.roster;
    const u = global.FormSYAuth.user();
    return app.roster.filter((r) => r.owner === u);
  }
  function findForCard(card) {
    if (!card) return null;
    let best = null, score = 0;
    app.roster.forEach((r) => {
      const s = matchScore(card, r);
      if (s > score) { score = s; best = r; }
    });
    return score >= 60 ? best : null;
  }
  function findCardForRecord(rec) {
    const cards = (app.bridge && app.bridge.getCards && app.bridge.getCards()) || [];
    let best = null, score = 0;
    cards.forEach((c) => {
      const s = matchScore(c, rec);
      if (s > score) { score = s; best = c; }
    });
    return score >= 60 ? best : null;
  }

  function uniqueValues(key) {
    const set = new Set();
    scopeList().forEach((r) => {
      const v = String(r[key] || "").trim();
      if (v) set.add(v);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ar"));
  }

  function passes(rec) {
    const q = arNorm(app.q);
    if (q) {
      const blob = arNorm([
        rec.fullName, rec.fatherName, rec.motherName, rec.nationalId, rec.selfId,
        rec.phone, rec.unit, rec.jobTitle, rec.category, rec.status,
      ].join(" "));
      if (blob.indexOf(q) < 0 && digits(rec.nationalId).indexOf(digits(app.q)) < 0 && digits(rec.phone).indexOf(digits(app.q)) < 0) {
        return false;
      }
    }
    return FILTERS.every((f) => {
      const sel = app.filters[f.key];
      if (!sel) return true;
      return String(rec[f.key] || "").trim() === sel;
    });
  }
  function filtered() {
    return scopeList().filter(passes);
  }

  function fillSelect(sel, values, current) {
    const keep = current || "";
    sel.innerHTML = "";
    const all = document.createElement("option");
    all.value = "";
    all.textContent = "الكل";
    sel.appendChild(all);
    values.forEach((v) => {
      const o = document.createElement("option");
      o.value = v;
      o.textContent = v;
      sel.appendChild(o);
    });
    sel.value = keep;
    if (sel.value !== keep) sel.value = "";
  }

  function refreshFilterOptions() {
    FILTERS.forEach((f) => {
      const el = document.getElementById("flt-" + f.key);
      if (!el) return;
      fillSelect(el, uniqueValues(f.key), app.filters[f.key] || "");
    });
    const rEl = document.getElementById("flt-report-same");
    FILTERS.forEach((f) => {
      const el = document.getElementById("rep-" + f.key);
      if (!el) return;
      fillSelect(el, uniqueValues(f.key), app.filters[f.key] || "");
    });
    if (rEl) rEl.checked = true;
  }

  function renderList() {
    const rows = filtered();
    const box = document.getElementById("roster-list");
    const meta = document.getElementById("roster-count");
    if (meta) meta.textContent = rows.length + " من " + scopeList().length + " موظف";
    if (!box) return;
    if (!rows.length) {
      box.innerHTML = "<div class='empty-list'>لا نتائج — غيّر البحث أو التصفية</div>";
      return;
    }
    box.innerHTML = rows.map((r) => {
      const linked = findCardForRecord(r);
      const active = r.id === app.currentId ? " active" : "";
      return (
        "<button type='button' class='emp-item" + active + "' data-id='" + esc(r.id) + "'>" +
          "<strong>" + esc(r.fullName || "بدون اسم") + "</strong>" +
          "<span>" + esc([r.jobTitle, r.unit].filter(Boolean).join(" — ")) + "</span>" +
          "<em>" + esc([r.category, r.status, r.contractType].filter(Boolean).join(" · ")) +
            (linked ? " · بطاقة" : "") + "</em>" +
        "</button>"
      );
    }).join("");
  }

  function fillForm() {
    const rec = current() || blankRecord();
    FIELDS.forEach((f) => {
      const node = document.querySelector('[data-rf="' + f.key + '"]');
      if (node) node.value = rec[f.key] || "";
    });
    const link = document.getElementById("link-state");
    const card = findCardForRecord(rec);
    if (link) {
      if (card) {
        link.innerHTML = "مرتبطة بالبطاقة الذاتية: <b>" + esc(card.fullName || "") + "</b>" +
          (card.nationalId ? " — " + esc(card.nationalId) : "") +
          (rec.owner ? " — المُدخل: " + esc(rec.owner) : "");
        link.className = "link-state ok";
      } else {
        link.textContent = "لا توجد بطاقة ذاتية مطابقة — يمكن إنشاؤها من هذا السجل" +
          (rec.owner ? " — المُدخل: " + rec.owner : "");
        link.className = "link-state";
      }
    }
  }

  async function saveRosterForm() {
    let rec = current();
    const draft = {};
    FIELDS.forEach((f) => {
      const node = document.querySelector('[data-rf="' + f.key + '"]');
      draft[f.key] = node ? node.value : (rec && rec[f.key]) || "";
    });
    const nid = global.FormSYGate ? global.FormSYGate.nidText(draft.nationalId) : String(draft.nationalId || "");
    const linked = rec ? findCardForRecord(rec) : null;
    const cardId = linked && nid && (global.FormSYGate ? global.FormSYGate.nidText(linked.nationalId) : linked.nationalId) === nid ? linked.id : "";
    const same = !!(rec && nid && (global.FormSYGate ? global.FormSYGate.nidText(rec.nationalId) : rec.nationalId) === nid);
    const gate = global.FormSYGate
      ? await global.FormSYGate.review(draft.nationalId, draft.fullName, cardId, rec ? rec.id : "", same)
      : "ok";
    if (gate === "back") {
      if (global.FormSYGate) global.FormSYGate.focus("roster");
      setStatus("لم يُحفظ — صحّح الرقم الوطني", false);
      return "back";
    }
    if (gate === "ignore") {
      fillForm();
      app.dirty = false;
      setStatus("أُهمل السجل ولم يُحفظ", false);
      return "ignore";
    }
    if (!rec) {
      rec = blankRecord();
      if (global.FormSYAuth && global.FormSYAuth.user()) rec.owner = global.FormSYAuth.user();
      app.roster.unshift(rec);
      app.currentId = rec.id;
    }
    FIELDS.forEach((f) => { rec[f.key] = draft[f.key]; });
    if (nid) rec.nationalId = nid;
    rec.updatedAt = new Date().toISOString();
    if (!rec.owner && global.FormSYAuth && global.FormSYAuth.user()) rec.owner = global.FormSYAuth.user();
    rec.birthPlaceDate = [rec.birthPlace, rec.birthDate].filter(Boolean).join(" ");
    rec.residence = [rec.residenceGov, rec.residencePlace].filter(Boolean).join(" ");
    rec.qualification = rec.qualForAppointment || rec.certType || rec.qualification || "";
    app.dirty = false;
    persist();
    return rec;
  }

  function statsOf(rows) {
    function bucket(key) {
      const m = {};
      rows.forEach((r) => {
        const k = String(r[key] || "").trim() || "غير محدد";
        m[k] = (m[k] || 0) + 1;
      });
      return Object.keys(m).sort((a, b) => m[b] - m[a]).map((k) => ({ k, n: m[k] }));
    }
    const num = (key) => {
      const vals = rows.map((r) => Number(r[key])).filter((n) => !isNaN(n) && n > 0);
      if (!vals.length) return "—";
      return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
    };
    return {
      total: rows.length,
      male: rows.filter((r) => /ذكر/.test(r.gender || "")).length,
      female: rows.filter((r) => /أنثى|انثى/.test(r.gender || "")).length,
      perm: rows.filter((r) => (r.contractType || "").indexOf("مثبت") >= 0).length,
      contract: rows.filter((r) => (r.contractType || "").indexOf("متعاقد") >= 0).length,
      onJob: rows.filter((r) => (r.status || "").indexOf("رأس") >= 0).length,
      leave: rows.filter((r) => (r.status || "").indexOf("اجازة") >= 0 || (r.status || "").indexOf("إجازة") >= 0).length,
      dismissed: rows.filter((r) => r.dismissed === "نعم" || (r.status || "").indexOf("مفصول") >= 0).length,
      avgAge: num("age"),
      avgService: num("serviceYears"),
      byCat: bucket("category"),
      byUnit: bucket("unit"),
      byStatus: bucket("status"),
      byAppoint: bucket("appointmentMode"),
      byHealth: bucket("healthStatus"),
    };
  }

  function renderStats(targetId, rows) {
    const el = document.getElementById(targetId);
    if (!el) return;
    const s = statsOf(rows);
    function pills(arr) {
      return arr.map((x) => "<span class='pill'><b>" + esc(x.k) + "</b> " + x.n + "</span>").join("") || "<span class='muted'>لا بيانات</span>";
    }
    el.innerHTML =
      "<div class='stat-cards'>" +
        [["الإجمالي", s.total], ["ذكور", s.male], ["إناث", s.female], ["مثبت", s.perm],
         ["متعاقد", s.contract], ["على رأس عمله", s.onJob], ["إجازة", s.leave], ["مفصول", s.dismissed],
         ["متوسط العمر", s.avgAge], ["متوسط الخدمة", s.avgService]].map(([k, v]) =>
          "<div class='stat-card'><div class='n'>" + v + "</div><div class='l'>" + k + "</div></div>"
        ).join("") +
      "</div>" +
      "<div class='stat-block'><h4>حسب الفئة</h4><div class='pills'>" + pills(s.byCat) + "</div></div>" +
      "<div class='stat-block'><h4>حسب الوحدة</h4><div class='pills'>" + pills(s.byUnit) + "</div></div>" +
      "<div class='stat-block'><h4>حسب الحالة</h4><div class='pills'>" + pills(s.byStatus) + "</div></div>" +
      "<div class='stat-block'><h4>حسب نمط التعيين</h4><div class='pills'>" + pills(s.byAppoint) + "</div></div>" +
      "<div class='stat-block'><h4>حسب الحالة الصحية</h4><div class='pills'>" + pills(s.byHealth) + "</div></div>";
  }

  function renderPreview() {
    const rows = filtered();
    const keys = app.printKeys.filter((k) => FIELDS.some((f) => f.key === k));
    const table = document.getElementById("report-preview");
    if (!table) return;
    const headCells = keys.map((k) => {
      const f = FIELDS.find((x) => x.key === k);
      return "<th>" + esc(f ? f.label : k) + "</th>";
    }).join("");
    const body = rows.map((r, i) =>
      "<tr><td class='idx'>" + (i + 1) + "</td>" + keys.map((k) => "<td>" + esc(r[k] || "") + "</td>").join("") + "</tr>"
    ).join("") || "<tr><td colspan='" + (keys.length + 1) + "' class='muted'>لا صفوف بعد التصفية</td></tr>";
    table.innerHTML = "<thead><tr><th>ت</th>" + headCells + "</tr></thead><tbody>" + body + "</tbody>";
    const n = document.getElementById("report-count");
    if (n) n.textContent = rows.length + " سجل";
    renderStats("report-stats", rows);
  }

  function renderRosterTable() {
    const table = document.getElementById("roster-table");
    if (!table) return;
    const cols = [
      ["fullName", "الاسم"],
      ["fatherName", "اسم الأب"],
      ["nationalId", "الرقم الوطني"],
      ["jobTitle", "المسمى"],
      ["unit", "الوحدة"],
      ["category", "الفئة"],
      ["status", "الحالة"],
      ["phone", "الهاتف"],
    ];
    if (seesAll()) cols.push(["owner", "المُدخل"]);
    const rows = filtered();
    const head = cols.map((c) => "<th>" + esc(c[1]) + "</th>").join("");
    const body = rows.map((r, i) =>
      "<tr data-id=\"" + esc(r.id) + "\"><td class='idx'>" + (i + 1) + "</td>" +
      cols.map((c) => "<td>" + esc(r[c[0]] || "") + "</td>").join("") + "</tr>"
    ).join("") || "<tr><td colspan='" + (cols.length + 1) + "'>لا صفوف</td></tr>";
    table.innerHTML = "<thead><tr><th>ت</th>" + head + "</tr></thead><tbody>" + body + "</tbody>";
  }

  function setRegistryMode(mode) {
    app.tableMode = mode === "table";
    const view = document.getElementById("view-registry");
    const wrap = document.getElementById("roster-table-wrap");
    if (view) view.classList.toggle("mode-table", app.tableMode);
    if (wrap) wrap.classList.toggle("hidden", !app.tableMode);
    const a = document.getElementById("btnRegForm");
    const b = document.getElementById("btnRegTable");
    if (a) a.classList.toggle("active", !app.tableMode);
    if (b) b.classList.toggle("active", app.tableMode);
    if (app.tableMode) renderRosterTable();
  }

  function renderAll() {
    refreshFilterOptions();
    renderList();
    fillForm();
    renderPreview();
    renderRosterTable();
    renderStats("registry-stats", filtered());
  }

  async function selectRecord(id) {
    if (app.dirty) {
      const saved = await saveRosterForm();
      if (saved === "back") return;
    }
    app.currentId = id;
    persist();
    renderList();
    fillForm();
  }

  function mergeRoster(incoming, overwriteEmpty) {
    let added = 0, updated = 0;
    function same(rec, r) {
      if ((rec.owner || "") !== (r.owner || "")) return false;
      if (rec.nationalId && r.nationalId && rec.nationalId === r.nationalId) return true;
      if (rec.id && r.id === rec.id) return true;
      const name = arNorm(rec.fullName);
      const father = arNorm(rec.fatherName);
      return !!(name && father && name === arNorm(r.fullName) && father === arNorm(r.fatherName) && !rec.nationalId);
    }
    incoming.forEach((raw) => {
      const rec = hydrate(raw);
      const hit = app.roster.find((r) => same(rec, r));
      if (!hit) {
        app.roster.push(rec);
        added += 1;
      } else {
        let ch = false;
        Object.keys(rec).forEach((k) => {
          if (k === "id") return;
          if (!hit[k] && rec[k]) { hit[k] = rec[k]; ch = true; }
        });
        if (ch) updated += 1;
      }
    });
    persist({ sync: false });
    return { added, updated };
  }

  function applySeed(seed, force) {
    if (!seed || !seed.roster) return { added: 0, updated: 0 };
    const flag = "formSY.roster.seed." + seed.version;
    if (!force && localStorage.getItem(flag) && app.roster.length) return { added: 0, updated: 0, skipped: true };
    const r = mergeRoster(seed.roster, true);
    localStorage.setItem(flag, "1");
    if (!app.currentId && app.roster[0]) app.currentId = app.roster[0].id;
    persist();
    return r;
  }

  function syncToCard(rec) {
    if (!app.bridge || !app.bridge.syncCardFromRoster) return;
    app.bridge.syncCardFromRoster(rec);
  }

  async function openLinkedCard() {
    const saved = await saveRosterForm();
    if (saved === "back" || saved === "ignore") return;
    const rec = saved;
    const card = findCardForRecord(rec);
    if (card && app.bridge && app.bridge.openCard) {
      app.bridge.openCard(card.id);
      return;
    }
    if (app.bridge && app.bridge.createCardFromRoster) {
      app.bridge.createCardFromRoster(rec);
    }
  }

  function buildPrintHtml(rows) {
    const keys = app.printKeys.filter((k) => FIELDS.some((f) => f.key === k));
    const s = statsOf(rows);
    const now = new Date();
    const ds = pad2(now.getDate()) + "/" + pad2(now.getMonth() + 1) + "/" + now.getFullYear();
    const filterBits = FILTERS.map((f) => app.filters[f.key] ? f.label + ": " + app.filters[f.key] : "")
      .concat(app.q ? ["بحث: " + app.q] : []).filter(Boolean);
    function bar(arr, title) {
      return "<h4>" + title + "</h4><table class='mini'>" +
        arr.map((x) => "<tr><td>" + esc(x.k) + "</td><td>" + x.n + "</td><td class='bar'><i style='width:" +
          (s.total ? Math.round(100 * x.n / s.total) : 0) + "%'></i></td></tr>").join("") + "</table>";
    }
    return (
      "<div class='rep-head'>" +
        "<div class='org'>الجمهورية العربية السورية</div>" +
        "<div class='org'>وزارة الشؤون الاجتماعية والعمل — مديرية الشؤون الاجتماعية والعمل بدرعا</div>" +
        "<h2>كشف الموظفين والتقرير الإحصائي</h2>" +
        "<div class='meta'>التاريخ: " + ds + " — العدد بعد التصفية: " + rows.length +
          (filterBits.length ? " — " + filterBits.join(" · ") : "") + "</div>" +
      "</div>" +
      "<div class='rep-stats'>" +
        "<span>الإجمالي " + s.total + "</span><span>ذكور " + s.male + "</span><span>إناث " + s.female +
        "</span><span>مثبت " + s.perm + "</span><span>متعاقد " + s.contract +
        "</span><span>على رأس عمله " + s.onJob + "</span><span>إجازة " + s.leave +
        "</span><span>مفصول " + s.dismissed + "</span></div>" +
      "<div class='rep-grid'>" + bar(s.byCat, "الفئات") + bar(s.byUnit.slice(0, 12), "الوحدات") + "</div>" +
      "<table class='rep-table'><thead><tr><th>ت</th>" +
        keys.map((k) => "<th>" + esc((FIELDS.find((f) => f.key === k) || {}).label || k) + "</th>").join("") +
      "</tr></thead><tbody>" +
        rows.map((r, i) => "<tr><td>" + (i + 1) + "</td>" + keys.map((k) => "<td>" + esc(r[k] || "") + "</td>").join("") + "</tr>").join("") +
      "</tbody></table>" +
      "<div class='rep-foot'>أخطبوط للحلول البرمجية — م. حسن الزعبي</div>"
    );
  }
  function pad2(n) { return String(n).padStart(2, "0"); }

  function printReport() {
    const rows = filtered();
    const box = document.getElementById("print-report");
    box.innerHTML = buildPrintHtml(rows);
    document.body.classList.add("printing-report");
    const after = () => {
      document.body.classList.remove("printing-report");
      window.removeEventListener("afterprint", after);
    };
    window.addEventListener("afterprint", after);
    window.print();
    setTimeout(after, 1500);
  }

  async function exportFiltered() {
    if (!global.ExcelJS) throw new Error("ExcelJS غير محمّل");
    const rows = filtered();
    const keys = app.printKeys.filter((k) => FIELDS.some((f) => f.key === k));
    const wb = new global.ExcelJS.Workbook();
    const ws = wb.addWorksheet("كشف الموظفين", { views: [{ rightToLeft: true }] });
    const headers = ["ت"].concat(keys.map((k) => (FIELDS.find((f) => f.key === k) || {}).label || k));
    ws.addRow(headers);
    rows.forEach((r, i) => ws.addRow([i + 1].concat(keys.map((k) => r[k] || ""))));
    const st = wb.addWorksheet("إحصاء", { views: [{ rightToLeft: true }] });
    const s = statsOf(rows);
    st.addRow(["المؤشر", "القيمة"]);
    [["الإجمالي", s.total], ["ذكور", s.male], ["إناث", s.female], ["مثبت", s.perm],
     ["متعاقد", s.contract], ["على رأس عمله", s.onJob], ["إجازة", s.leave], ["مفصول", s.dismissed]]
      .forEach((x) => st.addRow(x));
    st.addRow([]);
    st.addRow(["الفئة", "العدد"]);
    s.byCat.forEach((x) => st.addRow([x.k, x.n]));
    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "كشف-الموظفين.xlsx";
    a.click();
  }

  function buildFormDom() {
    const wrap = document.getElementById("roster-form");
    if (!wrap || wrap.dataset.ready) return;
    wrap.dataset.ready = "1";
    GROUPS.forEach((g) => {
      const fs = document.createElement("fieldset");
      const lg = document.createElement("legend");
      lg.textContent = g.label;
      fs.appendChild(lg);
      const grid = document.createElement("div");
      grid.className = "form-grid";
      FIELDS.filter((f) => f.group === g.id).forEach((f) => {
        const lab = document.createElement("label");
        const span = document.createElement("span");
        span.textContent = f.label;
        const input = document.createElement("input");
        input.type = "text";
        input.dataset.rf = f.key;
        input.autocomplete = "off";
        if (f.list) input.setAttribute("list", f.list);
        lab.appendChild(span);
        lab.appendChild(input);
        grid.appendChild(lab);
      });
      fs.appendChild(grid);
      wrap.appendChild(fs);
    });
    wrap.addEventListener("input", () => { app.dirty = true; });
  }

  function buildFieldPicker() {
    const box = document.getElementById("field-picker");
    if (!box || box.dataset.ready) return;
    box.dataset.ready = "1";
    box.innerHTML = FIELDS.map((f) =>
      "<label class='chk'><input type='checkbox' data-pk='" + f.key + "'" +
      (app.printKeys.indexOf(f.key) >= 0 ? " checked" : "") + "> " + esc(f.label) + "</label>"
    ).join("");
    box.addEventListener("change", () => {
      app.printKeys = Array.from(box.querySelectorAll("input[data-pk]:checked")).map((i) => i.dataset.pk);
      persist();
      renderPreview();
    });
  }

  function bind() {
    buildFormDom();
    buildFieldPicker();
    const search = document.getElementById("roster-search");
    if (search) {
      search.addEventListener("input", () => {
        app.q = search.value;
        renderList();
        renderPreview();
        renderStats("registry-stats", filtered());
        const n = document.getElementById("report-count");
        if (n) n.textContent = filtered().length + " سجل";
      });
    }
    FILTERS.forEach((f) => {
      ["flt-", "rep-"].forEach((prefix) => {
        const el = document.getElementById(prefix + f.key);
        if (!el) return;
        el.addEventListener("change", () => {
          app.filters[f.key] = el.value;
          FILTERS.forEach((ff) => {
            const a = document.getElementById("flt-" + ff.key);
            const b = document.getElementById("rep-" + ff.key);
            if (a && a !== el) a.value = app.filters[ff.key] || "";
            if (b && b !== el) b.value = app.filters[ff.key] || "";
          });
          renderList();
          renderPreview();
          renderStats("registry-stats", filtered());
        });
      });
    });
    const list = document.getElementById("roster-list");
    if (list) {
      list.addEventListener("click", (e) => {
        const b = e.target.closest("[data-id]");
        if (b) selectRecord(b.dataset.id);
      });
    }
    const btnSave = document.getElementById("btnRosterSave");
    if (btnSave) btnSave.onclick = async () => {
      const rec = await saveRosterForm();
      if (!rec || rec === "back" || rec === "ignore") return;
      syncToCard(rec);
      renderAll();
      setStatus("حُفظ سجل «" + (rec.fullName || "موظف") + "»", true);
    };
    const btnNew = document.getElementById("btnRosterNew");
    if (btnNew) btnNew.onclick = async () => {
      if (app.dirty) {
        const saved = await saveRosterForm();
        if (saved === "back") return;
      }
      const rec = blankRecord();
      if (global.FormSYAuth && global.FormSYAuth.user()) rec.owner = global.FormSYAuth.user();
      app.roster.unshift(rec);
      app.currentId = rec.id;
      persist();
      renderAll();
      setStatus("سجل جديد — عبّئ البيانات ثم احفظ", true);
    };
    const btnDel = document.getElementById("btnRosterDelete");
    if (btnDel) btnDel.onclick = () => {
      const rec = current();
      if (!rec) return;
      if (!confirm("حذف سجل «" + (rec.fullName || "موظف") + "» من السجل؟")) return;
      app.roster = app.roster.filter((r) => r.id !== rec.id);
      app.currentId = app.roster[0] ? app.roster[0].id : null;
      persist();
      renderAll();
      setStatus("تم حذف السجل", true);
    };
    const btnOpen = document.getElementById("btnOpenCard");
    if (btnOpen) btnOpen.onclick = openLinkedCard;
    const btnForm = document.getElementById("btnRegForm");
    const btnTable = document.getElementById("btnRegTable");
    if (btnForm) btnForm.onclick = () => setRegistryMode("form");
    if (btnTable) btnTable.onclick = () => setRegistryMode("table");
    const tableWrap = document.getElementById("roster-table-wrap");
    if (tableWrap && !tableWrap.dataset.bound) {
      tableWrap.dataset.bound = "1";
      tableWrap.addEventListener("click", (e) => {
        const tr = e.target.closest("tr[data-id]");
        if (!tr) return;
        selectRecord(tr.dataset.id);
        setRegistryMode("form");
      });
    }
    const btnPrint = document.getElementById("btnPrintReport");
    if (btnPrint) btnPrint.onclick = printReport;
    const btnExp = document.getElementById("btnExportReport");
    if (btnExp) btnExp.onclick = () => exportFiltered().then(
      () => setStatus("تم تصدير الكشف المصنّى", true),
      (e) => setStatus("فشل التصدير: " + e.message, false)
    );
    const btnDef = document.getElementById("btnDefaultFields");
    if (btnDef) btnDef.onclick = () => {
      app.printKeys = FIELDS.filter((f) => f.print).map((f) => f.key);
      persist();
      document.querySelectorAll("#field-picker input[data-pk]").forEach((i) => {
        i.checked = app.printKeys.indexOf(i.dataset.pk) >= 0;
      });
      renderPreview();
    };
    const btnAll = document.getElementById("btnAllFields");
    if (btnAll) btnAll.onclick = () => {
      app.printKeys = FIELDS.map((f) => f.key);
      persist();
      document.querySelectorAll("#field-picker input[data-pk]").forEach((i) => { i.checked = true; });
      renderPreview();
    };
    const btnClear = document.getElementById("btnClearFilters");
    if (btnClear) btnClear.onclick = () => {
      app.filters = {};
      app.q = "";
      const s = document.getElementById("roster-search");
      const s2 = document.getElementById("report-search");
      if (s) s.value = "";
      if (s2) s2.value = "";
      renderAll();
    };
    const rs = document.getElementById("report-search");
    if (rs) rs.addEventListener("input", () => {
      app.q = rs.value;
      const s = document.getElementById("roster-search");
      if (s) s.value = rs.value;
      renderList();
      renderPreview();
    });
  }

  function openRecordForCard(card) {
    const rec = findForCard(card);
    if (rec) {
      app.currentId = rec.id;
      persist();
      renderAll();
      return rec;
    }
    return null;
  }

  function upsertFromCard(card) {
    if (!card) return { rec: null, created: false };
    let rec = findForCard(card);
    let created = false;
    if (!rec) {
      rec = blankRecord();
      rec.source = "من البطاقة الذاتية";
      rec.owner = (global.FormSYAuth && global.FormSYAuth.user()) || card.owner || "";
      app.roster.push(rec);
      created = true;
    }
    const map = [
      ["fullName", "fullName"], ["fatherName", "fatherName"], ["motherName", "motherName"],
      ["nationalId", "nationalId"], ["selfId", "selfId"], ["gender", "gender"],
      ["registryPlaceNo", "registryPlaceNo"], ["qualification", "qualification"],
    ];
    map.forEach(([ck, rk]) => {
      if (card[ck] && !rec[rk]) rec[rk] = card[ck];
    });
    if (card.birthPlaceDate && !rec.birthPlaceDate) rec.birthPlaceDate = card.birthPlaceDate;
    if (card.residence && !rec.residencePlace && !rec.residence) rec.residencePlace = card.residence;
    const last = (card.jobs || []).filter((j) => j.title || j.workplace || j.category).slice(-1)[0];
    if (last) {
      if (last.title && !rec.jobTitle) rec.jobTitle = last.title;
      if (last.workplace && !rec.unit) rec.unit = last.workplace;
      if (last.category && !rec.category) rec.category = last.category;
    }
    persist();
    return { rec: rec, created: created };
  }

  function init(bridge) {
    app.bridge = bridge || {};
    load();
    bind();
    renderAll();
  }

  global.FormSYHR = {
    init,
    applySeed,
    mergeRoster,
    renderAll,
    findForCard,
    findCardForRecord,
    openRecordForCard,
    upsertFromCard,
    current,
    getRoster: () => scopeList(),
    getAllRoster: () => app.roster,
    FIELDS,
  };
})(window);
