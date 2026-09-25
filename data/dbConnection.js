const Database = require('better-sqlite3');
const db = new Database('arona_bot.db');
db.pragma('foreign_keys = ON');
db.defaultSafeIntegers(true);
module.exports = { db };