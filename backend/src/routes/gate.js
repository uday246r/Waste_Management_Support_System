const express = require("express");
const AccessGate = require("../models/accessGate");

const gateRouter = express.Router();

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

/**
 * Get or create the current gate password.
 * If no password exists or it's expired, generate a new one.
 */
async function getOrCreatePassword() {
  const now = Date.now();
  let doc = await AccessGate.findOne().sort({ createdAt: -1 }).limit(1);

  if (!doc || new Date(doc.expiresAt).getTime() <= now) {
    const password = Math.random().toString(36).slice(2, 8);
    const expiresAt = new Date(now + TWO_HOURS_MS);

    doc = await AccessGate.create({
      password,
      expiresAt,
    });
  }

  return doc;
}

/**
 * GET /api/gate/password
 * Returns current gate password and expiry (intentionally open).
 */
gateRouter.get("/password", async (req, res) => {
  try {
    const doc = await getOrCreatePassword();
    res.json({
      password: doc.password,
      expiresAt: new Date(doc.expiresAt).getTime(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/gate/verify
 * Verifies user input against stored password.
 */
gateRouter.post("/verify", async (req, res) => {
  try {
    const { password: userInput } = req.body;
    const doc = await getOrCreatePassword();

    const now = Date.now();
    if (new Date(doc.expiresAt).getTime() <= now) {
      return res.status(400).json({ valid: false, error: "Password expired" });
    }

    const valid = userInput === doc.password;
    res.json({ valid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = gateRouter;
