import { v4 as uuidv4 } from "uuid";

// parejasPorDivision es un objeto { 1: [parejaA, parejaB, ...], 2: [parejaC, ...], ... }
export function generarPartidos(parejasPorDivision) {
  const partidos = [];
  Object.entries(parejasPorDivision).forEach(([division, parejas]) => {
    for (let i = 0; i < parejas.length; i++) {
      for (let j = i + 1; j < parejas.length; j++) {
        partidos.push({
          id: uuidv4(),
          division: Number(division),
          pareja1Id: parejas[i].id,
          pareja2Id: parejas[j].id,
          resultado: null,
          estado: 'pendiente'
        });
      }
    }
  });
  return partidos;
}
