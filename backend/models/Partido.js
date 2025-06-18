const mongoose = require("mongoose");

const PartidoSchema = new mongoose.Schema({
  division: { type: Number, required: true },
  pareja1Id: { type: mongoose.Schema.Types.ObjectId, ref: "Pareja", required: true },
  pareja2Id: { type: mongoose.Schema.Types.ObjectId, ref: "Pareja", required: true },
  resultado: {
    sets: [
      { juegosPareja1: Number, juegosPareja2: Number }
    ],
    setsPareja1: Number,
    setsPareja2: Number
  },
  estado: { type: String, enum: ["pendiente", "jugado"], default: "pendiente" },
  fecha: { type: Date }
});

module.exports = mongoose.model("Partido", PartidoSchema);
