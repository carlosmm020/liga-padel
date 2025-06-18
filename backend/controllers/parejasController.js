const Pareja = require("../models/Pareja");
const Partido = require("../models/Partido");

// Obtener todas las parejas, populando los datos de jugador1 y jugador2
exports.getParejas = async (req, res) => {
  try {
    const parejas = await Pareja.find()
      .populate("jugador1Id")
      .populate("jugador2Id");
    res.json(parejas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear nueva pareja (recibe nombre, jugador1Id, jugador2Id, division)
exports.createPareja = async (req, res) => {
  try {
    const { nombre, jugador1Id, jugador2Id, division } = req.body;
    if (!nombre || !jugador1Id || !jugador2Id || !division) {
      return res.status(400).json({ error: "Faltan campos" });
    }
    // Evitar que los mismos jugadores se repitan en una pareja
    if (jugador1Id === jugador2Id) {
      return res.status(400).json({ error: "Una pareja debe tener dos jugadores distintos" });
    }
    const nuevaPareja = new Pareja({ nombre, jugador1Id, jugador2Id, division });
    await nuevaPareja.save();
    // Devuelve la pareja con los datos populados
    const parejaPopulada = await Pareja.findById(nuevaPareja._id)
      .populate("jugador1Id")
      .populate("jugador2Id");
    res.status(201).json(parejaPopulada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Editar pareja (puedes cambiar jugadores o división)
exports.updatePareja = async (req, res) => {
  try {
    const { nombre, jugador1Id, jugador2Id, division } = req.body;
    if (!nombre || !jugador1Id || !jugador2Id || !division) {
      return res.status(400).json({ error: "Faltan campos" });
    }
    if (jugador1Id === jugador2Id) {
      return res.status(400).json({ error: "Una pareja debe tener dos jugadores distintos" });
    }
    const pareja = await Pareja.findByIdAndUpdate(
      req.params.id,
      { nombre, jugador1Id, jugador2Id, division },
      { new: true }
    ).populate("jugador1Id").populate("jugador2Id");
    res.json(pareja);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Borrar pareja (y borrar todos los partidos de esa pareja)
exports.deletePareja = async (req, res) => {
  try {
    const parejaId = req.params.id;

    // Borra todos los partidos donde esté la pareja
    await Partido.deleteMany({
      $or: [
        { pareja1Id: parejaId },
        { pareja2Id: parejaId }
      ]
    });

    // Borra la pareja
    await Pareja.findByIdAndDelete(parejaId);

    res.json({ msg: "Pareja eliminada y partidos asociados eliminados" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
