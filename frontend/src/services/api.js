/**
 * services/api.js — compatibility shim
 *
 * AIPredictionStudio and AlertsManager import from ../services/api
 * using the legacy `api.methodName()` pattern. This shim re-exports the
 * canonical api.js from src/api.js as a default object with all methods
 * so both import styles work without touching every component.
 */
import {
  api as apiCall,
  get,
  post,
  patch,
  searchLocationAndPredict,
  getGazetteer,
  predictMultiHazard,
  inspectCoordinate,
  getFloodZones,
  batchSyncIncidents,
  analyzeRouteRisk,
  analyzeIncidentImage,
  generateAIReport,
  simulateScenario,
  chatWithAIAssistant,
  compareLocations,
  getRegionalRiskIndices,
} from "../api";

// Legacy default export used as `api.predictRisk(...)`, `api.getMLMetrics()`, etc.
const api = {
  // Core
  get,
  post,
  patch,

  // ML / Prediction
  predictRisk: (params) =>
    post("/api/predict-risk", {
      slope_deg: params.slope_angle ?? params.slope_deg ?? 35,
      rainfall_24h_mm: params.cumulative_24h_rainfall ?? params.rainfall_24h_mm ?? 80,
      rainfall_7d_mm: (params.cumulative_24h_rainfall ?? 80) * 3.5,
      soil_moisture_pct: params.soil_moisture ?? params.soil_moisture_pct ?? 65,
      pore_pressure_kpa: params.pore_water_pressure_kpa ?? params.pore_pressure_kpa ?? 35,
      elevation_m: params.elevation ?? params.elevation_m ?? 800,
      lithology_code: params.lithology_code ?? 3,
      displacement_mm: params.ground_displacement_rate ?? params.displacement_mm ?? 3,
      tilt_deg: params.tilt_deg ?? 2.5,
    }),

  getMLMetrics: () => get("/api/ml/metrics"),

  // Location
  searchLocationAndPredict,
  getGazetteer,
  predictMultiHazard,
  inspectCoordinate,

  // Map
  getFloodZones,
  getMapStations: () => get("/api/map/stations"),
  getHighRiskPolygons: () => get("/api/map/high-risk-polygons"),
  getEvacuationRoutes: () => get("/api/map/evacuation-routes"),
  getMapFacilities: () => get("/api/map/facilities"),
  getMapHistory: () => get("/api/map/history"),

  // Alerts
  getAlerts: (activeOnly = true) => get(`/api/alerts/?active_only=${activeOnly}`),
  dispatchSimulation: ({ alert_id, channels = ["SMS Gateway", "Push Broadcast"] }) =>
    post("/api/alerts/dispatch", { alert_id, channels }),
  acknowledgeAlert: (id) => post(`/api/alerts/ack/${id}`, {}),

  // Incidents
  getIncidents: () => get("/api/incidents/"),
  createIncident: (formData) => post("/api/incidents/", formData),
  updateIncidentStatus: (id, status) => patch(`/api/incidents/${id}/status`, { status }),
  batchSyncIncidents,
  analyzeIncidentImage,

  // Rainfall
  getLatestRainfall: () => get("/api/rainfall/latest"),
  getRainfallSeries: (location_id, hours = 48) =>
    get(`/api/rainfall/series?location_id=${location_id}&hours=${hours}`),
  getRainfallThresholds: () => get("/api/rainfall/thresholds"),

  // Dashboard
  getDashboardSummary: () => get("/api/dashboard/summary"),
  getRiskTimeline: () => get("/api/dashboard/risk-timeline"),
  getStateAnalytics: () => get("/api/dashboard/state-analytics"),
  getDashboardHistory: () => get("/api/dashboard/history"),
  getDashboardLocations: () => get("/api/dashboard/locations"),

  // NER
  getRegionalRiskIndices,
  getNERRiskIndices: () => get("/api/ner/risk-indices"),

  // AI
  generateAIReport,
  simulateScenario,
  chatWithAIAssistant,
  compareLocations,

  // Route
  analyzeRouteRisk,

  // Reports
  getReports: () => get("/api/reports/"),
  exportReport: (type) => get(`/api/reports/export?type=${type}`),

  // Sensors
  getSensors: () => get("/api/sensors/"),
  getSensorReadings: (id, hours = 24) => get(`/api/sensors/${id}/readings?hours=${hours}`),

  // Emergency
  getEmergencyFacilities: () => get("/api/emergency/facilities"),

  // Simulation
  startSimulation: (scenario) => post("/api/simulation/start", { scenario }),
  stopSimulation: () => post("/api/simulation/stop", {}),
  getSimulationState: () => get("/api/simulation/state"),
};

export default api;

// Named re-exports so `import { post } from "../services/api"` also works
export {
  apiCall as api,
  get,
  post,
  patch,
  searchLocationAndPredict,
  getGazetteer,
  predictMultiHazard,
  inspectCoordinate,
  getFloodZones,
  batchSyncIncidents,
  analyzeRouteRisk,
  analyzeIncidentImage,
  generateAIReport,
  simulateScenario,
  chatWithAIAssistant,
  compareLocations,
  getRegionalRiskIndices,
};
