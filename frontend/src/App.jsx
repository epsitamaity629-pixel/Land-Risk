import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./Layout";

// Auth & Public Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Core App Pages
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
import Compare from "./pages/Compare";
import Profile from "./pages/Profile";

// Flagship Command & Multi-Hazard Pages
import NERDashboard from "./pages/NERDashboard";
import LocationAnalysis from "./pages/LocationAnalysis";
import AlertCenter from "./pages/AlertCenter";
import AuthorityDashboard from "./pages/AuthorityDashboard";

export default function App() {
  return (
    <Routes>
      {/* Public landing & authentication */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Direct canonical location risk URL */}
      <Route path="/location/:locationName" element={<LocationAnalysis />} />

      {/* Main app shell */}
      <Route path="/app" element={<Layout />}>
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Core dashboard */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* Flagship pages */}
        <Route path="ner" element={<NERDashboard />} />
        <Route path="analyze" element={<LocationAnalysis />} />
        <Route path="alert-center" element={<AlertCenter />} />
        <Route path="authority" element={<AuthorityDashboard />} />

        {/* Multi-hazard grid & geospatial */}
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
        <Route path="compare" element={<Compare />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
