const express = require("express");
const router = express.Router();
const divisionesController = require("../controllers/divisionesController");
const auth = require("../middleware/auth")

// GET /api/divisiones
router.get("/", divisionesController.getDivisiones);
// POST /api/divisiones
router.post("/", auth, divisionesController.createDivision);
// DELETE /api/divisiones/:id
router.delete("/:id", auth, divisionesController.deleteDivision);

module.exports = router;
