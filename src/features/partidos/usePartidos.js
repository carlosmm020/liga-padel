import { useState } from "react";
import { generarPartidos } from "./generarPartidos";

const usePartidos = (parejas) => {
  // Agrupa parejas por división
  const parejasPorDivision = parejas.reduce((acc, p) => {
    acc[p.division] = acc[p.division] || [];
    acc[p.division].push(p);
    return acc;
  }, {});

  // Estado de partidos
  const [partidos, setPartidos] = useState([]);

  // Generar nuevos partidos (por ejemplo, al arrancar el mes)
  const generar = () => {
    const nuevos = generarPartidos(parejasPorDivision);
    setPartidos(nuevos);
  };

  // Actualizar resultado de un partido
  const actualizarResultado = (partidoId, resultado) => {
    setPartidos(
      partidos.map((p) =>
        p.id === partidoId
          ? { ...p, resultado, estado: "jugado" }
          : p
      )
    );
  };

  return {
    partidos,
    generar,
    actualizarResultado,
  };
};

export default usePartidos;
