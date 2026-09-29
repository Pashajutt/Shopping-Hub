const express = require('express');
const session = require('express-session');
const SqliteStore = require('./sqlite-store');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// --- Security: session secret must come from environment ---
if (IS_PROD && !process.env.SESSION_SECRET) {
  console.error('FATAL: SESSION_SECRET env var is required in production');
  process.exit(1);
}
const SESSION_SECRET = process.env.SESSION_SECRET || ('dev-only-' + Math.random().toString(36).slice(2));

// --- Security headers ---
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// --- Rate limiting for auth endpoints (brute-force protection) ---
const loginAttempts = new Map();
function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const rec = loginAttempts.get(ip) || { count: 0, reset: now + 15 * 60 * 1000 };
  if (now > rec.reset) { rec.count = 0; rec.reset = now + 15 * 60 * 1000; }
  rec.count++;
  loginAttempts.set(ip, rec);
  if (rec.count > 20) return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  next();
}

// --- Database ---
const db = new DatabaseSync(path.join(__dirname, 'shopping_hub.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    price INTEGER NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    city TEXT NOT NULL,
    area TEXT,
    phone TEXT,
    images TEXT DEFAULT '[]',
    status TEXT DEFAULT 'active',
    cond TEXT DEFAULT 'Used',
    seller_type TEXT DEFAULT 'Owner',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SESSION_SECRET,
  store: new SqliteStore(db),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000
  }
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Image uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  }
});

// --- Helpers ---
const requireLogin = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Login required' });
  next();
};

// --- Email OTP system ---
const nodemailer = require('nodemailer');
const otpStore = new Map(); // email -> { otp, expires, purpose, attempts }

function getMailer() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, '') },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000
  });
}

function makeOtp() { return String(Math.floor(100000 + Math.random() * 900000)); }

// Send OTP to email for signup or password reset
app.post('/api/auth/send-otp', rateLimit, async (req, res) => {
  const { email, purpose } = req.body;
  if (!email || !['signup', 'reset'].includes(purpose))
    return res.status(400).json({ error: 'Valid email and purpose required' });
  const em = email.trim().toLowerCase();
  if (purpose === 'signup') {
    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(em);
    if (exists) return res.status(400).json({ error: 'Email already registered. Please login.' });
  } else {
    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(em);
    if (!exists) return res.status(400).json({ error: 'No account found with this email.' });
  }
  const mailer = getMailer();
  if (!mailer) return res.status(500).json({ error: 'Email service not configured. Contact admin.' });
  const otp = makeOtp();
  otpStore.set(em + ':' + purpose, { otp, expires: Date.now() + 10 * 60 * 1000, attempts: 0 });
  const subject = purpose === 'signup' ? 'Shopping Hub — Verify your email' : 'Shopping Hub — Password reset code';
  try {
    await mailer.sendMail({
      from: `"Shopping Hub" <${process.env.GMAIL_USER}>`,
      to: em,
      subject,
      text: `Your Shopping Hub verification code is: ${otp}\n\nThis code expires in 10 minutes. If you didn't request this, please ignore.`
    });
    res.json({ ok: true, msg: 'OTP sent to your email' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to send OTP email' });
  }
});

// Verify OTP
function checkOtp(email, otp, purpose) {
  const key = email.trim().toLowerCase() + ':' + purpose;
  const rec = otpStore.get(key);
  if (!rec) return 'No OTP requested. Please send OTP first.';
  if (Date.now() > rec.expires) { otpStore.delete(key); return 'OTP expired. Please request a new one.'; }
  rec.attempts++;
  if (rec.attempts > 5) { otpStore.delete(key); return 'Too many wrong attempts. Request a new OTP.'; }
  if (rec.otp !== String(otp).trim()) return 'Wrong OTP. Try again.';
  otpStore.delete(key);
  return null;
}

// --- Auth API ---
app.post('/api/signup', rateLimit, (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
  try {
    const hash = bcrypt.hashSync(password, 10);
    const r = db.prepare('INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)')
      .run(name.trim(), email.trim().toLowerCase(), hash, phone || '');
    req.session.userId = Number(r.lastInsertRowid);
    req.session.userName = name.trim();
    res.json({ ok: true, name: name.trim() });
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) return res.status(400).json({ error: 'Email already registered' });
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Forgot password: reset with OTP
app.post('/api/auth/reset-password', rateLimit, (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ error: 'Email, OTP and new password required' });
  if (String(newPassword).length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  const err = checkOtp(email, otp, 'reset');
  if (err) return res.status(400).json({ error: err });
  const hash = bcrypt.hashSync(newPassword, 10);
  const r = db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hash, email.trim().toLowerCase());
  if (r.changes === 0) return res.status(400).json({ error: 'No account found' });
  res.json({ ok: true, msg: 'Password reset! Please login.' });
});

// Reset password via verified phone (Firebase SMS)
app.post('/api/auth/reset-password-phone', rateLimit, async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password required' });
  if (String(newPassword).length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  try {
    const certs = await getFbCerts();
    const decoded = jwt.decode(token, { complete: true });
    const kid = decoded && decoded.header && decoded.header.kid;
    if (!kid || !certs[kid]) return res.status(401).json({ error: 'Invalid token' });
    const projectId = process.env.FIREBASE_PROJECT_ID || '';
    const payload = jwt.verify(token, certs[kid], { algorithms: ['RS256'] });
    if (projectId && payload.aud !== projectId) return res.status(401).json({ error: 'Wrong project' });
    if (!payload.phone_number) return res.status(401).json({ error: 'No phone in token' });
    const hash = bcrypt.hashSync(newPassword, 10);
    const r = db.prepare('UPDATE users SET password = ? WHERE phone = ?').run(hash, payload.phone_number);
    if (r.changes === 0) return res.status(400).json({ error: 'No account found with this phone number' });
    res.json({ ok: true });
  } catch (e) {
    res.status(401).json({ error: 'Verification failed' });
  }
});
const jwt = require('jsonwebtoken');
let _fbCerts = null, _fbCertsAt = 0;
async function getFbCerts() {
  if (_fbCerts && Date.now() - _fbCertsAt < 3600e3) return _fbCerts;
  const r = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
  _fbCerts = await r.json(); _fbCertsAt = Date.now();
  return _fbCerts;
}
// Google sign-in via Firebase ID token
app.post('/api/auth/google', rateLimit, async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token required' });
  try {
    const certs = await getFbCerts();
    const decoded = jwt.decode(token, { complete: true });
    const kid = decoded && decoded.header && decoded.header.kid;
    if (!kid || !certs[kid]) return res.status(401).json({ error: 'Invalid token' });
    const projectId = process.env.FIREBASE_PROJECT_ID || '';
    const payload = jwt.verify(token, certs[kid], { algorithms: ['RS256'] });
    if (projectId && payload.aud !== projectId) return res.status(401).json({ error: 'Wrong project' });
    if (!payload.email) return res.status(401).json({ error: 'No email in token' });
    const email = payload.email.toLowerCase();
    const nm = payload.name || email.split('@')[0];
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      const r = db.prepare('INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)')
        .run(nm, email, bcrypt.hashSync(Math.random().toString(36), 10), '');
      user = { id: Number(r.lastInsertRowid), name: nm };
    }
    req.session.userId = user.id;
    req.session.userName = user.name;
    res.json({ ok: true, name: user.name });
  } catch (e) {
    res.status(401).json({ error: 'Google verification failed' });
  }
});
app.post('/api/auth/phone', rateLimit, async (req, res) => {
  const { token, name } = req.body;
  if (!token) return res.status(400).json({ error: 'Token required' });
  try {
    const certs = await getFbCerts();
    const decoded = jwt.decode(token, { complete: true });
    const kid = decoded && decoded.header && decoded.header.kid;
    if (!kid || !certs[kid]) return res.status(401).json({ error: 'Invalid token' });
    const projectId = process.env.FIREBASE_PROJECT_ID || '';
    const payload = jwt.verify(token, certs[kid], { algorithms: ['RS256'] });
    if (projectId && payload.aud !== projectId) return res.status(401).json({ error: 'Wrong project' });
    if (!payload.phone_number) return res.status(401).json({ error: 'No phone in token' });
    const phone = payload.phone_number;
    let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
    if (!user) {
      const nm = (name || 'User').trim() || 'User';
      const r = db.prepare('INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)')
        .run(nm, `phone_${Date.now()}@phone.local`, bcrypt.hashSync(Math.random().toString(36), 10), phone);
      user = { id: Number(r.lastInsertRowid), name: nm };
    }
    req.session.userId = user.id;
    req.session.userName = user.name;
    res.json({ ok: true, name: user.name });
  } catch (e) {
    res.status(401).json({ error: 'Phone verification failed' });
  }
});

app.post('/api/login', rateLimit, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(400).json({ error: 'Invalid email or password' });
  req.session.userId = user.id;
  req.session.userName = user.name;
  res.json({ ok: true, name: user.name });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/me', (req, res) => {
  if (!req.session.userId) return res.json({ loggedIn: false });
  res.json({ loggedIn: true, name: req.session.userName });
});

// --- Listings API ---
app.get('/api/listings', (req, res) => {
  const { q, category, city, mine, min, max, sort } = req.query;
  let sql = `SELECT l.*, u.name AS seller_name FROM listings l JOIN users u ON l.user_id = u.id WHERE l.status = 'active'`;
  const params = [];
  if (mine === '1' && req.session.userId) { sql += ' AND l.user_id = ?'; params.push(req.session.userId); }
  if (q) { sql += ' AND (l.title LIKE ? OR l.description LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
  if (category) { sql += ' AND l.category = ?'; params.push(category); }
  if (city) { sql += ' AND l.city = ?'; params.push(city); }
  if (min) { sql += ' AND l.price >= ?'; params.push(Number(min)); }
  if (max) { sql += ' AND l.price <= ?'; params.push(Number(max)); }
  sql += sort === 'plh' ? ' ORDER BY l.price ASC LIMIT 200' : sort === 'phl' ? ' ORDER BY l.price DESC LIMIT 200' : ' ORDER BY l.created_at DESC LIMIT 200';
  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(r => ({ ...r, images: JSON.parse(r.images || '[]') })));
});

app.get('/api/listings/:id', (req, res) => {
  const r = db.prepare(`SELECT l.*, u.name AS seller_name, u.phone AS seller_phone FROM listings l JOIN users u ON l.user_id = u.id WHERE l.id = ?`)
    .get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  r.images = JSON.parse(r.images || '[]');
  res.json(r);
});

app.post('/api/listings', requireLogin, upload.array('images', 5), (req, res) => {
  const { title, price, category, description, city, area, phone, cond, seller_type } = req.body;
  if (!title || !price || !category || !city) return res.status(400).json({ error: 'Title, price, category and city required' });
  const images = (req.files || []).map(f => '/uploads/' + f.filename);
  // Add new columns for older databases
  try { db.exec("ALTER TABLE listings ADD COLUMN cond TEXT DEFAULT 'Used'"); } catch {}
  try { db.exec("ALTER TABLE listings ADD COLUMN seller_type TEXT DEFAULT 'Owner'"); } catch {}
  const r = db.prepare(`INSERT INTO listings (user_id, title, price, category, description, city, area, phone, images, cond, seller_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(req.session.userId, title.trim(), parseInt(price), category, description || '', city, area || '', phone || '', JSON.stringify(images), cond || 'Used', seller_type || 'Owner');
  res.json({ ok: true, id: Number(r.lastInsertRowid) });
});

app.delete('/api/listings/:id', requireLogin, (req, res) => {
  const r = db.prepare('DELETE FROM listings WHERE id = ? AND user_id = ?').run(req.params.id, req.session.userId);
  if (r.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// --- Pakistan cities ---
const CITIES = ['Karachi','Lahore','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar','Quetta','Sialkot','Gujranwala','Hyderabad','Sargodha','Bahawalpur','Sukkur','Jhang','Sheikhupura','Larkana','Gujrat','Mardan','Kasur','Rahim Yar Khan','Sahiwal','Okara','Wah Cantt','Dera Ghazi Khan','Mirpur Khas','Nawabshah','Mingora','Chiniot','Kamoke','Mandi Bahauddin','Jhelum','Jacobabad','Shikarpur','Khanewal','Hafizabad','Kohat','Muzaffargarh','Khanpur','Gojra','Bahawalnagar','Muridke','Pakpattan','Khairpur','Daska','Vehari','Nowshera','Dera Ismail Khan','Chishtian','Kamalia','Kot Addu','Khuzdar','Turbat','Hub','Sibi','Zhob','Gwadar','Abbottabad','Mansehra','Swat','Charsadda','Swabi','Mardan','Haripur','Attock','Chakwal','Bhakkar','Layyah','Toba Tek Singh','Narowal','Sialkot','Zafarwal','Pasrur'];
app.get('/api/cities', (req, res) => res.json([...new Set(CITIES)].sort()));

const CATGROUPS = [
  { name: 'Mobiles', icon: '📱', subs: ['Mobiles', 'Tablets', 'Mobile Accessories', 'Smart Watches'] },
  { name: 'Vehicles', icon: '🚗', subs: ['Cars', 'Cars Accessories', 'Spare Parts', 'Number Plates', 'Buses, Vans & Trucks', 'Rickshaw & Chingchi', 'Commercial Vehicles', 'Boats', 'Motorcycles', 'Motorcycle Accessories', 'Scooters', 'Bicycles'] },
  { name: 'Property', icon: '🏠', subs: ['Property for Sale', 'Property for Rent', 'Property for Auction', 'New Projects', 'Room for Rent', 'Accommodation'] },
  { name: 'Electronics', icon: '💻', subs: ['Electronics', 'Home Appliances', 'Computers & Laptops', 'TV & Audio', 'Cameras', 'Games & Consoles'] },
  { name: 'Home & Furniture', icon: '🛋️', subs: ['Furniture & Home Decor', 'Bed & Bath', 'Garden Items'] },
  { name: 'Fashion', icon: '👗', subs: ['Fashion & Beauty', 'Clothes', 'Shoes', 'Bags & Wallets', 'Watches & Jewelry', 'Health & Beauty', 'Wedding'] },
  { name: 'Kids', icon: '🧸', subs: ['Moms & Kids', 'Kids & Babies'] },
  { name: 'Animals', icon: '🐄', subs: ['Animals', 'Dogs & Cats', 'Birds & Hens', 'Pets Accessories'] },
  { name: 'Jobs & Services', icon: '💼', subs: ['Jobs', 'Services', 'Business & Industrial', 'Business for Sale', 'Business Equipment', 'Agriculture'] },
  { name: 'Hobbies', icon: '⚽', subs: ['Books, Sports & Hobbies', 'Sports & Outdoors', 'Hobby & Collectibles', 'Music Instruments'] },
  { name: 'Travel & Food', icon: '✈️', subs: ['Tickets & Vouchers', 'Travel & Tours', 'Food'] },
  { name: 'Other', icon: '📦', subs: ['Items for Swap', 'Everything Else'] }
];
const CATEGORIES = CATGROUPS.flatMap(g => g.subs);
app.get('/api/categories', (req, res) => res.json(CATGROUPS));

app.listen(PORT, () => console.log(`Shopping Hub running on port ${PORT}`));
