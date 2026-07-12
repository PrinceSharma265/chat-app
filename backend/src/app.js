const express = require("express");
const cors = require("cors");
require("dotenv").config();

const messageRoutes = require("./routes/messageRoutes");

const app = express();
const corsOrigin = process.env.CORS_ORIGIN || "*";

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/messages", messageRoutes);

module.exports = app;
