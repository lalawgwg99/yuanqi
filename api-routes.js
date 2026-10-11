// 怨氣發電廠真後端：D1 + R2 API 路由
// 部署時整檔拼進 worker.js（handleApi 自包含，不依賴外部變數）

// ===== D1 schema（建表用，註解備用）=====
const D1_SCHEMA = [
"CREATE TABLE IF NOT EXISTS vents(id INTEGER PRIMARY KEY AUTOINCREMENT, nick TEXT, text TEXT, score INTEGER, quip TEXT, lang TEXT, reject INTEGER DEFAULT 0, ip TEXT, hugs INTEGER DEFAULT 0, boosts INTEGER DEFAULT 0, voice_key TEXT, created_at INTEGER)",
"CREATE TABLE IF NOT EXISTS kv(k TEXT PRIMARY KEY, v TEXT)",
"CREATE TABLE IF NOT EXISTS reports(id INTEGER PRIMARY KEY AUTOINCREMENT, vent_id INTEGER, reason TEXT, ip TEXT, created_at INTEGER)",
"INSERT INTO kv(k,v) SELECT 'yuanqi','62' WHERE NOT EXISTS (SELECT 1 FROM kv WHERE k='yuanqi')"
].join(";\n");

function yqTwDate(ms){
  var t = new Date((ms || Date.now()) + 8 * 3600 * 1000);
  return t.toISOString().slice(0, 10); // YYYY-MM-DD（UTC+8）
}
function yqDayKey(ms){
  return 'rejects_' + yqTwDate(ms).replace(/-/g, '');
}
function yqDayStartMs(ymd){
  var p = ymd.split('-');
  return Date.UTC(+p[0], +p[1] - 1, +p[2]) - 8 * 3600 * 1000;
}
async function yqKvGet(env, k, def){
  var r = await env.DB.prepare('SELECT v FROM kv WHERE k=?').bind(k).first();
  return r ? r.v : def;
}
async function yqKvSet(env, k, v){
  await env.DB.prepare('INSERT INTO kv(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v').bind(k, String(v)).run();
}
function yqIp(request){
  return request.headers.get('cf-connecting-ip') || 'unknown';
}

async function yqState(env){
  var y = parseInt(await yqKvGet(env, 'yuanqi', '62'), 10) || 0;
  var rejects = parseInt(await yqKvGet(env, yqDayKey(), '0'), 10) || 0;
  var kingRaw = await yqKvGet(env, 'king', null);
  var rows = await env.DB.prepare(
    'SELECT id,nick,text,score,hugs,boosts,voice_key,created_at FROM vents ORDER BY id DESC LIMIT 20'
  ).all();
  var vents = (rows.results || []).map(function(r){
    return { id: r.id, nick: r.nick, text: r.text, score: r.score, hugs: r.hugs || 0,
             boosts: r.boosts || 0, voice: !!r.voice_key, created: r.created_at };
  });
  return { yuanqi: y, rejects: rejects, king: kingRaw ? JSON.parse(kingRaw) : null, vents: vents };
}

async function yqVent(request, env){
  var ip = yqIp(request);
  var body = await request.json();
  var nick = String(body.nick || 'anon').slice(0, 40);
  var text = String(body.text || '').slice(0, 2000);
  var score = Math.max(0, Math.min(100, parseInt(body.score, 10) || 0));
  var quip = String(body.quip || '').slice(0, 200);
  var lang = String(body.lang || 'zh-TW').slice(0, 10);
  var reject = body.reject ? 1 : 0;
  // 限流：同 IP 1 小時內最多 30 筆
  var c = await env.DB.prepare('SELECT COUNT(*) AS n FROM vents WHERE ip=? AND created_at>?')
    .bind(ip, Date.now() - 3600 * 1000).first();
  if (c && c.n >= 30) return Response.json({ error: 'too many' }, { status: 429 });
  var info = await env.DB.prepare(
    'INSERT INTO vents(nick,text,score,quip,lang,reject,ip,created_at) VALUES(?,?,?,?,?,?,?,?)'
  ).bind(nick, text, score, quip, lang, reject, ip, Date.now()).run();
  var id = info.meta.last_row_id;
  var y = parseInt(await yqKvGet(env, 'yuanqi', '62'), 10) || 0;
  if (!reject) {
    y += score;
    await yqKvSet(env, 'yuanqi', y);
  } else {
    var rk = yqDayKey();
    var rc = (parseInt(await yqKvGet(env, rk, '0'), 10) || 0) + 1;
    await yqKvSet(env, rk, rc);
  }
  if (!reject && score >= 90) {
    var kingRaw = await yqKvGet(env, 'king', null);
    var king = kingRaw ? JSON.parse(kingRaw) : null;
    if (!king || score > king.score) {
      await yqKvSet(env, 'king', JSON.stringify({ nick: nick, score: score, text: text.slice(0, 120) }));
    }
  }
  return Response.json({ ok: true, id: id });
}

async function yqHug(request, env){
  var body = await request.json();
  var id = parseInt(body.id, 10) || 0;
  var row = await env.DB.prepare('SELECT hugs FROM vents WHERE id=?').bind(id).first();
  if (!row) return Response.json({ error: 'not found' }, { status: 404 });
  var hugs = (row.hugs || 0) + 1;
  await env.DB.prepare('UPDATE vents SET hugs=? WHERE id=?').bind(hugs, id).run();
  var y = Math.max(0, (parseInt(await yqKvGet(env, 'yuanqi', '62'), 10) || 0) - 2);
  await yqKvSet(env, 'yuanqi', y);
  return Response.json({ ok: true, hugs: hugs });
}

async function yqBoost(request, env){
  var body = await request.json();
  var id = parseInt(body.id, 10) || 0;
  var row = await env.DB.prepare('SELECT score,boosts,nick,text FROM vents WHERE id=?').bind(id).first();
  if (!row) return Response.json({ error: 'not found' }, { status: 404 });
  var boosts = (row.boosts || 0) + 1;
  await env.DB.prepare('UPDATE vents SET boosts=? WHERE id=?').bind(boosts, id).run();
  var lv = (row.score || 0) + boosts * 5;
  var y = (parseInt(await yqKvGet(env, 'yuanqi', '62'), 10) || 0) + 1;
  await yqKvSet(env, 'yuanqi', y);
  if (lv >= 90) {
    var kingRaw = await yqKvGet(env, 'king', null);
    var king = kingRaw ? JSON.parse(kingRaw) : null;
    if (!king || lv > king.score) {
      await yqKvSet(env, 'king', JSON.stringify({ nick: row.nick, score: lv, text: String(row.text || '').slice(0, 120) }));
    }
  }
  return Response.json({ ok: true, boosts: boosts, lv: lv });
}

async function yqReport(request, env){
  var body = await request.json();
  var id = parseInt(body.id, 10) || 0;
  var reason = String(body.reason || '').slice(0, 200);
  await env.DB.prepare('INSERT INTO reports(vent_id,reason,ip,created_at) VALUES(?,?,?,?)')
    .bind(id, reason, yqIp(request), Date.now()).run();
  return Response.json({ ok: true });
}

async function yqWeather(env){
  var today = yqTwDate();
  var yday = yqTwDate(Date.now() - 86400 * 1000);
  var st = await env.DB.prepare(
    'SELECT COUNT(*) AS n, COALESCE(SUM(score),0) AS total, COALESCE(SUM(reject),0) AS rej, COALESCE(MAX(score),0) AS peak FROM vents WHERE created_at>=? AND created_at<?'
  ).bind(yqDayStartMs(yday), yqDayStartMs(today)).first();
  return { date: yday, vents: st.n || 0, total: st.total || 0, rejects: st.rej || 0, peak: st.peak || 0 };
}

async function yqVoicePost(request, env){
  var form = await request.formData();
  var audio = form.get('audio');
  var nick = String(form.get('nick') || 'anon').slice(0, 40);
  if (!audio || typeof audio.arrayBuffer !== 'function') {
    return Response.json({ error: 'no audio' }, { status: 400 });
  }
  var buf = await audio.arrayBuffer();
  if (buf.byteLength > 8 * 1024 * 1024) {
    return Response.json({ error: 'too large' }, { status: 413 });
  }
  var ext = (audio.name || '').toLowerCase().indexOf('.wav') >= 0 ? 'wav' : 'webm';
  var ctype = audio.type || (ext === 'wav' ? 'audio/wav' : 'audio/webm');
  var key = 'v/' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '.' + ext;
  await env.VOICE.put(key, buf, { httpMetadata: { contentType: ctype } });
  var info = await env.DB.prepare(
    "INSERT INTO vents(nick,text,score,lang,ip,voice_key,created_at) VALUES(?,'',50,'',?,?,?)"
  ).bind(nick, yqIp(request), key, Date.now()).run();
  var id = info.meta.last_row_id;
  return Response.json({ ok: true, id: id, url: '/api/voice?id=' + id });
}

async function yqVoiceGet(request, env){
  var id = new URL(request.url).searchParams.get('id');
  var row = await env.DB.prepare('SELECT voice_key FROM vents WHERE id=?').bind(id).first();
  if (!row || !row.voice_key) return Response.json({ error: 'not found' }, { status: 404 });
  var obj = await env.VOICE.get(row.voice_key);
  if (!obj) return Response.json({ error: 'not found' }, { status: 404 });
  var ct = (obj.httpMetadata && obj.httpMetadata.contentType) || 'audio/webm';
  return new Response(obj.body, { headers: { 'content-type': ct } });
}

async function handleApi(request, env){
  try {
    var url = new URL(request.url);
    var path = url.pathname;
    var method = request.method;
    if (path === '/api/state' && method === 'GET') return Response.json(await yqState(env));
    if (path === '/api/vent' && method === 'POST') return await yqVent(request, env);
    if (path === '/api/hug' && method === 'POST') return await yqHug(request, env);
    if (path === '/api/boost' && method === 'POST') return await yqBoost(request, env);
    if (path === '/api/report' && method === 'POST') return await yqReport(request, env);
    if (path === '/api/weather' && method === 'GET') return Response.json(await yqWeather(env));
    if (path === '/api/voice' && method === 'POST') return await yqVoicePost(request, env);
    if (path === '/api/voice' && method === 'GET') return await yqVoiceGet(request, env);
    return Response.json({ error: 'not found' }, { status: 404 });
  } catch (e) {
    return Response.json({ error: 'internal' }, { status: 500 });
  }
}
