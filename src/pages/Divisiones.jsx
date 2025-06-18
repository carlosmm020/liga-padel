import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/Divisiones.css";

const API_DIVISIONES = "http://localhost:5000/api/divisiones";
const API_PAREJAS = "http://localhost:5000/api/parejas";

const Divisiones = () => {
  const { isAdmin, token } = useAuth();
  const [divisiones, setDivisiones] = useState([]);
  const [parejas, setParejas] = useState([]);
  const [nuevaDivision, setNuevaDivision] = useState("");
  const [nombreDivision, setNombreDivision] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal de confirmación para borrar
  const [confirmState, setConfirmState] = useState({
    open: false,
    divisionId: null,
    divisionNumero: null
  });

  // Cargar divisiones y parejas desde el backend
  useEffect(() => {
    fetch(API_DIVISIONES)
      .then(res => res.json())
      .then(setDivisiones);

    fetch(API_PAREJAS)
      .then(res => res.json())
      .then(setParejas);
  }, []);

  // Añadir división
  const handleAddDivision = async () => {
    if (!token) return toast.error("No tienes permisos.");
    const n = Number(nuevaDivision);
    if (!n || divisiones.some(d => d.numero === n)) {
      toast.warn("El número de división ya existe o no es válido.");
      return;
    }
    setLoading(true);
    const res = await fetch(API_DIVISIONES, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ numero: n, nombre: nombreDivision })
    });
    setLoading(false);
    if (res.ok) {
      setNuevaDivision("");
      setNombreDivision("");
      actualizarDivisiones();
      toast.success("División creada correctamente");
    } else {
      toast.error("Error al crear división");
    }
  };

  // Eliminar división (muestra modal)
  const handleRemoveDivision = (id, numero) => {
    if (parejas.some((p) => p.division === numero)) {
      toast.error("No puedes eliminar una división que tiene parejas.");
      return;
    }
    setConfirmState({ open: true, divisionId: id, divisionNumero: numero });
  };

  // Confirmar borrado tras modal
  const handleConfirmRemove = async () => {
    setLoading(true);
    const res = await fetch(`${API_DIVISIONES}/${confirmState.divisionId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    setLoading(false);
    setConfirmState({ open: false, divisionId: null, divisionNumero: null });
    if (res.ok) {
      actualizarDivisiones();
      toast.success("División eliminada correctamente");
    } else {
      toast.error("Error al eliminar división");
    }
  };

  // Mover pareja de división
  const handleMovePareja = async (pareja, nuevaDiv) => {
    if (pareja.division === Number(nuevaDiv)) return;
    setLoading(true);
    const res = await fetch(`${API_PAREJAS}/${pareja._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ...pareja, division: Number(nuevaDiv) })
    });
    setLoading(false);
    if (res.ok) {
      actualizarParejas();
      toast.success("Pareja movida correctamente");
    } else {
      toast.error("Error al mover pareja");
    }
  };

  // Refrescar divisiones y parejas
  const actualizarDivisiones = () => {
    fetch(API_DIVISIONES)
      .then(res => res.json())
      .then(setDivisiones);
  };

  const actualizarParejas = () => {
    fetch(API_PAREJAS)
      .then(res => res.json())
      .then(setParejas);
  };

  return (
    <div className="divisiones-container">
      <div className="division-title">Gestión de Divisiones</div>
      {isAdmin && (
        <div className="divisiones-form-bar">
          <label>
            Nueva división:&nbsp;
            <input
              type="number"
              min="1"
              value={nuevaDivision}
              onChange={e => setNuevaDivision(e.target.value)}
              style={{ width: 50 }}
              required
              disabled={loading}
            />
          </label>
          <input
            type="text"
            placeholder="Nombre (opcional)"
            value={nombreDivision}
            onChange={e => setNombreDivision(e.target.value)}
            disabled={loading}
          />
          <button onClick={handleAddDivision} disabled={!nuevaDivision || loading}>
            {loading ? "Añadiendo..." : "Añadir división"}
          </button>
        </div>
      )}

      {divisiones.length === 0 && (
        <div style={{ color: "gray", margin: "2rem 0" }}>
          No hay divisiones registradas.
        </div>
      )}

      {divisiones
        .sort((a, b) => a.numero - b.numero)
        .map((division) => (
        <div className="division-card" key={division._id}>
          <div className="division-title" style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
            <span>
              División {division.numero}{" "}
              <span style={{ color: "#888" }}>{division.nombre}</span>
            </span>
            {isAdmin && (
              <button
                style={{
                  color: "#fff",
                  background: "#e53935",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  padding: "5px 13px",
                  marginLeft: 10,
                  cursor: "pointer",
                  transition: "background .15s",
                  boxShadow: "0 2px 8px #d32f2f22"
                }}
                onClick={() => handleRemoveDivision(division._id, division.numero)}
                disabled={loading}
              >
                Eliminar división
              </button>
            )}
          </div>
          <table className="parejas-division-table">
            <thead>
              <tr>
                <th>Pareja</th>
                <th>Jugadores</th>
                {isAdmin && <th>Acción</th>}
              </tr>
            </thead>
            <tbody>
              {parejas.filter((p) => p.division === division.numero).length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 3 : 2} style={{ color: "gray" }}>
                    Sin parejas en esta división
                  </td>
                </tr>
              ) : (
                parejas
                  .filter((p) => p.division === division.numero)
                  .map((p) => (
                    <tr key={p._id}>
                      <td>{p.nombre}</td>
                      <td style={{ whiteSpace: "normal", maxWidth: 280, wordBreak: "break-word", textAlign: "left" }}>
                        {p.jugador1Id?.nombreCompleto} <br /> {p.jugador2Id?.nombreCompleto}
                      </td>

                      {isAdmin && (
                      <td>
                        <div className="inline-select-container">
                          <span className="mover-label">Mover a:&nbsp;</span>
                          <select
                            className="select-division"
                            value={p.division}
                            onChange={e => handleMovePareja(p, e.target.value)}
                            disabled={loading}
                          >
                            {divisiones.map((d) => (
                              <option key={d._id} value={d.numero}>
                                División {d.numero}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      )}
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      ))}

      {/* Modal para confirmación de borrado */}
      <ConfirmModal
        open={confirmState.open}
        title="¿Eliminar división?"
        message={`¿Seguro que quieres eliminar la División ${confirmState.divisionNumero}?\nEsta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        loading={loading}
        onConfirm={handleConfirmRemove}
        onCancel={() => setConfirmState({ open: false, divisionId: null, divisionNumero: null })}
      />
    </div>
  );
};

export default Divisiones;
