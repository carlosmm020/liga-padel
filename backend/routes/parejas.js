const express = require("express");
const router = express.Router();
const Pareja = require("../models/Pareja");
const auth = require("../middleware/auth");

// GET: Listar todas las parejas con jugadores completos
router.get("/", async (req, res) => {
  try {
    const parejas = await Pareja.find().populate("jugador1Id jugador2Id");
    res.json(parejas);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener parejas" });
  }
});

// POST: Crear nueva pareja (solo admin)
router.post("/", auth, async (req, res) => {
  if (!req.user || req.user.user !== "admin")
    return res.status(403).json({ error: "No autorizado" });
  const { nombre, jugador1Id, jugador2Id, division } = req.body;
  if (!nombre || !jugador1Id || !jugador2Id || !division) {
    return res.status(400).json({ error: "Faltan campos" });
  }
  try {
    const pareja = new Pareja({
      nombre,
      jugador1Id,
      jugador2Id,
      division
    });
    await pareja.save();
    res.json(pareja);
  } catch (err) {
    res.status(500).json({ error: "Error al crear pareja" });
  }
});

// PUT: Actualizar pareja existente (solo admin)
router.put("/:id", auth, async (req, res) => {
  if (!req.user || req.user.user !== "admin")
    return res.status(403).json({ error: "No autorizado" });
  const { nombre, jugador1Id, jugador2Id, division } = req.body;
  if (!nombre || !jugador1Id || !jugador2Id || !division) {
    return res.status(400).json({ error: "Faltan campos" });
  }
  try {
    const pareja = await Pareja.findByIdAndUpdate(
      req.params.id,
      { nombre, jugador1Id, jugador2Id, division },
      { new: true }
    );
    res.json(pareja);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar pareja" });
  }
});

// DELETE: Eliminar pareja (solo admin)
router.delete("/:id", auth, async (req, res) => {
  if (!req.user || req.user.user !== "admin")
    return res.status(403).json({ error: "No autorizado" });
  await Pareja.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
