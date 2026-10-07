var crypto = require("crypto");
var getStore = null;
try {
  getStore = require("@netlify/blobs").getStore;
} catch (e) {
  getStore = null;
}

var DESIGNER_SALT = "c4eae2dee84b99e7ae87ded6fbe4ed77";
var DESIGNER_HASH = "e10410bf51d6981c720c9384446a515c432d04cc2fd43794f9b7f3dd2d853597";

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: { "access-control-allow-origin": "*" } };
  }
  if (event.httpMethod !== "POST") {
    return json(405, { message: "POST only" });
  }
  var req;
  try {
    req = JSON.parse(event.body || "{}");
  } catch (e) {
    return json(400, { message: "الطلب مو مفهوم" });
  }
  if (req.action === "save-config") return saveConfig(req);
  return proxy(req);
};

async function blobStore() {
  if (!getStore) return null;
  try {
    return getStore("sijil-cloud", { consistency: "strong" });
  } catch (e) {
    return null;
  }
}

function designerOk(user, pass) {
  var name = String(user || "").replace(/\s+/g, "").toLowerCase();
  var hash = crypto.createHash("sha256").update(DESIGNER_SALT + "\n" + String(pass || ""), "utf8").digest("hex");
  return name === "asma" && hash === DESIGNER_HASH;
}

async function saveConfig(req) {
  if (!designerOk(req.user, req.pass)) return json(403, { message: "المصمم فقط يربط القاعدة" });
  var base = String(req.url || "").replace(/\/+$/, "");
  if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/i.test(base)) {
    return json(400, { message: "الرابط لازم يكون https://xxxx.supabase.co" });
  }
  var key = String(req.key || "");
  if (key.length < 20) return json(400, { message: "المفتاح ناقص" });
  var table = String(req.table || "thatea");
  if (table.length > 80) return json(400, { message: "اسم الجدول طويل" });
  var store = await blobStore();
  if (!store) return json(500, { message: "تعذر حفظ الربط على الخادم" });
  await store.setJSON("config", { url: base, key: key, table: table });
  return json(200, { ok: true });
}

async function loadConfig() {
  var store = await blobStore();
  if (!store) return null;
  try {
    return await store.get("config", { type: "json" });
  } catch (e) {
    return null;
  }
}

async function proxy(req) {
  var base = String(req.url || "").replace(/\/+$/, "");
  var key = String(req.key || "");
  var table = String(req.table || "thatea");
  if (req.auto || !base || !key) {
    var saved = await loadConfig();
    if (saved && saved.url && saved.key) {
      base = saved.url;
      key = saved.key;
      if (!req.table && saved.table) table = saved.table;
    }
  }
  if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/i.test(base)) {
    return json(503, { message: "القاعدة لم تُربط بعد. يدخل المصمم مرة واحدة من الربط السحابي." });
  }
  if (table.length > 80) return json(400, { message: "اسم الجدول طويل" });
  var method = req.method === "POST" ? "POST" : "GET";
  var query = String(req.query || "");
  if (query.length > 800) return json(400, { message: "query طويل" });
  var target = base + "/rest/v1/" + encodeURIComponent(table) + (query ? "?" + query : "");
  var headers = {
    apikey: key,
    Authorization: "Bearer " + key,
    Accept: "application/json",
  };
  var init = { method: method, headers: headers };
  if (method === "POST") {
    headers["Content-Type"] = "application/json";
    if (req.prefer) headers.Prefer = String(req.prefer);
    init.body = JSON.stringify(req.body == null ? [] : req.body);
  }
  try {
    var res = await fetch(target, init);
    var text = await res.text();
    return {
      statusCode: res.status,
      headers: { "content-type": res.headers.get("content-type") || "application/json" },
      body: text || "{}",
    };
  } catch (e) {
    return json(502, { message: "Netlify ما قدر يوصل لـ Supabase: " + (e.message || e) });
  }
}

function json(code, obj) {
  return {
    statusCode: code,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(obj),
  };
}
