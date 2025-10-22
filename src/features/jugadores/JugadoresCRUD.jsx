// src/features/jugadores/JugadoresCRUD.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const API_JUGADORES = "https://liga-padel.onrender.com/api/jugadores";

export default function JugadoresCRUD() {
  const { token, isAdmin } = useAuth();
  const [jugadores, setJugadores] = useState([]);
  const [form, setForm] = useState({ nombreCompleto: "", telefono: "", dni: "" });
  const [editId, setEditId] = useState(null);

  const fetchJugadores = () => {
    fetch(API_JUGADORES)
      .then(res => res.json())
      .then(setJugadores)
      .catch(() => toast.error("Error cargando jugadores"));
  };

  useEffect(fetchJugadores, []);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return toast.warn("No eres admin");
    if (!form.nombreCompleto || !form.telefono || !form.dni) return toast.info("Completa todos los campos");
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

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar jugador?")) return;
    try {
      const res = await fetch(`${API_JUGADORES}/${id}`, {
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
  };

  return (
    <div style={{ maxWidth: 450, margin: "auto" }}>
      <h2>Jugadores</h2>
      {isAdmin ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: 18 }}>
          <input
            name="nombreCompleto"
            placeholder="Nombre completo"
            value={form.nombreCompleto}
            onChange={handleChange}
            required
          />
          <input
            name="telefono"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={handleChange}
            required
          />
          <input
            name="dni"
            placeholder="DNI"
            value={form.dni}
            onChange={handleChange}
            required
          />
          <button type="submit">{editId ? "Actualizar" : "Crear"}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm({ nombreCompleto: "", telefono: "", dni: "" }); }}>Cancelar</button>}
        </form>
      ) : (
        <div style={{ color: "red" }}>Solo administradores pueden editar jugadores.</div>
      )}
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>DNI</th>
            {isAdmin && <th>Acción</th>}
          </tr>
        </thead>
        <tbody>
          {jugadores.map(j => (
            <tr key={j._id}>
              <td>{j.nombreCompleto}</td>
              <td>{j.telefono}</td>
              <td>{j.dni}</td>
              {isAdmin && (
                <td>
                  <button onClick={() => handleEdit(j)}>Editar</button>
                  <button onClick={() => handleDelete(j._id)}>Eliminar</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
