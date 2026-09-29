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
  const icons = {
    'Mobiles': '📱', 'Tablets': '📲', 'Mobile Accessories': '🎧',
    'Cars': '🚗', 'Cars Accessories': '🔧', 'Spare Parts': '⚙️',
    'Buses, Vans & Trucks': '🚌', 'Rickshaw & Chingchi': '🛺', 'Boats': '⛵',
    'Motorcycles': '🏍️', 'Scooters': '🛵', 'Bicycles': '🚲',
    'Property for Sale': '🏠', 'Property for Rent': '🏘️',
    'Electronics': '💻', 'Home Appliances': '🧺', 'Computers & Laptops': '💻',
    'TV & Audio': '📺', 'Cameras': '📷',
    'Furniture & Home Decor': '🛋️', 'Fashion & Beauty': '💄',
    'Clothes': '👗', 'Watches & Jewelry': '⌚',
    'Animals': '🐾', 'Dogs & Cats': '🐱', 'Birds & Hens': '🐔',
    'Jobs': '💼', 'Services': '🛠️',
    'Business & Industrial': '🏭', 'Agriculture': '🌾',
    'Books, Sports & Hobbies': '📚', 'Kids & Babies': '🧸'
  };
  return icons[c] || '📦';
}

function setCat(c) { state.filters.category = c; renderCats(); loadListings(); }
function goHome() { state.filters = {}; document.getElementById('searchInput').value = ''; renderCats(); showHome(); }
function doSearch() { state.filters.q = document.getElementById('searchInput').value.trim(); loadListings(); }

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
  const mainCats = [['Mobiles','Mobiles'],['Vehicles','Cars'],['Property For Sale','Property for Sale'],['Property For Rent','Property for Rent'],['Services','Services'],['Jobs','Jobs'],['Animals','Animals'],['Furniture & Home','Furniture & Home Decor']];
  document.getElementById('main').innerHTML = `
    <div class="locbar">📍 <select onchange="filterCity(this.value)"><option value="">All Pakistan</option>${state.cities.map(c => `<option ${state.filters.city === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
      <button class="btn" onclick="showFavs()" style="padding:8px 14px;font-size:13px">❤️ Favorites</button></div>
    <div class="filters">
      <input type="number" id="fMin" placeholder="Min price" value="${state.filters.min || ''}" style="padding:10px;border:2px solid var(--ink);border-radius:8px;width:130px;font-family:inherit">
      <input type="number" id="fMax" placeholder="Max price" value="${state.filters.max || ''}" style="padding:10px;border:2px solid var(--ink);border-radius:8px;width:130px;font-family:inherit">
      <button class="btn btn-solid" onclick="filterPrice()" style="padding:10px 18px">Apply</button>
    </div>
    <div class="catgrid">${mainCats.map(([lbl, c]) => `<button class="catcell" onclick="setCat('${c}')"><span class="cico">${catIcon(c)}</span><span class="clbl">${lbl}</span></button>`).join('')}</div>
    <h2 class="section">Fresh recommendations</h2>
    <div class="grid" id="grid"><div class="empty"><span class="big">⏳</span>Loading...</div></div>`;
  loadListings();
}

function filterCity(v) { state.filters.city = v; loadListings(); }
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
  return `<div class="card" onclick="showDetail(${l.id})"><button class="favbtn" onclick="event.stopPropagation();toggleFav(${l.id})">${fav}</button>${img}
    <div class="card-body"><span class="tag">${catIcon(l.category)} ${esc(l.category)}</span>
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
  const img = l.images && l.images[0] ? `<img class="detail-img" src="${l.images[0]}">` : `<div class="noimg" style="height:300px;border:2px solid var(--line);border-radius:18px">📦</div>`;
  document.getElementById('main').innerHTML = `
    <button class="btn" onclick="showHome()" style="margin-bottom:16px">← Back to bazaar</button>
    <div class="detail"><div>${img}
      <div class="form-card" style="max-width:none;margin-top:16px"><h3>📝 Description</h3><p style="margin-top:8px;white-space:pre-wrap">${esc(l.description || 'No description provided.')}</p></div>
    </div>
    <div class="detail-info">
      <span class="tag">${catIcon(l.category)} ${esc(l.category)}</span>
      <div class="detail-price">${fmtPrice(l.price)}</div>
      <div class="detail-title">${esc(l.title)}</div>
      <div class="detail-meta">📍 ${esc(l.city)}${l.area ? ', ' + esc(l.area) : ''}</div>
      <div class="detail-meta">🕒 ${timeAgo(l.created_at)}</div>
      <div class="seller-box"><h3>🤝 Meet the Seller</h3>
        <div class="detail-meta">👤 ${esc(l.seller_name)}</div>
        ${(l.phone || l.seller_phone) ? `<button class="btn btn-teal" id="phoneBtn" onclick="showPhone('${esc(l.phone || l.seller_phone)}')" style="width:100%;margin-top:8px">📞 Show Phone Number</button><div class="detail-meta" id="phoneNum" style="display:none;font-size:20px;font-weight:800;margin-top:10px;text-align:center"></div>` : ''}
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
    <label>Category *</label><select id="adCat" onchange="onCatChange()">${state.categories.map(c => `<option>${c}</option>`).join('')}</select>
    <div id="mobilePicker" style="display:none">
      <label>Brand *</label><select id="adBrand" onchange="onBrandChange()"><option value="">-- Select Brand --</option>${Object.keys(MOBILE_BRANDS).map(b => `<option>${b}</option>`).join('')}</select>
      <label>Model *</label><select id="adModel" onchange="onModelChange()"><option value="">-- Select Model --</option></select>
    </div>
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
