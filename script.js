
const WA_PHONE = '905398342301';
const OWNER_NAME = 'Batuhan Şahin';
const ADMIN_PASS = 'real2026';
const $ = (sel, scope=document) => scope.querySelector(sel);
const $$ = (sel, scope=document) => [...scope.querySelectorAll(sel)];

function toast(msg){
  const el = $('[data-toast]');
  if(!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'), 2600);
}
function now(){ return new Date().toLocaleString('tr-TR'); }
function getStore(key){
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch(e){ return []; }
}
function setStore(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
function formData(form){ return Object.fromEntries(new FormData(form).entries()); }
function openWA(text){ window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(text)}`, '_blank'); }

document.addEventListener('DOMContentLoaded', () => {
  const year = $('[data-year]'); if(year) year.textContent = new Date().getFullYear();
  const menuBtn = $('[data-menu-btn]'); const nav = $('[data-nav]');
  if(menuBtn && nav) menuBtn.addEventListener('click', () => nav.classList.toggle('open'));

  const applyForm = $('[data-apply-form]');
  if(applyForm){
    applyForm.addEventListener('submit', e => {
      e.preventDefault();
      const d = formData(applyForm); d.date = now();
      const list = getStore('realAgencyApplications'); list.unshift(d); setStore('realAgencyApplications', list);
      toast('Başvuru kaydedildi. WhatsApp açılıyor.');
      openWA(`REAL MEDYA AGENCY BAŞVURU\nAd Soyad: ${d.name}\nTikTok: ${d.tiktok}\nTelefon: ${d.phone}\nKategori: ${d.category}\nDaha önce ajans: ${d.agency}\nNot: ${d.note || '-'}\nTarih: ${d.date}`);
      applyForm.reset();
    });
  }

  const realpayForm = $('[data-realpay-form]');
  if(realpayForm){
    realpayForm.addEventListener('submit', e => {
      e.preventDefault();
      const d = formData(realpayForm); d.date = now();
      const list = getStore('realAgencyRealPay'); list.unshift(d); setStore('realAgencyRealPay', list);
      toast('RealPay talebi kaydedildi. WhatsApp açılıyor.');
      openWA(`REALPAY TALEP\nAd Soyad: ${d.name}\nTikTok: ${d.tiktok}\nTelefon: ${d.phone}\nMevcut Puan: ${d.points}\nÜrün: ${d.product}\nNot/Adres: ${d.note || '-'}\nTarih: ${d.date}`);
      realpayForm.reset();
    });
  }

  const contactForm = $('[data-contact-form]');
  if(contactForm){
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const d = formData(contactForm);
      openWA(`REAL MEDYA AGENCY İLETİŞİM\nAd Soyad: ${d.name}\nTelefon: ${d.phone}\nMesaj: ${d.message}`);
      contactForm.reset();
    });
  }

  const adminBtn = $('[data-admin-open]');
  if(adminBtn){ adminBtn.addEventListener('click', openAdmin); }
  const passInput = $('[data-admin-pass]');
  if(passInput){ passInput.addEventListener('keydown', e => { if(e.key==='Enter') openAdmin(); }); }
  const exportBtn = $('[data-export-json]');
  if(exportBtn) exportBtn.addEventListener('click', exportData);
  const clearBtn = $('[data-clear-data]');
  if(clearBtn) clearBtn.addEventListener('click', () => {
    if(confirm('Tüm başvuru ve RealPay verileri silinsin mi?')){
      localStorage.removeItem('realAgencyApplications');
      localStorage.removeItem('realAgencyRealPay');
      localStorage.removeItem('realAgencyUsers');
      localStorage.removeItem('realAgencySession');
      renderAdmin(); toast('Veriler temizlendi.');
    }
  });


  const registerForm = $('[data-register-form]');
  if(registerForm){
    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      const d = formData(registerForm); d.date = now(); d.provider = 'Form';
      const users = getStore('realAgencyUsers');
      if(users.some(u => (u.email || '').toLowerCase() === (d.email || '').toLowerCase())){ toast('Bu e-posta zaten kayıtlı.'); return; }
      users.unshift(d); setStore('realAgencyUsers', users);
      localStorage.setItem('realAgencySession', JSON.stringify({name:d.name, email:d.email, provider:'Form'}));
      toast('Kayıt oluşturuldu. Giriş yapıldı.');
      setTimeout(()=>location.href='index.html', 900);
    });
  }

  const loginForm = $('[data-login-form]');
  if(loginForm){
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const d = formData(loginForm);
      const users = getStore('realAgencyUsers');
      const found = users.find(u => (u.email||'').toLowerCase()===(d.identity||'').toLowerCase() || (u.phone||'')===d.identity || (u.tiktok||'')===d.identity);
      if(!found || found.password !== d.password){ toast('Kullanıcı bulunamadı veya şifre yanlış.'); return; }
      localStorage.setItem('realAgencySession', JSON.stringify({name:found.name, email:found.email, provider:found.provider || 'Form'}));
      toast('Giriş başarılı.');
      setTimeout(()=>location.href='index.html', 800);
    });
  }

  $$('[data-social-login]').forEach(btn => btn.addEventListener('click', () => {
    const provider = btn.getAttribute('data-social-login') || 'Sosyal';
    const name = provider + ' Kullanıcısı';
    const user = {date:now(), name, tiktok: provider==='TikTok' ? '@tiktok_kullanici' : '', phone:'', email: provider.toLowerCase()+'-demo@realmedya.local', category: provider+' OAuth Demo', provider, password:''};
    const users = getStore('realAgencyUsers');
    users.unshift(user); setStore('realAgencyUsers', users);
    localStorage.setItem('realAgencySession', JSON.stringify({name, email:user.email, provider}));
    toast(provider + ' ile demo oturum açıldı. Gerçek OAuth için API bağlantısı gerekir.');
    setTimeout(()=>location.href='index.html', 1200);
  }));

  renderSession();

});

function openAdmin(){
  const pass = $('[data-admin-pass]')?.value || '';
  if(pass !== ADMIN_PASS){ toast('Şifre yanlış.'); return; }
  $('[data-admin-login]')?.classList.add('hidden');
  $('[data-admin-panel]')?.classList.remove('hidden');
  renderAdmin();
}
function safe(v){ return String(v || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function renderAdmin(){
  const appBody = $('[data-applications-table]');
  const rpBody = $('[data-realpay-table]');
  const usersBody = $('[data-users-table]');
  if(appBody){
    const data = getStore('realAgencyApplications');
    appBody.innerHTML = data.length ? data.map(d => `<tr><td>${safe(d.date)}</td><td>${safe(d.name)}</td><td>${safe(d.tiktok)}</td><td>${safe(d.phone)}</td><td>${safe(d.category)}</td><td>${safe(d.note)}</td></tr>`).join('') : '<tr><td colspan="6">Henüz başvuru yok.</td></tr>';
  }
  if(rpBody){
    const data = getStore('realAgencyRealPay');
    rpBody.innerHTML = data.length ? data.map(d => `<tr><td>${safe(d.date)}</td><td>${safe(d.name)}</td><td>${safe(d.tiktok)}</td><td>${safe(d.phone)}</td><td>${safe(d.points)}</td><td>${safe(d.product)}</td><td>${safe(d.note)}</td></tr>`).join('') : '<tr><td colspan="7">Henüz RealPay talebi yok.</td></tr>';
  }
  if(usersBody){
    const data = getStore('realAgencyUsers');
    usersBody.innerHTML = data.length ? data.map(d => `<tr><td>${safe(d.date)}</td><td>${safe(d.name)}</td><td>${safe(d.tiktok)}</td><td>${safe(d.phone)}</td><td>${safe(d.email)}</td><td>${safe(d.category || d.provider)}</td></tr>`).join('') : '<tr><td colspan="6">Henüz üye kaydı yok.</td></tr>';
  }
}
function exportData(){
  const data = { applications:getStore('realAgencyApplications'), realpay:getStore('realAgencyRealPay'), users:getStore('realAgencyUsers'), exportedAt:new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'real-medya-agency-veriler.json'; a.click();
  URL.revokeObjectURL(url);
}


function renderSession(){
  const raw = localStorage.getItem('realAgencySession');
  if(!raw) return;
  let session; try{ session = JSON.parse(raw); }catch(e){ return; }
  const pill = document.createElement('div');
  pill.className = 'session-pill';
  pill.innerHTML = `Oturum: ${safe(session.name || session.email || 'Üye')} <small>(${safe(session.provider || 'Form')})</small> <button type="button">Çıkış</button>`;
  pill.querySelector('button').addEventListener('click', () => { localStorage.removeItem('realAgencySession'); location.reload(); });
  document.body.appendChild(pill);
}
