import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/Resultados.css";

// Un mini spinner simple
const Spinner = () => (
  <span className="mini-spinner" style={{
    display: "inline-block",
    width: 18, height: 18, border: "2.5px solid #d32f2f30",
    borderTop: "2.5px solid #d32f2f", borderRadius: "50%",
    animation: "spin 0.7s linear infinite", margin: "0 6px"
  }} />
);

const API_PARTIDOS = "https://liga-padel.onrender.com/api/partidos";
const API_DIVISIONES = "https://liga-padel.onrender.com/api/divisiones";
const API_PAREJAS = "https://liga-padel.onrender.com/api/parejas";

// --- FUNCIÓN PARA FECHAS ALEATORIAS VÁLIDAS ---
function getRandomFechaEnRango() {
  const hoy = new Date();
  hoy.setHours(0,0,0,0);
  const fin = new Date(hoy);
  fin.setDate(hoy.getDate() + 30);

  // Crear slots válidos
  const slots = [];
  let d = new Date(hoy);
  while (d <= fin) {
    const dia = d.getDay(); // 0-dom, 1-lun ... 6-sab
    if (dia >= 1 && dia <= 5) { // Lunes a viernes
      for (let h = 18; h <= 21; h++) {
        for (let min of [0, 30]) {
          if (h === 21 && min === 30) continue;
          const slot = new Date(d);
          slot.setHours(h, min, 0, 0);
          slots.push(new Date(slot));
        }
      }
      // Añade 21:30
      const lastSlot = new Date(d); lastSlot.setHours(21, 30, 0, 0); slots.push(lastSlot);
    } else if (dia === 0 || dia === 6) { // Sábado/domingo
      for (let h = 9; h <= 12; h++) {
        for (let min of [0, 30]) {
          if (h === 9 && min === 0) continue; // No 9:00
          if (h === 12 && min === 30) continue; // 12:30 último
          const slot = new Date(d);
          slot.setHours(h, min, 0, 0);
          slots.push(new Date(slot));
        }
      }
      // Añade 12:30
      const lastSlot = new Date(d); lastSlot.setHours(12, 30, 0, 0); slots.push(lastSlot);
    }
    d.setDate(d.getDate() + 1);
  }
  // Devolver uno aleatorio
  const idx = Math.floor(Math.random() * slots.length);
  return slots[idx];
}

const Resultados = () => {
  const { isAdmin, token } = useAuth();
  const [partidos, setPartidos] = useState([]);
  const [divisiones, setDivisiones] = useState([]);
  const [parejas, setParejas] = useState([]);
  const [divisionSeleccionada, setDivisionSeleccionada] = useState("");
  const [editandoPartido, setEditandoPartido] = useState(null);
  const [filtroPareja, setFiltroPareja] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingAccion, setLoadingAccion] = useState(false);
  const [editandoFecha, setEditandoFecha] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [modalBorrar, setModalBorrar] = useState({ abierto: false, partido: null });

  

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(API_PARTIDOS).then(res => res.json()),
      fetch(API_DIVISIONES).then(res => res.json()),
      fetch(API_PAREJAS).then(res => res.json())
    ]).then(([p, d, pa]) => {
      setPartidos(p);
      setDivisiones(d);
      setParejas(pa);
    }).catch(() => {
      toast.error("Error al cargar los datos");
    }).finally(() => setLoading(false));
  }, []);

  const abrirModalBorrarResultado = (partido) => {
    setModalBorrar({ abierto: true, partido });
  };

  const actualizarPartidos = () => {
    setLoading(true);
    fetch(API_PARTIDOS)
      .then(res => res.json())
      .then(setPartidos)
      .catch(() => toast.error("Error al actualizar la lista"))
      .finally(() => setLoading(false));
  };

  // --- GUARDAR RESULTADO DE PARTIDO ---
  const handleResultado = async (partido, resultado) => {
    if (!token) return toast.warn("No tienes permisos.");
    const esEmpate = resultado.sets &&
      resultado.sets.length >= 2 &&
      resultado.sets.every(set => set.juegosPareja1 === 0 && set.juegosPareja2 === 0);

    if (!(esEmpate || resultado.setsPareja1 === 2 || resultado.setsPareja2 === 2)) {
      toast.info("Debe haber un ganador a 2 sets o empate 0-0 0-0.");
      return;
    }
    setLoadingAccion(true);
    try {
      const res = await fetch(`${API_PARTIDOS}/${partido._id}/resultado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          resultado,
          estado: "jugado"
        })
      });
      if (res.ok) {
        toast.success("¡Resultado guardado!");
        actualizarPartidos();
      } else {
        toast.error("Error al guardar resultado");
      }
    } catch (e) {
      toast.error("Error de red al guardar resultado");
    }
    setLoadingAccion(false);
  };

  // Borrar resultado de un partido
  const handleBorrarResultado = async () => {
    const partido = modalBorrar.partido;
    if (!token) {
      toast.warn("No tienes permisos.");
      return;
    }
    setLoadingAccion(true);
    try {
      const res = await fetch(`${API_PARTIDOS}/${partido._id}/resultado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          resultado: null,
          estado: "pendiente"
        })
      });
      if (res.ok) {
        toast.success("Resultado borrado");
        actualizarPartidos();
      } else {
        toast.error("Error al borrar el resultado");
      }
    } catch (e) {
      toast.error("Error de red al borrar resultado");
    }
    setLoadingAccion(false);
    setModalBorrar({ abierto: false, partido: null });
  };


 // --- BORRAR TODOS LOS PARTIDOS ---
  const borrarTodosLosPartidos = async () => {
    // Nuevo endpoint, solo una llamada
    await fetch(API_PARTIDOS, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
  };

  // --- GENERAR CALENDARIO ---
  const handleGenerarCalendario = async () => {
    if (!isAdmin) return toast.error("No tienes permisos para generar el calendario.");

    // 1. Todos contra todos de cada división (solo las que tengan 2 o más parejas)
    let partidosAGenerar = [];
    divisiones.forEach(division => {
      const parejasDivision = parejas.filter(p => p.division === division.numero);
      if (parejasDivision.length < 2) return;

      for (let i = 0; i < parejasDivision.length; i++) {
        for (let j = i + 1; j < parejasDivision.length; j++) {
          partidosAGenerar.push({
            division: division.numero,
            pareja1Id: parejasDivision[i]._id,
            pareja2Id: parejasDivision[j]._id,
            resultado: null,
            estado: "pendiente",
            fecha: getRandomFechaEnRango().toISOString(),
          });
        }
      }
    });

    if (partidosAGenerar.length === 0) {
      return toast.info("No hay emparejamientos posibles para generar calendario.");
    }

    try {
      // Borra todos los partidos antiguos
      if (partidos.length > 0) {
        await borrarTodosLosPartidos();
      }
      // Crea los nuevos partidos
      await Promise.all(
        partidosAGenerar.map(partido =>
          fetch(API_PARTIDOS, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(partido),
          })
        )
      );
      toast.success("¡Calendario generado correctamente!");
      actualizarPartidos();
    } catch (e) {
      toast.error("Error generando partidos. Intenta de nuevo.");
    }
  };

  // ---- FILTROS y lógica para mostrar el botón ---
  const parejasEnDivision = divisionSeleccionada
    ? parejas.filter(p => p.division === Number(divisionSeleccionada))
    : parejas;

  const partidosEnDivisionSeleccionada = divisionSeleccionada
    ? partidos.filter(p => p.division === Number(divisionSeleccionada))
    : partidos;

  const partidosDivision = partidos.filter(p => {
    const pareja1Existe = parejas.some(pa => pa._id === p.pareja1Id);
    const pareja2Existe = parejas.some(pa => pa._id === p.pareja2Id);

    let divisionMatch = !divisionSeleccionada
      ? pareja1Existe && pareja2Existe
      : (p.division === Number(divisionSeleccionada) && pareja1Existe && pareja2Existe);

    if (filtroPareja) {
      return divisionMatch && (p.pareja1Id === filtroPareja || p.pareja2Id === filtroPareja);
    }
    return divisionMatch;
  });

  // --- BOTÓN SOLO AL PRINCIPIO O AL FINAL ---
  const todosJugados = partidos.length > 0 && partidos.every(p => p.estado === "jugado");
  const hayPartidos = partidos.length > 0;
  const mostrarBotonGenerarCalendario = isAdmin && (!hayPartidos || todosJugados);

  // --- resto igual ---
  const parejasDeLosPartidos = Array.from(new Set(
    partidosEnDivisionSeleccionada.flatMap(p => [p.pareja1Id, p.pareja2Id])
  ));
  const mismosIntegrantes = parejasEnDivision.length > 0 &&
    parejasEnDivision.length === parejasDeLosPartidos.length &&
    parejasEnDivision.every(p => parejasDeLosPartidos.includes(p._id));

  const todosJugadosDivision = partidosEnDivisionSeleccionada.length > 0 &&
    partidosEnDivisionSeleccionada.every(p => p.estado === "jugado");

  const mostrarAvisoRondaFinalizada =
    isAdmin &&
    mismosIntegrantes &&
    todosJugadosDivision &&
    !filtroPareja;

  const parejasFiltradas = divisionSeleccionada
    ? parejas.filter(p => p.division === Number(divisionSeleccionada))
    : [];

  return (
    <div className="resultados-container">
      <div className="resultados-title">Resultados de Partidos</div>
      <div className="resultados-filtros">
        <label>
          Ver división:&nbsp;
          <select
            value={divisionSeleccionada}
            onChange={e => {
              setDivisionSeleccionada(e.target.value);
              setFiltroPareja("");
            }}
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
        </label>
      {divisionSeleccionada && (
        <label>
          Ver solo la pareja:&nbsp;
          <select
            value={filtroPareja}
            onChange={e => setFiltroPareja(e.target.value)}
            style={{ minWidth: 180 }}
            disabled={!divisionSeleccionada}
          >
            <option value="">Todas</option>
            {parejasFiltradas.map(p => (
              <option key={p._id} value={p._id}>{p.nombre}</option>
            ))}
          </select>
        </label>
      )}
      </div>
      {/* AVISO de ronda finalizada */}
      {mostrarAvisoRondaFinalizada && (
        <div style={{
          background: "#ffebee",
          color: "#b71c1c",
          border: "1.5px solid #e57373",
          borderRadius: "12px",
          margin: "1.3rem 0 1.4rem 0",
          padding: "1rem 2rem",
          fontWeight: 600,
          fontSize: "1.06em",
          boxShadow: "0 2px 9px #b71c1c11"
        }}>
          <div>
            <span style={{ fontSize: "1.12em" }}>¡Ronda finalizada en esta división!</span>
            <br />
            <span style={{ fontWeight: 400, color: "#d32f2f" }}>
              Ahora puedes hacer los ascensos y descensos en la página de Divisiones.
              <br />Después podrás volver aquí y generar el nuevo calendario de la división.
            </span>
          </div>
          <button
            style={{
              marginTop: "1.1rem",
              background: "#e53935",
              color: "#fff",
              border: "none",
              borderRadius: "7px",
              padding: "0.5rem 1.3rem",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "1em",
              boxShadow: "0 2px 7px #d32f2f22"
            }}
            onClick={() => window.location.href = "/divisiones"}
          >
            Ir a gestión de divisiones
          </button>
        </div>
      )}

      {/* Botón para generar nuevo calendario */}
      {mostrarBotonGenerarCalendario && (
        <div style={{ textAlign: "center", margin: "2.5rem 0" }}>
          <button
            className="btn-generar-calendario"
            onClick={handleGenerarCalendario}
            style={{
              background: "#d32f2f",
              color: "#fff",
              fontWeight: 800,
              borderRadius: 10,
              fontSize: "1.13em",
              padding: "1em 2em",
              boxShadow: "0 2px 12px #d32f2f26",
              border: "none",
              cursor: "pointer"
            }}
          >
            Generar nuevo calendario
          </button>
        </div>
      )}

      <div className="resultados-table">
        {loading ? (
          <div style={{ padding: "2.5rem", textAlign: "center" }}>
            <Spinner /> Cargando partidos...
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Pareja 1</th>
                <th>Pareja 2</th>
                <th>Resultado</th>
                <th>Estado</th>
                <th>Fecha</th>
                {isAdmin && <th>Acción</th>}
              </tr>
            </thead>
            <tbody>
              {partidosDivision.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} style={{ color: "gray" }}>
                    No hay partidos en esta división.
                  </td>
                </tr>
              ) : (
                partidosDivision.map(p => (
                  <tr key={p._id}>
                    <td>
                      {parejas.find(pa => pa._id === p.pareja1Id)?.nombre || "Pareja 1"}
                    </td>
                    <td>
                      {parejas.find(pa => pa._id === p.pareja2Id)?.nombre || "Pareja 2"}
                    </td>
                    <td>
                      {p.resultado && p.resultado.sets && p.resultado.sets.length > 0 ? (
                        <div className="resultado-detalle">
                          <div className="resultado-sets">
                            {p.resultado.sets.map(
                              (set, idx) =>
                                <span key={idx} style={{ marginRight: 6 }}>
                                  {set.juegosPareja1}-{set.juegosPareja2}
                                </span>
                            )}
                          </div>
                          <div className="resultado-global">
                            ({p.resultado.setsPareja1}-{p.resultado.setsPareja2})
                          </div>
                        </div>
                      ) : "-"}
                    </td>
                    <td>{p.estado === "jugado" ? "Jugado" : "Pendiente"}</td>
                    <td>
                      {p.fecha
                        ? new Date(p.fecha).toLocaleString("es-ES", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "-"}
                    </td>
                    {isAdmin && (
                      <td>
                        {(editandoPartido === p._id || p.estado !== "jugado") ? (
                          <form
                            className="form-editar-resultado"
                            onSubmit={e => {
                              e.preventDefault();
                              const set1p1 = Number(e.target.set1p1.value);
                              const set1p2 = Number(e.target.set1p2.value);
                              const set2p1 = Number(e.target.set2p1.value);
                              const set2p2 = Number(e.target.set2p2.value);
                              const set3p1 = e.target.set3p1.value ? Number(e.target.set3p1.value) : null;
                              const set3p2 = e.target.set3p2.value ? Number(e.target.set3p2.value) : null;

                              // Construye los sets:
                              const sets = [
                                { juegosPareja1: set1p1, juegosPareja2: set1p2 },
                                { juegosPareja1: set2p1, juegosPareja2: set2p2 },
                              ];
                              // Solo añade el tercer set si tiene datos (distinto de null o ambos 0)
                              if (
                                (set3p1 !== null && set3p2 !== null) &&
                                (set3p1 !== 0 || set3p2 !== 0)
                              ) {
                                sets.push({ juegosPareja1: set3p1, juegosPareja2: set3p2 });
                              }

                              // Calcula sets ganados
                              let setsPareja1 = 0;
                              let setsPareja2 = 0;
                              sets.forEach(set => {
                                if (set.juegosPareja1 > set.juegosPareja2) setsPareja1++;
                                else if (set.juegosPareja2 > set.juegosPareja1) setsPareja2++;
                              });

                              // --- Empate: todos los juegos son 0-0 en todos los sets (permite 2 o 3 sets)
                              const esEmpate = sets.every(set =>
                                set.juegosPareja1 === 0 && set.juegosPareja2 === 0
                              );

                              if (!(esEmpate || setsPareja1 === 2 || setsPareja2 === 2)) {
                                toast.info("Debe haber un ganador a 2 sets o empate 0-0 0-0.");
                                return;
                              }
                                  
                              handleResultado(p, { sets, setsPareja1, setsPareja2 });
                              setEditandoPartido(null);
                            }}
                          >
                            {/* Set 1 */}
                            <input
                              name="set1p1"
                              type="number"
                              min="0"
                              max="7"
                              required
                              className="input-set"
                              defaultValue={p.resultado?.sets?.[0]?.juegosPareja1 || ""}
                            />
                            <span>-</span>
                            <input
                              name="set1p2"
                              type="number"
                              min="0"
                              max="7"
                              required
                              className="input-set"
                              defaultValue={p.resultado?.sets?.[0]?.juegosPareja2 || ""}
                            />
                            {/* Set 2 */}
                            <input
                              name="set2p1"
                              type="number"
                              min="0"
                              max="7"
                              required
                              className="input-set"
                              defaultValue={p.resultado?.sets?.[1]?.juegosPareja1 || ""}
                            />
                            <span>-</span>
                            <input
                              name="set2p2"
                              type="number"
                              min="0"
                              max="7"
                              required
                              className="input-set"
                              defaultValue={p.resultado?.sets?.[1]?.juegosPareja2 || ""}
                            />
                            {/* Set 3 */}
                            <input
                              name="set3p1"
                              type="number"
                              min="0"
                              max="7"
                              className="input-set"
                              defaultValue={p.resultado?.sets?.[2]?.juegosPareja1 || ""}
                            />
                            <span>-</span>
                            <input
                              name="set3p2"
                              type="number"
                              min="0"
                              max="7"
                              className="input-set"
                              defaultValue={p.resultado?.sets?.[2]?.juegosPareja2 || ""}
                            />
                            <span className="botones-edicion">
                              <button type="submit" disabled={loadingAccion}>
                                {loadingAccion ? <Spinner /> : "Guardar"}
                              </button>
                              {p.estado === "jugado" && (
                                <button
                                  type="button"
                                  onClick={() => setEditandoPartido(null)}
                                  style={{ background: "var(--gris)", color: "#000", border: "1px solid #bbb" }}
                                  disabled={loadingAccion}
                                >
                                  Cancelar
                                </button>
                              )}
                            </span>
                          </form>
                        ) : (
                          <div style={{ display: "flex", gap: "7px" }}>
                            <button onClick={() => setEditandoPartido(p._id)} disabled={loadingAccion}>
                              Editar
                            </button>
                            {/* Botón borrar resultado solo si ya tiene resultado */}
                            {p.resultado && (
                              <button
                                onClick={() => abrirModalBorrarResultado(p)} disabled={loadingAccion}
                              >
                                Borrar resultado
                              </button>

                            )}
                            {editandoFecha === p._id ? (
                              <>
                                <input
                                  type="datetime-local"
                                  value={nuevaFecha}
                                  onChange={e => setNuevaFecha(e.target.value)}
                                />
                                <button onClick={() => handleActualizarFecha(p._id)} style={{ marginLeft: 6 }}>Guardar</button>
                                <button onClick={() => setEditandoFecha(null)} style={{ marginLeft: 6 }}>Cancelar</button>
                              </>
                            ) : (
                              <button onClick={() => {
                                setEditandoFecha(p._id);
                                setNuevaFecha(p.fecha ? new Date(p.fecha).toISOString().slice(0, 16) : "");
                              }}>
                                Editar fecha
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      {/* Mini spinner CSS */}
      <style>
        {`@keyframes spin{to{transform:rotate(360deg)}}`}
      </style>
      <ConfirmModal
        open={modalBorrar.abierto}
        title="Borrar resultado"
        message={`¿Seguro que quieres borrar el resultado\ndel partido entre:\n${modalBorrar.partido
          ? `${parejas.find(pa => pa._id === modalBorrar.partido.pareja1Id)?.nombre || "Pareja 1"} vs ${parejas.find(pa => pa._id === modalBorrar.partido.pareja2Id)?.nombre || "Pareja 2"}`
          : ""}?`}
        confirmText="Borrar"
        cancelText="Cancelar"
        onConfirm={handleBorrarResultado}
        onCancel={() => setModalBorrar({ abierto: false, partido: null })}
        loading={loadingAccion}
      />
    </div>
  );
};

export default Resultados;
