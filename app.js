(function () {
  const STORE_KEY = "formSY.cards.v2";
  const CURRENT_KEY = "formSY.current.v2";

  const SUGGESTED_CHANGES = [
    ["31/12/1993", "ترفيع", "قرار", "1307", "1993"],
    ["30/04/1994", "زيادة", "مرسوم", "3", "1994"],
    ["31/12/1995", "ترفيع", "قرار", "1528", "1995"],
    ["31/12/1997", "ترفيع", "قرار", "1548", "1997"],
    ["31/12/1999", "ترفيع", "قرار", "1675", "1999"],
    ["31/08/2000", "زيادة", "مرسوم", "36", "2000"],
    ["31/12/2001", "ترفيع", "قرار", "2624", "2001"],
    ["31/05/2002", "زيادة", "مرسوم", "28", "2002"],
    ["31/12/2003", "ترفيع", "قرار", "3280", "2004"],
    ["11/05/2004", "زيادة", "مرسوم", "31", "2004"],
    ["31/12/2005", "ترفيع", "قرار", "1076", "2006"],
    ["01/02/2006", "زيادة", "مرسوم", "14", "2006"],
    ["30/12/2007", "ترفيع", "قرار", "1692", "2008"],
    ["11/05/2008", "زيادة", "مرسوم", "25", "2008"],
    ["31/12/2009", "ترفيع", "قرار", "279", "2010"],
    ["11/04/2011", "زيادة", "مرسوم", "40", "2011"],
    ["31/12/2011", "ترفيع", "قرار", "398", "2012"],
    ["01/07/2013", "زيادة", "مرسوم", "38", "2013"],
    ["31/12/2013", "ترفيع", "قرار", "1957", "2014"],
    ["23/09/2015", "زيادة", "مرسوم", "41", "2015"],
    ["31/12/2015", "ترفيع", "قرار", "109", "2016"],
    ["03/12/2017", "ترفيع", "قرار", "", "2018"],
    ["23/11/2019", "زيادة", "مرسوم", "21", "2019"],
    ["31/12/2019", "ترفيع", "قرار", "1034", "2020"],
    ["11/07/2021", "زيادة", "مرسوم", "19", "2021"],
    ["15/12/2021", "زيادة", "مرسوم", "29", "2022"],
    ["31/12/2021", "ترفيع", "قرار", "69", "2022"],
    ["16/08/2023", "زيادة", "مرسوم", "11", "2023"],
    ["31/12/2023", "زيادة", "مرسوم", "7", "2024"],
    ["31/12/2023", "ترفيع", "قرار", "353", "2024"],
    ["19/06/2025", "زيادة", "مرسوم", "102", "2025"],
  ];

  const SAMPLE = {
    agency: "",
    nationalId: "",
    selfId: "",
    insuranceId: "",
    fullName: "علي الزعبي",
    fatherName: "عمر",
    motherName: "مريم",
    birthPlaceDate: "",
    registryPlaceNo: "",
    gender: "ذكر",
    nationality: "ع.س",
    foreignLang: "",
    qualification: "إجازة في الاقتصاد",
    courses: "",
    residence: "درعا المحطة",
    decreeNo: "1503",
    decreeDate: "24/12/1995",
    appointmentType: "تعييناً بالوكالة",
    notifyDate: "",
    endServiceDate: "",
    registrarPrivate: "",
    registrarAuditor: "",
  };

  function emptyRow() {
    return {
      workplace: "", title: "", jobType: "", category: "", wage: "", startDate: "",
      changeDate: "", reason: "", docType: "", docNo: "", docYear: "",
      registrarName: "", registrarSign: "",
    };
  }
  const CATALOG = SUGGESTED_CHANGES.map((s) => ({
    changeDate: s[0], reason: s[1], docType: s[2], docNo: s[3], docYear: s[4],
  }));

  function emptyJobs() {
    return Array.from({ length: 31 }, emptyRow);
  }
  function emptyLeave() {
    return { duration: "", start: "", end: "", reasons: "", docType: "", docNo: "", docDate: "", registrar: "" };
  }
  function emptyReward() {
    return { type: "", reasons: "", docType: "", docNo: "", docDate: "", registrar: "" };
  }
  function emptyNote() {
    return { text: "", registrar: "" };
  }
  function uid() {
    return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function blankCard() {
    return {
      id: uid(),
      updatedAt: new Date().toISOString(),
      ...Object.fromEntries(Object.keys(SAMPLE).map((k) => [k, ""])),
      decreeNo: "1503",
      decreeDate: "24/12/1995",
      appointmentType: "تعييناً بالوكالة",
      nationality: "ع.س",
      jobs: emptyJobs(),
      leaves: Array.from({ length: 29 }, emptyLeave),
      rewards: Array.from({ length: 11 }, emptyReward),
      penalties: Array.from({ length: 17 }, emptyReward),
      insurance: Array.from({ length: 11 }, emptyNote),
      health: Array.from({ length: 11 }, emptyNote),
      clearance: Array.from({ length: 11 }, emptyNote),
      suggestApplied: false,
    };
  }
  function sampleCard() {
    const c = blankCard();
    Object.assign(c, SAMPLE);
    c.jobs = emptyJobs();
    c.suggestApplied = false;
    return c;
  }

  const FIELDS = [
    "agency", "nationalId", "selfId", "insuranceId",
    "fullName", "fatherName", "motherName", "birthPlaceDate", "registryPlaceNo",
    "gender", "nationality", "foreignLang", "qualification", "courses", "residence",
    "decreeNo", "decreeDate", "appointmentType", "notifyDate", "endServiceDate",
    "registrarPrivate", "registrarAuditor",
  ];

  const state = {
    cards: [],
    currentId: null,
    page: 1,
    zoom: 1,
    dirty: false,
  };

  function loadStore() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      state.cards = raw ? JSON.parse(raw) : [];
    } catch (e) {
      state.cards = [];
    }
    if (!state.cards.length) {
      state.cards = [sampleCard()];
    }
    state.currentId = localStorage.getItem(CURRENT_KEY) || state.cards[0].id;
    if (!state.cards.find((c) => c.id === state.currentId)) state.currentId = state.cards[0].id;
  }
  function persist() {
    localStorage.setItem(STORE_KEY, JSON.stringify(state.cards));
    localStorage.setItem(CURRENT_KEY, state.currentId);
    if (window.FormSYCloud && window.FormSYHR) {
      window.FormSYCloud.queue("roster", window.FormSYHR.getRoster());
    }
  }
  function current() {
    return state.cards.find((c) => c.id === state.currentId);
  }
  function arNorm(s) {
    return String(s || "")
      .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
      .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي")
      .replace(/\s+/g, " ").trim();
  }
  function digitsOnly(s) {
    return String(s || "").replace(/\D/g, "");
  }
  function padJobs(list) {
    const rows = (list || []).map((j) => Object.assign(emptyRow(), j));
    while (rows.length < 31) rows.push(emptyRow());
    if (rows.length > 31) rows.length = 31;
    return rows;
  }
  function hydrateCard(raw) {
    const c = blankCard();
    FIELDS.forEach((k) => {
      if (raw[k] != null && raw[k] !== "") c[k] = raw[k];
    });
    c.jobs = padJobs(raw.jobs);
    if (raw.leaves) c.leaves = raw.leaves;
    if (raw.rewards) c.rewards = raw.rewards;
    if (raw.penalties) c.penalties = raw.penalties;
    if (raw.insurance) c.insurance = raw.insurance;
    if (raw.health) c.health = raw.health;
    if (raw.clearance) c.clearance = raw.clearance;
    c.sourceFile = raw.sourceFile || "";
    if (raw.id) c.id = raw.id;
    else if (raw.nationalId) c.id = "nid-" + raw.nationalId;
    else if (raw.fullName) c.id = "nm-" + String(raw.fullName).replace(/\s+/g, "").slice(0, 28);
    return c;
  }
  function findCardMatch(incoming) {
    const nid = digitsOnly(incoming.nationalId);
    const name = arNorm(incoming.fullName);
    return state.cards.find((c) => {
      if (nid && digitsOnly(c.nationalId) === nid) return true;
      if (incoming.id && c.id === incoming.id) return true;
      if (name && arNorm(c.fullName) === name) return true;
      return false;
    }) || null;
  }
  function mergeIncomingCard(incoming) {
    const hit = findCardMatch(incoming);
    if (!hit) {
      state.cards.push(incoming);
      return "added";
    }
    FIELDS.forEach((k) => {
      if (incoming[k] && !hit[k]) hit[k] = incoming[k];
    });
    const hitHasJobs = (hit.jobs || []).some((r) => r.workplace || r.title || r.wage || r.changeDate);
    const inHasJobs = (incoming.jobs || []).some((r) => r.workplace || r.title || r.wage || r.changeDate);
    if (!hitHasJobs && inHasJobs) hit.jobs = padJobs(incoming.jobs);
    return "updated";
  }
  function applySeedCards(seed, force) {
    if (!seed || !seed.cards) return { added: 0, updated: 0, skipped: true };
    const flag = "formSY.cards.seed." + seed.version;
    if (!force && localStorage.getItem(flag) && state.cards.length > 3) {
      return { added: 0, updated: 0, skipped: true };
    }
    let added = 0, updated = 0;
    seed.cards.forEach((raw) => {
      const r = mergeIncomingCard(hydrateCard(raw));
      if (r === "added") added += 1;
      else updated += 1;
    });
    localStorage.setItem(flag, "1");
    if (!state.cards.find((c) => c.id === state.currentId) && state.cards[0]) {
      state.currentId = state.cards[0].id;
    }
    persist();
    return { added, updated };
  }
  function setStatus(msg, ok) {
    const el = document.getElementById("status");
    el.textContent = msg;
    el.style.color = ok === false ? "#ffb4b4" : "#d9c89a";
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  const CHANGE_KEYS = ["changeDate", "reason", "docType", "docNo", "docYear"];
  let suggesting = false;

  function changeFilled(row) {
    return CHANGE_KEYS.some((k) => (row[k] || "").trim());
  }
  function assignChange(row, item) {
    CHANGE_KEYS.forEach((k) => { row[k] = item[k] || ""; });
  }
  function normTxt(s) {
    return String(s || "").replace(/\s+/g, "").replace(/[ـ]/g, "");
  }
  function normDate(s) {
    const t = String(s || "").trim();
    let m = t.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
    if (m) {
      const d = m[1].padStart(2, "0");
      const mo = m[2].padStart(2, "0");
      let y = m[3];
      if (y.length === 2) y = (+y > 50 ? "19" : "20") + y;
      return d + "/" + mo + "/" + y;
    }
    m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return m[3] + "/" + m[2] + "/" + m[1];
    return t;
  }
  function fieldMatches(key, typed, item) {
    const v = String(typed || "").trim();
    if (!v) return true;
    const iv = String(item[key] || "");
    if (key === "changeDate") return normDate(v) === normDate(iv);
    if (key === "docNo" || key === "docYear") return normTxt(v) === normTxt(iv);
    return normTxt(iv).indexOf(normTxt(v)) !== -1 || normTxt(v) === normTxt(iv);
  }
  function isGenericOnly(row) {
    const hasSpecific = (row.changeDate || "").trim() || (row.docNo || "").trim() || (row.docYear || "").trim();
    if (hasSpecific) return false;
    const reason = (row.reason || "").trim();
    const doc = (row.docType || "").trim();
    if (!reason && !doc) return true;
    const genericReason = !reason || reason === "ترفيع" || reason === "زيادة";
    const genericDoc = !doc || doc === "قرار" || doc === "مرسوم";
    return genericReason && genericDoc;
  }
  function findCatalogMatches(row) {
    return CATALOG
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => CHANGE_KEYS.every((k) => fieldMatches(k, row[k], item)));
  }
  function syncJobInputs(card) {
    const wrap = document.getElementById("jobs");
    if (!wrap) return;
    const keys = [
      "workplace", "title", "jobType", "category", "wage", "startDate",
      "changeDate", "reason", "docType", "docNo", "docYear",
      "registrarName", "registrarSign",
    ];
    card.jobs.forEach((row, i) => {
      keys.forEach((k, j) => {
        const node = wrap.children[i * 13 + j];
        const input = node && node.querySelector("input");
        if (input && input.value !== (row[k] || "")) input.value = row[k] || "";
      });
    });
  }
  function usedCatalogIndexes(card, exceptRow) {
    const used = new Set();
    (card.jobs || []).forEach((r, i) => {
      if (i === exceptRow || !changeFilled(r)) return;
      const hits = findCatalogMatches(r);
      if (hits.length === 1) used.add(hits[0].index);
    });
    return used;
  }
  function fillThisRowOnly(card, row, rowIndex, item) {
    suggesting = true;
    assignChange(row, item);
    syncJobInputs(card);
    renderLedgers();
    suggesting = false;
    setStatus("اكتمل هذا السطر من الاقتراح — كل تبدل مستقل، احذف الخانة بعد تحديدها", true);
  }
  function maybeSuggestFromRow(card, row, rowIndex) {
    if (suggesting || !changeFilled(row)) return;
    if (isGenericOnly(row)) return;
    const hits = findCatalogMatches(row);
    if (!hits.length) return;
    const used = usedCatalogIndexes(card, rowIndex);
    const pick = hits.find((h) => !used.has(h.index)) || hits[0];
    fillThisRowOnly(card, row, rowIndex, pick.item);
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }
  function toDMY(y, m, d) {
    y = +y;
    m = +m;
    d = +d;
    if (y < 100) y += y >= 50 ? 1900 : 2000;
    if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1800 || y > 2100) return null;
    return pad2(d) + "/" + pad2(m) + "/" + y;
  }
  function parseToDMY(chunk) {
    const t = String(chunk || "").trim();
    let m = t.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
    if (m) return toDMY(m[3], m[2], m[1]);
    m = t.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
    if (m) return toDMY(m[1], m[2], m[3]);
    m = t.match(/^(\d{2})(\d{2})(\d{4})$/);
    if (m) return toDMY(m[3], m[2], m[1]);
    return null;
  }
  function formatDateValue(raw) {
    if (!raw || !String(raw).trim()) return raw || "";
    return parseToDMY(String(raw).trim()) || String(raw).trim();
  }
  function formatPlaceDate(raw) {
    if (!raw || !String(raw).trim()) return raw || "";
    const t = String(raw).trim();
    const only = parseToDMY(t);
    if (only) return only;
    const m = t.match(/(\d{1,4}[\/\-.]\d{1,2}[\/\-.]\d{1,4}|\d{8})/);
    if (!m) return t;
    const formatted = parseToDMY(m[1]);
    if (!formatted) return t;
    return (t.slice(0, m.index) + formatted + t.slice(m.index + m[0].length))
      .replace(/\s{2,}/g, " ")
      .trim();
  }
  const DATE_ONLY_KEYS = {
    startDate: 1, changeDate: 1, decreeDate: 1, notifyDate: 1, endServiceDate: 1,
    start: 1, end: 1, docDate: 1,
  };
  function applyDateFormat(obj, key, input) {
    const prev = obj[key] || "";
    const next = key === "birthPlaceDate" ? formatPlaceDate(prev) : DATE_ONLY_KEYS[key] ? formatDateValue(prev) : prev;
    if (next !== prev) {
      obj[key] = next;
      if (input) input.value = next;
      state.dirty = true;
    }
  }

  function selectOnArrive(input) {
    input.addEventListener("focus", () => {
      requestAnimationFrame(() => {
        try { input.select(); } catch (e) {}
      });
    });
  }

  function bindInput(input, obj, key, after) {
    input.value = obj[key] || "";
    selectOnArrive(input);
    input.addEventListener("input", () => {
      obj[key] = input.value;
      state.dirty = true;
      if (after) after();
    });
    input.addEventListener("blur", () => {
      applyDateFormat(obj, key, input);
      if (after) after();
    });
    return input;
  }

  function inp(obj, key, extraClass, listId, after) {
    const i = document.createElement("input");
    i.type = "text";
    i.autocomplete = "off";
    i.spellcheck = false;
    if (["changeDate", "docNo", "docYear", "startDate", "wage", "docDate", "start", "end"].indexOf(key) >= 0) {
      i.style.direction = "ltr";
    }
    if (DATE_ONLY_KEYS[key]) i.title = "التاريخ: 01/01/2001";
    if (extraClass) i.className = extraClass;
    if (listId) i.setAttribute("list", listId);
    bindInput(i, obj, key, () => {
      refreshSelect();
      renderLedgers();
      if (after) after();
    });
    return i;
  }

  function cell(cls, child) {
    const d = el("div", cls);
    if (child) {
      d.appendChild(child);
      d.addEventListener("mousedown", (e) => {
        if (e.target.tagName === "INPUT") return;
        const i = d.querySelector("input");
        if (!i) return;
        e.preventDefault();
        i.focus();
      });
    }
    return d;
  }

  function buildJobGrid(card) {
    const wrap = document.getElementById("jobs");
    wrap.innerHTML = "";
    if (!card.jobs) card.jobs = emptyJobs();
    while (card.jobs.length < 31) card.jobs.push(emptyRow());
    card.jobs.length = 31;
    card.jobs.forEach((row, rowIndex) => {
      ["workplace", "title", "jobType", "category", "wage"].forEach((k) => {
        wrap.appendChild(cell("cell val", inp(row, k)));
      });
      wrap.appendChild(cell("cell val", inp(row, "startDate")));
      CHANGE_KEYS.forEach((k) => {
        const list = k === "reason" ? "list-reason" : k === "docType" ? "list-doctype" : null;
        wrap.appendChild(cell("cell sug", inp(row, k, "", list, () => {
          maybeSuggestFromRow(card, row, rowIndex);
        })));
      });
      wrap.appendChild(cell("cell val", inp(row, "registrarName")));
      wrap.appendChild(cell("cell val", inp(row, "registrarSign")));
    });
  }

  function buildGrid(id, rows, keys, count, factory) {
    const wrap = document.getElementById(id);
    wrap.innerHTML = "";
    if (!rows) rows = [];
    while (rows.length < count) rows.push(factory());
    rows.length = count;
    rows.forEach((row) => {
      keys.forEach((k) => wrap.appendChild(cell("cell val", inp(row, k))));
    });
    return rows;
  }

  function fillScalars(card) {
    FIELDS.forEach((k) => {
      const node = document.querySelector('[data-field="' + k + '"]');
      if (!node) return;
      node.value = card[k] || "";
      node.spellcheck = false;
      node.autocomplete = "off";
      selectOnArrive(node);
      if (k === "birthPlaceDate" || DATE_ONLY_KEYS[k]) {
        node.title = "التاريخ: 01/01/2001";
        if (k !== "birthPlaceDate") node.style.direction = "ltr";
      }
      node.oninput = () => {
        card[k] = node.value;
        state.dirty = true;
        refreshSelect();
        renderLedgers();
      };
      node.onblur = () => {
        applyDateFormat(card, k, node);
        refreshSelect();
        renderLedgers();
      };
    });
    document.querySelectorAll(".p1 .cell, .p1 .sign-space, .p2 .cell").forEach((box) => {
      if (box.dataset.clickBound) return;
      box.dataset.clickBound = "1";
      box.addEventListener("mousedown", (e) => {
        if (e.target.tagName === "INPUT") return;
        const i = box.querySelector("input");
        if (!i) return;
        e.preventDefault();
        i.focus();
      });
    });
  }

  function renderCard() {
    const card = current();
    fillScalars(card);
    buildJobGrid(card);
    card.leaves = buildGrid("leaves", card.leaves, ["duration", "start", "end", "reasons", "docType", "docNo", "docDate", "registrar"], 29, emptyLeave);
    card.rewards = buildGrid("rewards", card.rewards, ["type", "reasons", "docType", "docNo", "docDate", "registrar"], 11, emptyReward);
    card.penalties = buildGrid("penalties", card.penalties, ["type", "reasons", "docType", "docNo", "docDate", "registrar"], 17, emptyReward);
    card.insurance = buildGrid("insurance", card.insurance, ["text", "registrar"], 11, emptyNote);
    card.health = buildGrid("health", card.health, ["text", "registrar"], 11, emptyNote);
    card.clearance = buildGrid("clearance", card.clearance, ["text", "registrar"], 11, emptyNote);
    refreshSelect();
    renderLedgers();
    showPage(state.page);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function blankFoot(cols, n) {
    return Array.from({ length: n }, () => "<tr>" + "<td></td>".repeat(cols) + "</tr>").join("");
  }

  function renderLedgers() {
    const card = current();
    const t3 = document.getElementById("ledger3-body");
    const t4 = document.getElementById("ledger4-body");
    const rows = [];
    (card.jobs || []).forEach((r) => {
      if (!changeFilled(r) && !(r.workplace || r.title || r.wage || r.startDate)) return;
      if (!changeFilled(r)) return;
      rows.push(
        "<tr>" +
          "<td>" + (rows.length + 1) + "</td>" +
          "<td>" + esc(card.fullName) + "</td>" +
          "<td>" + esc(card.nationalId) + "</td>" +
          "<td>" + esc(r.workplace) + "</td>" +
          "<td>" + esc(r.title) + "</td>" +
          "<td class='sug'>" + esc(r.changeDate) + "</td>" +
          "<td class='sug'>" + esc(r.reason) + "</td>" +
          "<td class='sug'>" + esc(r.docType) + "</td>" +
          "<td class='sug'>" + esc(r.docNo) + "</td>" +
          "<td class='sug'>" + esc(r.docYear) + "</td>" +
        "</tr>"
      );
    });
    t3.innerHTML = rows.join("") ||
      "<tr><td colspan='10' class='muted'>كل سطر تبدل مستقل — أدخل قيمة واحدة في سطر الوجه 1 فيكتمل ذلك السطر وحده ويظهر هنا</td></tr>";
    document.getElementById("ledger3-foot").innerHTML = rows.length ? blankFoot(10, 6) : "";

    const p4 = [];
    function add4(kind, detail, mid, a, b, dt, dn, dd) {
      if (!(detail || mid || a || b || dt || dn)) return;
      p4.push(
        "<tr>" +
          "<td>" + (p4.length + 1) + "</td>" +
          "<td>" + esc(card.fullName) + "</td>" +
          "<td>" + esc(kind) + "</td>" +
          "<td>" + esc(detail) + "</td>" +
          "<td>" + esc(mid) + "</td>" +
          "<td>" + esc(a) + "</td>" +
          "<td>" + esc(b) + "</td>" +
          "<td>" + esc(dt) + "</td>" +
          "<td>" + esc(dn) + "</td>" +
          "<td>" + esc(dd) + "</td>" +
        "</tr>"
      );
    }
    (card.leaves || []).forEach((r) => add4("إجازة بلا أجر", r.reasons, r.duration, r.start, r.end, r.docType, r.docNo, r.docDate));
    (card.rewards || []).forEach((r) => add4("مكافأة", r.reasons, r.type, "", "", r.docType, r.docNo, r.docDate));
    (card.penalties || []).forEach((r) => add4("عقوبة", r.reasons, r.type, "", "", r.docType, r.docNo, r.docDate));
    (card.insurance || []).forEach((r) => add4("وضع تأميني", r.text, "", "", "", "", "", ""));
    (card.health || []).forEach((r) => add4("حالة صحية", r.text, "", "", "", "", "", ""));
    (card.clearance || []).forEach((r) => add4("براءة ذمة", r.text, "", "", "", "", "", ""));
    t4.innerHTML = p4.join("") ||
      "<tr><td colspan='10' class='muted'>تُملأ تلقائياً من الوجه 2 عند كتابة أي سطر في الإجازات أو المكافآت أو العقوبات</td></tr>";
    document.getElementById("ledger4-foot").innerHTML = p4.length ? blankFoot(10, 8) : "";

    const metaBits = [
      card.agency ? "الجهة: " + card.agency : "",
      card.nationalId ? "الرقم الوطني: " + card.nationalId : "",
      card.selfId ? "الرقم الذاتي: " + card.selfId : "",
    ].filter(Boolean).join("  ·  ");
    document.getElementById("ledger3-name").textContent = card.fullName || "—";
    document.getElementById("ledger4-name").textContent = card.fullName || "—";
    document.getElementById("ledger3-meta").textContent = metaBits;
    document.getElementById("ledger4-meta").textContent = metaBits;
  }

  function refreshSelect() {
    const sel = document.getElementById("cardSelect");
    const keep = state.currentId;
    const qEl = document.getElementById("cardSearch");
    const q = arNorm(qEl && qEl.value);
    const qd = digitsOnly(qEl && qEl.value);
    sel.innerHTML = "";
    const list = state.cards.filter((c, i) => {
      if (!q && !qd) return true;
      const blob = arNorm((c.fullName || "") + " " + (c.fatherName || "") + " " + (c.agency || ""));
      const nid = digitsOnly(c.nationalId);
      return (q && blob.indexOf(q) >= 0) || (qd && nid.indexOf(qd) >= 0);
    });
    (list.length ? list : state.cards).forEach((c, i) => {
      const o = document.createElement("option");
      o.value = c.id;
      o.textContent = (c.fullName || ("بطاقة " + (i + 1))) + (c.nationalId ? " — " + c.nationalId : "");
      sel.appendChild(o);
    });
    if (list.length && !list.find((c) => c.id === keep)) sel.value = list[0].id;
    else sel.value = keep;
  }

  function parseLooseDate(s) {
    if (!s) return NaN;
    const t = String(s).trim();
    const iso = Date.parse(t);
    if (!isNaN(iso)) return iso;
    const m = t.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
    if (!m) return NaN;
    const d = +m[1], mo = +m[2], y = +m[3] < 100 ? 2000 + +m[3] : +m[3];
    return new Date(y, mo - 1, d).getTime();
  }

  function showPage(n, instant) {
    state.page = n;
    document.querySelectorAll(".page-nav button").forEach((b) => {
      b.classList.toggle("active", Number(b.dataset.page) === n);
    });
    const target = document.querySelector('.page[data-page="' + n + '"]');
    if (target) target.scrollIntoView({ behavior: instant ? "auto" : "smooth", block: "start" });
  }

  function applyZoom() {
    const stage = document.getElementById("stage");
    stage.style.zoom = String(state.zoom);
    stage.style.transform = "";
    stage.style.marginBottom = "";
  }

  function saveCard() {
    const card = current();
    card.updatedAt = new Date().toISOString();
    persist();
    state.dirty = false;
    if (window.FormSYHR) window.FormSYHR.upsertFromCard(card);
    setStatus("تم الحفظ محلياً — " + (card.fullName || "بطاقة بلا اسم"), true);
    refreshSelect();
  }

  function cardHasData(card) {
    if (FIELDS.some((k) => (card[k] || "").trim() && !["decreeNo", "decreeDate", "appointmentType", "nationality"].includes(k))) return true;
    return (card.jobs || []).some((r) => r.workplace || r.title || r.wage || r.startDate);
  }

  function newCard() {
    const cur = current();
    if (cardHasData(cur) || state.dirty) saveCard();
    const c = blankCard();
    state.cards.push(c);
    state.currentId = c.id;
    persist();
    renderCard();
    showPage(1);
    setStatus("بطاقة جديدة — عبّئ البيانات ثم احفظ", true);
  }

  function switchCard(id) {
    if (state.dirty) saveCard();
    state.currentId = id;
    persist();
    renderCard();
  }

  function deleteCard() {
    const card = current();
    if (!card) {
      setStatus("لا توجد بطاقة للحذف", false);
      return;
    }
    const name = card.fullName || "هذه البطاقة";
    if (!window.confirm("حذف بطاقة «" + name + "» نهائياً؟")) return;
    if (state.cards.length <= 1) {
      state.cards = [blankCard()];
      state.currentId = state.cards[0].id;
    } else {
      state.cards = state.cards.filter((c) => c.id !== state.currentId);
      state.currentId = state.cards[0].id;
    }
    persist();
    renderCard();
    showPage(1, true);
    setStatus("تم حذف البطاقة", true);
  }

  async function exportExcel() {
    saveCard();
    setStatus("جاري التصدير إلى الملف نفسه…");
    try {
      const name = await window.FormSYExport.exportCards(state.cards);
      setStatus("تم الحفظ في الملف نفسه: " + name + " — صفحتان لكل موظف، والجداول مشتركة ومتتالية", true);
    } catch (e) {
      console.error(e);
      setStatus("فشل التصدير: " + (e.message || e), false);
    }
  }

  function exportJson() {
    saveCard();
    const blob = new Blob([JSON.stringify(state.cards, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "البطاقات-الذاتية.json";
    a.click();
  }

  function importJson(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data) || !data.length) throw new Error("الملف فارغ");
        data.forEach((c) => {
          if (!c.id) c.id = uid();
        });
        state.cards = data;
        state.currentId = data[0].id;
        persist();
        renderCard();
        setStatus("تم استيراد " + data.length + " بطاقة", true);
      } catch (e) {
        setStatus("ملف غير صالح", false);
      }
    };
    reader.readAsText(file, "utf-8");
  }

  function printAll() {
    saveCard();
    window.print();
  }

  function showView(name) {
    const views = ["card", "registry", "report"];
    views.forEach((v) => {
      const page = document.getElementById("view-" + v);
      const bar = document.getElementById("bar-" + v);
      if (page) page.classList.toggle("hidden", v !== name);
      if (bar) bar.classList.toggle("hidden", v !== name);
    });
    document.querySelectorAll("#viewTabs [data-view]").forEach((b) => {
      b.classList.toggle("active", b.dataset.view === name);
    });
    document.body.classList.remove("printing-report");
    if ((name === "registry" || name === "report") && window.FormSYHR) {
      window.FormSYHR.renderAll();
    }
  }

  function createCardFromRoster(rec) {
    if (!rec) return;
    const fake = { fullName: rec.fullName, nationalId: rec.nationalId, selfId: rec.selfId, id: rec.nationalId ? "nid-" + rec.nationalId : "" };
    const existing = findCardMatch(fake);
    if (existing) {
      state.currentId = existing.id;
      persist();
      renderCard();
      showView("card");
      setStatus("فُتحت البطاقة المرتبطة: " + (existing.fullName || ""), true);
      return existing;
    }
    const c = blankCard();
    c.fullName = rec.fullName || "";
    c.fatherName = rec.fatherName || "";
    c.motherName = rec.motherName || rec.motherShort || "";
    c.nationalId = rec.nationalId || "";
    c.selfId = rec.selfId || "";
    c.gender = rec.gender || "";
    c.registryPlaceNo = rec.registryPlaceNo || rec.registryNo || "";
    c.qualification = rec.qualification || rec.qualForAppointment || rec.certType || "";
    c.residence = rec.residence || rec.residencePlace || "";
    c.birthPlaceDate = rec.birthPlaceDate || [rec.birthPlace, rec.birthDate].filter(Boolean).join(" ");
    c.foreignLang = rec.englishLevel || rec.otherLang || "";
    c.agency = rec.orgLevel1 || rec.unit || "مديرية الشؤون الاجتماعية والعمل بدرعا";
    c.jobs[0].workplace = rec.unit || rec.orgLevel4 || "";
    c.jobs[0].title = rec.jobTitle || "";
    c.jobs[0].category = rec.category || "";
    c.jobs[0].startDate = rec.appointmentDate || rec.stateWorkDate || "";
    if (rec.nationalId) c.id = "nid-" + rec.nationalId;
    state.cards.push(c);
    state.currentId = c.id;
    persist();
    renderCard();
    showView("card");
    setStatus("أُنشئت بطاقة ذاتية من السجل: " + (c.fullName || ""), true);
    return c;
  }

  function syncCardFromRoster(rec) {
    const fake = { fullName: rec.fullName, nationalId: rec.nationalId, selfId: rec.selfId };
    const card = findCardMatch(fake) || current();
    if (!card || !rec) return;
    const pairs = [
      ["fullName", rec.fullName], ["fatherName", rec.fatherName], ["motherName", rec.motherName],
      ["nationalId", rec.nationalId], ["selfId", rec.selfId], ["gender", rec.gender],
      ["registryPlaceNo", rec.registryPlaceNo || rec.registryNo],
      ["qualification", rec.qualification || rec.qualForAppointment],
      ["residence", rec.residence || rec.residencePlace],
    ];
    pairs.forEach(([k, v]) => {
      if (v && !card[k]) card[k] = v;
    });
    persist();
  }

  async function importExcelFiles(fileList) {
    if (!window.FormSYImport) {
      setStatus("مكتبة الاستيراد غير جاهزة", false);
      return;
    }
    setStatus("جاري استيراد ملفات Excel…");
    try {
      const res = await window.FormSYImport.importFiles(fileList);
      let added = 0, updated = 0;
      (res.cards || []).forEach((raw) => {
        const r = mergeIncomingCard(hydrateCard(raw));
        if (r === "added") added += 1;
        else updated += 1;
      });
      persist();
      let rosterMsg = "";
      if ((res.roster || []).length && window.FormSYHR) {
        const rr = window.FormSYHR.mergeRoster(res.roster, true);
        window.FormSYHR.renderAll();
        rosterMsg = " — السجل +" + rr.added + " / تحديث " + rr.updated;
      }
      if (state.cards[0] && !state.cards.find((c) => c.id === state.currentId)) state.currentId = state.cards[0].id;
      renderCard();
      const err = (res.errors || []).length ? " | تنبيه: " + res.errors[0] : "";
      setStatus("Excel: بطاقات +" + added + " / تحديث " + updated + rosterMsg + err, true);
    } catch (e) {
      console.error(e);
      setStatus("فشل الاستيراد: " + (e.message || e), false);
    }
  }

  function bind() {
    document.getElementById("btnNew").onclick = newCard;
    document.getElementById("btnSave").onclick = saveCard;
    document.getElementById("btnExport").onclick = () => exportExcel();
    document.getElementById("btnExportAll").onclick = () => exportExcel();
    document.getElementById("btnPrint").onclick = printAll;
    document.getElementById("btnDelete").addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      deleteCard();
    });
    document.getElementById("btnJson").onclick = exportJson;
    document.getElementById("fileJson").onchange = (e) => {
      if (e.target.files[0]) importJson(e.target.files[0]);
      e.target.value = "";
    };
    const onExcel = (e) => {
      if (e.target.files && e.target.files.length) importExcelFiles(e.target.files);
      e.target.value = "";
    };
    const fe = document.getElementById("fileExcel");
    const ff = document.getElementById("fileFolder");
    const fe2 = document.getElementById("fileExcel2");
    if (fe) fe.onchange = onExcel;
    if (ff) ff.onchange = onExcel;
    if (fe2) fe2.onchange = onExcel;
    document.getElementById("cardSelect").onchange = (e) => switchCard(e.target.value);
    const cs = document.getElementById("cardSearch");
    if (cs) {
      cs.addEventListener("input", () => {
        refreshSelect();
        const sel = document.getElementById("cardSelect");
        if (sel && sel.value && sel.value !== state.currentId) switchCard(sel.value);
      });
    }
    document.querySelectorAll(".page-nav button").forEach((b) => {
      b.onclick = () => showPage(Number(b.dataset.page));
    });
    document.querySelectorAll("#viewTabs [data-view]").forEach((b) => {
      b.onclick = () => showView(b.dataset.view);
    });
    const btnOpenRoster = document.getElementById("btnOpenRoster");
    if (btnOpenRoster) {
      btnOpenRoster.onclick = () => {
        if (!window.FormSYHR) return;
        const card = current();
        let rec = window.FormSYHR.findForCard(card);
        if (!rec) rec = window.FormSYHR.upsertFromCard(card);
        window.FormSYHR.openRecordForCard(card);
        showView("registry");
        setStatus("السجل المرتبط: " + ((rec && rec.fullName) || card.fullName || ""), true);
      };
    }
    const cf2 = document.getElementById("btnClearFilters2");
    if (cf2) cf2.onclick = () => {
      const b = document.getElementById("btnClearFilters");
      if (b) b.click();
    };
    const zoom = document.getElementById("zoom");
    zoom.oninput = () => {
      state.zoom = Number(zoom.value) / 100;
      applyZoom();
    };
    window.addEventListener("beforeunload", () => {
      if (state.dirty) persist();
    });
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        const reg = document.getElementById("view-registry");
        if (reg && !reg.classList.contains("hidden")) {
          document.getElementById("btnRosterSave").click();
        } else saveCard();
      }
    });
  }

  function registerSW() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }
  }

  loadStore();
  const seed = window.FORMSY_SEED;
  const seedCards = applySeedCards(seed, false);
  bind();
  if (window.FormSYHR) {
    window.FormSYHR.init({
      getCards: () => state.cards,
      setStatus,
      openCard: (id) => {
        if (id) switchCard(id);
        showView("card");
      },
      createCardFromRoster,
      syncCardFromRoster,
    });
    if (seed) window.FormSYHR.applySeed(seed, false);
    window.FormSYHR.renderAll();
    if (window.FormSYCloud) window.FormSYCloud.hydrateRoster();
  }
  renderCard();
  applyZoom();
  registerSW();
  const nR = window.FormSYHR ? window.FormSYHR.getRoster().length : 0;
  const seedNote = seedCards.skipped ? "" : " — استُوردت بطاقات الشؤون";
  setStatus("جاهز — " + state.cards.length + " بطاقة · " + nR + " سجل" + seedNote);

  const params = new URLSearchParams(location.search);
  const demo = params.get("demo");
  if (demo) {
    const card = current();
    card.jobs[0].docNo = demo;
    maybeSuggestFromRow(card, card.jobs[0], 0);
  }
  const only = params.get("page");
  if (only) {
    document.querySelectorAll(".page").forEach((p) => {
      p.classList.toggle("hidden", String(p.dataset.page) !== only);
    });
    showPage(Number(only), true);
  }
})();
