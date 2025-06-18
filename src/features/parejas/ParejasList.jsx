const ParejasList = ({ parejas, divisiones, onEdit, onDelete }) => (
  <table>
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Jugador 1</th>
        <th>Jugador 2</th>
        <th>División</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {parejas.length === 0 ? (
        <tr>
          <td colSpan={5} style={{ color: "gray" }}>No hay parejas registradas.</td>
        </tr>
      ) : (
        parejas.map(p => (
          <tr key={p._id || p.id}>
            <td>{p.nombre}</td>
            <td>{p.jugador1}</td>
            <td>{p.jugador2}</td>
            <td>
              {divisiones.find(d => d.numero === p.division)?.nombre || p.division}
            </td>
            <td>
              <button onClick={() => onEdit(p)}>Editar</button>
              <button onClick={() => onDelete(p._id || p.id)}>Eliminar</button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);

export default ParejasList;
