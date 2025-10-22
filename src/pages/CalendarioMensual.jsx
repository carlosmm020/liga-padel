import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { formatISO } from "date-fns";
import "../styles/CalendarioMensual.css";

const API_PARTIDOS = "https://liga-padel.onrender.com/api/partidos";
const API_PAREJAS = "https://liga-padel.onrender.com/api/parejas";
const API_DIVISIONES = "https://liga-padel.onrender.com/api/divisiones";

export default function CalendarioMensual() {
  const [eventos, setEventos] = useState([]);
  const [parejas, setParejas] = useState([]);
  const [divisiones, setDivisiones] = useState([]);
  const [divisionSeleccionada, setDivisionSeleccionada] = useState("");
  const [eventoActivo, setEventoActivo] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const { token, isAdmin } = useAuth();
  const [parejaSeleccionada, setParejaSeleccionada] = useState("");

    
  const parejasDeDivision = divisionSeleccionada
  ? parejas.filter(p => String(p.division) === String(divisionSeleccionada))
  : [];

  useEffect(() => {
    Promise.all([
      fetch(API_PARTIDOS).then(res => res.json()),
      fetch(API_PAREJAS).then(res => res.json()),
      fetch(API_DIVISIONES).then(res => res.json())
    ]).then(([partidos, parejasData, divisionesData]) => {
      setParejas(parejasData);
      setDivisiones(divisionesData);

      const buscarNombre = id => {
        const pareja = parejasData.find(pa => pa._id === id);
        return pareja ? pareja.nombre : "¿?";
      };

      const eventosMapeados = partidos
        .filter(p => p.fecha)
        .map(p => {
          const pareja1 = buscarNombre(p.pareja1Id);
          const pareja2 = buscarNombre(p.pareja2Id);
          return {
            id: p._id,
            title: `${pareja1} vs ${pareja2}`,
            start: p.fecha,
            division: p.division,
            estado: p.estado,
            resultado: p.resultado,
            pareja1,
            pareja2,
            extendedProps: {
              division: p.division,
              estado: p.estado,
              resultado: p.resultado,
              pareja1,
              pareja2,
            },
          };
        });
      setEventos(eventosMapeados);
    }).catch(() => toast.error("No se pudieron cargar los partidos"));
  }, []);

  useEffect(() => {
    setParejaSeleccionada(""); // Resetea el filtro de pareja al cambiar división
  }, [divisionSeleccionada]);


  const handleClickEvento = (info) => {
    if (!isAdmin) return;
    setEventoActivo(info.event);
    setNuevaFecha(formatISO(new Date(info.event.start)).slice(0, 16));
  };

  const guardarFecha = async () => {
    if (!nuevaFecha || !eventoActivo) return;
    try {
      const res = await fetch(`${API_PARTIDOS}/${eventoActivo.id}/fecha`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fecha: nuevaFecha }),
      });
      if (res.ok) {
        toast.success("Fecha actualizada");
        setEventoActivo(null);
        window.location.reload();
      } else {
        toast.error("Error al actualizar");
      }
    } catch (e) {
      toast.error("Error de red");
    }
  };

  const eventosFiltrados = eventos.filter(ev => {
    const coincideDivision = !divisionSeleccionada || String(ev.division) === String(divisionSeleccionada);
    const coincidePareja = !parejaSeleccionada ||
      ev.pareja1 === parejaSeleccionada ||
      ev.pareja2 === parejaSeleccionada;
    return coincideDivision && coincidePareja;
  });

  // --- Renderizador de eventos personalizado
  function renderEventoPersonalizado(arg) {
    const evento = arg.event.extendedProps;
    const estado = evento.estado || "pendiente";
    let color = "#d32f2f";
    let bg = "#ffebee";
    let icon = "🕓";

    if (estado === "jugado") {
      color = "#239C45";
      bg = "#e0f9e2";
      icon = "✅";
    }

    // Hora formato hh:mm siempre
    const fechaObj = arg.event.start;
    const hora = fechaObj
      ? fechaObj.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
      : "";

    // Título legible, recorta si es muy largo (pero deja tooltip)
    let title = `${hora} - ${arg.event.title}`;
    if (title.length > 32) {
      title = title.slice(0, 29) + "...";
    }

    // Tooltip con todos los detalles
    const tooltip = [
      `${hora} - ${arg.event.title}`,
      evento.resultado && evento.resultado.setsPareja1 !== undefined && evento.resultado.setsPareja2 !== undefined
        ? `Resultado: ${evento.resultado.setsPareja1}-${evento.resultado.setsPareja2}`
        : "",
      `División: ${evento.division || "?"}`,
      `Estado: ${estado === "jugado" ? "Jugado" : "Pendiente"}`,
    ]
      .filter(Boolean)
      .join("\n");

    return (
      <div
        style={{
          background: bg,
          color,
          borderRadius: 8,
          padding: "2px 7px",
          fontWeight: 500,
          fontSize: "0.98em",
          display: "flex",
          alignItems: "center",
          gap: 7,
          border: `1.3px solid ${color}`,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: 220,
        }}
        title={tooltip}
      >
        <span style={{ fontSize: "1.07em" }}>{icon}</span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
      </div>
    );
  }

  return (
    <div className="calendario-mensual-container">
      <div className="calendario-mensual-title">Calendario de Partidos</div>
      <div className="calendario-mensual-filtros" style={{ marginBottom: 20, textAlign: "center" }}>
        <label style={{ fontWeight: 700, marginRight: 10 }}>
          Ver división:{" "}
          <select
            value={divisionSeleccionada}
            onChange={e => setDivisionSeleccionada(e.target.value)}
          >
            <option value="">Todas</option>
            {divisiones
              .sort((a, b) => a.numero - b.numero)
              .map(d => (
                <option key={d._id} value={d.numero}>
                  División {d.numero} {d.nombre}
                </option>
              ))}
          </select>
          {divisionSeleccionada && (
            <label style={{ fontWeight: 700, marginLeft: 20 }}>
              Ver solo la pareja:{" "}
              <select
                value={parejaSeleccionada}
                onChange={e => setParejaSeleccionada(e.target.value)}
              >
                <option value="">Todas</option>
                {parejasDeDivision.map(p => (
                  <option key={p._id} value={p.nombre}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </label>
          )}
        </label>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={eventosFiltrados}
        locale="es"
        height="auto"
        eventClick={handleClickEvento}
        eventContent={renderEventoPersonalizado}
      />

      {/* Modal para editar fecha */}
      {eventoActivo && (
        <div className="calendario-mensual-modal-bg">
          <div className="calendario-mensual-modal">
            <h3>Editar fecha del partido</h3>
            <p>{eventoActivo.title}</p>
            <input
              type="datetime-local"
              value={nuevaFecha}
              onChange={(e) => setNuevaFecha(e.target.value)}
            />
            <div className="calendario-mensual-modal-actions">
              <button onClick={() => setEventoActivo(null)}>Cancelar</button>
              <button onClick={guardarFecha}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
