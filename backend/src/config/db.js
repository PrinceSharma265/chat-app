const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "..", "..", "data", "chat.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    delivered INTEGER DEFAULT 0
  )
`);

module.exports = db;
