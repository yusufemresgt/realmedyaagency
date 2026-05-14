const CONTACT = {
  whatsapp: '905398342301',
  whatsappText: '+90 539 834 23 01',
  owner: 'Batuhan Şahin',
  instagram: 'batuhannsqhin0',
  domain: 'realmedyaagency.com',
  liveUrl: 'https://realmedyaagency.vercel.app'
};
const PRODUCTS = [
  {id:'universal', name:'TikTok Universal', price:12000, img:'assets/gift-tiktok-universal.svg', tag:'TikTok Hediyesi'},
  {id:'aslan', name:'Aslan Hediyesi', price:25000, img:'assets/gift-aslan.svg', tag:'Premium Hediye'},
  {id:'yildiz', name:'Yıldızlar Arası', price:45000, img:'assets/gift-yildizlar-arasi.svg', tag:'Özel Hediye'},
  {id:'kulaklik', name:'Kablosuz Kulaklık', price:15000, img:'assets/puan.svg', tag:'Ekipman'},
  {id:'mikrofon', name:'Profesyonel Mikrofon', price:18000, img:'assets/puan.svg', tag:'Yayın Ekipmanı'},
  {id:'mouse', name:'Gaming Mouse', price:9000, img:'assets/puan.svg', tag:'Oyun Ekipmanı'},
  {id:'destek', name:'Yayın Tasarım Desteği', price:7000, img:'assets/logo.jpg', tag:'Hizmet'},
  {id:'ozel', name:'Özel Ödül Talebi', price:50000, img:'assets/realpay-card.svg', tag:'VIP'}
];
const GAMES = [
  {name:'5 Takım Arena Oyunu', type:'Arena', desc:'Hediyelere göre skor alan, skora göre büyüyen hareketli toplar.', link:'oyunlar/arena-demo/index.html', img:'assets/game-arena.svg'},
  {name:'Direk Bayrak Yarışı', type:'Yarış', desc:'Puan oranına göre bayrakların yukarı/aşağı ilerlediği yayın oyunu.', link:'oyunlar/bayrak-demo/index.html', img:'assets/game-flags.svg'},
  {name:'Top Arena Sistemi', type:'Etkileşim', desc:'Profil fotoğraflı toplar, skor ve gerçek zamanlı hareket düzeni.', link:'oyunlar/top-demo/index.html', img:'assets/game-drops.svg'}
];
function $(s,root=document){return root.querySelector(s)}
function $$(s,root=document){return [...root.querySelectorAll(s)]}
function store(k,v){localStorage.setItem(k, JSON.stringify(v))}
function get(k, fallback=[]){try{return JSON.parse(localStorage.getItem(k)) ?? fallback}catch(e){return fallback}}
function toast(msg){let el=$('.toast')||document.body.appendChild(Object.assign(document.createElement('div'),{className:'toast'}));el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2600)}
function wa(message){return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`}
function currentUser(){return get('rma_current_user', null)}
function setCurrentUser(u){localStorage.setItem('rma_current_user', JSON.stringify(u))}
function allUsers(){return get('rma_users', [])}
function saveUsers(users){store('rma_users', users)}
function upsertUser(user){let users=allUsers();let i=users.findIndex(u=>u.email===user.email); if(i>=0) users[i]={...users[i],...user}; else users.push({...user, points:user.points??3000, created:new Date().toLocaleString('tr-TR')}); saveUsers(users); return users.find(u=>u.email===user.email)}
function setupNav(){
  const menu=$('#menuBtn'), links=$('#navLinks'); if(menu&&links) menu.addEventListener('click',()=>links.classList.toggle('show'));
  const path=location.pathname.split('/').pop()||'index.html'; $$('.navlinks a').forEach(a=>{const href=a.getAttribute('href'); if(href===path || (path===''&&href==='index.html')) a.classList.add('active')});
  const u=currentUser(); $$('.userLabel').forEach(e=>e.textContent=u?u.name||u.email:'Misafir'); $$('.pointLabel').forEach(e=>e.textContent=(u?.points??0).toLocaleString('tr-TR'));
}
function initParticles(){
 const c=document.getElementById('bgParticles'); if(!c) return; const ctx=c.getContext('2d'); let w,h,dpr,particles=[];
 function resize(){dpr=Math.min(devicePixelRatio||1,2); w=c.width=innerWidth*dpr; h=c.height=innerHeight*dpr; c.style.width=innerWidth+'px'; c.style.height=innerHeight+'px'; ctx.setTransform(dpr,0,0,dpr,0,0); const n=Math.min(90, Math.floor(innerWidth/18)); particles=Array.from({length:n},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.9+.35,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,a:Math.random()*.6+.2}));}
 function loop(){ctx.clearRect(0,0,innerWidth,innerHeight); for(const p of particles){p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=innerWidth;if(p.x>innerWidth)p.x=0;if(p.y<0)p.y=innerHeight;if(p.y>innerHeight)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${p.a})`;ctx.fill()} for(let i=0;i<particles.length;i++){for(let j=i+1;j<particles.length;j++){const a=particles[i],b=particles[j],dx=a.x-b.x,dy=a.y-b.y,dist=Math.hypot(dx,dy); if(dist<120){ctx.strokeStyle=`rgba(255,255,255,${(1-dist/120)*.10})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}}} requestAnimationFrame(loop)}
 addEventListener('resize',resize); resize(); loop();
}
function setupFaq(){ $$('.faq button').forEach(b=>b.addEventListener('click',()=>b.closest('.faq').classList.toggle('open'))) }
function setupTabs(){ $$('.tab').forEach(t=>t.addEventListener('click',()=>{const id=t.dataset.tab; $$('.tab').forEach(x=>x.classList.remove('active')); $$('.tab-panel').forEach(x=>x.classList.remove('active')); t.classList.add('active'); $('#'+id)?.classList.add('active')})) }
function renderProducts(){ const grid=$('#productGrid'); if(!grid) return; grid.innerHTML=PRODUCTS.map(p=>`<article class="card product"><div class="product-img"><img src="${p.img}" alt="${p.name}"></div><span class="tag">${p.tag}</span><h3>${p.name}</h3><p>RealPay puanınla talep oluştur, yönetim onayladıktan sonra iletişime geçsin.</p><div class="price"><img src="assets/puan.svg" alt="Puan">${p.price.toLocaleString('tr-TR')} puan</div><br><button class="btn primary" onclick="requestProduct('${p.id}')">Talep Et</button></article>`).join('') }
function renderGames(){ const grid=$('#gameGrid'); if(!grid) return; grid.innerHTML=GAMES.map(g=>`<article class="card"><div class="icon"><img src="${g.img}" alt="${g.name}"></div><span class="tag">${g.type}</span><h3>${g.name}</h3><p>${g.desc}</p><a class="btn small" href="${g.link}">Demo Aç</a><a class="btn small ghost" href="${wa('Merhaba, '+g.name+' için kurulum istiyorum.')}" target="_blank">Kurulum İste</a></article>`).join('') }
function requestProduct(id){ const p=PRODUCTS.find(x=>x.id===id); const u=currentUser(); const order={id:'RP'+Date.now(), product:p.name, price:p.price, user:u?.email||'misafir', name:u?.name||'Misafir', date:new Date().toLocaleString('tr-TR'), status:'Bekliyor'}; const orders=get('rma_orders',[]); orders.unshift(order); store('rma_orders',orders); toast('RealPay talebi oluşturuldu'); setTimeout(()=>window.open(wa(`RealPay talebi:%0AÜrün: ${p.name}%0APuan: ${p.price}%0AKullanıcı: ${order.name} / ${order.user}`),'_blank'),400) }
function setupForms(){
 const app=$('#applicationForm'); if(app) app.addEventListener('submit',e=>{e.preventDefault(); const fd=new FormData(app); const obj=Object.fromEntries(fd.entries()); obj.id='B'+Date.now(); obj.date=new Date().toLocaleString('tr-TR'); obj.status='Yeni'; const arr=get('rma_applications',[]); arr.unshift(obj); store('rma_applications',arr); toast('Başvuru kaydedildi'); window.open(wa(`Real Medya Agency başvurusu%0AAd: ${obj.name}%0ATikTok: ${obj.tiktok}%0ATelefon: ${obj.phone}%0AKategori: ${obj.category}%0ANot: ${obj.note||'-'}`),'_blank'); app.reset(); });
 const reg=$('#registerForm'); if(reg) reg.addEventListener('submit',e=>{e.preventDefault(); const fd=new FormData(reg); const u=upsertUser({name:fd.get('name'),email:fd.get('email'),phone:fd.get('phone'),tiktok:fd.get('tiktok'),provider:'E-posta'}); setCurrentUser(u); toast('Kayıt oluşturuldu'); setTimeout(()=>location.href='panel.html',600) });
 const login=$('#loginForm'); if(login) login.addEventListener('submit',e=>{e.preventDefault(); const email=new FormData(login).get('email'); let u=allUsers().find(x=>x.email===email); if(!u) u=upsertUser({name:email.split('@')[0], email, provider:'Demo', points:3000}); setCurrentUser(u); toast('Giriş yapıldı'); setTimeout(()=>location.href='panel.html',600) });
 $$('.socialLogin').forEach(b=>b.addEventListener('click',()=>{const provider=b.dataset.provider; const u=upsertUser({name:provider+' Kullanıcısı', email:provider.toLowerCase()+'-demo@realmedyaagency.com', provider, points:3000}); setCurrentUser(u); toast(provider+' ile demo giriş yapıldı'); setTimeout(()=>location.href='panel.html',650)}));
}
function renderPanel(){ const box=$('#userPanel'); if(!box) return; const u=currentUser(); if(!u){box.innerHTML='<div class="notice">Paneli görmek için önce giriş yapmalısın.</div><br><a class="btn primary" href="giris.html">Giriş Yap</a>'; return} const orders=get('rma_orders',[]).filter(o=>o.user===u.email); box.innerHTML=`<div class="cards three"><div class="card"><span class="tag">Profil</span><h3>${u.name}</h3><p>${u.email}<br>${u.phone||''}<br>${u.tiktok||''}</p></div><div class="card"><span class="tag">RealPay</span><h3>${(u.points||0).toLocaleString('tr-TR')} Puan</h3><p>Puan bakiyen demo olarak local kayıtlıdır. Gerçek sistem için veritabanı bağlanır.</p></div><div class="card"><span class="tag">Durum</span><h3>Aktif Üye</h3><p>Başvuru ve RealPay taleplerin buradan takip edilir.</p></div></div><div class="card" style="margin-top:18px"><h3>RealPay Taleplerim</h3><div class="table-wrap"><table class="table"><thead><tr><th>Ürün</th><th>Puan</th><th>Durum</th><th>Tarih</th></tr></thead><tbody>${orders.map(o=>`<tr><td>${o.product}</td><td>${o.price}</td><td>${o.status}</td><td>${o.date}</td></tr>`).join('')||'<tr><td colspan="4">Henüz talep yok.</td></tr>'}</tbody></table></div></div>` }
function setupAdmin(){
 const login=$('#adminLogin'), dash=$('#adminDash'); if(!login) return; function show(){login.classList.add('hidden'); dash.classList.remove('hidden'); renderAdmin()}
 if(sessionStorage.getItem('rma_admin')==='1') show();
 login.addEventListener('submit',e=>{e.preventDefault(); if(new FormData(login).get('pass')==='real2026'){sessionStorage.setItem('rma_admin','1'); show()} else toast('Şifre hatalı')});
}
function renderAdmin(){
 const apps=get('rma_applications',[]), orders=get('rma_orders',[]), users=allUsers();
 $('#adminStats').innerHTML=`<div class="stat"><strong>${apps.length}</strong><span>Başvuru</span></div><div class="stat"><strong>${orders.length}</strong><span>RealPay Talep</span></div><div class="stat"><strong>${users.length}</strong><span>Üye</span></div><div class="stat"><strong>${users.reduce((a,u)=>a+(u.points||0),0).toLocaleString('tr-TR')}</strong><span>Toplam Puan</span></div>`;
 $('#appsTable').innerHTML=apps.map(a=>`<tr><td>${a.name}</td><td>${a.tiktok}</td><td>${a.phone}</td><td>${a.category}</td><td>${a.status}</td><td>${a.date}</td></tr>`).join('')||'<tr><td colspan="6">Başvuru yok.</td></tr>';
 $('#ordersTable').innerHTML=orders.map(o=>`<tr><td>${o.id}</td><td>${o.name}</td><td>${o.product}</td><td>${o.price}</td><td>${o.status}</td><td>${o.date}</td></tr>`).join('')||'<tr><td colspan="6">Talep yok.</td></tr>';
 $('#usersTable').innerHTML=users.map(u=>`<tr><td>${u.name}</td><td>${u.email}</td><td>${u.tiktok||''}</td><td>${(u.points||0).toLocaleString('tr-TR')}</td><td><button class="btn small" onclick="addPoints('${u.email}',1000)">+1000</button> <button class="btn small danger" onclick="addPoints('${u.email}',-1000)">-1000</button></td></tr>`).join('')||'<tr><td colspan="5">Üye yok.</td></tr>';
}
function addPoints(email,amount){let users=allUsers(); let u=users.find(x=>x.email===email); if(!u)return; u.points=Math.max(0,(u.points||0)+amount); saveUsers(users); const cur=currentUser(); if(cur?.email===email) setCurrentUser(u); renderAdmin(); toast('Puan güncellendi')}
function seedDemo(){ if(!localStorage.getItem('rma_seeded')){upsertUser({name:'Demo Yayıncı',email:'demo@realmedyaagency.com',tiktok:'@demo',phone:'+90 539 834 23 01',points:30000,provider:'Demo'}); localStorage.setItem('rma_seeded','1')} }
document.addEventListener('DOMContentLoaded',()=>{seedDemo(); setupNav(); initParticles(); setupFaq(); setupTabs(); setupForms(); renderProducts(); renderGames(); renderPanel(); setupAdmin(); document.body.insertAdjacentHTML('beforeend','<div class="toast"></div>')});

/* V8 backend liderlik sistemi */
const RMA_API_BASE = localStorage.getItem('rma_api_base') || '';
const DEMO_LEADERS = [
  {id:'demo1', name:'Berat', tiktok:'beratkamaz_', instagram:'', avatar:'assets/logo.jpg', hours:31, seconds:111600, points:31000, isLive:true},
  {id:'demo2', name:'M3T3_GAMES', tiktok:'m3t3_games', instagram:'m3t3_games', avatar:'assets/logo.jpg', hours:15.5, seconds:55800, points:15500, isLive:false},
  {id:'demo3', name:'KaanTea', tiktok:'kaantea', instagram:'kaantea', avatar:'assets/logo.jpg', hours:7.75, seconds:27900, points:7750, isLive:false}
];
let liveAdminToken = localStorage.getItem('rma_live_admin_token') || '';
let currentLeaderPeriod = 'month';
const DEFAULT_TABLE_SETTINGS = {
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
let agencyTableSettings = {...DEFAULT_TABLE_SETTINGS};
function mergeTableSettings(v){ agencyTableSettings = {...DEFAULT_TABLE_SETTINGS, ...(v||{})}; return agencyTableSettings; }
function apiUrl(path){ return `${RMA_API_BASE}${path}`; }
async function apiFetch(path, opts={}){
  const headers = Object.assign({'Content-Type':'application/json'}, opts.headers || {});
  if(opts.admin) headers.Authorization = `Bearer ${liveAdminToken}`;
  const res = await fetch(apiUrl(path), Object.assign({}, opts, {headers}));
  const data = await res.json().catch(()=>({ok:false,error:'JSON okunamadi'}));
  if(!res.ok || data.ok === false) throw new Error(data.error || 'API hatasi');
  return data;
}
function hoursText(hours){ return `${Number(hours || 0).toLocaleString('tr-TR',{maximumFractionDigits:2})} saat`; }
function cleanTiktok(u){ return (u || '-').toString().replace(/^@+/, ''); }
function podiumLabel(rank){ return rank===1?'ŞAMPİYON':rank===2?'ELİT YAYINCI':'YÜKSELEN YILDIZ'; }
function applyLeaderCopy(){
  const s=agencyTableSettings;
  const pairs=[['homeLeaderTag',s.tag],['homeLeaderTitle',s.title],['pageLeaderTag',s.tag||'Ajans Yayın Sıralaması'],['pageLeaderTitle',s.pageTitle||'Ajans Liderleri']];
  pairs.forEach(([id,val])=>{ const el=document.getElementById(id); if(el && val) el.textContent=val; });
}
function leaderCard(item, rank){
  const crown = rank===1 ? '🏆' : rank===2 ? '🥈' : '🥉';
  const s = agencyTableSettings;
  const classes = ['leader-card',`rank-${rank}`];
  if(!s.neonFirst) classes.push('no-neon');
  if(!s.showRankBadge) classes.push('hide-rank');
  if(!s.showTier) classes.push('hide-tier');
  if(!s.showTiktok) classes.push('hide-tiktok');
  return `<article class="${classes.join(' ')}">
    <div class="leader-aura"></div>
    <div class="rank-badge"><span>${rank}</span><em>${crown}</em></div>
    <div class="leader-rank-line">${rank}. SIRA</div>
    <div class="leader-avatar-wrap"><img class="leader-avatar" src="${item.avatar || 'assets/logo.jpg'}" alt="${item.name}" onerror="this.src='assets/logo.jpg'"></div>
    <div class="leader-tier">${podiumLabel(rank)}</div>
    <div class="leader-name">${item.name || 'Yayıncı'}</div>
    <div class="leader-user">@${cleanTiktok(item.tiktok)}</div>
  </article>`;
}
function renderTop3(targetId, items){
  const el = document.getElementById(targetId); if(!el) return;
  el.classList.remove('theme-neon','theme-silver','theme-dark');
  el.classList.add(`theme-${agencyTableSettings.theme || 'neon'}`);
  const top = (items || []).slice(0,3);
  if(!top.length){ el.innerHTML='<div class="notice">Henüz yayıncı yok.</div>'; return; }
  const left = top[1] || null;
  const center = top[0] || null;
  const right = top[2] || null;
  const order = [left, center, right].filter(Boolean);
  el.innerHTML = order.map((item)=> leaderCard(item, top.indexOf(item)+1)).join('');
}
async function loadLeaderboard(period='month'){
  try{
    const data = await apiFetch(`/api/leaderboard?period=${period}`);
    mergeTableSettings(data.settings?.leaderboard || data.settings || {});
    applyLeaderCopy();
    return data.items || [];
  }catch(err){
    console.warn('Backend yok, demo liderlik kullanılıyor:', err.message);
    mergeTableSettings(DEFAULT_TABLE_SETTINGS); applyLeaderCopy();
    return DEMO_LEADERS;
  }
}
async function renderHomeLeaderboard(){
  const el=document.getElementById('homeLeaderboard'); if(!el) return;
  el.innerHTML='<div class="notice">Liderlik yükleniyor...</div>';
  const items = await loadLeaderboard('month');
  renderTop3('homeLeaderboard', items);
}
async function renderLeaderboardPage(period=currentLeaderPeriod){
  currentLeaderPeriod=period;
  const topEl=document.getElementById('leaderboardTop'), rows=document.getElementById('leaderboardRows');
  if(!topEl && !rows) return;
  const items=await loadLeaderboard(period);
  renderTop3('leaderboardTop', items);
  if(rows){
    rows.innerHTML = items.map((x,i)=>`<tr><td><b>${i+1}</b></td><td><div class="creator-line"><img src="${x.avatar||'assets/logo.jpg'}" onerror="this.src='assets/logo.jpg'"><div><b>${x.name}</b><br><small>${agencyTableSettings.showTiktok?'@'+cleanTiktok(x.tiktok):''}</small></div></div></td><td>${agencyTableSettings.showTiktok?'@'+cleanTiktok(x.tiktok):'-'}</td></tr>`).join('') || '<tr><td colspan="3">Yayıncı yok.</td></tr>';
  }
}
function setupLeaderboardButtons(){
  document.querySelectorAll('[data-period]').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('[data-period]').forEach(b=>b.classList.remove('primary'));
    btn.classList.add('primary');
    renderLeaderboardPage(btn.dataset.period);
  }));
}
function fillTableSettingsForm(settings=agencyTableSettings){
  const f=document.getElementById('tableSettingsForm'); if(!f) return;
  const s={...DEFAULT_TABLE_SETTINGS,...settings};
  ['tag','title','pageTitle','sortMode','theme'].forEach(k=>{ if(f.elements[k]) f.elements[k].value=s[k] ?? ''; });
  ['showTiktok','showRankBadge','showTier','neonFirst'].forEach(k=>{ if(f.elements[k]) f.elements[k].checked=!!s[k]; });
}
async function saveTableSettings(form){
  const fd=new FormData(form);
  const body={
    tag:fd.get('tag')||DEFAULT_TABLE_SETTINGS.tag,
    title:fd.get('title')||DEFAULT_TABLE_SETTINGS.title,
    subtitle:'',
    pageTitle:fd.get('pageTitle')||DEFAULT_TABLE_SETTINGS.pageTitle,
    pageSubtitle:'',
    sortMode:fd.get('sortMode')||'hours',
    theme:fd.get('theme')||'neon',
    showTiktok:fd.get('showTiktok')==='on',
    showRankBadge:fd.get('showRankBadge')==='on',
    showTier:fd.get('showTier')==='on',
    neonFirst:fd.get('neonFirst')==='on'
  };
  const data=await apiFetch('/api/admin/table-settings',{method:'PUT',admin:true,body:JSON.stringify(body)});
  mergeTableSettings(data.settings?.leaderboard || body); applyLeaderCopy(); fillTableSettingsForm();
  await renderHomeLeaderboard(); await renderLeaderboardPage(currentLeaderPeriod);
}
async function liveAdminLogin(password){
  const data = await apiFetch('/api/admin/login',{method:'POST',body:JSON.stringify({password})});
  liveAdminToken=data.token; localStorage.setItem('rma_live_admin_token', liveAdminToken); return data;
}
function totalSecondsForCreator(c, sessions){
  return Number(c.totalManualSeconds||0) + (sessions||[]).filter(s=>s.creatorId===c.id).reduce((a,s)=>a+(s.endAt?Number(s.durationSeconds||0):Math.floor((Date.now()-new Date(s.startAt).getTime())/1000)),0);
}

async function refreshLiveAdmin(){
  const dash=document.getElementById('liveAdminDash'); if(!dash || !liveAdminToken) return;
  try{
    const status=await apiFetch('/api/admin/status',{admin:true});
    window.liveAdminCreators=status.db.creators||[];
    mergeTableSettings(status.db.settings?.leaderboard || {}); fillTableSettingsForm(); applyLeaderCopy();
    const box=document.getElementById('liveStatusBox');
    if(box){ box.innerHTML=`<span class="status-pill ${status.monitorRunning?'ok':'bad'}">Takip: ${status.monitorRunning?'Aktif':'Kapalı'}</span><span class="status-pill ${status.connectorLoaded?'ok':'bad'}">TikTok: ${status.connectorLoaded?'Hazır':'Pasif'}</span>`; }
    const rows=document.getElementById('creatorAdminRows');
    if(rows){
      const list=(status.db.creators||[]).map(c=>{
        const safeId = String(c.id).replace(/[^a-zA-Z0-9_-]/g,'');
        return `<article class="easy-creator-card" data-creator-id="${c.id}">
          <div class="easy-avatar-zone">
            <img id="preview_${safeId}" src="${c.avatar||'assets/logo.jpg'}" onerror="this.src='assets/logo.jpg'" alt="${c.name||'Yayıncı'}">
            <label class="btn ghost upload-btn mini-upload">Resim Seç<input type="file" id="file_${safeId}" accept="image/png,image/jpeg,image/webp,image/svg+xml" onchange="previewCreatorImage('${c.id}', this)"></label>
          </div>
          <div class="easy-creator-fields">
            <label>Takma Ad<input class="input" id="name_${safeId}" value="${String(c.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;')}"></label>
            <label>TikTok<input class="input" id="tiktok_${safeId}" value="${cleanTiktok(c.tiktok)}"></label>
            <label>Sıra<input class="input" id="order_${safeId}" type="number" min="1" value="${c.displayOrder||''}" placeholder="-"></label>
          </div>
          <div class="easy-row-actions">
            <button class="btn primary" onclick="saveCreatorInline('${c.id}')">Kaydet</button>
            <button class="btn small" onclick="creatorAction('${c.id}','manual-start')">Başlat</button>
            <button class="btn small ghost" onclick="creatorAction('${c.id}','manual-stop')">Durdur</button>
            <button class="btn small" onclick="adjustCreator('${c.id}',3600)">+1 Saat</button>
            <button class="btn small ghost" onclick="adjustCreator('${c.id}',-3600)">-1 Saat</button>
            <button class="btn small danger" onclick="deleteCreator('${c.id}')">Sil</button>
          </div>
        </article>`;
      }).join('');
      rows.innerHTML = list || '<div class="notice">Yayıncı yok.</div>';
    }
  }catch(err){
    const msg=document.getElementById('liveAdminLoginMsg'); if(msg) msg.textContent='API bağlantısı yok veya token geçersiz: '+err.message;
  }
}
async function creatorAction(id, action){ try{ await apiFetch(`/api/admin/creators/${id}/${action}`,{method:'POST',admin:true}); await refreshLiveAdmin(); await renderLeaderboardPage(currentLeaderPeriod); await renderHomeLeaderboard(); toast('İşlem tamam'); }catch(e){ toast(e.message); } }
async function adjustCreator(id, seconds){ try{ await apiFetch(`/api/admin/creators/${id}/adjust`,{method:'POST',admin:true,body:JSON.stringify({seconds})}); await refreshLiveAdmin(); await renderLeaderboardPage(currentLeaderPeriod); await renderHomeLeaderboard(); toast('Sıralama verisi güncellendi'); }catch(e){ toast(e.message); } }
async function updateCreatorOrder(id, value){ try{ await apiFetch(`/api/admin/creators/${id}`,{method:'PUT',admin:true,body:JSON.stringify({displayOrder:value?Number(value):null})}); await refreshLiveAdmin(); await renderHomeLeaderboard(); await renderLeaderboardPage(currentLeaderPeriod); toast('Sıra kaydedildi'); }catch(e){ toast(e.message); } }
function fileToDataURL(file){
  return new Promise((resolve,reject)=>{ if(!file) return resolve(null); const reader=new FileReader(); reader.onload=()=>resolve(reader.result); reader.onerror=()=>reject(reader.error||new Error('Görsel okunamadı')); reader.readAsDataURL(file); });
}
function safeCreatorDomId(id){ return String(id).replace(/[^a-zA-Z0-9_-]/g,''); }
function previewCreatorImage(id, input){
  const file=input?.files?.[0]; if(!file) return;
  const img=document.getElementById('preview_'+safeCreatorDomId(id)); if(!img) return;
  const url=URL.createObjectURL(file); img.src=url;
}
async function saveCreatorInline(id){
  const sid=safeCreatorDomId(id);
  const name=document.getElementById('name_'+sid)?.value?.trim() || 'Yayıncı';
  const tiktok=document.getElementById('tiktok_'+sid)?.value?.trim() || '';
  const displayOrder=document.getElementById('order_'+sid)?.value || '';
  const file=document.getElementById('file_'+sid)?.files?.[0];
  const body={name,tiktok,displayOrder:displayOrder?Number(displayOrder):null};
  if(file){ body.avatarData=await fileToDataURL(file); body.avatarFileName=file.name; }
  try{
    await apiFetch(`/api/admin/creators/${id}`,{method:'PUT',admin:true,body:JSON.stringify(body)});
    await refreshLiveAdmin(); await renderHomeLeaderboard(); await renderLeaderboardPage(currentLeaderPeriod);
    toast('Yayıncı kaydedildi');
  }catch(e){ toast(e.message); }
}
async function editCreator(id){ return saveCreatorInline(id); }
async function deleteCreator(id){ if(!confirm('Bu yayıncı silinsin mi?')) return; try{ await apiFetch(`/api/admin/creators/${id}`,{method:'DELETE',admin:true}); await refreshLiveAdmin(); await renderHomeLeaderboard(); await renderLeaderboardPage(currentLeaderPeriod); toast('Yayıncı silindi'); }catch(e){ toast(e.message); } }
function setupLiveAdmin(){
  const login=document.getElementById('liveAdminLogin'), dash=document.getElementById('liveAdminDash');
  if(!login && !dash) return;
  if(liveAdminToken && dash){ dash.classList.remove('hidden'); refreshLiveAdmin(); }
  if(login){ login.addEventListener('submit',async e=>{e.preventDefault(); const p=new FormData(login).get('password'); try{ await liveAdminLogin(p); document.getElementById('liveAdminDash')?.classList.remove('hidden'); toast('Yönetim paneli açıldı'); refreshLiveAdmin(); }catch(err){ toast(err.message); }}); }
  document.getElementById('startMonitorBtn')?.addEventListener('click',async()=>{try{await apiFetch('/api/admin/monitor/start',{method:'POST',admin:true});refreshLiveAdmin();toast('Takip başlatıldı')}catch(e){toast(e.message)}});
  document.getElementById('stopMonitorBtn')?.addEventListener('click',async()=>{try{await apiFetch('/api/admin/monitor/stop',{method:'POST',admin:true});refreshLiveAdmin();toast('Takip durduruldu')}catch(e){toast(e.message)}});
  document.getElementById('runOnceBtn')?.addEventListener('click',async()=>{try{await apiFetch('/api/admin/monitor/run-once',{method:'POST',admin:true});refreshLiveAdmin();toast('Kontrol çalıştı')}catch(e){toast(e.message)}});
  const newFile=document.querySelector('#creatorForm input[name="avatarFile"]');
  newFile?.addEventListener('change',()=>{ const file=newFile.files?.[0]; const img=document.getElementById('newCreatorPreview'); if(file && img){ img.src=URL.createObjectURL(file); }});
  document.getElementById('creatorForm')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const fd=new FormData(e.currentTarget);
    const body=Object.fromEntries(fd.entries());
    const file=e.currentTarget.querySelector('input[name="avatarFile"]')?.files?.[0];
    if(file){ body.avatarData=await fileToDataURL(file); body.avatarFileName=file.name; }
    delete body.avatarFile;
    if(!body.avatar && !body.avatarData) body.avatar='assets/logo.jpg';
    if(body.displayOrder) body.displayOrder=Number(body.displayOrder);
    delete body.pointsPerHour;
    try{
      await apiFetch('/api/admin/creators',{method:'POST',admin:true,body:JSON.stringify(body)});
      e.currentTarget.reset(); const preview=document.getElementById('newCreatorPreview'); if(preview) preview.src='assets/logo.jpg';
      await refreshLiveAdmin(); await renderHomeLeaderboard(); await renderLeaderboardPage(currentLeaderPeriod);
      toast('Yayıncı eklendi');
    }catch(err){toast(err.message)}
  });
  document.getElementById('tableSettingsForm')?.addEventListener('submit',async e=>{e.preventDefault(); try{await saveTableSettings(e.currentTarget); toast('Tablo ayarları kaydedildi')}catch(err){toast(err.message)}});
  setInterval(()=>{ if(document.getElementById('liveAdminDash') && !document.getElementById('liveAdminDash').classList.contains('hidden')) refreshLiveAdmin(); }, 15000);
}
document.addEventListener('DOMContentLoaded',()=>{
  setupNav(); initParticles(); setupFaq(); setupTabs(); renderProducts(); renderGames(); setupForms(); renderPanel(); setupAdmin();
  renderHomeLeaderboard(); renderLeaderboardPage(); setupLeaderboardButtons(); setupLiveAdmin();
});
