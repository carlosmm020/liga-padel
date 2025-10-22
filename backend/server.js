require("dotenv").config();
console.log("[BACKEND] ADMIN_PASSWORD desde .env:", process.env.ADMIN_PASSWORD);
console.log("[BACKEND] JWT_SECRET desde .env:", process.env.JWT_SECRET);
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Importa rutas
const authRoutes = require("./routes/auth")
const parejasRoutes = require("./routes/parejas");
const divisionesRoutes = require("./routes/divisiones");
const partidosRoutes = require("./routes/partidos");
const jugadoresRouter = require("./routes/jugadores");

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Ruta de Login (no necesita token)
app.use("/api", authRoutes)

// Rutas protegidas y libres
app.use("/api/parejas", parejasRoutes);
app.use("/api/divisiones", divisionesRoutes);
app.use("/api/partidos", partidosRoutes);
app.use("/api/jugadores", jugadoresRouter);

// Ruta de prueba basica
app.get("/", (req, res) => {
  res.send("API Liga Pádel funcionando 🚀");
});

// Conexión a MongoDB y arranque del servidor
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`[BACKEND] Servidor escuchando en puerto ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("Error de conexión a MongoDB:", err);
  });
