require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let WebcastPushConnection = null;
try {
  ({ WebcastPushConnection } = require('tiktok-live-connector'));
} catch (err) {
  console.warn('[UYARI] tiktok-live-connector yuklu degil veya acilamadi. npm install calistirinca yuklenir.');
}

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'real2026';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'real-medya-agency-secret';
const LIVE_CHECK_INTERVAL_MS = Number(process.env.LIVE_CHECK_INTERVAL_MS || 180000);
const POINTS_PER_HOUR = Number(process.env.POINTS_PER_HOUR || 1000);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(__dirname, { extensions: ['html'], dotfiles: 'ignore' }));

function nowISO() { return new Date().toISOString(); }
function makeId(prefix = 'id') { return `${prefix}_${crypto.randomUUID().slice(0, 8)}`; }
function normalizeTikTok(v = '') { return String(v).trim().replace(/^@+/, '').replace(/\s+/g, ''); }
function tokenForPassword(password) {
  return crypto.createHash('sha256').update(`${password}:${ADMIN_SECRET}`).digest('hex');
}
function adminToken() { return tokenForPassword(ADMIN_PASSWORD); }
function requireAdmin(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.replace(/^Bearer\s+/i, '').trim();
  if (token && token === adminToken()) return next();
  return res.status(401).json({ ok: false, error: 'Yetkisiz istek. Admin token gecersiz.' });
}
function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    const seed = {
      version: 1,
      settings: { pointsPerHour: POINTS_PER_HOUR },
      creators: [
        { id: 'cr_m3t3', name: 'M3T3_GAMES', tiktok: 'm3t3_games', instagram: 'm3t3_games', avatar: 'assets/logo.jpg', active: true, isLive: false, totalManualSeconds: 55800, lastSeen: null, lastError: null, createdAt: nowISO() },
        { id: 'cr_berat', name: 'Berat', tiktok: 'beratkamaz_', instagram: '', avatar: 'assets/logo.jpg', active: true, isLive: false, totalManualSeconds: 111600, lastSeen: null, lastError: null, createdAt: nowISO() },
        { id: 'cr_kaan', name: 'KaanTea', tiktok: 'kaantea', instagram: 'kaantea', avatar: 'assets/logo.jpg', active: true, isLive: false, totalManualSeconds: 27900, lastSeen: null, lastError: null, createdAt: nowISO() }
      ],
      sessions: [],
      audit: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf8');
  }
}
function readDb() { ensureDb(); return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
function writeDb(db) { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8'); }
function audit(action, detail = {}) {
  const db = readDb();
  db.audit = db.audit || [];
  db.audit.unshift({ id: makeId('log'), action, detail, at: nowISO() });
  db.audit = db.audit.slice(0, 500);
  writeDb(db);
}
function getCreator(db, id) { return db.creators.find(c => c.id === id); }
function parseDate(v) { return v ? new Date(v).getTime() : null; }
function periodStart(period) {
  const d = new Date();
  if (period === 'day') { d.setHours(0,0,0,0); return d.getTime(); }
  if (period === 'week') { const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); d.setHours(0,0,0,0); return d.getTime(); }
  if (period === 'month') { d.setDate(1); d.setHours(0,0,0,0); return d.getTime(); }
  return 0;
}
function sessionOverlapSeconds(session, startMs, endMs = Date.now()) {
  const s = parseDate(session.startAt);
  const e = session.endAt ? parseDate(session.endAt) : endMs;
  if (!s || !e) return 0;
  const from = Math.max(s, startMs);
  const to = Math.min(e, endMs);
  return Math.max(0, Math.floor((to - from) / 1000));
}
function creatorTotalSeconds(db, creator, period = 'all') {
  const start = periodStart(period);
  let seconds = period === 'all' ? Number(creator.totalManualSeconds || 0) : 0;
  for (const s of db.sessions || []) {
    if (s.creatorId === creator.id) seconds += sessionOverlapSeconds(s, start);
  }
  if (period !== 'all' && creator.totalManualSeconds) {
    // Manuel toplamlar donem ayrimi olmadan girildigi icin aylik/haftalik liderlikte de gosterilir.
    seconds += Number(creator.totalManualSeconds || 0);
  }
  return seconds;
}
function formatCreatorForLeaderboard(db, creator, period) {
  const seconds = creatorTotalSeconds(db, creator, period);
  const hours = seconds / 3600;
  return {
    id: creator.id,
    name: creator.name,
    tiktok: creator.tiktok,
    instagram: creator.instagram || '',
    avatar: creator.avatar || 'assets/logo.jpg',
    active: !!creator.active,
    isLive: !!creator.isLive,
    lastSeen: creator.lastSeen || null,
    lastError: creator.lastError || null,
    seconds,
    hours: Number(hours.toFixed(2)),
    points: Math.round(hours * (Number(creator.pointsPerHour || POINTS_PER_HOUR)))
  };
}
function startManualSession(creatorId, source = 'manual') {
  const db = readDb();
  const c = getCreator(db, creatorId);
  if (!c) return { ok: false, error: 'Yayinci bulunamadi.' };
  const running = (db.sessions || []).find(s => s.creatorId === creatorId && !s.endAt);
  c.isLive = true;
  c.lastSeen = nowISO();
  c.lastError = null;
  if (!running) {
    db.sessions.unshift({ id: makeId('sess'), creatorId, startAt: nowISO(), endAt: null, durationSeconds: 0, source });
  }
  writeDb(db);
  audit('session_start', { creatorId, source });
  return { ok: true };
}
function stopManualSession(creatorId, source = 'manual') {
  const db = readDb();
  const c = getCreator(db, creatorId);
  if (!c) return { ok: false, error: 'Yayinci bulunamadi.' };
  const running = (db.sessions || []).find(s => s.creatorId === creatorId && !s.endAt);
  if (running) {
    running.endAt = nowISO();
    running.durationSeconds = sessionOverlapSeconds(running, 0, parseDate(running.endAt));
    running.source = running.source || source;
  }
  c.isLive = false;
  c.lastSeen = nowISO();
  writeDb(db);
  audit('session_stop', { creatorId, source });
  return { ok: true };
}

const liveConnections = new Map();
let monitorTimer = null;
let lastMonitorRun = null;

async function tryConnectCreator(creator) {
  if (!WebcastPushConnection) {
    const db = readDb();
    const c = getCreator(db, creator.id);
    if (c) c.lastError = 'tiktok-live-connector yuklu degil. npm install gerekli.';
    writeDb(db);
    return;
  }
  if (!creator.active || !creator.tiktok) return;
  if (liveConnections.has(creator.id)) return;
  const username = normalizeTikTok(creator.tiktok);
  const connection = new WebcastPushConnection(username, { enableExtendedGiftInfo: false, requestPollingIntervalMs: 2500 });
  liveConnections.set(creator.id, { connection, connecting: true, startedAt: Date.now() });
  connection.on('connected', () => {
    const db = readDb();
    const c = getCreator(db, creator.id);
    if (c) { c.lastError = null; c.lastSeen = nowISO(); }
    writeDb(db);
    startManualSession(creator.id, 'tiktok-auto');
  });
  connection.on('disconnected', () => {
    stopManualSession(creator.id, 'tiktok-auto');
    liveConnections.delete(creator.id);
  });
  connection.on('streamEnd', () => {
    stopManualSession(creator.id, 'tiktok-auto');
    liveConnections.delete(creator.id);
    try { connection.disconnect(); } catch(e) {}
  });
  connection.on('error', (err) => {
    const db = readDb();
    const c = getCreator(db, creator.id);
    if (c) c.lastError = String(err?.message || err).slice(0, 180);
    writeDb(db);
  });
  try {
    await connection.connect();
    liveConnections.set(creator.id, { connection, connecting: false, startedAt: Date.now() });
  } catch (err) {
    const db = readDb();
    const c = getCreator(db, creator.id);
    if (c) {
      c.isLive = false;
      c.lastSeen = nowISO();
      c.lastError = String(err?.message || err).slice(0, 180);
    }
    writeDb(db);
    liveConnections.delete(creator.id);
  }
}
async function runMonitorOnce() {
  lastMonitorRun = nowISO();
  const db = readDb();
  const creators = db.creators.filter(c => c.active && c.tiktok);
  for (const c of creators) {
    await tryConnectCreator(c);
    await new Promise(r => setTimeout(r, 800));
  }
}
function startMonitor() {
  if (monitorTimer) return;
  runMonitorOnce().catch(console.error);
  monitorTimer = setInterval(() => runMonitorOnce().catch(console.error), LIVE_CHECK_INTERVAL_MS);
}
function stopMonitor() {
  if (monitorTimer) clearInterval(monitorTimer);
  monitorTimer = null;
}

app.get('/api/health', (req, res) => res.json({ ok: true, at: nowISO(), monitorRunning: !!monitorTimer, connectorLoaded: !!WebcastPushConnection }));
app.post('/api/admin/login', (req, res) => {
  const pass = req.body?.password || '';
  if (pass === ADMIN_PASSWORD) return res.json({ ok: true, token: adminToken() });
  res.status(401).json({ ok: false, error: 'Admin sifresi hatali.' });
});
app.get('/api/leaderboard', (req, res) => {
  const period = ['day','week','month','all'].includes(req.query.period) ? req.query.period : 'month';
  const db = readDb();
  const data = db.creators.map(c => formatCreatorForLeaderboard(db, c, period)).sort((a,b) => b.seconds - a.seconds);
  res.json({ ok: true, period, pointsPerHour: POINTS_PER_HOUR, items: data });
});
app.get('/api/creators', (req, res) => {
  const period = ['day','week','month','all'].includes(req.query.period) ? req.query.period : 'month';
  const db = readDb();
  res.json({ ok: true, items: db.creators.map(c => formatCreatorForLeaderboard(db, c, period)) });
});
app.get('/api/admin/status', requireAdmin, (req, res) => {
  const db = readDb();
  res.json({ ok: true, monitorRunning: !!monitorTimer, lastMonitorRun, connectorLoaded: !!WebcastPushConnection, connections: [...liveConnections.keys()], db });
});
app.post('/api/admin/monitor/start', requireAdmin, (req, res) => { startMonitor(); res.json({ ok: true, monitorRunning: true }); });
app.post('/api/admin/monitor/stop', requireAdmin, (req, res) => { stopMonitor(); res.json({ ok: true, monitorRunning: false }); });
app.post('/api/admin/monitor/run-once', requireAdmin, async (req, res) => { await runMonitorOnce(); res.json({ ok: true, lastMonitorRun }); });
app.post('/api/admin/creators', requireAdmin, (req, res) => {
  const db = readDb();
  const body = req.body || {};
  const creator = {
    id: makeId('cr'),
    name: String(body.name || body.tiktok || 'Yayinci').trim(),
    tiktok: normalizeTikTok(body.tiktok),
    instagram: String(body.instagram || '').replace(/^@+/, '').trim(),
    avatar: String(body.avatar || 'assets/logo.jpg').trim(),
    active: body.active !== false,
    isLive: false,
    totalManualSeconds: Number(body.totalManualSeconds || 0),
    pointsPerHour: Number(body.pointsPerHour || POINTS_PER_HOUR),
    lastSeen: null,
    lastError: null,
    createdAt: nowISO()
  };
  db.creators.unshift(creator);
  writeDb(db);
  audit('creator_create', { creator });
  res.json({ ok: true, creator });
});
app.put('/api/admin/creators/:id', requireAdmin, (req, res) => {
  const db = readDb();
  const c = getCreator(db, req.params.id);
  if (!c) return res.status(404).json({ ok: false, error: 'Yayinci bulunamadi.' });
  const fields = ['name','tiktok','instagram','avatar','active','pointsPerHour'];
  for (const f of fields) if (Object.prototype.hasOwnProperty.call(req.body, f)) c[f] = f === 'tiktok' ? normalizeTikTok(req.body[f]) : req.body[f];
  if (req.body.active !== undefined) c.active = !!req.body.active;
  writeDb(db);
  audit('creator_update', { id: c.id });
  res.json({ ok: true, creator: c });
});
app.delete('/api/admin/creators/:id', requireAdmin, (req, res) => {
  const db = readDb();
  db.creators = db.creators.filter(c => c.id !== req.params.id);
  db.sessions = (db.sessions || []).filter(s => s.creatorId !== req.params.id);
  writeDb(db);
  audit('creator_delete', { id: req.params.id });
  res.json({ ok: true });
});
app.post('/api/admin/creators/:id/manual-start', requireAdmin, (req, res) => res.json(startManualSession(req.params.id, 'manual-admin')));
app.post('/api/admin/creators/:id/manual-stop', requireAdmin, (req, res) => res.json(stopManualSession(req.params.id, 'manual-admin')));
app.post('/api/admin/creators/:id/adjust', requireAdmin, (req, res) => {
  const seconds = Number(req.body?.seconds || 0);
  const db = readDb();
  const c = getCreator(db, req.params.id);
  if (!c) return res.status(404).json({ ok: false, error: 'Yayinci bulunamadi.' });
  c.totalManualSeconds = Math.max(0, Number(c.totalManualSeconds || 0) + seconds);
  writeDb(db);
  audit('creator_adjust_seconds', { id: c.id, seconds });
  res.json({ ok: true, creator: c });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

ensureDb();
if (String(process.env.AUTO_MONITOR || '').toLowerCase() === 'true') startMonitor();
app.listen(PORT, () => {
  console.log(`Real Medya Agency V8 calisiyor: http://localhost:${PORT}`);
  console.log(`Admin sifresi: ${ADMIN_PASSWORD}`);
});
