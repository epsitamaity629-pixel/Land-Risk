import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MapPage from "./pages/MapPage";
import Predict from "./pages/Predict";
import Explain from "./pages/Explain";
import Rainfall from "./pages/Rainfall";
import Sensors from "./pages/Sensors";
import History from "./pages/History";
import Alerts from "./pages/Alerts";
import Incidents from "./pages/Incidents";
import Emergency from "./pages/Emergency";
import Analytics from "./pages/Analytics";
import Users from "./pages/Users";
import SettingsPage from "./pages/SettingsPage";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/app" element={<Layout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="map" element={<MapPage />} />
        <Route path="predict" element={<Predict />} />
        <Route path="explain" element={<Explain />} />
        <Route path="rainfall" element={<Rainfall />} />
        <Route path="sensors" element={<Sensors />} />
        <Route path="history" element={<History />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="incidents" element={<Incidents />} />
        <Route path="emergency" element={<Emergency />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}
