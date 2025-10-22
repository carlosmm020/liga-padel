import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/Jugadores.css";

const API_JUGADORES = "https://liga-padel.onrender.com/api/jugadores";

export default function Jugadores() {
  const { token, isAdmin } = useAuth();
  const [jugadores, setJugadores] = useState([]);
  const [form, setForm] = useState({ nombreCompleto: "", telefono: "", dni: "" });
  const [editId, setEditId] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [modal, setModal] = useState({ abierto: false, id: null, nombre: "" });

  const fetchJugadores = () => {
    fetch(API_JUGADORES)
      .then(res => res.json())
      .then(setJugadores)
      .catch(() => toast.error("Error cargando jugadores"));
  };

  useEffect(fetchJugadores, []);

  // Filtro dinámico (nombre o dni o telefono)
  const jugadoresFiltrados = jugadores.filter(j =>
    j.nombreCompleto.toLowerCase().includes(filtro.toLowerCase()) ||
    j.dni.toLowerCase().includes(filtro.toLowerCase()) ||
    j.telefono.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const esNombreValido = (nombre) => /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre);
  const esTelefonoValido = (telefono) => /^[0-9]{9}$/.test(telefono);
  const esDniValido = (dni) => /^(\d{8}[A-Z]|[XYZ]\d{7}[A-Z])$/.test(dni);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return toast.warn("No eres admin");

    const { nombreCompleto, telefono, dni } = form;

    if (!nombreCompleto || !telefono || !dni) {
      return toast.info("Completa todos los campos");
    }

    if (!esNombreValido(nombreCompleto)) {
      return toast.error("El nombre no debe contener números ni símbolos");
    }

    if (!esTelefonoValido(telefono)) {
      return toast.error("El teléfono debe tener 9 dígitos");
    }

    if (!esDniValido(dni)) {
      return toast.error("DNI o NIE no válido");
    }
    try {
      const res = await fetch(editId ? `${API_JUGADORES}/${editId}` : API_JUGADORES, {
        method: editId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        toast.success(editId ? "Jugador actualizado" : "Jugador creado");
        setForm({ nombreCompleto: "", telefono: "", dni: "" });
        setEditId(null);
        fetchJugadores();
      } else {
        const { error } = await res.json();
        toast.error(error || "Error en la operación");
      }
    } catch {
      toast.error("Error de red");
    }
  };

  const handleEdit = (jugador) => {
    setEditId(jugador._id);
    setForm({
      nombreCompleto: jugador.nombreCompleto,
      telefono: jugador.telefono,
      dni: jugador.dni
    });
  };

  const abrirModalEliminar = (jugador) => {
    setModal({ abierto: true, id: jugador._id, nombre: jugador.nombreCompleto });
  };

  const cerrarModal = () => {
    setModal({ abierto: false, id: null, nombre: "" });
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_JUGADORES}/${modal.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Jugador eliminado");
        fetchJugadores();
      } else {
        toast.error("Error eliminando");
      }
    } catch {
      toast.error("Error de red");
    }
    cerrarModal();
  };

  return (
    <div className="jugadores-container">
      <div className="jugadores-title">Gestión de Jugadores</div>
      {/* Filtro */}
      <div className="section-card">
        <div className="section-title">Buscar jugador</div>
        <input
          className="input"
          type="text"
          placeholder="Buscar por nombre, teléfono o DNI..."
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
        />
      </div>
      {isAdmin &&(
        <form className="section-card" onSubmit={handleSubmit}>
          <div className="section-title">{editId ? "Editar jugador" : "Crear jugador"}</div>
            <input
              name="nombreCompleto"
              className="input"
              placeholder="Nombre completo"
              value={form.nombreCompleto}
              onChange={handleChange}
              required
              autoComplete="off"
            />
            <input
              name="telefono"
              className="input"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={handleChange}
              required
              autoComplete="off"
            />      
            <input
              name="dni"
              className="input"
              placeholder="DNI"
              value={form.dni}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          <div style={{ marginTop: "10px", textAlign: "center" }}>
            <button className="btn-rojo" type="submit">{editId ? "Actualizar" : "Crear"}</button>
            {editId && (
              <button
                type="button"
                onClick={() => { setEditId(null); setForm({ nombreCompleto: "", telefono: "", dni: "" }); }}
                className="btn-cancelar"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
      <div className="jugadores-table">
        <table>
          <thead>
            <tr>
              <th style={{ minWidth: 170 }}>Nombre</th>
              <th style={{ minWidth: 110 }}>Teléfono</th>
              <th style={{ minWidth: 80 }}>DNI</th>
              {isAdmin && <th style={{ minWidth: 100 }}>Acción</th>}
            </tr>
          </thead>
          <tbody>
            {jugadoresFiltrados.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 4 : 3} style={{ color: "#888", padding: "1.5rem" }}>
                  No hay jugadores registrados.
                </td>
              </tr>
            ) : (
              jugadoresFiltrados.map(j => (
                <tr key={j._id}>
                  <td style={{ whiteSpace: "normal", maxWidth: 230, wordBreak: "break-word" }}>{j.nombreCompleto}</td>
                  <td style={{ whiteSpace: "normal", maxWidth: 130, wordBreak: "break-word" }}>{j.telefono}</td>
                  <td style={{ whiteSpace: "normal", maxWidth: 80, wordBreak: "break-word" }}>{j.dni}</td>
                  {isAdmin && (
                    <td>
                      <button onClick={() => handleEdit(j)}>Editar</button>
                      <button onClick={() => abrirModalEliminar(j)}>Eliminar</button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal para confirmar */}
      <ConfirmModal
        open={modal.abierto}
        title="Eliminar jugador"
        message={`¿Seguro que quieres eliminar a\n ${modal.nombre}?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        onCancel={cerrarModal}
      />
    </div>
  );
}
