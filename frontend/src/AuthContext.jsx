import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { post } from "./api";
import { TRANSLATIONS } from "./translations";

const AuthContext = createContext(null);

const DEFAULT_SAVED_LOCATIONS = [
  { id: 1, name: "Shillong", category: "Home", state: "Meghalaya", alertsEnabled: true, lastRisk: 74, status: "HIGH" },
  { id: 2, name: "Gangtok", category: "College", state: "Sikkim", alertsEnabled: true, lastRisk: 68, status: "HIGH" },
  { id: 3, name: "Guwahati", category: "Family", state: "Assam", alertsEnabled: true, lastRisk: 52, status: "MODERATE" },
  { id: 4, name: "Darjeeling", category: "Travel", state: "West Bengal", alertsEnabled: false, lastRisk: 61, status: "HIGH" },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("bhusurakha_user") || localStorage.getItem("disastershield_user") || localStorage.getItem("ner_user");
    return raw ? JSON.parse(raw) : null;
  });

  const [role, setRole] = useState(() => {
    return localStorage.getItem("bhusurakha_role") || localStorage.getItem("disastershield_role") || user?.role || "Citizen";
  });

  const [lang, setLangState] = useState(() => {
    return localStorage.getItem("bhusurakha_lang") || localStorage.getItem("disastershield_lang") || "en";
  });

  const [savedLocations, setSavedLocations] = useState(() => {
    try {
      const raw = localStorage.getItem("bhusurakha_saved_places") || localStorage.getItem("disastershield_saved_places");
      return raw ? JSON.parse(raw) : DEFAULT_SAVED_LOCATIONS;
    } catch (e) {
      return DEFAULT_SAVED_LOCATIONS;
    }
  });

  const [isOnboarded, setIsOnboarded] = useState(() => {
    return localStorage.getItem("bhusurakha_onboarded") === "true";
  });

  useEffect(() => {
    try {
      localStorage.setItem("bhusurakha_saved_places", JSON.stringify(savedLocations));
    } catch (e) {}
  }, [savedLocations]);

  const addSavedLocation = (loc) => {
    setSavedLocations((prev) => {
      const exists = prev.find((p) => p.name.toLowerCase() === loc.name.toLowerCase());
      if (exists) return prev;
      return [
        ...prev,
        {
          id: Date.now(),
          name: loc.name,
          category: loc.category || "Custom",
          state: loc.state || "NER / Pan-India",
          alertsEnabled: loc.alertsEnabled !== false,
          lastRisk: loc.lastRisk || 65,
          status: loc.status || "HIGH",
        },
      ];
    });
  };

  const removeSavedLocation = (locName) => {
    setSavedLocations((prev) => prev.filter((p) => p.name.toLowerCase() !== locName.toLowerCase()));
  };

  const toggleSavedLocationAlerts = (locName) => {
    setSavedLocations((prev) =>
      prev.map((p) =>
        p.name.toLowerCase() === locName.toLowerCase() ? { ...p, alertsEnabled: !p.alertsEnabled } : p
      )
    );
  };

  const login = async (username, password) => {
    const data = await post("/api/auth/login", { username, password });
    localStorage.setItem("bhusurakha_token", data.access_token);
    localStorage.setItem("bhusurakha_user", JSON.stringify(data.user));
    localStorage.setItem("bhusurakha_role", data.user.role);
    setUser(data.user);
    setRole(data.user.role);
    return data.user;
  };

  const register = async (userData) => {
    const data = await post("/api/auth/register", userData);
    if (data.access_token) {
      localStorage.setItem("bhusurakha_token", data.access_token);
      localStorage.setItem("bhusurakha_user", JSON.stringify(data.user));
      localStorage.setItem("bhusurakha_role", data.user.role);
      setUser(data.user);
      setRole(data.user.role);
    }
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("bhusurakha_token");
    localStorage.removeItem("bhusurakha_user");
    localStorage.removeItem("disastershield_token");
    localStorage.removeItem("disastershield_user");
    setUser(null);
  };

  const switchRole = (r) => {
    setRole(r);
    localStorage.setItem("bhusurakha_role", r);
  };

  const switchLang = (l) => {
    setLangState(l);
    localStorage.setItem("bhusurakha_lang", l);
  };

  const completeOnboarding = () => {
    setIsOnboarded(true);
    localStorage.setItem("bhusurakha_onboarded", "true");
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const value = useMemo(
    () => ({
      user,
      role,
      login,
      register,
      logout,
      switchRole,
      lang,
      switchLang,
      t,
      savedLocations,
      addSavedLocation,
      removeSavedLocation,
      toggleSavedLocationAlerts,
      isOnboarded,
      completeOnboarding,
    }),
    [user, role, lang, t, savedLocations, isOnboarded]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function canSee(role, min) {
  // All features are accessible to every registered user of Bhu-Surakha
  return true;
}
