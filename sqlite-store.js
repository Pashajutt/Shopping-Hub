// Simple SQLite-backed session store for express-session (survives server restarts)
const { Store } = require('express-session');
class SqliteStore extends Store {
  constructor(db) {
    super();
    this.db = db;
    db.exec(`CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      sess TEXT NOT NULL,
      expire INTEGER NOT NULL
    )`);
    // Clean expired sessions every hour
    setInterval(() => {
      try { db.prepare('DELETE FROM sessions WHERE expire < ?').run(Date.now()); } catch (e) {}
    }, 3600000).unref();
  }
  get(sid, cb) {
    try {
      const row = this.db.prepare('SELECT sess FROM sessions WHERE sid = ? AND expire > ?').get(sid, Date.now());
      cb(null, row ? JSON.parse(row.sess) : null);
    } catch (e) { cb(e); }
  }
  set(sid, sess, cb) {
    try {
      const expire = Date.now() + (sess.cookie && sess.cookie.maxAge ? sess.cookie.maxAge : 30 * 24 * 3600 * 1000);
      this.db.prepare('INSERT OR REPLACE INTO sessions (sid, sess, expire) VALUES (?, ?, ?)')
        .run(sid, JSON.stringify(sess), expire);
      cb(null);
    } catch (e) { cb(e); }
  }
  destroy(sid, cb) {
    try { this.db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid); cb(null); }
    catch (e) { cb(e); }
  }
  touch(sid, sess, cb) { this.set(sid, sess, cb); }
}
module.exports = SqliteStore;
