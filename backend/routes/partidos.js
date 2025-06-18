const express = require("express");
const router = express.Router();
const partidosController = require("../controllers/partidosController");
const auth = require("../middleware/auth");

// GET /api/partidos
router.get("/", partidosController.getPartidos);
// POST /api/partidos
router.post("/", auth, partidosController.createPartido);
// PUT /api/partidos/:id/resultado
router.put("/:id/resultado", auth, partidosController.updateResultado);
// PUT /api/partidos/:id/fecha
router.put("/:id/fecha", auth, partidosController.updateFecha);
// DELETE /api/partidos/:id
router.delete("/:id", auth, partidosController.deletePartido);
// BORRAR TODOS LOS PARTIDOS (solo admin)
router.delete("/", auth, partidosController.deleteAllPartidos);


module.exports = router;
