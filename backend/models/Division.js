const mongoose = require("mongoose");

const DivisionSchema = new mongoose.Schema({
  numero: { type: Number, required: true, unique: true }, // Por ejemplo, 1, 2, 3...
  nombre: { type: String } // Opcional: para el futuro, por si quieres llamarles "Primera", "Segunda", etc.
});

module.exports = mongoose.model("Division", DivisionSchema);
