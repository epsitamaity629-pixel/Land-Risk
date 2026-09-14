import {
  api as baseApi,
  get,
  post,
  searchLocationAndPredict as searchLoc,
  getGazetteer as getGaz,
  predictMultiHazard as predMulti,
  inspectCoordinate as inspCoord,
  getFloodZones as getFlood,
  batchSyncIncidents as batchSync,
  analyzeRouteRisk as analyzeRoute,
} from "../api";
import {
  getMockDashboardOverview,
  getMockMLMetrics,
  getMockLithologies,
  generateLocationPredictionFallback,
  generateRouteAnalysisFallback,
} from "./fallbackEngine";

export const api = {
  // Universal Multi-Hazard Search & Location Prediction
  searchLocationPredict: async (query = "", latitude = null, longitude = null) => {
    return await searchLoc(query, latitude, longitude);
  },

  getGazetteer: async (q = "") => {
    return await getGaz(q);
  },

  predictMultiHazard: async (payload) => {
    return await predMulti(payload);
  },

  inspectCoordinate: async (lat, lon) => {
    return await inspCoord(lat, lon);
  },

  getFloodZones: async () => {
    return await getFlood();
  },

  // Dashboard
  getDashboardOverview: async () => {
    try {
      return await get("/dashboard/summary");
    } catch (e) {
      return getMockDashboardOverview();
    }
  },

  // GIS Map
  getMapStations: async () => {
    try {
      return await get("/map/stations");
    } catch (e) {
      return [];
    }
  },

  getHighRiskPolygons: async () => {
    try {
      return await get("/map/high-risk-polygons");
    } catch (e) {
      return [];
    }
  },

  // AI Prediction & ML
  predictRisk: async (payload) => {
    return await post("/predict-risk", payload);
  },

  getMLMetrics: async () => {
    try {
      return await get("/ml/metrics");
    } catch (e) {
      return getMockMLMetrics();
    }
  },

  // Rainfall
  getRainfallLatest: async () => {
    try {
      return await get("/rainfall/latest");
    } catch (e) {
      return [];
    }
  },

  getRainfallSeries: async (locationId = null) => {
    try {
      const p = locationId ? `?location_id=${locationId}` : "";
      return await get(`/rainfall/series${p}`);
    } catch (e) {
      return [];
    }
  },

  // Sensors
  getSensors: async () => {
    try {
      return await get("/map/sensors");
    } catch (e) {
      return [];
    }
  },

  // Alerts
  getActiveAlerts: async () => {
    try {
      return await get("/alerts/");
    } catch (e) {
      return [];
    }
  },

  dispatchAlert: async (alertId, channels) => {
    try {
      return await post("/alerts/dispatch", { alert_id: alertId, channels });
    } catch (e) {
      return { status: "dispatched", channels };
    }
  },

  // Historical
  getHistoricalLandslides: async () => {
    try {
      return await get("/dashboard/history");
    } catch (e) {
      return [];
    }
  },

  // Incident Reports & Offline Sync
  getIncidents: async () => {
    try {
      return await get("/incidents/");
    } catch (e) {
      return [];
    }
  },

  batchSyncIncidents: async (reports) => {
    return await batchSync(reports);
  },

  // Emergency Facilities
  getEmergencyFacilities: async () => {
    try {
      return await get("/map/facilities");
    } catch (e) {
      return [];
    }
  },

  // State Analytics
  getStateAnalytics: async () => {
    try {
      return await get("/dashboard/state-analytics");
    } catch (e) {
      return [];
    }
  },

  // Live Simulation
  simulationTick: async () => {
    try {
      return await post("/simulation/tick", {});
    } catch (e) {
      return { tick: 1, active_sim: true };
    }
  },
};