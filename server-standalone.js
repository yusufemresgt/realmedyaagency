// Real Medya Agency V8 - dependency-free local server
// Calisirken npm install gerekmez. Sadece Node.js yeterlidir.
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

let WebcastPushConnection = null;
try {
  ({ WebcastPushConnection } = require('tiktok-live-connector'));
} catch (err) {
  WebcastPushConnection = null;
}

const ROOT = __dirname;
const LOG_DIR = path.join(ROOT, 'logs');
const DATA_DIR = path.join(ROOT, 'data');
const UPLOAD_DIR = path.join(ROOT, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'real2026';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'real-medya-agency-secret';
const POINTS_PER_HOUR = Number(process.env.POINTS_PER_HOUR || 1000);
const LIVE_CHECK_INTERVAL_MS = Number(process.env.LIVE_CHECK_INTERVAL_MS || 180000);
const START_PORT = Number(process.env.PORT || 3000);
const DEFAULT_LEADERBOARD_SETTINGS = {
  tag:'REAL MEDYA ELİT LİGİ',
  title:'Ajansın en çok yayın yapanları',
  subtitle:'',
  pageTitle:'Ajans Liderleri',
  pageSubtitle:'',
  sortMode:'manual',
  theme:'neon',
  showTiktok:true,
  showRankBadge:true,
  showTier:true,
  neonFirst:true
};
function cleanBool(v, fallback=true){ return typeof v === 'boolean' ? v : fallback; }
function sanitizeLeaderboardSettings(input={}){
  const s={...DEFAULT_LEADERBOARD_SETTINGS,...(input||{})};
  s.sortMode = ['hours','manual'].includes(s.sortMode) ? s.sortMode : 'manual';
  s.theme = ['neon','silver','dark'].includes(s.theme) ? s.theme : 'neon';
  s.showTiktok = cleanBool(s.showTiktok,true);
  s.showRankBadge = cleanBool(s.showRankBadge,true);
  s.showTier = cleanBool(s.showTier,true);
  s.neonFirst = cleanBool(s.neonFirst,true);
  ['tag','title','subtitle','pageTitle','pageSubtitle'].forEach(k=>s[k]=String(s[k] ?? DEFAULT_LEADERBOARD_SETTINGS[k]).slice(0,500));
  return s;
}
function normalizeDb(db){
  db.settings = db.settings || {};
  db.settings.pointsPerHour = Number(db.settings.pointsPerHour || POINTS_PER_HOUR);
  db.settings.leaderboard = sanitizeLeaderboardSettings(db.settings.leaderboard || {});
  db.creators = (db.creators || []).map((c,i)=>({displayOrder:c.displayOrder ?? null, ...c}));
  db.sessions = db.sessions || [];
  db.audit = db.audit || [];
  return db;
}
function sortLeaderboardItems(items, settings){
  const mode=(settings?.leaderboard?.sortMode || settings?.sortMode || 'hours');
  return items.sort((a,b)=>{
    const manualA = Number.isFinite(Number(a.displayOrder)) ? Number(a.displayOrder) : 999999;
    const manualB = Number.isFinite(Number(b.displayOrder)) ? Number(b.displayOrder) : 999999;
    if(mode==='manual'){
      if(manualA!==manualB) return manualA-manualB;
      return b.seconds-a.seconds;
    }
    if(mode==='hours'){
      if(b.seconds!==a.seconds) return b.seconds-a.seconds;
      return manualA-manualB;
    }
    return b.seconds-a.seconds;
  });
}

function mkdirp(p){ if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true}); }
mkdirp(LOG_DIR); mkdirp(DATA_DIR); mkdirp(UPLOAD_DIR);
function log(msg){ const line = `[${new Date().toISOString()}] ${msg}`; console.log(line); try{ fs.appendFileSync(path.join(LOG_DIR,'server-output.txt'), line+'\n'); }catch(e){} }
function nowISO(){ return new Date().toISOString(); }
function makeId(prefix='id'){ return `${prefix}_${crypto.randomUUID().slice(0,8)}`; }
function normalizeTikTok(v=''){ return String(v).trim().replace(/^@+/,'').replace(/\s+/g,''); }
function avatarExtFromMime(mime, fileName='avatar.png'){
  const map={'image/png':'png','image/jpeg':'jpg','image/jpg':'jpg','image/webp':'webp','image/svg+xml':'svg'};
  if(map[mime]) return map[mime];
  const e=String(fileName||'').split('.').pop().toLowerCase();
  return ['png','jpg','jpeg','webp','svg'].includes(e) ? (e==='jpeg'?'jpg':e) : 'png';
}
function saveAvatarData(dataUrl, creatorId, fileName='avatar.png'){
  if(!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) return null;
  const m=dataUrl.match(/^data:(image\/(png|jpeg|jpg|webp|svg\+xml));base64,(.+)$/);
  if(!m) return null;
  const ext=avatarExtFromMime(m[1], fileName);
  const safe=String(creatorId||makeId('cr')).replace(/[^a-zA-Z0-9_-]/g,'');
  const outName=`${safe}-${Date.now()}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR,outName),Buffer.from(m[3],'base64'));
  return `uploads/${outName}`;
}

function tokenForPassword(password){ return crypto.createHash('sha256').update(`${password}:${ADMIN_SECRET}`).digest('hex'); }
function adminToken(){ return tokenForPassword(ADMIN_PASSWORD); }
function unauthorized(res){ json(res, 401, {ok:false,error:'Yetkisiz istek. Admin sifresi/token gecersiz.'}); }
function requireAdmin(req,res){ const h=req.headers['authorization']||''; const token=String(h).replace(/^Bearer\s+/i,'').trim(); if(token && token===adminToken()) return true; unauthorized(res); return false; }

function ensureDb(){
  if(!fs.existsSync(DB_FILE)){
    const seed={
      version:1,
      settings:{pointsPerHour:POINTS_PER_HOUR, leaderboard: DEFAULT_LEADERBOARD_SETTINGS},
      creators:[
        {id:'cr_m3t3',displayOrder:1,name:'M3T3_GAMES',tiktok:'m3t3_games',instagram:'m3t3_games',avatar:'assets/logo.jpg',active:true,isLive:false,totalManualSeconds:55800,lastSeen:null,lastError:null,createdAt:nowISO()},
        {id:'cr_berat',displayOrder:2,name:'Berat',tiktok:'beratkamaz_',instagram:'',avatar:'assets/logo.jpg',active:true,isLive:false,totalManualSeconds:111600,lastSeen:null,lastError:null,createdAt:nowISO()},
        {id:'cr_kaan',displayOrder:3,name:'KaanTea',tiktok:'kaantea',instagram:'kaantea',avatar:'assets/logo.jpg',active:true,isLive:false,totalManualSeconds:27900,lastSeen:null,lastError:null,createdAt:nowISO()}
      ],
      sessions:[],
      audit:[]
    };
    fs.writeFileSync(DB_FILE,JSON.stringify(seed,null,2),'utf8');
  }
}
function readDb(){ ensureDb(); const db=normalizeDb(JSON.parse(fs.readFileSync(DB_FILE,'utf8'))); return db; }
function writeDb(db){ fs.writeFileSync(DB_FILE,JSON.stringify(db,null,2),'utf8'); }
function audit(action,detail={}){ const db=readDb(); db.audit=db.audit||[]; db.audit.unshift({id:makeId('log'),action,detail,at:nowISO()}); db.audit=db.audit.slice(0,500); writeDb(db); }
function getCreator(db,id){ return db.creators.find(c=>c.id===id); }
function parseDate(v){ return v ? new Date(v).getTime() : null; }
function periodStart(period){ const d=new Date(); if(period==='day'){d.setHours(0,0,0,0);return d.getTime();} if(period==='week'){const day=(d.getDay()+6)%7; d.setDate(d.getDate()-day); d.setHours(0,0,0,0); return d.getTime();} if(period==='month'){d.setDate(1); d.setHours(0,0,0,0); return d.getTime();} return 0; }
function sessionOverlapSeconds(session,startMs,endMs=Date.now()){ const s=parseDate(session.startAt); const e=session.endAt?parseDate(session.endAt):endMs; if(!s||!e)return 0; const from=Math.max(s,startMs); const to=Math.min(e,endMs); return Math.max(0,Math.floor((to-from)/1000)); }
function creatorTotalSeconds(db,creator,period='all'){ const start=periodStart(period); let seconds=period==='all'?Number(creator.totalManualSeconds||0):0; for(const s of db.sessions||[]){ if(s.creatorId===creator.id) seconds+=sessionOverlapSeconds(s,start); } if(period!=='all'&&creator.totalManualSeconds) seconds+=Number(creator.totalManualSeconds||0); return seconds; }
function formatCreatorForLeaderboard(db,creator,period){ const seconds=creatorTotalSeconds(db,creator,period); const hours=seconds/3600; return {id:creator.id,displayOrder:creator.displayOrder ?? null,name:creator.name,tiktok:creator.tiktok,instagram:creator.instagram||'',avatar:creator.avatar||'assets/logo.jpg',active:!!creator.active,isLive:!!creator.isLive,lastSeen:creator.lastSeen||null,lastError:creator.lastError||null,seconds,hours:Number(hours.toFixed(2)),points:Math.round(hours*Number(creator.pointsPerHour||POINTS_PER_HOUR))}; }
function startManualSession(creatorId,source='manual'){ const db=readDb(); const c=getCreator(db,creatorId); if(!c) return {ok:false,error:'Yayinci bulunamadi.'}; const running=(db.sessions||[]).find(s=>s.creatorId===creatorId&&!s.endAt); c.isLive=true; c.lastSeen=nowISO(); c.lastError=null; if(!running){ db.sessions.unshift({id:makeId('sess'),creatorId,startAt:nowISO(),endAt:null,durationSeconds:0,source}); } writeDb(db); audit('session_start',{creatorId,source}); return {ok:true}; }
function stopManualSession(creatorId,source='manual'){ const db=readDb(); const c=getCreator(db,creatorId); if(!c) return {ok:false,error:'Yayinci bulunamadi.'}; const running=(db.sessions||[]).find(s=>s.creatorId===creatorId&&!s.endAt); if(running){ running.endAt=nowISO(); running.durationSeconds=sessionOverlapSeconds(running,0,parseDate(running.endAt)); running.source=running.source||source; } c.isLive=false; c.lastSeen=nowISO(); writeDb(db); audit('session_stop',{creatorId,source}); return {ok:true}; }

const liveConnections=new Map();
let monitorTimer=null; let lastMonitorRun=null;
async function tryConnectCreator(creator){
  if(!WebcastPushConnection){
    const db=readDb(); const c=getCreator(db,creator.id); if(c) c.lastError='Otomatik TikTok connector yuklu degil. OPTIONAL_TIKTOK_CONNECTOR_KUR.cmd calistirilabilir.'; writeDb(db); return;
  }
  if(!creator.active||!creator.tiktok||liveConnections.has(creator.id)) return;
  const username=normalizeTikTok(creator.tiktok);
  const connection=new WebcastPushConnection(username,{enableExtendedGiftInfo:false,requestPollingIntervalMs:2500});
  liveConnections.set(creator.id,{connection,connecting:true,startedAt:Date.now()});
  connection.on('connected',()=>{ const db=readDb(); const c=getCreator(db,creator.id); if(c){c.lastError=null;c.lastSeen=nowISO();} writeDb(db); startManualSession(creator.id,'tiktok-auto'); });
  connection.on('disconnected',()=>{ stopManualSession(creator.id,'tiktok-auto'); liveConnections.delete(creator.id); });
  connection.on('streamEnd',()=>{ stopManualSession(creator.id,'tiktok-auto'); liveConnections.delete(creator.id); try{connection.disconnect();}catch(e){} });
  connection.on('error',(err)=>{ const db=readDb(); const c=getCreator(db,creator.id); if(c)c.lastError=String(err?.message||err).slice(0,180); writeDb(db); });
  try{ await connection.connect(); liveConnections.set(creator.id,{connection,connecting:false,startedAt:Date.now()}); }
  catch(err){ const db=readDb(); const c=getCreator(db,creator.id); if(c){c.isLive=false;c.lastSeen=nowISO();c.lastError=String(err?.message||err).slice(0,180);} writeDb(db); liveConnections.delete(creator.id); }
}
async function runMonitorOnce(){ lastMonitorRun=nowISO(); const db=readDb(); for(const c of db.creators.filter(x=>x.active&&x.tiktok)){ await tryConnectCreator(c); await new Promise(r=>setTimeout(r,800)); } }
function startMonitor(){ if(monitorTimer) return; runMonitorOnce().catch(e=>log('monitor error: '+e.message)); monitorTimer=setInterval(()=>runMonitorOnce().catch(e=>log('monitor error: '+e.message)),LIVE_CHECK_INTERVAL_MS); }
function stopMonitor(){ if(monitorTimer) clearInterval(monitorTimer); monitorTimer=null; }

const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml; charset=utf-8','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8'};
function send(res,status,body,headers={}){ res.writeHead(status,headers); res.end(body); }
function json(res,status,obj){ send(res,status,JSON.stringify(obj),{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}); }
function safePath(urlPath){ let p=decodeURIComponent(urlPath.split('?')[0]); if(p==='/'||p==='') p='/index.html'; if(!path.extname(p)) p += '.html'; const full=path.normalize(path.join(ROOT,p)); if(!full.startsWith(ROOT)) return null; return full; }
function serveStatic(req,res){ const full=safePath(req.url); if(!full) return send(res,403,'Forbidden',{'Content-Type':'text/plain'}); fs.readFile(full,(err,data)=>{ if(err){ fs.readFile(path.join(ROOT,'index.html'),(e,d)=> e?send(res,404,'Not found',{'Content-Type':'text/plain'}):send(res,200,d,{'Content-Type':'text/html; charset=utf-8'})); return; } const ext=path.extname(full).toLowerCase(); send(res,200,data,{'Content-Type':MIME[ext]||'application/octet-stream'}); }); }
function readBody(req){ return new Promise((resolve,reject)=>{ let raw=''; req.on('data',c=>{raw+=c; if(raw.length>2e6){req.destroy(); reject(new Error('Body too large'));}}); req.on('end',()=>{ if(!raw) return resolve({}); try{ resolve(JSON.parse(raw)); }catch(e){ resolve({}); } }); req.on('error',reject); }); }
function match(pathname,pattern){ const a=pathname.split('/').filter(Boolean), b=pattern.split('/').filter(Boolean); if(a.length!==b.length) return null; const params={}; for(let i=0;i<b.length;i++){ if(b[i].startsWith(':')) params[b[i].slice(1)]=a[i]; else if(a[i]!==b[i]) return null; } return params; }
function validPeriod(v){ return ['day','week','month','all'].includes(v)?v:'month'; }

async function handleApi(req,res,pathname,query){
  try{
    if(req.method==='GET' && pathname==='/api/health') return json(res,200,{ok:true,at:nowISO(),monitorRunning:!!monitorTimer,connectorLoaded:!!WebcastPushConnection});
    if(req.method==='POST' && pathname==='/api/admin/login') { const body=await readBody(req); if(body.password===ADMIN_PASSWORD) return json(res,200,{ok:true,token:adminToken()}); return json(res,401,{ok:false,error:'Admin sifresi hatali.'}); }
    if(req.method==='GET' && pathname==='/api/table-settings') { const db=readDb(); return json(res,200,{ok:true,settings:db.settings}); }
    if(req.method==='PUT' && pathname==='/api/admin/table-settings') { if(!requireAdmin(req,res))return; const body=await readBody(req); const db=readDb(); db.settings=db.settings||{}; db.settings.leaderboard=sanitizeLeaderboardSettings(body); writeDb(db); audit('leaderboard_settings_update',{settings:db.settings.leaderboard}); return json(res,200,{ok:true,settings:db.settings}); }
    if(req.method==='GET' && pathname==='/api/leaderboard') { const period=validPeriod(query.get('period')); const db=readDb(); const items=sortLeaderboardItems(db.creators.map(c=>formatCreatorForLeaderboard(db,c,period)), db.settings); return json(res,200,{ok:true,period,settings:db.settings,pointsPerHour:POINTS_PER_HOUR,items}); }
    if(req.method==='GET' && pathname==='/api/creators') { const period=validPeriod(query.get('period')); const db=readDb(); return json(res,200,{ok:true,settings:db.settings,items:sortLeaderboardItems(db.creators.map(c=>formatCreatorForLeaderboard(db,c,period)), db.settings)}); }
    if(req.method==='GET' && pathname==='/api/admin/status') { if(!requireAdmin(req,res))return; const db=readDb(); return json(res,200,{ok:true,monitorRunning:!!monitorTimer,lastMonitorRun,connectorLoaded:!!WebcastPushConnection,connections:[...liveConnections.keys()],db}); }
    if(req.method==='POST' && pathname==='/api/admin/monitor/start') { if(!requireAdmin(req,res))return; startMonitor(); return json(res,200,{ok:true,monitorRunning:true,connectorLoaded:!!WebcastPushConnection}); }
    if(req.method==='POST' && pathname==='/api/admin/monitor/stop') { if(!requireAdmin(req,res))return; stopMonitor(); return json(res,200,{ok:true,monitorRunning:false}); }
    if(req.method==='POST' && pathname==='/api/admin/monitor/run-once') { if(!requireAdmin(req,res))return; await runMonitorOnce(); return json(res,200,{ok:true,lastMonitorRun,connectorLoaded:!!WebcastPushConnection}); }
    if(req.method==='POST' && pathname==='/api/admin/creators') { if(!requireAdmin(req,res))return; const body=await readBody(req); const db=readDb(); const creatorId=makeId('cr'); const uploadedAvatar=saveAvatarData(body.avatarData,creatorId,body.avatarFileName); const creator={id:creatorId,name:String(body.name||body.tiktok||'Yayinci').trim(),tiktok:normalizeTikTok(body.tiktok),instagram:String(body.instagram||'').replace(/^@+/,'').trim(),avatar:uploadedAvatar || String(body.avatar||'assets/logo.jpg').trim(),displayOrder:body.displayOrder?Number(body.displayOrder):((db.creators.reduce((m,x)=>Math.max(m, Number(x.displayOrder||0)),0))+1),active:body.active!==false,isLive:false,totalManualSeconds:Number(body.totalManualSeconds||0),pointsPerHour:Number(body.pointsPerHour||POINTS_PER_HOUR),lastSeen:null,lastError:null,createdAt:nowISO()}; db.creators.unshift(creator); writeDb(db); audit('creator_create',{creator}); return json(res,200,{ok:true,creator}); }
    let p;
    if(req.method==='PUT' && (p=match(pathname,'/api/admin/creators/:id'))) { if(!requireAdmin(req,res))return; const body=await readBody(req); const db=readDb(); const c=getCreator(db,p.id); if(!c)return json(res,404,{ok:false,error:'Yayinci bulunamadi.'}); const uploadedAvatar=saveAvatarData(body.avatarData,c.id,body.avatarFileName); if(uploadedAvatar) c.avatar=uploadedAvatar; for(const f of ['name','tiktok','instagram','avatar','active','pointsPerHour','displayOrder']) if(Object.prototype.hasOwnProperty.call(body,f) && body[f] !== '') c[f]=f==='tiktok'?normalizeTikTok(body[f]):body[f]; if(body.active!==undefined)c.active=!!body.active; if(Object.prototype.hasOwnProperty.call(body,'displayOrder')) c.displayOrder = body.displayOrder ? Number(body.displayOrder) : null; writeDb(db); audit('creator_update',{id:c.id}); return json(res,200,{ok:true,creator:c}); }
    if(req.method==='DELETE' && (p=match(pathname,'/api/admin/creators/:id'))) { if(!requireAdmin(req,res))return; const db=readDb(); db.creators=db.creators.filter(c=>c.id!==p.id); db.sessions=(db.sessions||[]).filter(s=>s.creatorId!==p.id); writeDb(db); audit('creator_delete',{id:p.id}); return json(res,200,{ok:true}); }
    if(req.method==='POST' && (p=match(pathname,'/api/admin/creators/:id/manual-start'))) { if(!requireAdmin(req,res))return; return json(res,200,startManualSession(p.id,'manual-admin')); }
    if(req.method==='POST' && (p=match(pathname,'/api/admin/creators/:id/manual-stop'))) { if(!requireAdmin(req,res))return; return json(res,200,stopManualSession(p.id,'manual-admin')); }
    if(req.method==='POST' && (p=match(pathname,'/api/admin/creators/:id/adjust'))) { if(!requireAdmin(req,res))return; const body=await readBody(req); const seconds=Number(body.seconds||0); const db=readDb(); const c=getCreator(db,p.id); if(!c)return json(res,404,{ok:false,error:'Yayinci bulunamadi.'}); c.totalManualSeconds=Math.max(0,Number(c.totalManualSeconds||0)+seconds); writeDb(db); audit('creator_adjust_seconds',{id:c.id,seconds}); return json(res,200,{ok:true,creator:c}); }
    return json(res,404,{ok:false,error:'API bulunamadi.'});
  } catch(err){ log('api error: '+(err.stack||err.message)); return json(res,500,{ok:false,error:String(err.message||err)}); }
}

const server=http.createServer((req,res)=>{ const u=new URL(req.url,'http://localhost'); if(u.pathname.startsWith('/api/')) return handleApi(req,res,u.pathname,u.searchParams); return serveStatic(req,res); });

function listenOn(port){
  server.once('error',(err)=>{
    if(err.code==='EADDRINUSE' && port < START_PORT+20){ log(`Port ${port} dolu, ${port+1} deneniyor...`); listenOn(port+1); }
    else { log('SERVER HATASI: '+(err.stack||err.message)); setTimeout(()=>process.exit(1),500); }
  });
  server.listen(port,()=>{
    const url=`http://localhost:${port}`;
    fs.writeFileSync(path.join(LOG_DIR,'server-url.txt'),url,'utf8');
    fs.writeFileSync(path.join(LOG_DIR,'server-status.txt'),`READY ${url} ${new Date().toISOString()}`,'utf8');
    log(`Real Medya Agency V13 calisiyor: ${url}`);
    log(`Yayinci Yonetimi: ${url}/canli-admin.html`);
    log(`Admin sifresi: ${ADMIN_PASSWORD}`);
    log(`TikTok connector: ${WebcastPushConnection ? 'yuklu' : 'yok - site yine acilir'}`);
  });
}
ensureDb();
if(String(process.env.AUTO_MONITOR||'').toLowerCase()==='true') startMonitor();
listenOn(START_PORT);
