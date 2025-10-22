import { useState, useEffect, use } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/CRUD.css";

const API_PAREJAS = "https://liga-padel.onrender.com/api/parejas";
const API_JUGADORES = "https://liga-padel.onrender.com/api/jugadores";
const API_DIVISIONES = "https://liga-padel.onrender.com/api/divisiones";

const CRUD = () => {
  const { token, isAdmin } = useAuth();
  const [parejas, setParejas] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [divisiones, setDivisiones] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    jugador1Id: "",
    jugador2Id: "",
    division: ""
  });
  const [editId, setEditId] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [modal, setModal] = useState({ abierto: false, id: null, nombre: "" });

  useEffect(() => {
    fetch(API_PAREJAS, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(setParejas);
    fetch(API_JUGADORES, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(setJugadores);
    fetch(API_DIVISIONES, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(setDivisiones);
  }, [token]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.jugador1Id || !form.jugador2Id || !form.division)
      return toast.info("Completa todos los campos");
    if (form.jugador1Id === form.jugador2Id)
      return toast.info("Elige dos jugadores distintos");
    try {
      const res = await fetch(editId ? `${API_PAREJAS}/${editId}` : API_PAREJAS, {
        method: editId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        toast.success(editId ? "Pareja actualizada" : "Pareja creada");
        setForm({ nombre: "", jugador1Id: "", jugador2Id: "", division: "" });
        setEditId(null);
        fetch(API_PAREJAS, { headers: { Authorization: `Bearer ${token}` } })
          .then(res => res.json()).then(setParejas);
      } else {
        toast.error("Error en la operación");
      }
    } catch {
      toast.error("Error de red");
    }
  };

  const handleEdit = (pareja) => {
    setEditId(pareja._id);
    setForm({
      nombre: pareja.nombre,
      jugador1Id: pareja.jugador1Id?._id || "",
      jugador2Id: pareja.jugador2Id?._id || "",
      division: pareja.division
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar pareja?")) return;
    try {
      const res = await fetch(`${API_PAREJAS}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Pareja eliminada");
        fetch(API_PAREJAS, { headers: { Authorization: `Bearer ${token}` } })
          .then(res => res.json()).then(setParejas);
      } else {
        toast.error("Error eliminando");
      }
    } catch {
      toast.error("Error de red");
    }
  };

  const abrirModalEliminar = (pareja) => {
  setModal({
    abierto: true,
    id: pareja._id,
    nombre: pareja.nombre
  });
};

const cerrarModal = () => {
  setModal({ abierto: false, id: null, nombre: "" });
};

const confirmarDelete = async () => {
  try {
    const res = await fetch(`${API_PAREJAS}/${modal.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      toast.success("Pareja eliminada");
      fetch(API_PAREJAS, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json()).then(setParejas);
    } else {
      toast.error("Error eliminando");
    }
  } catch {
    toast.error("Error de red");
  }
  cerrarModal();
};

const parejasFiltradas = parejas.filter(p =>
  p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
  p.jugador1Id?.nombreCompleto?.toLowerCase().includes(filtro.toLowerCase()) ||
  p.jugador2Id?.nombreCompleto?.toLowerCase().includes(filtro.toLowerCase())
);

  if (!isAdmin) {
    return (
      <div className="crud-container">
        <h2 className="crud-title">Acceso solo para admin</h2>
      </div>
    );
  }

  return (
    <div className="crud-container">
      <div className="crud-title">Gestión de Parejas</div>
      {/* Filtro */}
      <div className="section-card">
        <div className="section-title">Buscar Pareja</div>
        <input
          className="input"
          type="text"
          placeholder="Buscar por pareja o jugador..."
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
        />
      </div>
      <form className="section-card" onSubmit={handleSubmit}>
        <div className="section-title">{editId ? "Editar jugador" : "Crear jugador"}</div>
          <input
            name="nombre"
            className="input"
            placeholder="Nombre de la pareja"
            value={form.nombre}
            onChange={handleChange}
            required
            autoComplete="off"
            style={{ minWidth: 0, width: '100%', boxSizing: 'border-box' }}
          />
          <select
            className="select"
            name="jugador1Id"
            value={form.jugador1Id}
            onChange={handleChange}
            required
            style={{ minWidth: 0, width: '100%', boxSizing: 'border-box' }}
          >
            <option value="" disabled selected>Selecciona Jugador 1</option>
            {jugadores.map(j => (
              <option key={j._id} value={j._id}>
                {j.nombreCompleto} ({j.dni})
              </option>
            ))}
          </select>
          <select
            className="select"
            name="jugador2Id"
            value={form.jugador2Id}
            onChange={handleChange}
            required
            style={{ minWidth: 0, width: '100%', boxSizing: 'border-box' }}
          >
            <option value="" disabled selected>Selecciona Jugador 2</option>
            {jugadores.map(j => (
              <option key={j._id} value={j._id}>
                {j.nombreCompleto} ({j.dni})
              </option>
            ))}
          </select>
          <select
            className="select"
            name="division"
            value={form.division}
            onChange={handleChange}
            required
            style={{ minWidth: 0, width: '100%', boxSizing: 'border-box' }}
          >
            <option value="" disabled selected>Selecciona División</option>
            {divisiones.map(d => (
              <option key={d._id} value={d.numero}>
                División {d.numero}
              </option>
            ))}
          </select>
        <div style={{ marginTop: '14px', textAlign: 'center' }}>
          <button className="btn-rojo" type="submit">{editId ? "Actualizar" : "Crear"}</button>
          {editId && (
            <button
              type="button"
              onClick={() => { setEditId(null); setForm({ nombre: "", jugador1Id: "", jugador2Id: "", division: "" }); }}
              className="btn-cancelar"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
      <div className="crud-table">
        <table>
          <thead>
            <tr>
              <th>Pareja</th>
              <th>Jugador 1</th>
              <th>Jugador 2</th>
              <th>División</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {parejasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ color: "#888", padding: "1.5rem" }}>
                  No hay parejas registradas.
                </td>
              </tr>
            ) : (
              parejasFiltradas.map(p => (
                <tr key={p._id}>
                  <td>{p.nombre}</td>
                  <td>{p.jugador1Id?.nombreCompleto}</td>
                  <td>{p.jugador2Id?.nombreCompleto}</td>
                  <td>{p.division}</td>
                  <td>
                    <button onClick={() => handleEdit(p)}>Editar</button>
                    <button onClick={() => abrirModalEliminar(p)}>Eliminar</button>

                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ConfirmModal
        open={modal.abierto}
        title="Eliminar pareja"
        message={`¿Seguro que quieres eliminar la pareja\n${modal.nombre}?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmarDelete}
        onCancel={cerrarModal}
      />

    </div>
  );
};

export default CRUD;
