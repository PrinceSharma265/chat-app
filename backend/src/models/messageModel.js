const { nanoid } = require("nanoid");
const db = require("../config/db");

function createMessage({ username, text }) {
  const id = nanoid();
  const timestamp = new Date().toISOString();
  const delivered = 1;

  db.prepare(
    `
      INSERT INTO messages (id, username, text, timestamp, delivered)
      VALUES (?, ?, ?, ?, ?)
    `
  ).run(id, username, text, timestamp, delivered);

  return {
    id,
    username,
    text,
    timestamp,
    delivered,
  };
}

function getAllMessages() {
  return db
    .prepare(
      `
        SELECT id, username, text, timestamp, delivered
        FROM messages
        ORDER BY timestamp ASC
      `
    )
    .all();
}

module.exports = {
  createMessage,
  getAllMessages,
};
