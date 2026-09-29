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
  el.innerHTML = `<button class="${!state.filters.category ? 'active' : ''}" onclick="setCat('')">🌍 All</button>` +
    state.categories.map(c => `<button class="${state.filters.category === c ? 'active' : ''}" onclick="setCat('${c}')">${catIcon(c)} ${c}</button>`).join('');
}

function catIcon(c) {
  return { 'Mobiles': '📱', 'Vehicles': '🚗', 'Electronics': '💻', 'Home & Furniture': '🛋️', 'Fashion': '👗', 'Property': '🏠', 'Jobs': '💼', 'Services': '🔧', 'Animals': '🐾', 'Books & Hobbies': '📚' }[c] || '📦';
}

function setCat(c) { state.filters.category = c; renderCats(); loadListings(); }
function goHome() { state.filters = {}; document.getElementById('searchInput').value = ''; renderCats(); showHome(); }
function doSearch() { state.filters.q = document.getElementById('searchInput').value.trim(); loadListings(); }

async function showHome() {
  state.view = 'home';
  document.getElementById('main').innerHTML = `
    <div class="hero">
      <h1>Buy and sell <span class="hl">for free</span> anywhere in Pakistan</h1>
      <p>From mobiles to cars to furniture — find amazing deals near you. 🇵🇰</p>
      <div class="hero-cta">
        <button class="btn btn-sell" onclick="showPostAd()">+ SELL NOW</button>
      </div>
    </div>
    <div class="filters">
      <select id="fCity" onchange="filterCity(this.value)"><option value="">📍 All Pakistan</option>${state.cities.map(c => `<option ${state.filters.city === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
    </div>
    <h2 class="section">Fresh recommendations</h2>
    <div class="grid" id="grid"><div class="empty"><span class="big">⏳</span>Loading...</div></div>`;
  loadListings();
}

function filterCity(v) { state.filters.city = v; loadListings(); }

async function loadListings() {
  const p = new URLSearchParams();
  if (state.filters.q) p.set('q', state.filters.q);
  if (state.filters.category) p.set('category', state.filters.category);
  if (state.filters.city) p.set('city', state.filters.city);
  const list = await api('/api/listings?' + p);
  state.listings = list;
  const g = document.getElementById('grid');
  if (!g) return;
  g.innerHTML = list.length ? list.map(cardHTML).join('') : `<div class="empty"><span class="big">📭</span>No ads yet — be the first to post! 🎉</div>`;
}

function cardHTML(l) {
  const img = l.images && l.images[0] ? `<img src="${l.images[0]}" loading="lazy">` : `<div class="noimg">📦</div>`;
  return `<div class="card" onclick="showDetail(${l.id})">${img}
    <div class="card-body"><span class="tag">${catIcon(l.category)} ${esc(l.category)}</span>
    <div class="card-price">Rs ${Number(l.price).toLocaleString()}</div>
    <div class="card-title">${esc(l.title)}</div>
    <div class="card-meta"><span>📍 ${esc(l.city)}</span><span>${timeAgo(l.created_at)}</span></div></div></div>`;
}

async function showDetail(id) {
  const l = await api('/api/listings/' + id);
  const img = l.images && l.images[0] ? `<img class="detail-img" src="${l.images[0]}">` : `<div class="noimg" style="height:300px;border:2px solid var(--line);border-radius:18px">📦</div>`;
  document.getElementById('main').innerHTML = `
    <button class="btn" onclick="showHome()" style="margin-bottom:16px">← Back to bazaar</button>
    <div class="detail"><div>${img}
      <div class="form-card" style="max-width:none;margin-top:16px"><h3>📝 Description</h3><p style="margin-top:8px;white-space:pre-wrap">${esc(l.description || 'No description provided.')}</p></div>
    </div>
    <div class="detail-info">
      <span class="tag">${catIcon(l.category)} ${esc(l.category)}</span>
      <div class="detail-price">Rs ${Number(l.price).toLocaleString()}</div>
      <div class="detail-title">${esc(l.title)}</div>
      <div class="detail-meta">📍 ${esc(l.city)}${l.area ? ', ' + esc(l.area) : ''}</div>
      <div class="detail-meta">🕒 ${timeAgo(l.created_at)}</div>
      <div class="seller-box"><h3>🤝 Meet the Seller</h3>
        <div class="detail-meta">👤 ${esc(l.seller_name)}</div>
        ${l.phone ? `<div class="detail-meta">📞 ${esc(l.phone)}</div>` : ''}
        ${l.seller_phone && l.seller_phone !== l.phone ? `<div class="detail-meta">📞 ${esc(l.seller_phone)}</div>` : ''}
      </div>
    </div></div>`;
  window.scrollTo(0, 0);
}

/* ---- Auth with Login/Signup tabs ---- */
function showAuth(tab) {
  state.authTab = tab || 'login';
  const t = state.authTab;
  const loginForm = `
    <label>Email</label><input id="liEmail" type="email" placeholder="you@email.com">
    <label>Password</label><input id="liPass" type="password" placeholder="••••••">
    <div class="err" id="liErr"></div>
    <button class="btn btn-solid" onclick="doLogin()">🔐 Login</button>`;
  const signupForm = `
    <label>Full Name</label><input id="suName" placeholder="Your name">
    <label>Email</label><input id="suEmail" type="email" placeholder="you@email.com">
    <label>Phone</label><input id="suPhone" placeholder="03xx-xxxxxxx">
    <label>Password</label><input id="suPass" type="password" placeholder="Choose a password">
    <div class="err" id="suErr"></div>
    <button class="btn btn-teal" onclick="doSignup()">🚀 Create Free Account</button>`;
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

async function logout() { await api('/api/logout', { method: 'POST' }); state.user = null; renderUserArea(); showHome(); }

function showPostAd() {
  if (!state.user) { showAuth('signup'); return; }
  document.getElementById('main').innerHTML = `
  <div class="form-card"><h2>📢 Post Your Ad</h2>
    <div class="form-sub">It's FREE and takes 1 minute!</div>
    <label>Title *</label><input id="adTitle" placeholder="e.g. iPhone 13 Pro Max — urgent sale">
    <label>Price (Rs) *</label><input id="adPrice" type="number" placeholder="e.g. 250000">
    <label>Category *</label><select id="adCat">${state.categories.map(c => `<option>${c}</option>`).join('')}</select>
    <label>City *</label><select id="adCity">${state.cities.map(c => `<option>${c}</option>`).join('')}</select>
    <label>Area</label><input id="adArea" placeholder="e.g. DHA Phase 5">
    <label>Phone</label><input id="adPhone" placeholder="03xx-xxxxxxx">
    <label>Description</label><textarea id="adDesc" placeholder="Condition, features, reason for selling..."></textarea>
    <label>Photos (max 5)</label><input id="adImgs" type="file" accept="image/*" multiple>
    <div class="err" id="adErr"></div>
    <button class="btn btn-sell" onclick="doPostAd()">🚀 Publish Ad</button>
  </div>`;
  window.scrollTo(0, 0);
}

async function doPostAd() {
  const fd = new FormData();
  fd.append('title', v('adTitle')); fd.append('price', v('adPrice'));
  fd.append('category', v('adCat')); fd.append('city', v('adCity'));
  fd.append('area', v('adArea')); fd.append('phone', v('adPhone')); fd.append('description', v('adDesc'));
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
      <div><b>${esc(l.title)}</b><br><span style="color:var(--muted);font-size:13px">Rs ${Number(l.price).toLocaleString()} • 📍 ${esc(l.city)}</span></div>
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
