import { createContext, useContext, useMemo, useState } from "react";
import { post } from "./api";
import { TRANSLATIONS } from "./translations";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("ner_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [role, setRole] = useState(() => localStorage.getItem("ner_role") || user?.role || "Citizen");
  const [lang, setLangState] = useState(() => localStorage.getItem("ner_lang") || "en");

  const login = async (username, password) => {
    const data = await post("/api/auth/login", { username, password });
    localStorage.setItem("ner_token", data.access_token);
    localStorage.setItem("ner_user", JSON.stringify(data.user));
    localStorage.setItem("ner_role", data.user.role);
    setUser(data.user);
    setRole(data.user.role);
    return data.user;
  };

  const register = async (userData) => {
    const data = await post("/api/auth/register", userData);
    if (data.access_token) {
      localStorage.setItem("ner_token", data.access_token);
      localStorage.setItem("ner_user", JSON.stringify(data.user));
      localStorage.setItem("ner_role", data.user.role);
      setUser(data.user);
      setRole(data.user.role);
    }
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("ner_token");
    localStorage.removeItem("ner_user");
    setUser(null);
  };

  const switchRole = (r) => {
    setRole(r);
    localStorage.setItem("ner_role", r);
  };

  const switchLang = (l) => {
    setLangState(l);
    localStorage.setItem("ner_lang", l);
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const value = useMemo(
    () => ({ user, role, login, register, logout, switchRole, lang, switchLang, t }),
    [user, role, lang, t]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function canSee(role, min) {
  const order = ["Citizen", "Field Officer", "Disaster Management Authority", "Admin"];
  return order.indexOf(role) >= order.indexOf(min);
}
