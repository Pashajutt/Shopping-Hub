let state = { user: null, categories: [], cities: [], listings: [], view: 'home', filters: {}, authTab: 'login' };

async function api(path, opts = {}) {
  const r = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Error');
  return d;
}

async function init() {
  const me = await api('/api/me');
  state.user = me.loggedIn ? { name: me.name } : null;
  state.categories = await api('/api/categories');
  state.cities = await api('/api/cities');
  renderUserArea(); renderCats(); showHome();
}

function renderUserArea() {
  const el = document.getElementById('userArea');
  if (state.user) {
    el.innerHTML = `<span class="hello">👋 ${esc(state.user.name)}</span>
      <button class="btn" onclick="showMyAds()">My Ads</button>
      <button class="btn btn-sell" onclick="showPostAd()">+ SELL</button>
      <button class="btn" onclick="logout()">Logout</button>`;
  } else {
    el.innerHTML = `<button class="btn" onclick="showAuth('login')">🔐 Login</button>
      <button class="btn btn-teal" onclick="showAuth('signup')">📝 Sign Up</button>
      <button class="btn btn-sell" onclick="showPostAd()">+ SELL</button>`;
  }
}

function renderCats() {
  const el = document.getElementById('catNav');
  el.innerHTML = `<button class="${!state.filters.group ? 'active' : ''}" onclick="setGroup('')">🌍 All</button>` +
    state.categories.map(g => `<button class="${state.filters.group === g.name ? 'active' : ''}" onclick="setGroup('${g.name}')">${g.icon} ${g.name}</button>`).join('');
}

function catIcon(c) {
  if (state.categories && state.categories.find) {
    const g = state.categories.find(x => x.name === c);
    if (g) return g.icon;
  }
  const icons = {
    'Mobiles': '📱', 'Tablets': '📲', 'Mobile Accessories': '🎧', 'Smart Watches': '⌚',
    'Cars': '🚗', 'Cars Accessories': '🔧', 'Spare Parts': '⚙️', 'Number Plates': '🔢',
    'Buses, Vans & Trucks': '🚌', 'Rickshaw & Chingchi': '🛺', 'Commercial Vehicles': '🚚', 'Boats': '⛵',
    'Motorcycles': '🏍️', 'Motorcycle Accessories': '🪖', 'Scooters': '🛵', 'Bicycles': '🚲',
    'Property for Sale': '🏠', 'Property for Rent': '🏘️', 'Property for Auction': '🔨', 'New Projects': '🏗️', 'Room for Rent': '🛏️',
    'Electronics': '💻', 'Home Appliances': '🧺', 'Computers & Laptops': '💻',
    'TV & Audio': '📺', 'Cameras': '📷', 'Games & Consoles': '🎮',
    'Furniture & Home Decor': '🛋️', 'Bed & Bath': '🛁', 'Garden Items': '🌱',
    'Fashion & Beauty': '💄', 'Clothes': '👗', 'Shoes': '👟', 'Bags & Wallets': '👜',
    'Watches & Jewelry': '💍', 'Health & Beauty': '💅', 'Wedding': '💒', 'Moms & Kids': '🤱',
    'Animals': '🐾', 'Dogs & Cats': '🐱', 'Birds & Hens': '🐔', 'Pets Accessories': '🦴',
    'Jobs': '💼', 'Services': '🛠️',
    'Business & Industrial': '🏭', 'Business for Sale': '💰', 'Business Equipment': '🏗️', 'Agriculture': '🌾',
    'Books, Sports & Hobbies': '📚', 'Sports & Outdoors': '⚽', 'Hobby & Collectibles': '🎨',
    'Music Instruments': '🎸', 'Tickets & Vouchers': '🎫',
    'Travel & Tours': '✈️', 'Accommodation': '🏨',
    'Food': '🍔', 'Items for Swap': '🔄',
    'Kids & Babies': '🧸', 'Everything Else': '📦'
  };
  return icons[c] || '📦';
}

function setGroup(g) {
  state.filters.group = g;
  state.filters.category = '';
  renderCats();
  if (!g) { showHome(); return; }
  const grp = state.categories.find(x => x.name === g);
  if (!grp) { showHome(); return; }
  state.view = 'group';
  document.getElementById('main').innerHTML = `
    <div class="crumbs"><a onclick="goHome()">🏠 Home</a> / ${grp.icon} ${grp.name}</div>
    <h2 style="margin:16px 0">${grp.icon} ${grp.name}</h2>
    <div class="catgrid">${grp.subs.map(s => `<button class="catcell" onclick="setCat('${s.replace(/'/g, "\\'")}')"><span class="cico">${catIcon(s)}</span><span class="clbl">${s}</span></button>`).join('')}</div>
    <h2 class="section">All in ${grp.name}</h2>
    <div class="grid" id="grid"><div class="empty"><span class="big">⏳</span>Loading...</div></div>`;
  loadGroupListings(grp.subs);
  window.scrollTo(0, 0);
}
async function loadGroupListings(subs) {
  const all = [];
  for (const s of subs) {
    try { const list = await api('/api/listings?category=' + encodeURIComponent(s)); all.push(...list); } catch (e) {}
  }
  all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  state.listings = all;
  const g = document.getElementById('grid');
  if (!g) return;
  g.innerHTML = all.length ? all.map(cardHTML).join('') : `<div class="empty"><span class="big">📭</span>No ads yet in this category — be the first to post! 🎉</div>`;
}
function setCat(c) { state.filters.category = c; state.filters.group = ''; renderCats(); showHome(); loadListings(); }
function goHome() { state.filters = {}; document.getElementById('searchInput').value = ''; renderCats(); showHome(); }
function doSearch() { state.filters.q = document.getElementById('searchInput').value.trim(); loadListings(); }

// ===== Contact info =====
const CONTACT = {
  phone: '+923002132209',
  phoneLabel: '📞 +92 300 2132209',
  whatsapp: '923002132209',
  facebook: '#',
  tiktok: '#'
};
function navGo(v) {
  document.querySelectorAll('.bnav-item').forEach(b => b.classList.remove('active'));
  const map = { home: 'bn-home', chat: 'bn-chat', myads: 'bn-myads', account: 'bn-account' };
  if (map[v]) document.getElementById(map[v]).classList.add('active');
  if (v === 'home') goHome();
  else if (v === 'chat') showChat();
  else if (v === 'myads') showMyAds();
  else if (v === 'account') showAccount();
}
function showChat() {
  state.view = 'chat';
  document.getElementById('main').innerHTML = `<div class="empty"><span class="big">💬</span><b>Chat</b><br>Buyer-seller chat is coming soon! 🚀<br><span style="font-size:13px">For now, call the seller directly from any ad. 📞</span></div>`;
  window.scrollTo(0, 0);
}
function showAbout() {
  state.view = 'about';
  document.getElementById('main').innerHTML = `<div class="form-card" style="max-width:640px">
    <h2>ℹ️ About Shopping Hub</h2>
    <div class="form-sub">Pakistan's own online marketplace 🇵🇰</div>
    <p style="line-height:1.8;margin:16px 0">Shopping Hub is Pakistan's free classifieds platform where you can <b>buy and sell anything</b> — mobiles, cars, property, jobs and more. Posting ads is <b>100% FREE</b>!</p>
    <h3 style="margin:20px 0 10px">📢 Advertise With Us</h3>
    <p style="line-height:1.8;color:var(--muted)">Want to promote your brand or business on Shopping Hub? Contact us for banner ads and promotions:</p>
    <div style="display:grid;gap:10px;margin-top:14px">
      <a class="btn btn-teal" style="text-decoration:none;text-align:center" href="tel:${CONTACT.phone}">📞 ${CONTACT.phoneLabel}</a>
      <a class="btn" style="text-decoration:none;text-align:center;background:#25D366;border-color:#25D366;color:#fff" href="https://wa.me/${CONTACT.whatsapp}" target="_blank">💬 WhatsApp</a>
      <a class="btn" style="text-decoration:none;text-align:center" href="${CONTACT.facebook}" target="_blank">📘 Facebook</a>
      <a class="btn" style="text-decoration:none;text-align:center" href="${CONTACT.tiktok}" target="_blank">🎵 TikTok</a>
    </div>
    <h3 style="margin:20px 0 10px">🛡️ Safety</h3>
    <p style="line-height:1.8;color:var(--muted)">Always meet in public places, inspect items before paying, and never pay in advance.</p>
  </div>`;
  window.scrollTo(0, 0);
}
function showAccount() {
  if (state.user) {
    state.view = 'account';
    document.getElementById('main').innerHTML = `<div class="form-card"><h2>👤 My Account</h2>
      <p style="text-align:center;margin:14px 0"><b>${esc(state.user.name)}</b><br><span style="color:var(--muted)">${esc(state.user.email)}</span></p>
      <button class="btn" onclick="showMyAds()">📋 My Ads</button>
      <button class="btn" onclick="logout()" style="margin-top:10px;border-color:#c62828;color:#c62828">🚪 Logout</button></div>`;
  } else showAuth('login');
  window.scrollTo(0, 0);
}
async function showHome() {
  state.view = 'home';
  document.querySelectorAll('.bnav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('bn-home').classList.add('active');
  document.getElementById('main').innerHTML = `
    <div class="toptabs">
      <button class="toptab active" onclick="goHome()">🛍️ Shopping Hub</button>
      <button class="toptab" onclick="setGroup('Vehicles')">🚗 Motors</button>
      <button class="toptab" onclick="setGroup('Property')">🏠 Property</button>
    </div>
    <div class="locbar">📍 <select onchange="filterCity(this.value)"><option value="">All Pakistan</option>${state.cities.map(c => `<option ${state.filters.city === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
      <button class="btn" onclick="showFavs()" style="padding:8px 14px;font-size:13px">❤️ Favorites</button></div>
    <div class="filters">
      <input type="number" id="fMin" placeholder="Min price" value="${state.filters.min || ''}" style="padding:10px;border:2px solid var(--ink);border-radius:8px;width:130px;font-family:inherit">
      <input type="number" id="fMax" placeholder="Max price" value="${state.filters.max || ''}" style="padding:10px;border:2px solid var(--ink);border-radius:8px;width:130px;font-family:inherit">
      <button class="btn btn-solid" onclick="filterPrice()" style="padding:10px 18px">Apply</button>
      <select onchange="sortBy(this.value)" style="padding:10px 14px;border:2px solid var(--ink);border-radius:8px;font-family:inherit;font-weight:600;background:#fff;cursor:pointer">
        <option value="">Sort: Newest</option>
        <option value="plh" ${state.filters.sort === 'plh' ? 'selected' : ''}>Price: Low to High</option>
        <option value="phl" ${state.filters.sort === 'phl' ? 'selected' : ''}>Price: High to Low</option>
      </select>
    </div>
    <div class="catgrid">${state.categories.map(g => `<button class="catcell" onclick="setGroup('${g.name}')"><span class="cico">${g.icon}</span><span class="clbl">${g.name}</span></button>`).join('')}</div>
    <h2 class="section">Fresh recommendations</h2>
    <div class="grid" id="grid"><div class="empty"><span class="big">⏳</span>Loading...</div></div>`;
  loadListings();
}

function filterCity(v) { state.filters.city = v; loadListings(); }
function sortBy(v) { state.filters.sort = v; loadListings(); }
function filterPrice() {
  state.filters.min = document.getElementById('fMin').value;
  state.filters.max = document.getElementById('fMax').value;
  loadListings();
}

async function loadListings() {
  const p = new URLSearchParams();
  if (state.filters.q) p.set('q', state.filters.q);
  if (state.filters.category) p.set('category', state.filters.category);
  if (state.filters.city) p.set('city', state.filters.city);
  if (state.filters.min) p.set('min', state.filters.min);
  if (state.filters.max) p.set('max', state.filters.max);
  if (state.filters.sort) p.set('sort', state.filters.sort);
  const list = await api('/api/listings?' + p);
  state.listings = list;
  const g = document.getElementById('grid');
  if (!g) return;
  g.innerHTML = list.length ? list.map(cardHTML).join('') : `<div class="empty"><span class="big">📭</span>No ads yet — be the first to post! 🎉</div>`;
}

function fmtPrice(p) {
  p = Number(p);
  if (p >= 10000000) return 'Rs ' + (p / 10000000).toFixed(2).replace(/\.00$/, '') + ' Crore';
  if (p >= 100000) return 'Rs ' + (p / 100000).toFixed(2).replace(/\.00$/, '') + ' Lac';
  return 'Rs ' + p.toLocaleString();
}
function cardHTML(l) {
  const img = l.images && l.images[0] ? `<img src="${l.images[0]}" loading="lazy">` : `<div class="noimg">📦</div>`;
  const fav = isFav(l.id) ? '❤️' : '🤍';
  const badge = l.seller_type === 'Dealer' ? `<span class="sbadge dealer">🏪 Dealer</span>` : `<span class="sbadge owner">👤 Owner</span>`;
  const condTag = l.cond === 'New' ? `<span class="sbadge newc">✨ New</span>` : '';
  return `<div class="card" onclick="showDetail(${l.id})"><button class="favbtn" onclick="event.stopPropagation();toggleFav(${l.id})">${fav}</button>${img}
    <div class="card-body"><div style="display:flex;gap:5px;margin-bottom:7px;flex-wrap:wrap">${badge}${condTag}</div>
    <div class="card-price">${fmtPrice(l.price)}</div>
    <div class="card-title">${esc(l.title)}</div>
    <div class="card-meta"><span>📍 ${esc(l.city)}</span><span>${timeAgo(l.created_at)}</span></div></div></div>`;
}
function getFavs() { try { return JSON.parse(localStorage.getItem('sh_favs') || '[]'); } catch { return []; } }
function isFav(id) { return getFavs().includes(id); }
function toggleFav(id) {
  let f = getFavs();
  f = f.includes(id) ? f.filter(x => x !== id) : [...f, id];
  localStorage.setItem('sh_favs', JSON.stringify(f));
  if (state.view === 'home') loadListings();
  else if (state.view === 'favs') showFavs();
  else showDetail(id);
}
function showFavs() {
  state.view = 'favs';
  const favs = state.listings.filter(l => isFav(l.id));
  document.getElementById('main').innerHTML = `<h2 class="section">❤️ My Favorites</h2>
    <div class="grid">${favs.length ? favs.map(cardHTML).join('') : `<div class="empty"><span class="big">🤍</span>No favorites yet.<br>Tap the heart on any ad to save it here!</div>`}</div>`;
  window.scrollTo(0, 0);
}

async function showDetail(id) {
  const l = await api('/api/listings/' + id);
  const imgs = (l.images && l.images.length ? l.images : []);
  const gallery = imgs.length ? `
    <div class="galwrap"><img class="detail-img" id="galMain" src="${imgs[0]}">
    <button class="galbtn galprev" onclick="galMove(-1)">‹</button>
    <button class="galbtn galnext" onclick="galMove(1)">›</button>
    <div class="galcount" id="galCount">1/${imgs.length}</div></div>
    <div class="galthumbs">${imgs.map((s, i) => `<img src="${s}" class="${i === 0 ? 'on' : ''}" onclick="galGo(${i})">`).join('')}</div>`
    : `<div class="noimg" style="height:300px;border:2px solid var(--line);border-radius:18px">📦</div>`;
  window._galImgs = imgs; window._galIdx = 0;
  document.getElementById('main').innerHTML = `
    <div class="crumbs"><a onclick="goHome()">Home</a> / <a onclick="setCat('${esc(l.category)}')">${esc(l.category)}</a> / ${esc(l.title).slice(0, 30)}...</div>
    <div class="detail"><div>${gallery}
      <div class="form-card" style="max-width:none;margin-top:16px"><h3>📝 Description</h3><p style="margin-top:8px;white-space:pre-wrap">${esc(l.description || 'No description provided.')}</p></div>
    </div>
    <div class="detail-info">
      <span class="tag">${catIcon(l.category)} ${esc(l.category)}</span>
      <div class="detail-price">${fmtPrice(l.price)}</div>
      <div class="detail-title">${esc(l.title)}</div>
      <div class="detail-meta">📍 ${esc(l.city)}${l.area ? ', ' + esc(l.area) : ''}</div>
      <div class="detail-meta">🕒 ${timeAgo(l.created_at)}</div>
      <div class="detail-meta">🔖 Ad ID: ${l.id}</div>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="btn" onclick="shareAd()" style="flex:1">🔗 Share</button>
        <button class="btn" onclick="reportAd(${l.id})" style="flex:1">🚩 Report</button>
      </div>
      <div class="seller-box"><h3>🤝 Meet the Seller</h3>
        <div class="detail-meta">👤 ${esc(l.seller_name)} ${l.seller_type === 'Dealer' ? '<span class="sbadge dealer">🏪 Verified Dealer</span>' : '<span class="sbadge owner">👤 Direct Owner</span>'}</div>
        <div class="detail-meta">📦 Condition: <b>${esc(l.cond || 'Used')}</b></div>
        ${(l.phone || l.seller_phone) ? `<button class="btn btn-teal" id="phoneBtn" onclick="showPhone('${esc(l.phone || l.seller_phone)}')" style="width:100%;margin-top:8px">📞 Show Phone Number</button><div class="detail-meta" id="phoneNum" style="display:none;font-size:20px;font-weight:800;margin-top:10px;text-align:center"></div>
        <a class="btn" style="width:100%;margin-top:8px;background:#25D366;border-color:#25D366;color:#fff;text-decoration:none;text-align:center;display:block" href="https://wa.me/92${esc((l.phone || l.seller_phone).replace(/\D/g, '').replace(/^0/, ''))}" target="_blank">💬 WhatsApp</a>` : ''}
        <button class="btn" onclick="toggleFav(${l.id});event.stopPropagation()" style="width:100%;margin-top:10px">${isFav(l.id) ? '❤️ Saved in Favorites' : '🤍 Add to Favorites'}</button>
      </div>
      <div class="safety-box"><h3>🛡️ Safety Tips</h3><ul>
        <li>Meet in a public place</li>
        <li>Check the item before paying</li>
        <li>Never pay in advance</li>
      </ul></div>
    </div></div>
    <h2 class="section">Related ads</h2>
    <div class="grid">${state.listings.filter(x => x.id !== l.id && x.category === l.category).slice(0, 4).map(cardHTML).join('') || '<div class="empty">No related ads yet.</div>'}</div>`;
  window.scrollTo(0, 0);
}
function showPhone(p) {
  document.getElementById('phoneNum').textContent = '📞 ' + p;
  document.getElementById('phoneNum').style.display = 'block';
  document.getElementById('phoneBtn').style.display = 'none';
}
function galGo(i) {
  const n = window._galImgs.length;
  window._galIdx = ((i % n) + n) % n;
  document.getElementById('galMain').src = window._galImgs[window._galIdx];
  document.getElementById('galCount').textContent = (window._galIdx + 1) + '/' + n;
  document.querySelectorAll('.galthumbs img').forEach((t, j) => t.classList.toggle('on', j === window._galIdx));
}
function galMove(d) { galGo(window._galIdx + d); }
function shareAd() {
  const url = location.href;
  if (navigator.share) navigator.share({ title: document.title, url }).catch(() => {});
  else { navigator.clipboard.writeText(url).then(() => alert('Link copied! 🔗')); }
}
function reportAd(id) {
  if (confirm('Report this ad as inappropriate?')) alert('Thanks! We will review ad #' + id + '. 🛡️');
}

/* ---- Auth with Login/Signup tabs ---- */
function showAuth(tab) {
  state.authTab = tab || 'login';
  const t = state.authTab;
  const loginForm = `
    <label>Email</label><input id="liEmail" type="email" placeholder="you@email.com">
    <label>Password</label><input id="liPass" type="password" placeholder="••••••">
    <div class="err" id="liErr"></div>
    <button class="btn btn-solid" onclick="doLogin()">🔐 Login</button>
    <div class="form-link"><a onclick="showForgot()">Forgot password? 🔑</a></div>
    <div style="text-align:center;margin:14px 0;color:var(--muted)">— or —</div>
    <button class="btn" onclick="signInWithGoogle()" style="background:#fff">🔵 Continue with Google</button>`;
  const signupForm = `
    <label>Full Name</label><input id="suName" placeholder="Your name">
    <label>Email</label><input id="suEmail" type="email" placeholder="you@email.com">
    <label>Phone</label><input id="suPhone" placeholder="03xx-xxxxxxx">
    <label>Password</label><input id="suPass" type="password" placeholder="Choose a password">
    <div class="err" id="suErr"></div>
    <button class="btn btn-teal" onclick="doSignup()">🚀 Create Free Account</button>
    <div style="text-align:center;margin:14px 0;color:var(--muted)">— or —</div>
    <button class="btn" onclick="signInWithGoogle()" style="background:#fff">🔵 Sign up with Google</button>`;
  document.getElementById('main').innerHTML = `
  <div class="form-card">
    <h2>Welcome to Shopping Hub! 🛍️</h2>
    <div class="form-sub">Login or create a free account to start selling</div>
    <div class="auth-switch">
      <button class="${t === 'login' ? 'on' : ''}" onclick="showAuth('login')">🔐 Login</button>
      <button class="${t === 'signup' ? 'on' : ''}" onclick="showAuth('signup')">📝 Sign Up</button>
    </div>
    ${t === 'login' ? loginForm : signupForm}
  </div>`;
  window.scrollTo(0, 0);
}
const phoneForm = `
  <div id="phoneStep1">
    <label>Mobile Number</label>
    <div style="display:flex;gap:8px"><input value="+92" disabled style="width:60px;text-align:center"><input id="phNum" placeholder="3001234567" inputmode="numeric" style="flex:1"></div>
    <div id="recaptcha-box" style="margin:12px 0"></div>
    <div class="err" id="phErr"></div>
    <button class="btn btn-teal" onclick="sendPhoneOtp()">📲 Send OTP via SMS</button>
  </div>
  <div id="phoneStep2" style="display:none">
    <label>SMS Code *</label><input id="phOtp" placeholder="6-digit SMS code" maxlength="6" inputmode="numeric">
    <label>Your Name</label><input id="phName" placeholder="Your name">
    <div class="err" id="phErr2"></div>
    <button class="btn btn-teal" onclick="verifyPhoneOtp()">✅ Verify & Login</button>
    <div class="form-link"><a onclick="document.getElementById('phoneStep2').style.display='none';document.getElementById('phoneStep1').style.display='block'">← Change number</a></div>
  </div>`;
function showLogin() { showAuth('login'); }
function showSignup() { showAuth('signup'); }

async function doLogin() {
  try {
    const d = await api('/api/login', { method: 'POST', body: JSON.stringify({ email: v('liEmail'), password: v('liPass') }) });
    state.user = { name: d.name }; renderUserArea(); showHome();
  } catch (e) { document.getElementById('liErr').textContent = e.message; }
}

async function doSignup() {
  try {
    const d = await api('/api/signup', { method: 'POST', body: JSON.stringify({ name: v('suName'), email: v('suEmail'), password: v('suPass'), phone: v('suPhone') }) });
    state.user = { name: d.name }; renderUserArea(); showHome();
  } catch (e) { document.getElementById('suErr').textContent = e.message; }
}

function showForgot() {
  document.getElementById('main').innerHTML = `
  <div class="form-card">
    <h2>🔑 Forgot Password</h2>
    <div class="form-sub">Verify your phone via SMS, then set a new password</div>
    <div id="fpStep1">
      <label>Mobile Number</label>
      <div style="display:flex;gap:8px"><input value="+92" disabled style="width:60px;text-align:center"><input id="fpNum" placeholder="3001234567" inputmode="numeric" style="flex:1"></div>
      <div id="recaptcha-fp" style="margin:12px 0"></div>
      <div class="err" id="fpErr"></div>
      <button class="btn btn-teal" onclick="sendFpOtp()">📲 Send SMS Code</button>
    </div>
    <div id="fpStep2" style="display:none">
      <label>SMS Code *</label><input id="fpOtp" placeholder="6-digit SMS code" maxlength="6" inputmode="numeric">
      <label>New Password</label><input id="fpPass" type="password" placeholder="New password (min 6 chars)">
      <div class="err" id="fpErr2"></div>
      <button class="btn btn-solid" onclick="doFpReset()">✅ Reset Password</button>
    </div>
    <div class="form-link"><a onclick="showAuth('login')">← Back to Login</a></div>
  </div>`;
  window.scrollTo(0, 0);
  initFpRecaptcha();
}

let _fpConfirm = null;
function initFpRecaptcha() {
  if (!FIREBASE_READY) { document.getElementById('fpErr').textContent = 'Phone reset not configured yet.'; return; }
  try {
    _fbApp = firebase.apps.length ? firebase.app() : firebase.initializeApp(FIREBASE_CONFIG);
    window._recaptchaFp = new firebase.auth.RecaptchaVerifier('recaptcha-fp', { size: 'normal' });
  } catch (e) { document.getElementById('fpErr').textContent = 'Init failed: ' + e.message; }
}
async function sendFpOtp() {
  const num = '+92' + v('fpNum').replace(/\D/g, '').replace(/^0/, '');
  if (num.length < 13) { document.getElementById('fpErr').textContent = 'Enter a valid mobile number'; return; }
  try {
    _fpConfirm = await _fbApp.auth().signInWithPhoneNumber(num, window._recaptchaFp);
    document.getElementById('fpStep1').style.display = 'none';
    document.getElementById('fpStep2').style.display = 'block';
  } catch (e) { document.getElementById('fpErr').textContent = e.message; }
}
async function doFpReset() {
  try {
    const cred = await _fpConfirm.confirm(v('fpOtp'));
    const token = await cred.user.getIdToken();
    await api('/api/auth/reset-password-phone', { method: 'POST', body: JSON.stringify({ token, newPassword: v('fpPass') }) });
    alert('Password reset! Please login ✅');
    showAuth('login');
  } catch (e) { document.getElementById('fpErr2').textContent = e.message || 'Reset failed'; }
}

// ===== Phone OTP via Firebase =====
let _fbApp = null, _fbConfirm = null;
function fbApp() {
  if (!FIREBASE_READY) return null;
  return firebase.apps.length ? firebase.app() : firebase.initializeApp(FIREBASE_CONFIG);
}
async function signInWithGoogle() {
  if (!FIREBASE_READY) return alert('Google login not configured yet. Please use email signup.');
  try {
    const app = fbApp();
    const provider = new firebase.auth.GoogleAuthProvider();
    const cred = await app.auth().signInWithPopup(provider);
    const token = await cred.user.getIdToken();
    const d = await api('/api/auth/google', { method: 'POST', body: JSON.stringify({ token }) });
    state.user = { name: d.name }; renderUserArea(); showHome();
  } catch (e) { alert('Google sign-in failed: ' + (e.message || e)); }
}
function initPhoneAuth() {
  if (!FIREBASE_READY) {
    document.getElementById('phErr').textContent = 'Phone login not configured yet. Please use email.';
    return;
  }
  try {
    _fbApp = firebase.apps.length ? firebase.app() : firebase.initializeApp(FIREBASE_CONFIG);
    window._recaptcha = new firebase.auth.RecaptchaVerifier('recaptcha-box', { size: 'normal' });
  } catch (e) { document.getElementById('phErr').textContent = 'Phone auth init failed: ' + e.message; }
}
async function sendPhoneOtp() {
  const num = '+92' + v('phNum').replace(/\D/g, '').replace(/^0/, '');
  if (num.length < 13) { document.getElementById('phErr').textContent = 'Enter a valid mobile number'; return; }
  try {
    _fbConfirm = await _fbApp.auth().signInWithPhoneNumber(num, window._recaptcha);
    document.getElementById('phoneStep1').style.display = 'none';
    document.getElementById('phoneStep2').style.display = 'block';
  } catch (e) { document.getElementById('phErr').textContent = e.message; }
}
async function verifyPhoneOtp() {
  try {
    const cred = await _fbConfirm.confirm(v('phOtp'));
    const token = await cred.user.getIdToken();
    const d = await api('/api/auth/phone', { method: 'POST', body: JSON.stringify({ token, name: v('phName') }) });
    state.user = { name: d.name }; renderUserArea(); showHome();
  } catch (e) { document.getElementById('phErr2').textContent = e.message || 'Wrong code'; }
}

async function logout() { await api('/api/logout', { method: 'POST' }); state.user = null; renderUserArea(); showHome(); }

function showChooseCat(sub) {
  state.view = 'choosecat';
  let body;
  if (!sub) {
    body = `<h2 style="margin:16px 0">📢 What are you selling?</h2>
      <div class="catgrid">${state.categories.map((g, i) => `<button class="catcell" onclick="showChooseCat(${i})"><span class="cico">${g.icon}</span><span class="clbl">${g.name}</span></button>`).join('')}</div>`;
  } else {
    const grp = state.categories[Number(sub)];
    if (!grp) return showChooseCat();
    body = `<div class="crumbs"><a onclick="showChooseCat()">← Categories</a> / ${grp.icon} ${grp.name}</div>
      <h2 style="margin:16px 0">${grp.icon} ${grp.name}</h2>
      <div class="catgrid">${grp.subs.map((s, si) => `<button class="catcell" onclick="showPostAdByIdx(${Number(sub)},${si})"><span class="cico">${catIcon(s)}</span><span class="clbl">${s}</span></button>`).join('')}</div>`;
  }
  document.getElementById('main').innerHTML = `<div style="max-width:640px;margin:0 auto">${body}</div>`;
  window.scrollTo(0, 0);
}
function showPostAdByIdx(gi, si) {
  const grp = state.categories[gi];
  if (grp && grp.subs[si]) showPostAd(grp.subs[si]);
}
function showPostAd(preCat) {
  if (!state.user) { showAuth('signup'); return; }
  // Step 1: choose category first (like OLX)
  if (!preCat) return showChooseCat();
  document.getElementById('main').innerHTML = `
  <div class="form-card"><h2>📢 Post Your Ad</h2>
    <div class="form-sub">It's FREE and takes 1 minute!</div>
    <label>Title *</label><input id="adTitle" placeholder="e.g. iPhone 13 Pro Max — urgent sale">
    <label>Price (Rs) *</label><input id="adPrice" type="number" placeholder="e.g. 250000">
    <label>Category *</label><select id="adCatGroup" onchange="onCatGroupChange()">${state.categories.map(g => `<option value="${g.name}">${g.icon} ${g.name}</option>`).join('')}</select>
    <label>Subcategory *</label><select id="adCat" onchange="onCatChange()"></select>
    <div id="mobilePicker" style="display:none">
      <label>Brand *</label><select id="adBrand" onchange="onBrandChange()"><option value="">-- Select Brand --</option>${Object.keys(MOBILE_BRANDS).map(b => `<option>${b}</option>`).join('')}</select>
      <label>Model *</label><select id="adModel" onchange="onModelChange()"><option value="">-- Select Model --</option></select>
    </div>
    <label>City *</label><select id="adCity">${state.cities.map(c => `<option>${c}</option>`).join('')}</select>
    <label>Condition</label><select id="adCond"><option>Used</option><option>New</option></select>
    <label>You are</label><select id="adSellerType"><option value="Owner">Direct Owner 👤</option><option value="Dealer">Dealer 🏪</option></select>
    <label>Area</label><input id="adArea" placeholder="e.g. DHA Phase 5">
    <label>Phone</label><input id="adPhone" placeholder="03xx-xxxxxxx">
    <label>Description</label><textarea id="adDesc" placeholder="Condition, features, reason for selling..."></textarea>
    <label>Photos (max 5)</label><input id="adImgs" type="file" accept="image/*" multiple>
    <div class="err" id="adErr"></div>
    <button class="btn btn-sell" onclick="doPostAd()">🚀 Publish Ad</button>
  </div>`;
  window.scrollTo(0, 0);
  // Pre-select the chosen category
  if (preCat) {
    for (const g of state.categories) {
      if (g.subs.includes(preCat)) {
        document.getElementById('adCatGroup').value = g.name;
        break;
      }
    }
  }
  onCatGroupChange();
  if (preCat) document.getElementById('adCat').value = preCat;
  onCatChange();
}

function onCatGroupChange() {
  const g = state.categories.find(x => x.name === document.getElementById('adCatGroup').value);
  document.getElementById('adCat').innerHTML = g ? g.subs.map(s => `<option>${s}</option>`).join('') : '';
  onCatChange();
}
function onCatChange() {
  const show = document.getElementById('adCat').value === 'Mobiles';
  document.getElementById('mobilePicker').style.display = show ? 'block' : 'none';
}
function onBrandChange() {
  const b = document.getElementById('adBrand').value;
  const m = document.getElementById('adModel');
  m.innerHTML = '<option value="">-- Select Model --</option>' + ((MOBILE_BRANDS[b] || []).map(x => `<option>${x}</option>`).join(''));
}
function onModelChange() {
  const b = document.getElementById('adBrand').value, m = document.getElementById('adModel').value;
  if (b && m) document.getElementById('adTitle').value = b + ' ' + m;
}
async function doPostAd() {
  if (document.getElementById('adCat').value === 'Mobiles') {
    if (!document.getElementById('adBrand').value) return alert('Please select a brand 📱');
    if (!document.getElementById('adModel').value) return alert('Please select a model 📱');
  }
  const fd = new FormData();
  fd.append('title', v('adTitle')); fd.append('price', v('adPrice'));
  fd.append('category', v('adCat')); fd.append('city', v('adCity'));
  fd.append('area', v('adArea')); fd.append('phone', v('adPhone')); fd.append('description', v('adDesc'));
  fd.append('cond', v('adCond')); fd.append('seller_type', v('adSellerType'));
  for (const f of document.getElementById('adImgs').files) fd.append('images', f);
  try {
    const r = await fetch('/api/listings', { method: 'POST', body: fd });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    showDetail(d.id);
  } catch (e) { document.getElementById('adErr').textContent = e.message; }
}

async function showMyAds() {
  const list = await api('/api/listings?mine=1');
  document.getElementById('main').innerHTML = `
    <h2 class="section">My Ads (${list.length})</h2>
    ${list.length ? list.map(l => `<div class="myad-row">
      <div><b>${esc(l.title)}</b><br><span style="color:var(--muted);font-size:13px">${fmtPrice(l.price)} • 📍 ${esc(l.city)}</span></div>
      <div><button class="btn" onclick="showDetail(${l.id})" style="margin-right:8px">View</button>
      <button class="del-btn" onclick="delAd(${l.id})">Delete</button></div></div>`).join('')
    : `<div class="empty"><span class="big">📭</span>You have no ads yet.<br><a onclick="showPostAd()" style="cursor:pointer;color:var(--teal-d);font-weight:700">Post your first ad now! 🚀</a></div>`}`;
}

async function delAd(id) {
  if (!confirm('Delete this ad?')) return;
  await api('/api/listings/' + id, { method: 'DELETE' });
  showMyAds();
}

function v(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function timeAgo(d) {
  const s = (Date.now() - new Date(d + 'Z').getTime()) / 1000;
  if (s < 3600) return Math.max(1, Math.floor(s / 60)) + ' min ago';
  if (s < 86400) return Math.floor(s / 3600) + ' hours ago';
  return Math.floor(s / 86400) + ' days ago';
}

document.getElementById('searchInput').addEventListener('keypress', e => { if (e.key === 'Enter') doSearch(); });
if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(() => {}); }
init();
