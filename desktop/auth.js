/* دخول محلي مع مزامنة اختيارية لجدول sijil_users. لا حلقة: السحب لا يستدعي الدفع. */
(function (global) {
  const USERS_KEY = "formSY.users.v1";
  const SESSION_KEY = "formSY.session.v1";
  const ROLES = { designer: "المصمم", clerk: "مدخل بيانات" };
  const DESIGNER_USER = "asma";
  const DESIGNER_SALT = "c4eae2dee84b99e7ae87ded6fbe4ed77";
  const DESIGNER_HASH = "e10410bf51d6981c720c9384446a515c432d04cc2fd43794f9b7f3dd2d853597";

  let mode = "login";
  let syncing = false;

  function canonUser(v) {
    const s = String(v || "").replace(/\s+/g, "").trim();
    return s.indexOf("@") >= 0 ? s.toLowerCase() : String(v || "").replace(/\s+/g, " ").trim();
  }
  function isDesignerName(v) {
    return canonUser(v).toLowerCase() === DESIGNER_USER;
  }
  function ensureDesigner(list) {
    let changed = false;
    let row = (list || []).find((u) => u && isDesignerName(u.username));
    if (!row) {
      list.push({
        username: DESIGNER_USER,
        passHash: DESIGNER_HASH,
        salt: DESIGNER_SALT,
        role: "designer",
        active: true,
        updatedAt: "2026-10-07T00:00:00.000Z",
      });
      return true;
    }
    if (row.username !== DESIGNER_USER) { row.username = DESIGNER_USER; changed = true; }
    if (row.role !== "designer") { row.role = "designer"; changed = true; }
    if (row.active === false) { row.active = true; changed = true; }
    if (row.salt !== DESIGNER_SALT || row.passHash !== DESIGNER_HASH) {
      row.salt = DESIGNER_SALT;
      row.passHash = DESIGNER_HASH;
      changed = true;
    }
    return changed;
  }
  function normalizeUsers(list) {
    let changed = false;
    (list || []).forEach((u) => {
      if (!u) return;
      if (isDesignerName(u.username)) return;
      if (u.role === "designer" || u.role === "manager") {
        u.role = "clerk";
        u.updatedAt = new Date().toISOString();
        changed = true;
      }
    });
    if (ensureDesigner(list)) changed = true;
    return changed;
  }
  function loadUsers() {
    try {
      const raw = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
      const list = Array.isArray(raw) ? raw : [];
      if (normalizeUsers(list)) saveUsers(list);
      return list;
    } catch (e) {
      return [];
    }
  }
  function saveUsers(list) {
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
  }
  function hasDesigner(list) {
    return (list || loadUsers()).some((u) => isDesignerName(u.username) && u.role === "designer" && u.active !== false);
  }
  function session() {
    try {
      const s = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      if (!s || !s.user || !s.role || !s.exp || s.exp < Date.now()) return null;
      if (s.role === "designer" && !isDesignerName(s.user)) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      if (isDesignerName(s.user)) s.role = "designer";
      else if (s.role === "manager" || s.role === "designer") s.role = "clerk";
      if (!ROLES[s.role]) return null;
      return s;
    } catch (e) {
      return null;
    }
  }
  function seesAll() {
    const s = session();
    return !!(s && s.role === "designer" && isDesignerName(s.user));
  }
  function user() {
    const s = session();
    return s ? s.user : "";
  }
  function roleLabel(role) {
    return ROLES[role] || role;
  }

  async function sha256(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  function randomSalt() {
    const a = new Uint8Array(16);
    crypto.getRandomValues(a);
    return Array.from(a).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  async function hashPassword(password, salt) {
    return sha256(salt + "\n" + password);
  }

  function lock() {
    document.body.classList.add("auth-locked");
    const gate = document.getElementById("auth-gate");
    if (gate) gate.classList.remove("hidden");
  }
  function unlock() {
    document.body.classList.remove("auth-locked");
    const gate = document.getElementById("auth-gate");
    if (gate) gate.classList.add("hidden");
  }

  function applyChrome() {
    const s = session();
    const who = document.getElementById("whoami");
    if (who) who.textContent = s ? s.user + " · " + roleLabel(s.role) : "";
    const usersBtn = document.getElementById("btnUsers");
    if (usersBtn) usersBtn.classList.toggle("hidden", !s || s.role !== "designer");
    const cloud = document.getElementById("btnCloud");
    if (cloud) cloud.classList.toggle("hidden", !s || s.role !== "designer");
  }

  function enter(rec) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      user: rec.username,
      role: rec.role,
      exp: Date.now() + 12 * 60 * 60 * 1000,
    }));
    applyChrome();
    global.dispatchEvent(new CustomEvent("formsy-auth", { detail: { type: "login", user: rec.username, role: rec.role } }));
    unlock();
  }

  async function pullUsers() {
    if (syncing) return false;
    if (!global.FormSYCloud || !global.FormSYCloud.rest) return false;
    const cfg = global.FormSYCloud.cfg && global.FormSYCloud.cfg();
    if (!cfg || (!cfg.auto && (!cfg.url || !cfg.anon))) return false;
    syncing = true;
    try {
      const res = await global.FormSYCloud.rest(
        "GET",
        "sijil_users",
        "select=username,pass_hash,salt,role,active,updated_at&limit=500"
      );
      if (!res || !res.ok) return false;
      const rows = await res.json();
      if (!Array.isArray(rows)) return false;
      const local = loadUsers();
      rows.forEach((row) => {
        if (!row || !row.username || !ROLES[row.role]) return;
        const rec = {
          username: String(row.username),
          passHash: row.pass_hash || "",
          salt: row.salt || "",
          role: row.role,
          active: row.active !== false,
          updatedAt: row.updated_at || "",
        };
        const i = local.findIndex((u) => canonUser(u.username) === canonUser(rec.username));
        if (i < 0) local.push(rec);
        else if (String(rec.updatedAt) >= String(local[i].updatedAt || "")) local[i] = rec;
      });
      normalizeUsers(local);
      saveUsers(local);
      return true;
    } catch (e) {
      return false;
    } finally {
      syncing = false;
    }
  }

  async function pushUsers(list) {
    if (syncing) return false;
    if (!global.FormSYCloud || !global.FormSYCloud.rest) return false;
    const cfg = global.FormSYCloud.cfg && global.FormSYCloud.cfg();
    if (!cfg || (!cfg.auto && (!cfg.url || !cfg.anon))) return false;
    const body = (list || []).filter((u) => u && u.username && u.passHash && u.salt).map((u) => ({
      username: u.username,
      pass_hash: u.passHash,
      salt: u.salt,
      role: u.role,
      active: u.active !== false,
      updated_at: u.updatedAt || new Date().toISOString(),
    }));
    if (!body.length) return false;
    syncing = true;
    try {
      const res = await global.FormSYCloud.rest(
        "POST",
        "sijil_users",
        "on_conflict=username",
        body,
        "resolution=merge-duplicates,return=minimal"
      );
      return !!(res && res.ok);
    } catch (e) {
      return false;
    } finally {
      syncing = false;
    }
  }

  function cleanName(v) {
    return canonUser(v);
  }

  async function addUser(username, password, role) {
    const name = role === "designer" ? DESIGNER_USER : cleanName(username);
    if (role === "designer") return "حساب المصمم ثابت ولا يُنشأ من هنا";
    if (name.length < 2 || name.length > 80) return "اسم المستخدم بين حرفين و80";
    if (String(password || "").length < 6) return "كلمة المرور 6 أحرف على الأقل";
    if (!ROLES[role]) return "صلاحية غير معروفة";
    if (role === "designer" && !isDesignerName(name)) return "صلاحية المصمم لهذا البريد فقط";
    if (role !== "designer" && isDesignerName(name)) return "هذا الاسم لحساب المصمم فقط";
    const list = loadUsers();
    if (list.some((u) => canonUser(u.username) === canonUser(name))) return "اسم المستخدم مستخدم";
    if (role === "designer" && hasDesigner(list)) return "حساب المصمم موجود مسبقاً";
    const salt = randomSalt();
    list.push({
      username: name,
      passHash: await hashPassword(password, salt),
      salt: salt,
      role: role,
      active: true,
      updatedAt: new Date().toISOString(),
    });
    saveUsers(list);
    await pushUsers(list);
    return "";
  }

  function renderMode() {
    const title = document.getElementById("auth-title");
    const lead = document.getElementById("auth-lead");
    const pass2 = document.getElementById("auth-pass2-label");
    const submit = document.getElementById("auth-submit");
    const sw = document.getElementById("auth-switch");
    const userEl = document.getElementById("auth-user");
    if (pass2) pass2.classList.toggle("hidden", mode === "login");
    if (mode === "register") {
      if (title) title.textContent = "تسجيل مستخدم";
      if (lead) lead.textContent = "اسم مستخدم وكلمة مرور. ترى وتعدّل السجلات التي تدخلها أنت فقط.";
      if (submit) submit.textContent = "إنشاء الحساب";
      if (sw) { sw.classList.remove("hidden"); sw.textContent = "العودة للدخول"; }
      if (userEl) userEl.readOnly = false;
    } else {
      if (title) title.textContent = "الدخول إلى السجل";
      if (lead) lead.textContent = "المصمم يدخل بحسابه فقط ويرى كل التغيرات. أي مستخدم آخر يرى بياناته وحدها.";
      if (submit) submit.textContent = "دخول";
      if (sw) { sw.classList.remove("hidden"); sw.textContent = "تسجيل مستخدم"; }
      if (userEl) userEl.readOnly = false;
    }
  }

  function setMsg(text, ok) {
    const msg = document.getElementById("auth-msg");
    if (!msg) return;
    msg.textContent = text || "";
    msg.className = "cloud-msg " + (ok === true ? "ok" : ok === false ? "err" : "");
  }

  async function onSubmit(e) {
    e.preventDefault();
    const name = cleanName(document.getElementById("auth-user").value);
    const pass = document.getElementById("auth-pass").value || "";
    const pass2el = document.getElementById("auth-pass2");
    const pass2 = pass2el ? pass2el.value : "";
    setMsg("جاري التحقق…");
    await pullUsers();
    if (isDesignerName(name)) {
      const hash = await hashPassword(pass, DESIGNER_SALT);
      if (hash !== DESIGNER_HASH) { setMsg("كلمة المرور غير صحيحة", false); return; }
      sessionStorage.setItem("formSY.designerPass", pass);
      setMsg("");
      enter({ username: DESIGNER_USER, role: "designer" });
      return;
    }
    sessionStorage.removeItem("formSY.designerPass");
    if (mode === "register") {
      if (pass !== pass2) { setMsg("كلمتا المرور غير متطابقتين", false); return; }
      const err = await addUser(name, pass, "clerk");
      if (err) { setMsg(err, false); return; }
      const rec = loadUsers().find((u) => canonUser(u.username) === canonUser(name));
      setMsg("");
      enter(rec);
      return;
    }
    const rec = loadUsers().find((u) => canonUser(u.username) === canonUser(name));
    if (!rec || rec.active === false) { setMsg("الحساب غير موجود أو موقوف", false); return; }
    const hash = await hashPassword(pass, rec.salt || "");
    if (hash !== rec.passHash) { setMsg("كلمة المرور غير صحيحة", false); return; }
    setMsg("");
    enter(rec);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&" + "amp;")
      .replace(/</g, "&" + "lt;")
      .replace(/"/g, "&" + "quot;");
  }
  function renderUsers() {
    const box = document.getElementById("users-list");
    if (!box) return;
    const list = loadUsers();
    if (!list.length) {
      box.innerHTML = "<p class='hint'>لا حسابات.</p>";
      return;
    }
    box.innerHTML = list.map((u) => {
      const off = u.active === false;
      return (
        "<div class='user-row' data-user=\"" + esc(u.username) + "\">" +
          "<b>" + esc(u.username) + "</b>" +
          "<span>" + esc(roleLabel(u.role) + (off ? " — موقوف" : "")) + "</span>" +
          (u.role === "designer" ? "" :
            "<button type='button' class='btn' data-act='toggle'>" + (off ? "تفعيل" : "إيقاف") + "</button>" +
            "<button type='button' class='btn' data-act='reset'>كلمة مرور</button>") +
        "</div>"
      );
    }).join("");
  }

  async function openUsers() {
    const s = session();
    if (!s || s.role !== "designer") return;
    const modal = document.getElementById("users-modal");
    if (!modal) return;
    modal.classList.remove("hidden");
    const msg = document.getElementById("users-msg");
    if (msg) msg.textContent = "جاري مزامنة الحسابات…";
    await pullUsers();
    await pushUsers(loadUsers());
    renderUsers();
    if (msg) msg.textContent = "حسابات المستخدمين تُزامَن مع القاعدة عندما يكون الربط محفوظاً. كل مستخدم يبقى على سجلاته.";
  }

  function bind() {
    lock();
    const form = document.getElementById("auth-card");
    if (form) form.addEventListener("submit", onSubmit);
    const sw = document.getElementById("auth-switch");
    if (sw) sw.onclick = () => {
      mode = mode === "register" ? "login" : "register";
      setMsg("");
      renderMode();
    };
    const usersBtn = document.getElementById("btnUsers");
    if (usersBtn) usersBtn.onclick = () => { openUsers(); };
    const close = document.getElementById("btnUsersClose");
    const modal = document.getElementById("users-modal");
    if (close && modal) close.onclick = () => modal.classList.add("hidden");
    if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); });
    const list = document.getElementById("users-list");
    if (list) list.addEventListener("click", async (e) => {
      const btn = e.target.closest("button[data-act]");
      if (!btn) return;
      const row = btn.closest(".user-row");
      if (!row) return;
      const name = row.dataset.user;
      const users = loadUsers();
      const rec = users.find((u) => u.username === name);
      if (!rec || rec.role === "designer") return;
      if (btn.dataset.act === "toggle") rec.active = rec.active === false;
      if (btn.dataset.act === "reset") {
        const next = global.prompt("كلمة مرور جديدة لـ " + name);
        if (!next) return;
        if (String(next).length < 6) { global.alert("6 أحرف على الأقل"); return; }
        rec.salt = randomSalt();
        rec.passHash = await hashPassword(next, rec.salt);
      }
      rec.updatedAt = new Date().toISOString();
      saveUsers(users);
      await pushUsers(users);
      renderUsers();
    });
    const create = document.getElementById("btnMgrCreate");
    if (create) create.onclick = async () => {
      const msg = document.getElementById("users-msg");
      const name = document.getElementById("mgr-user").value;
      const pass = document.getElementById("mgr-pass").value;
      const err = await addUser(name, pass, "manager");
      if (msg) msg.textContent = err || "تم إنشاء المدير";
      if (!err) {
        document.getElementById("mgr-user").value = "";
        document.getElementById("mgr-pass").value = "";
        renderUsers();
      }
    };
    const out = document.getElementById("btnLogout");
    if (out) out.onclick = () => {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem("formSY.designerPass");
      location.reload();
    };
    renderMode();
    if (session()) {
      applyChrome();
      unlock();
    }
    pullUsers().then(() => { renderMode(); });
  }

  global.FormSYAuth = {
    session: session,
    seesAll: seesAll,
    user: user,
    roleLabel: roleLabel,
    applyChrome: applyChrome,
    pullUsers: pullUsers,
    pushUsers: pushUsers,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})(window);
