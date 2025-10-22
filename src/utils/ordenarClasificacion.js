function miniLiga(parejasEmpatadas, partidosDiv) {
  // IDs de las parejas empatadas
  const ids = parejasEmpatadas.map(p => p.pareja._id);

  // Filtra solo los partidos entre las parejas empatadas
  const partidosMini = partidosDiv.filter(
    partido =>
      partido.estado === "jugado" &&
      ids.includes(partido.pareja1Id) &&
      ids.includes(partido.pareja2Id)
  );

  // Saca una clasificación solo para la mini-liga
  return parejasEmpatadas.map(row => {
    let puntos = 0, setsAFavor = 0, setsEnContra = 0, juegosAFavor = 0, juegosEnContra = 0;

    partidosMini.forEach(partido => {
      const soyP1 = partido.pareja1Id === row.pareja._id;
      const soyP2 = partido.pareja2Id === row.pareja._id;
      if (!soyP1 && !soyP2) return;

      // Empate
      const esEmpate = partido.resultado.sets &&
        partido.resultado.sets.length >= 2 &&
        partido.resultado.sets.every(set => set.juegosPareja1 === 0 && set.juegosPareja2 === 0);

      let setsGana = soyP1 ? partido.resultado.setsPareja1 : partido.resultado.setsPareja2;
      let setsPierde = soyP1 ? partido.resultado.setsPareja2 : partido.resultado.setsPareja1;

      // Suma sets/juegos
      partido.resultado.sets.forEach(set => {
        if (soyP1) {
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

      // Suma puntos
      if (esEmpate) {
        puntos += 1;
      } else if (setsGana > setsPierde) {
        puntos += 3;
      } else {
        puntos += 1;
      }
    });

    return {
      ...row,
      miniPuntos: puntos,
      miniSets: setsAFavor - setsEnContra,
      miniJuegos: juegosAFavor - juegosEnContra,
    };
  });
}

// Esta es la nueva función de ordenación, más compleja pero precisa
function ordenarClasificacion(clasificacion, partidosDiv) {
  // 1º Ordena por puntos
  clasificacion.sort((a, b) => b.puntos - a.puntos);

  // 2º Encuentra grupos de empatados a puntos
  let i = 0;
  while (i < clasificacion.length) {
    let j = i + 1;
    // Busca el rango [i,j) donde hay empate a puntos
    while (j < clasificacion.length && clasificacion[j].puntos === clasificacion[i].puntos) {
      j++;
    }
    const grupoEmpatado = clasificacion.slice(i, j);

    // Solo aplica la mini-liga si hay más de 1 empatado
    if (grupoEmpatado.length > 1) {
      // Mini-liga: solo entre los empatados
      const mini = miniLiga(grupoEmpatado, partidosDiv);
      // Ordena el grupo según miniPuntos, miniSets, miniJuegos, y luego criterios globales por si sigue habiendo empate
      mini.sort(
        (a, b) =>
          b.miniPuntos - a.miniPuntos ||
          b.miniSets - a.miniSets ||
          b.miniJuegos - a.miniJuegos ||
          (b.setsAFavor - b.setsEnContra) - (a.setsAFavor - a.setsEnContra) ||
          (b.juegosAFavor - b.juegosEnContra) - (a.juegosAFavor - a.juegosEnContra)
      );
      // Reemplaza el grupo empatado por el ordenado por mini-liga
      for (let k = 0; k < mini.length; k++) {
        clasificacion[i + k] = mini[k];
      }
    }
    i = j;
  }
  return clasificacion;
}

export default ordenarClasificacion;