const API_BASE_URL = "/api";

export const api = {
  // Universal Multi-Hazard Search & Location Prediction
  searchLocationPredict: async (query = "", latitude = null, longitude = null) => {
    const res = await fetch(`${API_BASE_URL}/predict/search-location`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, latitude, longitude }),
    });
    return res.json();
  },

  getGazetteer: async (q = "") => {
    const res = await fetch(`${API_BASE_URL}/predict/gazetteer?q=${encodeURIComponent(q)}`);
    return res.json();
  },

  predictMultiHazard: async (payload) => {
    const res = await fetch(`${API_BASE_URL}/predict/multi-hazard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  inspectCoordinate: async (lat, lon) => {
    const res = await fetch(`${API_BASE_URL}/map/inspect-coordinate?lat=${lat}&lon=${lon}`);
    return res.json();
  },

  getFloodZones: async () => {
    const res = await fetch(`${API_BASE_URL}/map/flood-zones`);
    return res.json();
  },

  // Dashboard
  getDashboardOverview: async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard/summary`);
    return res.json();
  },

  // GIS Map
  getMapStations: async () => {
    const res = await fetch(`${API_BASE_URL}/map/stations`);
    return res.json();
  },

  getHighRiskPolygons: async () => {
    const res = await fetch(`${API_BASE_URL}/map/high-risk-polygons`);
    return res.json();
  },

  // AI Prediction & ML
  predictRisk: async (payload) => {
    const res = await fetch(`${API_BASE_URL}/predict-risk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  getMLMetrics: async () => {
    const res = await fetch(`${API_BASE_URL}/ml/metrics`);
    return res.json();
  },

  // Rainfall
  getRainfallLatest: async () => {
    const res = await fetch(`${API_BASE_URL}/rainfall/latest`);
    return res.json();
  },

  getRainfallSeries: async (locationId = null) => {
    const p = locationId ? `?location_id=${locationId}` : "";
    const res = await fetch(`${API_BASE_URL}/rainfall/series${p}`);
    return res.json();
  },

  // Sensors
  getSensors: async () => {
    const res = await fetch(`${API_BASE_URL}/map/sensors`);
    return res.json();
  },

  // Alerts
  getActiveAlerts: async () => {
    const res = await fetch(`${API_BASE_URL}/alerts/`);
    return res.json();
  },

  dispatchAlert: async (alertId, channels) => {
    const res = await fetch(`${API_BASE_URL}/alerts/dispatch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alert_id: alertId, channels }),
    });
    return res.json();
  },

  // Historical
  getHistoricalLandslides: async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard/history`);
    return res.json();
  },

  // Incident Reports & Offline Sync
  getIncidents: async () => {
    const res = await fetch(`${API_BASE_URL}/incidents/`);
    return res.json();
  },

  batchSyncIncidents: async (reports) => {
    const res = await fetch(`${API_BASE_URL}/incidents/batch-sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reports }),
    });
    return res.json();
  },

  // Emergency Facilities
  getEmergencyFacilities: async () => {
    const res = await fetch(`${API_BASE_URL}/map/facilities`);
    return res.json();
  },

  // State Analytics
  getStateAnalytics: async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard/state-analytics`);
    return res.json();
  },

  // Live Simulation
  simulationTick: async () => {
    const res = await fetch(`${API_BASE_URL}/simulation/tick`, { method: "POST" });
    return res.json();
  },
};
