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
  var base = String(req.url || "").replace(/\/+$/, "");
  if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/i.test(base)) {
    return json(400, { message: "الرابط لازم يكون https://xxxx.supabase.co من زر Connect، مو صفحة الداشبورد" });
  }
  var table = String(req.table || "thatea");
  if (table.length > 80) return json(400, { message: "اسم الجدول طويل" });
  var method = req.method === "POST" ? "POST" : "GET";
  var query = String(req.query || "");
  if (query.length > 800) return json(400, { message: "query طويل" });
  var target = base + "/rest/v1/" + encodeURIComponent(table) + (query ? "?" + query : "");
  var key = String(req.key || "");
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
};

function json(code, obj) {
  return {
    statusCode: code,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(obj),
  };
}
