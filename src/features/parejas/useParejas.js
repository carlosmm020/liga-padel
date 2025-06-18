import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const divisionesPorDefecto = Array.from({ length: 10 }, (_, i) => i + 1);

const useParejas = () => {
  const [parejas, setParejas] = useState([]);
  const [divisiones, setDivisiones] = useState(divisionesPorDefecto);

  const addPareja = (pareja) => {
    setParejas([...parejas, { ...pareja, id: uuidv4() }]);
  };

  const updatePareja = (id, parejaActualizada) => {
    setParejas(
      parejas.map((p) => (p.id === id ? { ...p, ...parejaActualizada } : p))
    );
  };

  const deletePareja = (id) => {
    setParejas(parejas.filter((p) => p.id !== id));
  };

  return {
    parejas,
    divisiones,
    addPareja,
    updatePareja,
    deletePareja,
    setDivisiones, // Por si luego quieres cambiar el número de divisiones
  };
};

export default useParejas;
