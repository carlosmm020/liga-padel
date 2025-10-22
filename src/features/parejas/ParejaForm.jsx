import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const API_JUGADORES = "https://liga-padel.onrender.com/api/jugadores";

export default function ParejaForm({
  pareja,
  divisiones,
  onSave,
  onCancel
}) {
  const { token } = useAuth();
  const [nombre, setNombre] = useState(pareja?.nombre || "");
  const [jugador1Id, setJugador1Id] = useState(pareja?.jugador1Id || "");
  const [jugador2Id, setJugador2Id] = useState(pareja?.jugador2Id || "");
  const [division, setDivision] = useState(pareja?.division || "");
  const [jugadores, setJugadores] = useState([]);

  useEffect(() => {
    fetch(API_JUGADORES)
      .then(res => res.json())
      .then(setJugadores)
      .catch(() => toast.error("Error cargando jugadores"));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre || !jugador1Id || !jugador2Id || !division) {
      toast.info("Completa todos los campos");
      return;
    }
    if (jugador1Id === jugador2Id) {
      toast.info("Los jugadores deben ser diferentes");
      return;
    }
    onSave({
      nombre,
      jugador1Id,
      jugador2Id,
      division
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, flexDirection: "column" }}>
      <input
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        placeholder="Nombre de la pareja"
        required
      />
      <select
        value={jugador1Id}
        onChange={e => setJugador1Id(e.target.value)}
        required
      >
        <option value="">Jugador 1</option>
        {jugadores.map(j => (
          <option key={j._id} value={j._id}>{j.nombreCompleto}</option>
        ))}
      </select>
      <select
        value={jugador2Id}
        onChange={e => setJugador2Id(e.target.value)}
        required
      >
        <option value="">Jugador 2</option>
        {jugadores.map(j => (
          <option key={j._id} value={j._id}>{j.nombreCompleto}</option>
        ))}
      </select>
      <select
        value={division}
        onChange={e => setDivision(e.target.value)}
        required
      >
        <option value="">División</option>
        {divisiones.map(d => (
          <option key={d._id} value={d.numero}>
            División {d.numero} {d.nombre}
          </option>
        ))}
      </select>
      <div>
        <button type="submit">{pareja ? "Actualizar" : "Crear pareja"}</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancelar</button>}
      </div>
    </form>
  );
}
