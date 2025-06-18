import { createContext, useContext, useState } from "react";

const PartidosContext = createContext();

export function usePartidosContext() {
  return useContext(PartidosContext);
}

export function PartidosProvider({ children }) {
  const [partidos, setPartidos] = useState([]);

  const generarPartidos = (nuevosPartidos) => setPartidos(nuevosPartidos);

  const actualizarResultado = (partidoId, resultado) => {
    setPartidos((prev) =>
      prev.map((p) =>
        p.id === partidoId
          ? { ...p, resultado, estado: "jugado" }
          : p
      )
    );
  };

  return (
    <PartidosContext.Provider
      value={{ partidos, generarPartidos, actualizarResultado }}
    >
      {children}
    </PartidosContext.Provider>
  );
}
