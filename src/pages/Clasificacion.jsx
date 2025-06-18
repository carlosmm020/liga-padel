import { useState, useEffect } from "react";
import "../styles/Clasificacion.css"
import ordenarClasificacion from "../utils/ordenarClasificacion";

const API_PAREJAS = "http://localhost:5000/api/parejas";
const API_DIVISIONES = "http://localhost:5000/api/divisiones";
const API_PARTIDOS = "http://localhost:5000/api/partidos";

const Clasificacion = () => {
  const [parejas, setParejas] = useState([]);
  const [divisiones, setDivisiones] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [divisionSeleccionada, setDivisionSeleccionada] = useState("1");

  useEffect(() => {
    fetch(API_PAREJAS).then(res => res.json()).then(setParejas);
    fetch(API_DIVISIONES).then(res => res.json()).then(setDivisiones);
    fetch(API_PARTIDOS).then(res => res.json()).then(setPartidos);
  }, []);

  useEffect(() => {
  if (divisiones.length > 0) {
    // Si la división seleccionada no existe, selecciona la de menor número
    const divisionExiste = divisiones.some(d => d.numero === Number(divisionSeleccionada));
    if (!divisionExiste) {
      const primera = [...divisiones].sort((a, b) => a.numero - b.numero)[0];
      setDivisionSeleccionada(primera.numero.toString());
    }
  }
}, [divisiones]);


  // Filtrar parejas y partidos de la división seleccionada
  const numeroDiv = Number(divisionSeleccionada);
  const parejasDiv = parejas.filter(p => !divisionSeleccionada || p.division === numeroDiv);
  const partidosDiv = partidos.filter(p => !divisionSeleccionada || p.division === numeroDiv);

  // Calcula la clasificación
  const clasificacion = parejasDiv.map(pareja => {
    // Partidos donde está esta pareja
    const partidosJugados = partidosDiv.filter(
      partido =>
        partido.estado === "jugado" &&
        (partido.pareja1Id === pareja._id || partido.pareja2Id === pareja._id)
    );

    let puntos = 0;
    let victorias = 0;
    let derrotas = 0;
    let setsAFavor = 0;
    let setsEnContra = 0;
    let juegosAFavor = 0;
    let juegosEnContra = 0;

    partidosJugados.forEach(partido => {
      // Quién es pareja1/2 en este partido
      const soyPareja1 = partido.pareja1Id === pareja._id;

      // Suma sets/juegos
      if (partido.resultado && partido.resultado.sets) {
        partido.resultado.sets.forEach(set => {
          if (soyPareja1) {
            setsAFavor += set.juegosPareja1 > set.juegosPareja2 ? 1 : 0;
            setsEnContra += set.juegosPareja2 > set.juegosPareja1 ? 1 : 0;
            juegosAFavor += set.juegosPareja1;
            juegosEnContra += set.juegosPareja2;
          } else {
            setsAFavor += set.juegosPareja2 > set.juegosPareja1 ? 1 : 0;
            setsEnContra += set.juegosPareja1 > set.juegosPareja2 ? 1 : 0;
            juegosAFavor += set.juegosPareja2;
            juegosEnContra += set.juegosPareja1;
          }
        });
      }

      // Calcula victoria/derrota y puntos
      if (partido.resultado) {
        // Detecta empate 0-0 0-0 (todos los sets 0-0)
        const esEmpate = partido.resultado.sets &&
          partido.resultado.sets.length >= 2 &&
          partido.resultado.sets.every(set => set.juegosPareja1 === 0 && set.juegosPareja2 === 0);

        const setsGana = soyPareja1 ? partido.resultado.setsPareja1 : partido.resultado.setsPareja2;
        const setsPierde = soyPareja1 ? partido.resultado.setsPareja2 : partido.resultado.setsPareja1;

        if (esEmpate) {
          puntos += 1;
          // No suma ni victoria ni derrota
        } else if (setsGana > setsPierde) {
          victorias += 1;
          puntos += 3;
        } else {
          derrotas += 1;
          puntos += 1;
        }
      }
    });

    return {
      pareja,
      puntos,
      victorias,
      derrotas,
      partidosJugados: partidosJugados.length,
      setsAFavor,
      setsEnContra,
      juegosAFavor,
      juegosEnContra
    };
  });

  // Ordenar por puntos, luego diferencia sets, luego juegos
  ordenarClasificacion(clasificacion, partidosDiv);

  return (
    <div className="clasificacion-container">
      <div className="clasificacion-title">Clasificación</div>
      {/* Dropdown de divisiones */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Ver división:&nbsp;
          <select
            value={divisionSeleccionada}
            onChange={e => setDivisionSeleccionada(e.target.value)}
          >
            {divisiones
              .sort((a, b) => a.numero - b.numero)
              .map(d => (
                <option key={d._id} value={d.numero}>
                  División {d.numero} {d.nombre}
                </option>
              ))}
          </select>
        </label>
      </div>
      {/* Tabla de clasificación */}
      <div className="clasificacion-table">
        <table>
          <thead>
            <tr>
              <th>Pos</th>
              <th>Pareja</th>
              <th>Puntos</th>
              <th>Jugados</th>
              <th>Victorias</th>
              <th>Derrotas</th>
              <th>Sets +</th>
              <th>Sets -</th>
              <th>Juegos +</th>
              <th>Juegos -</th>
            </tr>
          </thead>
          <tbody>
            {clasificacion.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ color: "gray" }}>
                  No hay parejas o partidos jugados.
                </td>
              </tr>
            ) : (
              clasificacion.map((row, i) => (
                <tr key={row.pareja._id}>
                  <td>{i + 1}</td>
                  <td>
                    <b>{row.pareja.nombre}</b>
                  </td>
                  <td>{row.puntos}</td>
                  <td>{row.partidosJugados}</td>
                  <td>{row.victorias}</td>
                  <td>{row.derrotas}</td>
                  <td>{row.setsAFavor}</td>
                  <td>{row.setsEnContra}</td>
                  <td>{row.juegosAFavor}</td>
                  <td>{row.juegosEnContra}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Leyenda de criterios de desempate */}
      <div className="clasificacion-leyenda" style={{
        marginTop: "1.6em",
        fontSize: "0.98em",
        color: "#8d2626",
        background: "#fff2f2",
        padding: "1em 1.5em",
        borderRadius: "11px",
        border: "1.2px solid #d32f2f22",
        maxWidth: 560
      }}>
        <b>Criterios de clasificación:</b>
        <ol style={{ paddingLeft: 22, margin: 0, marginTop: 5 }}>
          <li>Puntos totales</li>
          <li>Enfrentamiento directo (mini-liga entre empatados)</li>
          <li>Diferencia de sets en la mini-liga</li>
          <li>Diferencia de juegos en la mini-liga</li>
          <li>Diferencia global de sets</li>
          <li>Diferencia global de juegos</li>
        </ol>
        <span style={{ fontSize: "0.93em", color: "#b71c1c", display: "block", marginTop: 7 }}>
          Si persiste el empate, se mantienen igualados en la tabla.
        </span>
      </div>

    </div>
  );
};

export default Clasificacion;

