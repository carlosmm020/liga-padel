import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

const Login = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { isAdmin, login, logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(password); // <- espera a que termine
    if (!ok) {
      setError("Contraseña incorrecta");
    } else {
      setError("");
      setPassword("");
    }
  };

  return (
    <div className="login-container">
      <h2>Admin</h2>
      {isAdmin ? (
        <div>
          <div className="login-info-admin">Ya eres administrador.</div>
          <button onClick={logout}>Cerrar sesión</button>
        </div>
      ) : (
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Contraseña de admin"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Entrar</button>
          {error && <div className="login-error">{error}</div>}
        </form>
      )}
    </div>
  );
};

export default Login;
