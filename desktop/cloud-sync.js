/* Sync roster rows to Supabase table (default: thatea) via PostgREST. */
(function (global) {
  const COLS = [
    ["عمود1", "id"],
    ["الرقم_الوطني", "nationalId"],
    ["الاسم الثلاثي", "fullName"],
    ["اسم_الأم_الكامل", "motherName"],
    ["التولد", "birthDate"],
    ["محل_الولادة", "birthPlace"],
    ["القيد", "registryPlaceNo"],
    ["الفئة_الوظيفية", "category"],
    ["مسمى العمل", "jobTitle"],
    ["الاسم", "firstName"],
    ["اسم_الأب", "fatherName"],
    ["النسبة", "familyName"],
    ["السوية_التنظيمية_الأولى", "orgLevel1"],
    ["السوية_التنظيمية_الثالثة", "unit"],
    ["الملاك الاصل", "originCadre"],
    ["السوية_التنظيمية_الرابعة", "orgLevel4"],
    ["الرقم_الشخصي", "personalNo"],
    ["الرقم_الذاتي", "selfId"],
    ["مثبت_أو_متعاقد", "contractType"],
    ["الحالة", "status"],
    ["الجنس", "gender"],
    ["الوضع_العائلي", "maritalStatus"],
    ["عدد_الزوجات", "wivesCount"],
    ["عدد_الابناء", "childrenCount"],
    ["المحافظة", "governorate"],
    ["المنطقة_المدينة", "district"],
    ["الناحية", "subdistrict"],
    ["الحالة_الصحية", "healthStatus"],
    ["تفصيل_الإصابة_أو_المرض", "healthDetail"],
    ["تاريخ_الإصابة", "injuryDate"],
    ["زمرة_الدم", "bloodType"],
    ["السكن_الحالي _( المحافظة )", "residenceGov"],
    ["السكن_الحالي _(المنطقة_المدينة )", "residencePlace"],
    ["نوع_السكن", "housingType"],
    ["مصدر_معلومات_السكن", "housingSource"],
    ["رقم_الهاتف", "phone"],
    ["نوع الشهادة", "certType"],
    ["الكلية/ المعهد", "college"],
    ["الاختصاص", "specialization"],
    ["عام الحصول على الشهادة", "certYear"],
    ["وجود الوثيقة", "hasDocument"],
    ["المعدل بالنسبة المئوية", "gradePercent"],
    ["الجامعة1", "university1"],
    ["المرحلة", "studyStage"],
    ["المؤهل_العلمي_المعين_على أساسه", "qualForAppointment"],
    ["مستوى_التمكن_من_اللغة_الإنكليزية", "englishLevel"],
    ["مستوى_التمكن_من_اللغة_التركية", "turkishLevel"],
    ["لغات_آخرى", "otherLang"],
    ["نمط_التعيين_أو_التعاقد", "appointmentMode"],
    ["نمط العمل", "workMode"],
    ["التخصص", "specialty"],
    ["الرقم_الوظيفي", "jobNumber"],
    ["تاريخ_التعيين", "appointmentDate"],
    ["تاريخ_العمل_بالدولة", "stateWorkDate"],
    ["حساب_شام_كاش", "shamCash"],
    ["تاريخ_تعديل_الفئة", "categoryChangeDate"],
    ["العمر (سنة)", "age"],
    ["سنوات الخدمة", "serviceYears"],
    ["المتبقي للتقاعد", "yearsToRetire"],
    ["المُدخل", "owner"],
  ];

  function cfg() {
    const url = (localStorage.getItem("formSY.cloud.url") || "").replace(/\/+$/, "");
    const anon = (localStorage.getItem("formSY.cloud.anon") || "").trim();
    const table = localStorage.getItem("formSY.cloud.table") || "thatea";
    if (url && anon) return { url: url, anon: anon, table: table, auto: false };
    return { url: "", anon: "", table: table, auto: true };
  }

  function rowFrom(rec) {
    const row = {};
    COLS.forEach(([col, key]) => {
      const v = rec[key];
      if (v != null && String(v) !== "") row[col] = String(v);
    });
    return row;
  }

  function recFrom(row) {
    const rec = {};
    COLS.forEach(([col, key]) => {
      const v = row[col];
      if (v != null && String(v) !== "") rec[key] = String(v);
    });
    return rec;
  }

  function headers(anon, extra) {
    const h = {
      apikey: anon,
      Authorization: "Bearer " + anon,
      Accept: "application/json",
    };
    return Object.assign(h, extra || {});
  }

  function restUrl(c, path, query) {
    const q = query ? "?" + query : "";
    return c.url + "/rest/v1/" + encodeURIComponent(c.table) + path + q;
  }

  async function parseError(res) {
    let msg = res.status + " " + res.statusText;
    try {
      const j = await res.json();
      msg = j.message || j.error_description || j.hint || JSON.stringify(j);
    } catch (e) {}
    return msg;
  }

  async function viaProxy(c, method, query, body, prefer) {
    let res;
    try {
      res = await fetch("/.netlify/functions/sb", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          action: "proxy",
          auto: !!c.auto,
          url: c.url,
          key: c.anon,
          table: c.table,
          method: method,
          query: query || "",
          body: body,
          prefer: prefer || "",
        }),
      });
    } catch (e) {
      return null;
    }
    if (res.status === 404) return null;
    return res;
  }

  async function rest(method, table, query, body, prefer) {
    const c = cfg();
    if (!c.auto && (!c.url || !c.anon)) return null;
    const use = { url: c.url, anon: c.anon, table: table || c.table };
    let res = await viaProxy(use, method === "POST" ? "POST" : "GET", query, body, prefer);
    if (!res && use.url && use.anon) {
      try {
        const headers = {
          apikey: use.anon,
          Authorization: "Bearer " + use.anon,
          Accept: "application/json",
        };
        const init = { method: method === "POST" ? "POST" : "GET", mode: "cors", cache: "no-store", headers: headers };
        if (init.method === "POST") {
          headers["Content-Type"] = "application/json";
          if (prefer) headers.Prefer = prefer;
          init.body = JSON.stringify(body == null ? [] : body);
        }
        res = await fetch(use.url + "/rest/v1/" + encodeURIComponent(use.table) + (query ? "?" + query : ""), init);
      } catch (e) {
        return null;
      }
    }
    return res;
  }

  async function pull() {
    const c = cfg();
    if (!c.auto && (!c.url || !c.anon)) return { ok: false, reason: "not-configured", rows: [] };
    let query = "select=*&limit=2000";
    const auth = global.FormSYAuth && global.FormSYAuth.session && global.FormSYAuth.session();
    if (auth && auth.role === "clerk") {
      query += "&" + encodeURIComponent("المُدخل") + "=eq." + encodeURIComponent(auth.user);
    }
    let res = await viaProxy(c, "GET", query);
    if (!res && c.url && c.anon) {
      try {
        res = await fetch(restUrl(c, "", query), {
          method: "GET",
          mode: "cors",
          cache: "no-store",
          headers: headers(c.anon),
        });
      } catch (e) {
        return { ok: false, reason: e.message || String(e), rows: [] };
      }
    }
    if (!res) return { ok: false, reason: "not-configured", rows: [] };
    if (!res.ok) return { ok: false, reason: await parseError(res), rows: [] };
    const data = await res.json();
    return { ok: true, rows: Array.isArray(data) ? data.map(recFrom) : [] };
  }

  async function postRows(c, rows, query, prefer) {
    let res = await viaProxy(c, "POST", query, rows, prefer);
    if (!res && c.url && c.anon) {
      try {
        res = await fetch(restUrl(c, "", query), {
          method: "POST",
          mode: "cors",
          cache: "no-store",
          headers: headers(c.anon, {
            "Content-Type": "application/json",
            Prefer: prefer || "return=minimal",
          }),
          body: JSON.stringify(rows),
        });
      } catch (e) {
        return { ok: false, reason: e.message || String(e) };
      }
    }
    if (!res) return { ok: false, reason: "not-configured" };
    if (res.ok) return { ok: true };
    return { ok: false, reason: await parseError(res) };
  }

  async function pushRows(records) {
    const c = cfg();
    if (!c.auto && (!c.url || !c.anon)) return { ok: false, reason: "not-configured" };
    const payload = (records || []).map(rowFrom).filter((r) => Object.keys(r).length);
    if (!payload.length) return { ok: false, reason: "ما في صفوف محفوظة على هذا الجهاز لرفعها" };
    let okCount = 0;
    const errors = [];
    for (let i = 0; i < payload.length; i++) {
      const row = payload[i];
      let sent = await postRows(c, [row], "", "return=minimal");
      const dup = /duplicate|23505|already exists|unique/i.test(sent.reason || "");
      if (!sent.ok && dup && row["الرقم_الوطني"]) {
        const keys = [];
        if (row["المُدخل"]) keys.push(encodeURIComponent("الرقم_الوطني") + "," + encodeURIComponent("المُدخل"));
        keys.push(encodeURIComponent("الرقم_الوطني"));
        for (let k = 0; k < keys.length && !sent.ok; k++) {
          sent = await postRows(c, [row], "on_conflict=" + keys[k], "resolution=merge-duplicates,return=minimal");
        }
      }
      if (sent.ok) okCount += 1;
      else if (errors.length < 2) errors.push(sent.reason || "فشل صف");
    }
    if (!okCount) return { ok: false, reason: errors[0] || "ما انرفع ولا صف" };
    return { ok: true, count: okCount, note: errors[0] || "" };
  }

  let timer = null;
  function queue(kind, data) {
    if (kind !== "roster") return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      pushRows(data).then((r) => {
        global.dispatchEvent(
          new CustomEvent("formsy-cloud", { detail: Object.assign({ kind: "push" }, r) })
        );
      });
    }, 900);
  }

  async function hydrateRoster() {
    if (!global.FormSYHR || !global.FormSYHR.mergeRoster) return;
    const c = cfg();
    if (!c.auto && (!c.url || !c.anon)) return;
    try {
      const r = await pull();
      if (r.ok && r.rows.length) {
        global.FormSYHR.mergeRoster(r.rows, true);
        global.FormSYHR.renderAll();
      }
      global.dispatchEvent(
        new CustomEvent("formsy-cloud", { detail: { kind: "pull", ok: r.ok, count: r.rows.length, reason: r.reason } })
      );
    } catch (e) {
      global.dispatchEvent(
        new CustomEvent("formsy-cloud", { detail: { kind: "pull", ok: false, reason: String(e) } })
      );
    }
  }

  global.FormSYCloud = { cfg, pull, pushRows, queue, hydrateRoster, rowFrom, recFrom, rest, SETUP_SQL: null };
  global.addEventListener("message", (e) => {
    if (e && e.data && e.data.type === "formsy-cloud-reload") hydrateRoster();
  });

  const SETUP_SQL =
    "-- شغّل هذا مرة واحدة في Supabase → SQL Editor → Run\n" +
    "alter table public.thatea enable row level security;\n" +
    "drop policy if exists thata_office_readwrite on public.thatea;\n" +
    "create policy thata_office_readwrite on public.thatea for all to anon, authenticated using (true) with check (true);\n" +
    "drop index if exists thata_national_id_uidx;\n" +
    "alter table public.thatea add column if not exists \"المُدخل\" text;\n" +
    "create unique index if not exists thata_owner_nid_uidx on public.thatea (\"الرقم_الوطني\", \"المُدخل\") where \"الرقم_الوطني\" is not null and \"الرقم_الوطني\" <> '';\n" +
    "create table if not exists public.sijil_users (\n" +
    "  username text primary key,\n" +
    "  pass_hash text not null,\n" +
    "  salt text not null,\n" +
    "  role text not null,\n" +
    "  active boolean not null default true,\n" +
    "  updated_at timestamptz default now()\n" +
    ");\n" +
    "alter table public.sijil_users enable row level security;\n" +
    "drop policy if exists sijil_users_rw on public.sijil_users;\n" +
    "create policy sijil_users_rw on public.sijil_users for all to anon, authenticated using (true) with check (true);\n";
  global.FormSYCloud.SETUP_SQL = SETUP_SQL;

  function readCloudFields(rawUrl, rawKey, rawTable) {
    let url = String(rawUrl || "").trim().replace(/^['"]|['"]$/g, "");
    let anon = String(rawKey || "").trim().replace(/^['"]|['"]$/g, "");
    const table = String(rawTable || "thatea").trim() || "thatea";
    const blob = (url + "\n" + anon).trim();
    const bits = blob.split(/[\s,]+/).filter(Boolean);
    bits.forEach((bit) => {
      if (/^sb_(publishable|secret)_/i.test(bit) || bit.indexOf("eyJ") === 0) anon = bit;
      else if (/supabase\.co/i.test(bit) || /^https?:\/\//i.test(bit)) url = bit;
    });
    if (/^sb_(publishable|secret)_/i.test(url) || url.indexOf("eyJ") === 0) {
      const swap = url;
      url = /^https?:\/\//i.test(anon) ? anon : "";
      anon = swap;
    }
    url = url.replace(/[^\x00-\x7F]/g, "").replace(/\/+$/, "").replace(/\/(rest|auth|storage)\/v1.*$/i, "");
    try {
      if (url) url = new URL(url).origin;
    } catch (e) {
      url = "";
    }
    if (/supabase\.com$/i.test(url) || /:\/\/supabase\.com/i.test(url)) url = "";
    return { url: url, anon: anon, table: table };
  }

  function explainCloudError(reason) {
    const r = String(reason || "");
    if (r === "not-configured") return "الرابط أو المفتاح فاضي. لازم الاثنين.";
    if (/invalid api key|401|unauthorized/i.test(r)) return "المفتاح غلط. انسخ Publishable key من Project Settings → API Keys، مو Secret.";
    if (/JWT|PGRST301/i.test(r)) return "المفتاح انرفض. استخدم Publishable (sb_publishable) مو Secret.";
    if (/PGRST205|could not find|schema cache|42P01|does not exist/i.test(r)) return "الجدول thata مو ظاهر للـ API. تأكد إن الاسم thatea وشغّل SQL.";
    if (/permission|42501|row-level|RLS/i.test(r)) return "الجدول مقفول. اضغط نسخ SQL والصقه في SQL Editor ثم Run، وبعدين أعد الاختبار.";
    if (/failed to fetch|networkerror|network error|load failed|cors/i.test(r)) {
      return "المتصفح ما قدر يوصل لـ Supabase. الرابط لازم يكون https://xxxx.supabase.co (من زر Connect)، مو صفحة supabase.com. جرّب فتح الرابط في تبويب جديد. إذا ما فتح، الشبكة حاجبة supabase.co.";
    }
    return r;
  }

  async function publishConfig(url, key, table) {
    const pass = sessionStorage.getItem("formSY.designerPass") || "";
    try {
      const res = await fetch("/.netlify/functions/sb", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          action: "save-config",
          user: "asma",
          pass: pass,
          url: url,
          key: key,
          table: table || "thatea",
        }),
      });
      if (!res || !res.ok) return { ok: false };
      return { ok: true };
    } catch (e) {
      return { ok: false };
    }
  }

  function bindCloudUi() {
    const modal = document.getElementById("cloud-modal");
    const btn = document.getElementById("btnCloud");
    if (!modal || !btn) return;
    const close = document.getElementById("btnCloudClose");
    const save = document.getElementById("btnCloudSave");
    const copy = document.getElementById("btnCloudSql");
    const clear = document.getElementById("btnCloudClear");
    const urlEl = document.getElementById("cloud-url");
    const anonEl = document.getElementById("cloud-anon");
    const tableEl = document.getElementById("cloud-table");
    const msg = document.getElementById("cloud-msg");
    const sqlEl = document.getElementById("cloud-sql");
    if (sqlEl) sqlEl.textContent = SETUP_SQL;
    function fill() {
      const c = cfg();
      if (urlEl) urlEl.value = c.url;
      if (anonEl) anonEl.value = c.anon;
      if (tableEl) tableEl.value = c.table;
    }
    function setMsg(text, ok) {
      if (!msg) return;
      msg.textContent = text;
      msg.className = "cloud-msg " + (ok === true ? "ok" : ok === false ? "err" : "");
    }
    btn.onclick = () => {
      fill();
      modal.classList.remove("hidden");
    };
    if (close) close.onclick = () => modal.classList.add("hidden");
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });
    if (copy) {
      copy.onclick = () => {
        navigator.clipboard.writeText(SETUP_SQL).then(
          () => setMsg("تم نسخ SQL — الصقه في SQL Editor ثم Run", true),
          () => setMsg("انسخ النص يدوياً من الصندوق أدناه", false)
        );
      };
    }
    if (clear) {
      clear.onclick = () => {
        localStorage.removeItem("formSY.cloud.url");
        localStorage.removeItem("formSY.cloud.anon");
        localStorage.setItem("formSY.cloud.table", "thatea");
        fill();
        setMsg("تم الفصل — البيانات تبقى على هذا الجهاز فقط", true);
      };
    }
    if (save) {
      save.onclick = async () => {
        const parsed = readCloudFields(urlEl && urlEl.value, anonEl && anonEl.value, tableEl && tableEl.value);
        if (urlEl) urlEl.value = parsed.url;
        if (anonEl) anonEl.value = parsed.anon;
        if (tableEl) tableEl.value = parsed.table;
        if (!parsed.url || !parsed.anon) {
          const miss = [];
          if (!parsed.url) miss.push("رابط المشروع (https://xxxx.supabase.co)");
          if (!parsed.anon) miss.push("Publishable key");
          setMsg("ناقص: " + miss.join(" و "), false);
          return;
        }
        localStorage.setItem("formSY.cloud.url", parsed.url);
        localStorage.setItem("formSY.cloud.anon", parsed.anon);
        localStorage.setItem("formSY.cloud.table", parsed.table);
        const published = await publishConfig(parsed.url, parsed.anon, parsed.table);
        setMsg(published.ok ? "جاري رفع السجلات وربطها لكل الحسابات…" : "جاري رفع السجلات على هذا الجهاز…");
        try {
          const roster = global.FormSYHR && global.FormSYHR.getRoster ? global.FormSYHR.getRoster() : [];
          const up = await pushRows(roster);
          if (!up.ok) {
            setMsg("الرفع فشل: " + explainCloudError(up.reason), false);
            return;
          }
          const r = await pull();
          if (!r.ok) {
            setMsg("فشل الاتصال: " + explainCloudError(r.reason), false);
            return;
          }
          await hydrateRoster();
          const extra = up.note ? " تنبيه: " + explainCloudError(up.note) : "";
          setMsg("متصل — رُفع " + up.count + " والسحابة فيها " + r.rows.length + " صف." + extra, true);
        } catch (e) {
          setMsg(explainCloudError(e && e.message ? e.message : e), false);
        }
      };
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindCloudUi);
  else bindCloudUi();
})(window);
