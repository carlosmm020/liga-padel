const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

console.log("[BACKEND] auth.js cargado"); // <--- Agregado

// POST /api/login
router.post("/login", (req, res) => {
  console.log("[BACKEND] POST /api/login llamado"); // <--- Agregado
  const { password } = req.body;
  console.log("[BACKEND] password recibido:", password); // <--- Agregado
  if (password === process.env.ADMIN_PASSWORD) {
    //Genera token cada 12h
    const token = jwt.sign({ user: "admin" }, process.env.JWT_SECRET, { expiresIn: "12h" });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Contraseña incorrecta" });
  }
});

module.exports = router;
