import { createContext, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const divisionesPorDefecto = Array.from({ length: 10 }, (_, i) => i + 1);

const ParejasContext = createContext();

export function useParejasContext() {
  return useContext(ParejasContext);
}

export function ParejasProvider({ children }) {
  const [parejas, setParejas] = useState([]);
  const [divisiones, setDivisiones] = useState(divisionesPorDefecto);

  const addPareja = (pareja) => {
    setParejas((prev) => [...prev, { ...pareja, id: uuidv4() }]);
  };

  const updatePareja = (id, parejaActualizada) => {
    setParejas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...parejaActualizada } : p))
    );
  };

  const deletePareja = (id) => {
    setParejas((prev) => prev.filter((p) => p.id !== id));
  };

  const value = {
    parejas,
    divisiones,
    addPareja,
    updatePareja,
    deletePareja,
    setDivisiones,
  };

  return (
    <ParejasContext.Provider value={value}>
      {children}
    </ParejasContext.Provider>
  );
}
