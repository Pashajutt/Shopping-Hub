const express = require('express');
const session = require('express-session');
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SESSION_SECRET,
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
  const { title, price, category, description, city, area, phone } = req.body;
  if (!title || !price || !category || !city) return res.status(400).json({ error: 'Title, price, category and city required' });
  const images = (req.files || []).map(f => '/uploads/' + f.filename);
  const r = db.prepare(`INSERT INTO listings (user_id, title, price, category, description, city, area, phone, images)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(req.session.userId, title.trim(), parseInt(price), category, description || '', city, area || '', phone || '', JSON.stringify(images));
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

const CATEGORIES = [
  'Mobiles',
  'Tablets',
  'Mobile Accessories',
  'Cars',
  'Cars Accessories',
  'Spare Parts',
  'Buses, Vans & Trucks',
  'Rickshaw & Chingchi',
  'Boats',
  'Motorcycles',
  'Scooters',
  'Bicycles',
  'Property for Sale',
  'Property for Rent',
  'Electronics',
  'Home Appliances',
  'Computers & Laptops',
  'TV & Audio',
  'Cameras',
  'Furniture & Home Decor',
  'Fashion & Beauty',
  'Clothes',
  'Watches & Jewelry',
  'Animals',
  'Dogs & Cats',
  'Birds & Hens',
  'Jobs',
  'Services',
  'Business & Industrial',
  'Agriculture',
  'Books, Sports & Hobbies',
  'Kids & Babies'
];
app.get('/api/categories', (req, res) => res.json(CATEGORIES));

app.listen(PORT, () => console.log(`Shopping Hub running on port ${PORT}`));
