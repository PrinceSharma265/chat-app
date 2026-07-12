const express = require("express");
const { createMessage, getAllMessages } = require("../models/messageModel");

const router = express.Router();

router.post("/", (req, res) => {
  try {
    const { username, text } = req.body || {};

    if (typeof username !== "string" || typeof text !== "string" || username.trim() === "" || text.trim() === "") {
      return res.status(400).json({ error: "username and text are required" });
    }

    const message = createMessage({ username: username.trim(), text: text.trim() });
    return res.status(201).json(message);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", (req, res) => {
  try {
    const messages = getAllMessages();
    return res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
