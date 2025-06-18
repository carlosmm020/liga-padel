import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Clasificacion from "./pages/Clasificacion";
import Resultados from "./pages/Resultados";
import CalendarioMensual from "./pages/CalendarioMensual";
import CRUD from "./pages/CRUD";
import Divisiones from "./pages/Divisiones";
import Jugadores from "./pages/Jugadores";
import { useAuth } from "./context/AuthContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { isAdmin } = useAuth();

  return (
    <Router>
      <Navbar />
      {/* Toastify container para notificaciones en toda la app */}
      <ToastContainer
        position="top-right"
        autoClose={2200}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Routes>
        <Route path="/" element={<Navigate to="/clasificacion" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/clasificacion" element={<Clasificacion />} />
        <Route path="/resultados" element={<Resultados />} />
        <Route path="/calendario-mensual" element={<CalendarioMensual />} />
        {/* Rutas protegidas para admin */}
        {isAdmin && <Route path="/jugadores" element={<Jugadores />} />}
        {isAdmin && <Route path="/crud" element={<CRUD />} />}
        <Route path="/divisiones" element={<Divisiones />} />
        {/* Si no es admin y accede a /crud, redirige */}
        {!isAdmin && <Route path="/crud" element={<Navigate to="/login" />} />}
        {!isAdmin && <Route path="/jugadores" element={<Navigate to="/login" />} />}
        {/* Ruta por defecto: si no existe la ruta, va a clasificación */}
        <Route path="*" element={<Navigate to="/clasificacion" />} />
      </Routes>
    </Router>
  );
}

export default App;
