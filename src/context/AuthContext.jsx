import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsAdmin(decoded?.user === "admin");
      } catch (e) {
        setIsAdmin(false);
        setToken("");
        localStorage.removeItem("token");
      }
    } else {
      setIsAdmin(false);
    }
  }, [token]);

  // NUEVO: login hace el fetch
  const login = async (password) => {
    try {
      const res = await fetch("https://liga-padel.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (!data.token) return false;
      setToken(data.token);
      localStorage.setItem("token", data.token);
      return true;
    } catch (err) {
      return false;
    }
  };

  const logout = () => {
    setToken("");
    setIsAdmin(false);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ token, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
