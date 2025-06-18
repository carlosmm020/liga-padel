const express = require("express");
const router = express.Router();
const Jugador = require("../models/Jugador");
const auth = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

const validarJugador = [
  body("nombreCompleto")
    .trim()
    .notEmpty().withMessage("El nombre es obligatorio")
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/).withMessage("El nombre no debe contener números ni símbolos"),

  body("telefono")
    .notEmpty().withMessage("El teléfono es obligatorio")
    .matches(/^[0-9]{9}$/).withMessage("El teléfono debe tener exactamente 9 números"),

  body("dni")
    .notEmpty().withMessage("El DNI es obligatorio")
    .matches(/^(\d{8}[A-Z]|[XYZ]\d{7}[A-Z])$/).withMessage("DNI o NIE no válido"),
];

// GET all jugadores
router.get("/", async (req, res) => {
  const jugadores = await Jugador.find().sort({ nombreCompleto: 1 });
  res.json(jugadores);
});

// POST crear jugador (solo admin)
router.post("/", auth, validarJugador, async (req, res) => {
  if (!req.user || req.user.user !== "admin") {
    return res.status(403).json({ error: "No autorizado" });
  }

  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  const { nombreCompleto, telefono, dni } = req.body;
  try {
    const jugador = new Jugador({ nombreCompleto, telefono, dni });
    await jugador.save();
    res.json(jugador);
  } catch (err) {
    res.status(400).json({ error: "DNI duplicado o datos incorrectos" });
  }
});


// PUT actualizar jugador (solo admin)
router.put("/:id", auth, async (req, res) => {
  if (!req.user || req.user.user !== "admin") {
    return res.status(403).json({ error: "No autorizado" });
  }
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  const { nombreCompleto, telefono, dni } = req.body;
  try {
    const jugador = await Jugador.findByIdAndUpdate(
      req.params.id,
      { nombreCompleto, telefono, dni },
      { new: true }
    );
    res.json(jugador);
  } catch (err) {
    res.status(400).json({ error: "No se pudo actualizar" });
  }
});

// DELETE jugador (solo admin)
router.delete("/:id", auth, async (req, res) => {
  if (!req.user || req.user.user !== "admin") {
    return res.status(403).json({ error: "No autorizado" });
  }
  await Jugador.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
