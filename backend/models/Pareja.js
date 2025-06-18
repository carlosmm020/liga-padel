const mongoose = require("mongoose");

const parejaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  jugador1Id: { type: mongoose.Schema.Types.ObjectId, ref: "Jugador", required: true },
  jugador2Id: { type: mongoose.Schema.Types.ObjectId, ref: "Jugador", required: true },
  division: { type: Number, required: true }
});

module.exports = mongoose.model("Pareja", parejaSchema);
