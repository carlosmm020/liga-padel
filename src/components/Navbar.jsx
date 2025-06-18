import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

const Navbar = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();

  // Función para resaltar la ruta activa
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link className={`navbar-link${isActive("/clasificacion") ? " active" : ""}`} to="/clasificacion">Clasificación</Link>
        <Link className={`navbar-link${isActive("/resultados") ? " active" : ""}`} to="/resultados">Resultados</Link>
        <Link className={`navbar-link${isActive("/calendario-mensual") ? " active" : ""}`} to="/calendario-mensual">Calendario Mensual</Link>
        {isAdmin && (
        <Link className={`navbar-link${isActive("/jugadores") ? " active" : ""}`} to="/jugadores">Jugadores</Link>
        )}
        {isAdmin && (
          <Link className={`navbar-link${isActive("/crud") ? " active" : ""}`} to="/crud">Parejas</Link>
        )}
        <Link className={`navbar-link${isActive("/divisiones") ? " active" : ""}`} to="/divisiones">Divisiones</Link>
        <Link className="navbar-link" to="/login">{isAdmin ? "Cerrar sesión" : "Admin"}</Link>
      </div>
    </nav>
  );
};

export default Navbar;
