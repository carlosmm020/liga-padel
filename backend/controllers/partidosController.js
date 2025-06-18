const Partido = require("../models/Partido");
const { generarFechasDisponibles } = require("../utils/fechaAsignador");
const usados = new Set(); // para evitar duplicados en tiempo real
const fechaGen = generarFechasDisponibles();

// Obtener todos los partidos ordenados por fecha
exports.getPartidos = async (req, res) => {
  try {
    const partidos = await Partido.find().sort({ fecha: 1 }); // ✅ ORDENADOS POR FECHA
    res.json(partidos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear un partido con fecha automática
exports.createPartido = async (req, res) => {
  try {
    const { division, pareja1Id, pareja2Id, resultado, estado } = req.body;

    let fecha;
    let intento = 0;
    do {
      fecha = fechaGen.next().value;
      intento++;
    } while (usados.has(fecha) && intento < 1000);
    usados.add(fecha);

    const nuevoPartido = new Partido({
      division,
      pareja1Id,
      pareja2Id,
      resultado,
      estado,
      fecha, // ✅ FECHA ASIGNADA AUTOMÁTICAMENTE
    });

    await nuevoPartido.save();
    res.status(201).json(nuevoPartido);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Actualizar resultado de un partido
exports.updateResultado = async (req, res) => {
  try {
    const { resultado, estado } = req.body;
    const partidoActualizado = await Partido.findByIdAndUpdate(
      req.params.id,
      { resultado, estado },
      { new: true }
    );
    res.json(partidoActualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar un partido
exports.deletePartido = async (req, res) => {
  try {
    await Partido.findByIdAndDelete(req.params.id);
    res.json({ msg: "Partido eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Borrar todos los partidos
exports.deleteAllPartidos = async (req, res) => {
  try {
    await Partido.deleteMany({});
    res.json({ msg: "Todos los partidos eliminados" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar fecha de un partido manualmente con validación
exports.updateFecha = async (req, res) => {
  try {
    const { fecha } = req.body;

    // ✅ Validación de fecha
    if (!fecha || isNaN(new Date(fecha).getTime())) {
      return res.status(400).json({ error: "Fecha no válida" });
    }

    const partido = await Partido.findByIdAndUpdate(
      req.params.id,
      { fecha },
      { new: true }
    );
    res.json(partido);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
