const Division = require("../models/Division");
const Partido = require("../models/Partido");

// Obtener todas las divisiones
exports.getDivisiones = async (req, res) => {
  try {
    const divisiones = await Division.find().sort({ numero: 1 });
    res.json(divisiones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear una nueva división
exports.createDivision = async (req, res) => {
  try {
    const { numero, nombre } = req.body;
    const nuevaDivision = new Division({ numero, nombre });
    await nuevaDivision.save();
    res.status(201).json(nuevaDivision);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar una división
exports.deleteDivision = async (req, res) => {
  try {
    const divisionId = req.params.id;
    // 1. Busca la división para obtener el número (es lo que guardan los partidos)
    const division = await Division.findById(divisionId);
    if (!division) {
      return res.status(404).json({ error: "División no encontrada" });
    }

    // 2. Borra todos los partidos de esa división
    await Partido.deleteMany({ division: division.numero });

    // (Opcional: también podrías borrar todas las parejas de esa división si quieres)
    // await Pareja.deleteMany({ division: division.numero });

    // 3. Borra la división
    await Division.findByIdAndDelete(divisionId);

    res.json({ msg: "División eliminada y partidos asociados eliminados" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
