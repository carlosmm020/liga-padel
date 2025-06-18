const mongoose = require("mongoose");

const jugadorSchema = new mongoose.Schema({
  nombreCompleto: { type: String, required: true },
  telefono: { type: String, required: true },
  dni: { type: String, required: true, unique: true }
});

module.exports = mongoose.model("Jugador", jugadorSchema);
