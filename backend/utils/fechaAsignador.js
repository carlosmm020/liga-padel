// utils/fechaAsignador.js

function generarSlotsDisponibles() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(hoy);
  fin.setDate(hoy.getDate() + 30);

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
      const lastSlot = new Date(d);
      lastSlot.setHours(21, 30, 0, 0);
      slots.push(lastSlot);
    } else if (dia === 0 || dia === 6) { // Sábado/domingo
      for (let h = 9; h <= 12; h++) {
        for (let min of [0, 30]) {
          if (h === 9 && min === 0) continue;
          if (h === 12 && min === 30) continue;
          const slot = new Date(d);
          slot.setHours(h, min, 0, 0);
          slots.push(new Date(slot));
        }
      }
      // Añade 12:30
      const lastSlot = new Date(d);
      lastSlot.setHours(12, 30, 0, 0);
      slots.push(lastSlot);
    }
    d.setDate(d.getDate() + 1);
  }
  return slots;
}

// Fisher-Yates shuffle
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generador de fechas random y sin repetir
function* generarFechasDisponibles() {
  let slots = shuffleArray(generarSlotsDisponibles());
  let idx = 0;
  while (true) {
    if (idx >= slots.length) {
      // Si se acaban, vuelve a generar más aleatorios
      slots = shuffleArray(generarSlotsDisponibles());
      idx = 0;
    }
    yield slots[idx++];
  }
}

module.exports = { generarFechasDisponibles };
