import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Truck, Shield, CloudRain, Navigation, AlertTriangle, Activity, Search,
  Plus, RefreshCw, Compass, MapPin, X, ChevronRight, ChevronLeft, Route,
  Mountain, Clock, Eye, Sun, Moon, Menu, Bell, Settings, LayoutDashboard,
  Radar, Map as MapIcon, Satellite, Layers, Filter, Download, MoreHorizontal,
  Wifi, WifiOff, ChevronDown, ArrowRight, ArrowDownRight, Maximize2,
  Crosshair, Zap, Users, TrendingUp, BarChart3, CircleDot, Send, LogOut,
  CheckCircle2, XCircle, FileText, AlertOctagon, Droplets, Wind, Thermometer,
  Gauge, Radio, UserCheck, Check, AlertCircle, ZoomIn, Globe
} from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import AIChat from './components/AIChat';

const API = 'http://127.0.0.1:8000';

// ═══════════════════════════════════════════════════════════════
//  GOOGLE MAPS INDIA (REGION: IN) OFFICIAL MAP ENGINE
//  (Compliant with Survey of India - Complete Sovereign J&K and Ladakh)
// ═══════════════════════════════════════════════════════════════
const GOOGLE_TILES_ROADMAP = [
  'https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&gl=IN&hl=en',
  'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&gl=IN&hl=en',
  'https://mt2.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&gl=IN&hl=en',
  'https://mt3.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&gl=IN&hl=en'
];

const GOOGLE_TILES_TERRAIN = [
  'https://mt0.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&gl=IN&hl=en',
  'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&gl=IN&hl=en',
  'https://mt2.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&gl=IN&hl=en',
  'https://mt3.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&gl=IN&hl=en'
];

const GOOGLE_TILES_SATELLITE = [
  'https://mt0.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&gl=IN&hl=en',
  'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&gl=IN&hl=en',
  'https://mt2.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&gl=IN&hl=en',
  'https://mt3.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&gl=IN&hl=en'
];

const BASE_MAP_STYLE = {
  version: 8,
  sources: {
    'src-google-dark': {
      type: 'raster',
      tiles: GOOGLE_TILES_ROADMAP,
      tileSize: 256
    },
    'src-google-light': {
      type: 'raster',
      tiles: GOOGLE_TILES_ROADMAP,
      tileSize: 256
    },
    'src-google-terrain': {
      type: 'raster',
      tiles: GOOGLE_TILES_TERRAIN,
      tileSize: 256
    },
    'src-google-satellite': {
      type: 'raster',
      tiles: GOOGLE_TILES_SATELLITE,
      tileSize: 256
    }
  },
  layers: [
    {
      id: 'base-layer-dark',
      type: 'raster',
      source: 'src-google-dark',
      layout: { visibility: 'visible' },
      paint: {
        'raster-opacity': 1
      }
    },
    {
      id: 'base-layer-light',
      type: 'raster',
      source: 'src-google-light',
      layout: { visibility: 'none' }
    },
    {
      id: 'base-layer-terrain',
      type: 'raster',
      source: 'src-google-terrain',
      layout: { visibility: 'none' }
    },
    {
      id: 'base-layer-satellite',
      type: 'raster',
      source: 'src-google-satellite',
      layout: { visibility: 'none' }
    }
  ]
};

const MAP_STYLES = {
  dark:      { label: 'Dark Tactical Map', icon: Moon },
  light:     { label: 'Google India (Roadmap Light)', icon: Sun },
  terrain:   { label: 'Google India (Terrain Topo)',  icon: MapIcon },
  satellite: { label: 'Google India (Satellite Hybrid)', icon: Satellite }
};

// ═══════════════════════════════════════════════════════════════
//  INITIAL SEED WEATHER CORRIDORS (NER SENSITIVE ARTERIES)
// ═══════════════════════════════════════════════════════════════
const WEATHER_CORRIDORS = [
  {
    id: 'sohra',
    name: 'Cherrapunji (Sohra) Sector',
    code: 'NER-MEGH-01',
    highway: 'SH-5 / Sohra Pass',
    lat: 25.2700,
    lng: 91.7300,
    rainfall_72h: 218.4,
    rain_rate: 24.5,
    wind_speed: 48.0,
    risk_level: 'CRITICAL',
    slope: 38.5,
    hydros_discharge: '280 m³/s',
    risk_score: 0.92,
    sparkline: [22, 38, 54, 82, 110, 165, 218]
  },
  {
    id: 'teesta',
    name: 'Teesta Valley / NH-10 Corridor',
    code: 'NER-SIKK-02',
    highway: 'NH-10 Sevoke - Rangpo',
    lat: 27.0800,
    lng: 88.4700,
    rainfall_72h: 174.0,
    rain_rate: 18.2,
    wind_speed: 68.5,
    risk_level: 'CRITICAL',
    slope: 42.0,
    hydros_discharge: '340 m³/s',
    risk_score: 0.88,
    sparkline: [15, 29, 44, 70, 98, 134, 174]
  },
  {
    id: 'umiam_nh6',
    name: 'NH-6 Corridor (Umiam - Jowai Pass)',
    code: 'NER-MEGH-06',
    highway: 'NH-6 East Khasi Hills',
    lat: 25.6820,
    lng: 91.8750,
    rainfall_72h: 112.5,
    rain_rate: 12.0,
    wind_speed: 35.0,
    risk_level: 'HIGH',
    slope: 29.4,
    hydros_discharge: '140 m³/s',
    risk_score: 0.74,
    sparkline: [10, 18, 30, 48, 68, 89, 112]
  },
  {
    id: 'brahmaputra_nh27',
    name: 'NH-27 Nagaon - Kaziranga Ridge',
    code: 'NER-ASSAM-27',
    highway: 'NH-27 National Corridor',
    lat: 26.3450,
    lng: 92.6840,
    rainfall_72h: 58.2,
    rain_rate: 4.8,
    wind_speed: 22.0,
    risk_level: 'MODERATE',
    slope: 12.0,
    hydros_discharge: '890 m³/s',
    risk_score: 0.38,
    sparkline: [8, 12, 18, 25, 34, 46, 58]
  }
];

// ═══════════════════════════════════════════════════════════════
//  PERSISTENT DISASTER & CORRIDOR HAZARDS (ALWAYS ACTIVE)
// ═══════════════════════════════════════════════════════════════
const INITIAL_INCIDENTS = [
  {
    incident_id: 'INC-NER-2026-001',
    reporter_id: 'FIELD-SCOUT-SIKK',
    driver_name: 'Subedar Amitav Das',
    vehicle_id: 'SCOUT-SIKK-01',
    incident_type: 'LANDSLIDE / MUDFLOW',
    location_name: 'NH-10 Km 38 near Teesta Low Dam, West Bengal',
    description: 'Major rockfall & mudflow blocked both lanes. Boulders estimated at 40 tons. PostGIS edge cost set to Infinity (999999).',
    lat: 27.0342,
    lng: 88.4512,
    blocked_edge_id: 48291,
    edge_cost: 999999,
    status: 'BLOCKADE_ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
    gps_accuracy: '±3.2m (RTK Fix)',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    incident_id: 'INC-NER-2026-002',
    reporter_id: 'FIELD-OBSERVER-MEGH',
    driver_name: 'Relief Scout Alpha',
    vehicle_id: 'SCOUT-MEGH-02',
    incident_type: 'FLASH FLOOD / WATERLOGGED',
    location_name: 'NH-6 Km 62 near Sonapur Tunnel, Meghalaya',
    description: 'Muddy flood water 1.2m above road level. High risk of hydroplaning and engine flooding.',
    lat: 25.1124,
    lng: 92.3618,
    blocked_edge_id: 59302,
    edge_cost: 999999,
    status: 'PENDING_REVIEW',
    image_url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600',
    gps_accuracy: '±4.8m (GNSS Standard)',
    timestamp: new Date(Date.now() - 1200000).toISOString()
  },
  {
    incident_id: 'INC-NER-2026-003',
    reporter_id: 'NDRF-REGIONAL-UNIT',
    driver_name: 'NDRF Quick Response Team',
    vehicle_id: 'NDRF-NER-04',
    incident_type: 'DAMAGED BRIDGE',
    location_name: 'NH-27 Bridge Pier 4 near Kaziranga, Assam',
    description: 'Structural micro-fractures detected following heavy river swell discharge (890 m³/s). Heavy vehicles rerouted.',
    lat: 26.5775,
    lng: 93.1711,
    blocked_edge_id: 67204,
    edge_cost: 999999,
    status: 'BLOCKADE_ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600',
    gps_accuracy: '±2.1m (High Precision)',
    timestamp: new Date(Date.now() - 7200000).toISOString()
  }
];

export default function App() {
  const { user, token, logout } = useAuth();

  // ── Navigation State ──
  const [activeTab, setActiveTab] = useState('radar');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Map State ──
  const [mapStyle, setMapStyle] = useState('dark');

  // ── Live Telemetry & Fleet State (Populated strictly by real mobile app stream) ──
  const [isConnected, setIsConnected] = useState(false);
  const [trucks, setTrucks] = useState({});
  const [selectedTruckId, setSelectedTruckId] = useState(null);
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [auditLogs, setAuditLogs] = useState([]);
  const [notification, setNotification] = useState(null);

  // ── FastAPI Backend Data (UI stays unchanged) ──
  const [dashboardData, setDashboardData] = useState(null);
  const [backendVehicles, setBackendVehicles] = useState([]);
  const [backendHazards, setBackendHazards] = useState([]);
  const [backendPredictions, setBackendPredictions] = useState([]);
  const [backendNotifications, setBackendNotifications] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);


  // ── ML Prediction & YOLO Analysis State ──
  const [mlPredictionLoading, setMlPredictionLoading] = useState(false);
  const [mlPredictionResult, setMlPredictionResult] = useState(null);
  const [imageAnalysisLoading, setImageAnalysisLoading] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState(null);
  const [selectedHazardImage, setSelectedHazardImage] = useState(null);

  const [mlForm, setMlForm] = useState({
    location_id: 1,
    elevation_m: 500,
    slope_deg: 25,
    aspect_deg: 180,
    dist_to_river_m: 1000,
    dist_to_road_m: 500,
    rainfall_72h_mm: 100,
    rainfall_24h_mm: 40,
    rainfall_intensity_mmh: 10
  });

  // ── Satellite Discovery Toast ──
  const [discoveryToast, setDiscoveryToast] = useState(null);

  // ── Modals & Lightbox ──
  const [showFleetPanel, setShowFleetPanel] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [hazardFilter, setHazardFilter] = useState('ALL'); // ALL, PENDING, ACTIVE

  // ── Weather Layer Toggles (Feature 5) ──
  const [weatherLayers, setWeatherLayers] = useState({
    rainfall: true,
    wind: true,
    rivers: true,
    slopes: true
  });

  // ── Incident Form State ──
  const [incForm, setIncForm] = useState({
    lat: 25.6820,
    lng: 91.8750,
    vehicle_id: 'TRK-COMMAND-ALPHA',
    incident_type: 'LANDSLIDE / MUDFLOW',
    location_name: 'NH-6 Corridor Pass near Umiam Lake, Meghalaya',
    description: 'Active landslide cutting off both lanes. Boulder blockage requiring immediate edge penalty.',
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
    reporter_id: 'FIELD-COMMAND-NER'
  });

  // ── Refs ──
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef({});
  const endpointMarkersRef = useRef({});
  const incidentMarkersRef = useRef({});
  const stableIncidentCoordsRef = useRef({});
  const notifTimer = useRef(null);
  const discoveryTimer = useRef(null);
  const backendNotificationSeenRef = useRef(null);

  const notify = useCallback((msg, type = 'info') => {
    clearTimeout(notifTimer.current);
    setNotification({ msg, type });
    notifTimer.current = setTimeout(() => setNotification(null), 5000);
  }, []);

  const triggerDiscoveryToast = useCallback((device) => {
    clearTimeout(discoveryTimer.current);
    setDiscoveryToast(device);
    discoveryTimer.current = setTimeout(() => setDiscoveryToast(null), 8000);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  //  COMPUTED LIVE FLEET HEALTH (FEATURE 2: AGGREGATE BADGES)
  // ═══════════════════════════════════════════════════════════════
  const fleetHealth = useMemo(() => {
    const list = Object.values(trucks);
    let safe = 0;
    let advisory = 0;
    let critical = 0;

    list.forEach((t) => {
      const rain = t.rainfall_rate || 0;
      const slope = t.slope || 0;
      const isWarn = t.hazard_status === 'WARNING' || t.hazard_status === 'CRITICAL';

      if (isWarn || slope > 32 || (slope > 25 && rain > 20)) {
        critical++;
      } else if (rain >= 15 || slope >= 20 || (t.speed && t.speed > 80)) {
        advisory++;
      } else {
        safe++;
      }
    });

    return { safe, advisory, critical, total: list.length };
  }, [trucks]);

  // ═══════════════════════════════════════════════════════════════
  //  MAP OVERLAY LAYERS (CORRIDORS & HAZARDS)
  // ═══════════════════════════════════════════════════════════════
  const addOfficialIndianBoundary = useCallback(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    try {
      // Route Corridors Layer
      if (!map.current.getSource('route-corridors')) {
        map.current.addSource('route-corridors', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
        map.current.addLayer({
          id: 'route-glow',
          type: 'line',
          source: 'route-corridors',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': ['get', 'color'],
            'line-width': ['case', ['boolean', ['get', 'selected'], false], 8, 4],
            'line-opacity': ['case', ['boolean', ['get', 'selected'], false], 0.35, 0.15],
            'line-blur': 3
          }
        });
        map.current.addLayer({
          id: 'route-lines',
          type: 'line',
          source: 'route-corridors',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': ['get', 'color'],
            'line-width': ['case', ['boolean', ['get', 'selected'], false], 3.5, 2.0],
            'line-opacity': 0.95
          }
        });
      }

      // Hazard Circles
      if (!map.current.getSource('hazard-zones')) {
        map.current.addSource('hazard-zones', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
        map.current.addLayer({
          id: 'hazard-glow-pulse',
          type: 'circle',
          source: 'hazard-zones',
          paint: {
            'circle-radius': 30,
            'circle-color': '#ef4444',
            'circle-opacity': 0.25,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ef4444',
            'circle-stroke-opacity': 0.8
          }
        });
      }
    } catch (err) {
      console.warn('Map overlay sync:', err);
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════
  //  MAP ENGINE INITIALIZATION + FASTAPI BACKEND INTEGRATION
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!map.current && mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: BASE_MAP_STYLE,
        center: [78.9629, 23.5937],
        zoom: 4.8,
        pitch: 0,
        bearing: 0,
        scrollZoom: true,
        antialias: true
      });

      map.current.addControl(
        new maplibregl.NavigationControl({ visualizePitch: true }),
        'bottom-left'
      );

      map.current.on('load', () => {
        addOfficialIndianBoundary();
      });

      map.current.on('style.load', () => {
        setTimeout(() => addOfficialIndianBoundary(), 80);
      });
    }
  }, [addOfficialIndianBoundary]);

  useEffect(() => {
    let cancelled = false;

    const fetchBackendData = async () => {
      try {
        setApiLoading(true);

        // Read the JWT from every auth storage shape used by the frontend.
        const readStoredToken = (storage, key) => {
          try {
            const raw = storage.getItem(key);
            if (!raw) return null;

            // Direct JWT value.
            if (raw.split('.').length === 3) return raw;

            // JSON stored by an AuthContext, e.g. { access_token: "..." }.
            const parsed = JSON.parse(raw);
            return parsed?.access_token || parsed?.accessToken || parsed?.token || null;
          } catch {
            return null;
          }
        };

        const accessToken =
          token ||
          user?.access_token ||
          user?.accessToken ||
          user?.token ||
          readStoredToken(localStorage, 'drishti_auth_token') ||
          readStoredToken(localStorage, 'access_token') ||
          readStoredToken(localStorage, 'accessToken') ||
          readStoredToken(localStorage, 'token') ||
          readStoredToken(localStorage, 'authUser') ||
          readStoredToken(localStorage, 'user') ||
          readStoredToken(sessionStorage, 'access_token') ||
          readStoredToken(sessionStorage, 'accessToken') ||
          readStoredToken(sessionStorage, 'token') ||
          readStoredToken(sessionStorage, 'authUser') ||
          readStoredToken(sessionStorage, 'user');

        if (!accessToken) {
          console.warn('No JWT access token found. Protected backend routes cannot be loaded.');
        }

        const authConfig = {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {}
        };

        const [
          dashboardResult,
          vehiclesResult,
          hazardsResult,
          predictionsResult,
          notificationsResult,
          locationsResult
        ] = await Promise.allSettled([
          axios.get(`${API}/dashboard`, authConfig),
          axios.get(`${API}/vehicles`, authConfig),
          axios.get(`${API}/hazards`, authConfig),
          axios.get(`${API}/prediction`, authConfig),
          axios.get(`${API}/notifications`, authConfig),
          axios.get(`${API}/locations`, authConfig)
        ]);

        if (cancelled) return;

        const getData = (result, fallback = []) =>
          result.status === 'fulfilled' ? result.value.data : fallback;

        const dashboard = getData(dashboardResult, null);
        const vehicles = Array.isArray(getData(vehiclesResult)) ? getData(vehiclesResult) : [];
        const hazards = Array.isArray(getData(hazardsResult)) ? getData(hazardsResult) : [];
        const predictions = Array.isArray(getData(predictionsResult)) ? getData(predictionsResult) : [];
        const notifications = Array.isArray(getData(notificationsResult)) ? getData(notificationsResult) : [];
        const locations = Array.isArray(getData(locationsResult)) ? getData(locationsResult) : [];

        const locationMap = Object.fromEntries(
          locations.map((location) => [location.id, location])
        );

        const normalizedVehicles = vehicles.map((vehicle) => ({
          ...vehicle,
          truck_id: vehicle.vehicle_id || String(vehicle.id),
          lat: vehicle.latitude,
          lng: vehicle.longitude,
          hazard_status:
            vehicle.hazard_status ||
            (String(vehicle.status || '').toUpperCase() === 'ONLINE' ? 'SAFE' : 'OFFLINE'),
          location_name:
            vehicle.location_name ||
            `${vehicle.name || vehicle.vehicle_id || 'Vehicle'} • ${vehicle.vehicle_type || 'Mobile Unit'}`
        }));

        const normalizedPredictions = predictions.map((prediction) => {
          const location = locationMap[prediction.location_id] || {};
          const confidence = Number(prediction.confidence);

          return {
            ...prediction,
            id: prediction.id || `PRED-${prediction.location_id}-${prediction.predicted_at || ''}`,
            name: location.name || `${prediction.hazard_type || 'Hazard'} Prediction`,
            code: `LOC-${prediction.location_id ?? 'UNK'}`,
            highway: prediction.hazard_type || 'Hazard Forecast',
            risk_level: String(prediction.risk_level || 'UNKNOWN').toUpperCase(),
            confidence: Number.isFinite(confidence) ? confidence : null,
            location_name: location.name || `Location #${prediction.location_id ?? 'Unknown'}`,
            lat: location.latitude ?? null,
            lng: location.longitude ?? null,
            predicted_at: prediction.predicted_at || prediction.created_at || null
          };
        });

        const normalizedHazards = hazards.map((hazard) => {
          const location = locationMap[hazard.location_id] || {};
          const status = String(hazard.status || '').toUpperCase();

          return {
            ...hazard,
            incident_id: `HZ-${hazard.id}`,
            incident_type: hazard.hazard_type || 'HAZARD',
            location_name: location.name || `Location #${hazard.location_id}`,
            lat: location.latitude ?? hazard.latitude ?? null,
            lng: location.longitude ?? hazard.longitude ?? null,
            timestamp: hazard.reported_at || hazard.created_at,
            status:
              status === 'ACTIVE' || status === 'BLOCKADE_ACTIVE'
                ? 'BLOCKADE_ACTIVE'
                : 'PENDING_REVIEW',
            description: hazard.description || `${hazard.severity || 'UNKNOWN'} severity hazard detected.`,
            vehicle_id: hazard.vehicle_id || hazard.reporter_id || `LOCATION-${hazard.location_id}`
          };
        });

        setDashboardData(dashboard || {});
        setBackendVehicles(normalizedVehicles);
        setBackendHazards(normalizedHazards);
        setBackendPredictions(normalizedPredictions);
        setBackendNotifications(notifications);

        const fleetMap = Object.fromEntries(
          normalizedVehicles.map((vehicle) => [vehicle.truck_id, vehicle])
        );

        setTrucks(fleetMap);
        setIncidents(() => {
          const merged = [...INITIAL_INCIDENTS, ...normalizedHazards];
          const byId = new Map();
          for (const item of merged) {
            const id = item.incident_id || `${item.incident_type}-${item.lat}-${item.lng}`;
            byId.set(id, item);
          }
          return [...byId.values()];
        });
        setIsConnected(true);

        console.log('Dashboard:', dashboard);
        console.log('Vehicles:', normalizedVehicles);
        console.log('Hazards:', normalizedHazards);
        console.log('Predictions:', normalizedPredictions);
        console.log('Notifications:', notifications);
      } catch (error) {
        console.error(
          'Backend integration error:',
          error.response?.data || error.message
        );
        setIsConnected(false);
      } finally {
        if (!cancelled) setApiLoading(false);
      }
    };

    fetchBackendData();
    const interval = setInterval(fetchBackendData, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  // Show the latest backend notification using the existing toast UI.
  useEffect(() => {
    if (!backendNotifications.length) return;

    const latest = backendNotifications[0];
    const notificationId = latest.id || latest.notification_id || latest.created_at || JSON.stringify(latest);
    if (backendNotificationSeenRef.current === notificationId) return;

    backendNotificationSeenRef.current = notificationId;
    const message = latest.message || latest.title || latest.description || latest.detail || 'New command notification received';
    const type = String(latest.type || latest.level || latest.status || '').toLowerCase();
    notify(
      message,
      type.includes('error') || type.includes('critical') ? 'error' :
      type.includes('success') || type.includes('safe') ? 'success' : 'info'
    );
  }, [backendNotifications, notify]);

  // Use real backend predictions in the existing weather/prediction cards.
  // If no prediction records exist yet, the original seeded cards remain visible.
  const predictionCards = useMemo(() => {
    if (!backendPredictions.length) return WEATHER_CORRIDORS;

    return backendPredictions.map((prediction) => {
      const confidencePct = prediction.confidence == null
        ? 0
        : Math.max(0, Math.min(100, prediction.confidence <= 1 ? prediction.confidence * 100 : prediction.confidence));
      const severity = prediction.risk_level === 'CRITICAL' ? 1 : prediction.risk_level === 'HIGH' ? 0.8 : prediction.risk_level === 'MODERATE' ? 0.55 : 0.3;

      return {
        ...prediction,
        id: prediction.id,
        name: prediction.location_name || prediction.name,
        code: prediction.code || `LOC-${prediction.location_id ?? 'UNK'}`,
        highway: prediction.highway || prediction.hazard_type || 'Hazard Forecast',
        rainfall_72h: confidencePct.toFixed(0),
        rain_rate: prediction.confidence == null ? '—' : confidencePct.toFixed(1),
        wind_speed: 0,
        slope: '—',
        hydros_discharge: prediction.predicted_at ? new Date(prediction.predicted_at).toLocaleString() : 'Latest model output',
        risk_score: severity,
        sparkline: [severity * 25, severity * 40, severity * 55, severity * 65, severity * 75, severity * 90, confidencePct],
        isBackendPrediction: true
      };
    });
  }, [backendPredictions]);

  // Resize map on layout changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (map.current) map.current.resize();
    }, 300);
    return () => clearTimeout(timer);
  }, [sidebarOpen, activeTab]);

  // Sync route lines when selection changes
  useEffect(() => {
    syncRoutes(Object.values(trucks), selectedTruckId);
  }, [selectedTruckId, trucks]);

  // ═══════════════════════════════════════════════════════════════
  //  MAP SYNCHRONIZATION HELPERS
  // ═══════════════════════════════════════════════════════════════
  const syncRoutes = (list, selId) => {
    if (!map.current || !map.current.getSource('route-corridors')) return;
    const features = list
      .filter((t) => t.route_coords && t.route_coords.length > 1)
      .map((t) => ({
        type: 'Feature',
        properties: {
          truck_id: t.truck_id,
          color: t.truck_id === selId ? '#00f3ff' : '#0284c7',
          selected: t.truck_id === selId
        },
        geometry: {
          type: 'LineString',
          coordinates: t.route_coords.map((c) => [c.lng, c.lat])
        }
      }));
    map.current.getSource('route-corridors').setData({ type: 'FeatureCollection', features });
  };

  const syncHazards = (list) => {
    if (!map.current || !map.current.getSource('hazard-zones')) return;

    const features = list
      .filter((i) => i.status === 'BLOCKADE_ACTIVE')
      .map((i) => {
        const key = String(i.incident_id || i.id || `${i.lat}-${i.lng}`);
        const lat = Number(i.lat);
        const lng = Number(i.lng);

        if (
          !stableIncidentCoordsRef.current[key] &&
          Number.isFinite(lat) &&
          Number.isFinite(lng)
        ) {
          stableIncidentCoordsRef.current[key] = [lng, lat];
        }

        const coordinates = stableIncidentCoordsRef.current[key];
        if (!coordinates) return null;

        return {
          type: 'Feature',
          properties: { id: key },
          geometry: { type: 'Point', coordinates }
        };
      })
      .filter(Boolean);

    map.current.getSource('hazard-zones').setData({
      type: 'FeatureCollection',
      features
    });
  };

  const updateEndpoints = (d) => {
    if (!map.current || !d.origin || !d.destination) return;
    const oKey = `${d.truck_id}-o`;
    if (!endpointMarkersRef.current[oKey]) {
      const el = document.createElement('div');
      el.style.cssText = 'width:12px;height:12px;border-radius:50%;background:#10b981;border:2px solid #ffffff;box-shadow:0 0 10px #10b981;';
      endpointMarkersRef.current[oKey] = new maplibregl.Marker(el).setLngLat([d.origin.lng, d.origin.lat]).addTo(map.current);
    }
    const dKey = `${d.truck_id}-d`;
    if (!endpointMarkersRef.current[dKey]) {
      const el = document.createElement('div');
      el.style.cssText = 'width:12px;height:12px;border-radius:50%;background:#00f3ff;border:2px solid #ffffff;box-shadow:0 0 10px #00f3ff;';
      endpointMarkersRef.current[dKey] = new maplibregl.Marker(el).setLngLat([d.destination.lng, d.destination.lat]).addTo(map.current);
    }
  };

  const updateVehicleMarker = (d) => {
    if (!map.current) return;

    const key = String(d.truck_id);
    const lat = Number(d.lat);
    const lng = Number(d.lng);

    // Use the actual geographic coordinate on every update. MapLibre keeps the
    // marker attached to this point during pan/zoom/resize, while new GPS data
    // is still allowed to move it to its new real-world position.
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const coordinates = [lng, lat];

    if (!markersRef.current[d.truck_id]) {
      const el = document.createElement('div');
      // The DOM element itself is ONLY the 26px geographic pin. The label is
      // absolutely positioned outside it, so MapLibre anchors the exact [lng, lat]
      // to the center of the icon — not to the bottom of the text label.
      el.style.cssText = 'cursor:pointer;width:26px;height:26px;display:flex;align-items:center;justify-content:center;';
      el.innerHTML = `
        <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:38px;height:38px;border-radius:50%;background:rgba(0,243,255,0.4);animation:ping 1.4s cubic-bezier(0,0,0.2,1) infinite;pointer-events:none;"></div>
        <div style="position:relative;width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg, #00f3ff, #0284c7);border:2.5px solid #ffffff;box-shadow:0 0 18px rgba(0,243,255,1);display:flex;align-items:center;justify-content:center;">
          <svg width="13" height="13" viewBox="0 0 10 10" fill="white"><polygon points="5,1 9,9 1,9"/></svg>
        </div>
        <div style="position:absolute;top:calc(100% + 8px);left:50%;transform:translateX(-50%);background:#0b0f19;border:1px solid rgba(0,243,255,0.5);border-radius:5px;padding:2px 7px;font-size:10px;font-family:monospace;font-weight:800;color:#00f3ff;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,0.7);pointer-events:none;">${d.truck_id}</div>
      `;
      el.onclick = () => {
        setSelectedTruckId(d.truck_id);
        flyTo(d);
      };
      markersRef.current[d.truck_id] = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(coordinates)
        .addTo(map.current);
    } else {
      markersRef.current[d.truck_id].setLngLat(coordinates);
    }
  };

  const updateIncidentMarker = (inc) => {
    if (!map.current) return;
    const key = String(inc.incident_id || inc.id || `${inc.lat}-${inc.lng}`);
    const lat = Number(inc.lat);
    const lng = Number(inc.lng);

    // Always use this incident's actual geographic coordinate. The marker stays
    // attached to the map point during pan/zoom/resize and updates only when
    // the incident itself receives a new latitude/longitude.
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const coordinates = [lng, lat];

    const isBlocked = inc.status === 'BLOCKADE_ACTIVE';
    const isFlood = inc.incident_type?.includes('FLOOD');
    const isBridge = inc.incident_type?.includes('BRIDGE');
    const iconSymbol = isFlood ? '🌊' : isBridge ? '⚠️' : '⛔';
    const tagLabel = isFlood ? 'FLASH FLOOD' : isBridge ? 'DAMAGED BRIDGE' : 'LANDSLIDE';

    if (!incidentMarkersRef.current[key]) {
      const el = document.createElement('div');
      // Keep the marker's geographic anchor on the circular icon. The text tag
      // is visually attached but does not change the map coordinate's anchor point.
      el.style.cssText = 'cursor:pointer;width:28px;height:28px;display:flex;align-items:center;justify-content:center;';
      el.innerHTML = `
        <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:34px;height:34px;border-radius:50%;background:${isBlocked ? 'rgba(239,68,68,0.35)' : 'rgba(245,158,11,0.35)'};animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;pointer-events:none;"></div>
        <div style="position:relative;width:28px;height:28px;border-radius:50%;background:${isBlocked ? 'linear-gradient(135deg,#dc2626,#991b1b)' : 'linear-gradient(135deg,#f59e0b,#d97706)'};border:2px solid #ffffff;box-shadow:0 0 12px ${isBlocked ? '#ef4444' : '#f59e0b'};display:flex;align-items:center;justify-content:center;font-size:13px;">
          ${iconSymbol}
        </div>
        <div style="position:absolute;top:calc(100% + 8px);left:50%;transform:translateX(-50%);background:rgba(15,23,42,0.95);border:1px solid ${isBlocked ? 'rgba(239,68,68,0.6)' : 'rgba(245,158,11,0.6)'};border-radius:6px;padding:2px 8px;font-size:10px;font-weight:800;color:#ffffff;white-space:nowrap;box-shadow:0 4px 10px rgba(0,0,0,0.8);display:flex;align-items:center;gap:4px;pointer-events:none;">
          <span style="color:${isBlocked ? '#f87171' : '#fbbf24'};">${tagLabel}</span>
          <span style="color:#94a3b8;font-size:9px;">${isBlocked ? '(BLOCKED)' : '(REVIEW)'}</span>
        </div>
      `;
      el.onclick = () => {
        setActiveTab('hazard');
      };
      incidentMarkersRef.current[key] = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat(coordinates).addTo(map.current);
    } else {
      incidentMarkersRef.current[key].setLngLat(coordinates);
    }
  };

  // Keep the existing map UI, but feed it with FastAPI data.
  useEffect(() => {
    if (!map.current) return;

    Object.values(trucks).forEach((truck) => {
      if (Number.isFinite(Number(truck.lat)) && Number.isFinite(Number(truck.lng))) {
        updateVehicleMarker(truck);
      }
    });

    const activeIncidentKeys = new Set();

    incidents.forEach((incident) => {
      const lat = Number(incident.lat);
      const lng = Number(incident.lng);
      const key = incident.incident_id || `${incident.lat}-${incident.lng}`;

      // Do not create a marker for missing coordinates or the accidental 0,0 ocean point.
      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        !(lat === 0 && lng === 0)
      ) {
        activeIncidentKeys.add(key);
        updateIncidentMarker({ ...incident, lat, lng });
      }
    });

    // Remove markers that no longer exist in the latest backend response.
    Object.keys(incidentMarkersRef.current).forEach((key) => {
      if (!activeIncidentKeys.has(key)) {
        incidentMarkersRef.current[key].remove();
        delete incidentMarkersRef.current[key];
      }
    });

    syncHazards(
      incidents.filter((incident) => {
        const lat = Number(incident.lat);
        const lng = Number(incident.lng);
        return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
      })
    );
  }, [trucks, incidents]);

  const flyTo = (truck) => {
    map.current?.flyTo({ center: [truck.lng, truck.lat], zoom: 11, pitch: 45, speed: 1.4 });
  };

  const changeMapStyle = (key) => {
    if (!map.current) return;
    setMapStyle(key);
    ['dark', 'light', 'terrain', 'satellite'].forEach((mode) => {
      const layerId = `base-layer-${mode}`;
      if (map.current.getLayer(layerId)) {
        map.current.setLayoutProperty(
          layerId,
          'visibility',
          mode === key ? 'visible' : 'none'
        );
      }
    });
  };

  // ═══════════════════════════════════════════════════════════════
  //  HAZARD ACTIONS — CONNECTED TO FASTAPI
  // ═══════════════════════════════════════════════════════════════
  const handleApproveBlockade = async (incident) => {
    const hazardId = incident.id;

    try {
      if (hazardId != null) {
        await axios.put(`${API}/hazards/${hazardId}`, {
          location_id: incident.location_id,
          hazard_type: incident.hazard_type || incident.incident_type,
          severity: incident.severity || 'High',
          description: incident.description,
          status: 'ACTIVE'
        });
      }

      setIncidents((prev) =>
        prev.map((item) =>
          item.incident_id === incident.incident_id
            ? { ...item, status: 'BLOCKADE_ACTIVE' }
            : item
        )
      );

      setAuditLogs((prev) => [{
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        incident_id: incident.incident_id,
        action: 'APPROVE_BLOCKADE',
        operator: user?.username || 'kirasensei',
        location: incident.location_name
      }, ...prev]);

      notify('Hazard approved and blockade status activated.', 'success');
    } catch (error) {
      notify(
        error.response?.data?.detail ||
        `Approval error: ${error.message}`,
        'error'
      );
    }
  };

  const handleAiVerifyHazard = async (incident) => {
    const hazardId = incident.id || 1;
    notify('🤖 AI Agent Cross-Checking Wind, Rainfall & Baseline Data...', 'info');

    try {
      const response = await axios.post(`${API}/hazards/${hazardId}/ai-verify`);
      const verification = response.data.verification;

      setIncidents((prev) =>
        prev.map((item) =>
          item.incident_id === incident.incident_id || item.id === hazardId
            ? { ...item, status: response.data.current_status, ai_verification: verification }
            : item
        )
      );

      notify(
        `🤖 AI Decision: ${verification.ai_decision} (${verification.confidence_percentage} Confidence) — ${verification.recommendation}`,
        verification.ai_decision === 'AI_VERIFIED_AUTHENTIC' ? 'success' : 'warning'
      );
    } catch (error) {
      notify('AI cross-verification failed to reach backend endpoint.', 'error');
    }
  };

  const handleDismissIncident = async (incident) => {
    try {
      if (incident.id != null) {
        await axios.delete(`${API}/hazards/${incident.id}`);
      }

      setIncidents((prev) =>
        prev.filter((item) => item.incident_id !== incident.incident_id)
      );

      if (incidentMarkersRef.current[incident.incident_id]) {
        incidentMarkersRef.current[incident.incident_id].remove();
        delete incidentMarkersRef.current[incident.incident_id];
      }

      setAuditLogs((prev) => [{
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        incident_id: incident.incident_id,
        action: 'DISMISSED_CLEAR',
        operator: user?.username || 'kirasensei',
        location: incident.location_name
      }, ...prev]);

      notify('Hazard dismissed and removed from the command view.', 'info');
    } catch (error) {
      notify(
        error.response?.data?.detail ||
        `Dismiss error: ${error.message}`,
        'error'
      );
    }
  };

  const handleManualReportSubmit = async (e) => {
    e.preventDefault();

    try {
      // Your current FastAPI Hazard model needs a location_id.
      // Create the location from the existing modal fields, then create the hazard.
      const locationResponse = await axios.post(`${API}/locations`, {
        name: incForm.location_name,
        latitude: parseFloat(incForm.lat),
        longitude: parseFloat(incForm.lng),
        state: 'NER'
      });

      const newLocation = locationResponse.data;

      const hazardResponse = await axios.post(`${API}/hazards`, {
        location_id: newLocation.id,
        hazard_type: incForm.incident_type,
        severity: 'High',
        description: incForm.description
      });

      const newHazard = {
        ...hazardResponse.data,
        incident_id: `HZ-${hazardResponse.data.id}`,
        incident_type: hazardResponse.data.hazard_type,
        location_name: newLocation.name,
        lat: newLocation.latitude,
        lng: newLocation.longitude,
        timestamp: hazardResponse.data.reported_at,
        status: 'PENDING_REVIEW',
        vehicle_id: incForm.vehicle_id
      };

      setIncidents((prev) => [newHazard, ...prev]);
      setShowReportModal(false);
      notify('Hazard report saved to the FastAPI backend.', 'success');
    } catch (error) {
      notify(
        error.response?.data?.detail ||
        `Could not submit hazard: ${error.message}`,
        'error'
      );
    }
  };


  // ═══════════════════════════════════════════════════════════════
  //  ML ACTIONS — XGBOOST SUSCEPTIBILITY + YOLO IMAGE ANALYSIS
  // ═══════════════════════════════════════════════════════════════
  const handleMlFormChange = (field, value) => {
    setMlForm((prev) => ({
      ...prev,
      [field]: Number(value)
    }));
  };

  const runSusceptibilityPrediction = async (e) => {
    e.preventDefault();
    setMlPredictionLoading(true);

    try {
      const response = await axios.post(
        `${API}/ml/predict-susceptibility`,
        mlForm
      );

      const payload = response.data;
      const result = payload.data;
      setMlPredictionResult(payload);

      // Update the existing prediction dashboard immediately. The regular
      // 5-second backend refresh will later replace this with the DB record.
      if (payload.prediction_id != null) {
        const confidence = Number(result.hazard_probability ?? result.probability ?? 0);
        setBackendPredictions((prev) => [{
          id: payload.prediction_id,
          location_id: payload.location_id ?? mlForm.location_id,
          hazard_type: 'HAZARD_SUSCEPTIBILITY',
          risk_level: result.risk_level,
          confidence,
          location_name: `Location #${payload.location_id ?? mlForm.location_id}`,
          predicted_at: new Date().toISOString()
        }, ...prev.filter((item) => item.id !== payload.prediction_id)]);
      }

      notify(
        `XGBoost prediction complete: ${result.risk_level} risk (${((result.hazard_probability ?? result.probability ?? 0) * 100).toFixed(2)}% hazard probability).`,
        result.risk_level === 'HIGH' ? 'error' : 'success'
      );
    } catch (error) {
      notify(
        error.response?.data?.detail ||
        `ML prediction failed: ${error.message}`,
        'error'
      );
    } finally {
      setMlPredictionLoading(false);
    }
  };

  const analyzeUploadedHazardImage = async () => {
    if (!selectedHazardImage) {
      notify('Please select an image before starting YOLO analysis.', 'error');
      return;
    }

    setImageAnalysisLoading(true);

    try {
      const formData = new FormData();
      formData.append('location_id', String(mlForm.location_id));
      formData.append('file', selectedHazardImage);

      const response = await axios.post(
        `${API}/ml/analyze-image`,
        formData
      );

      const payload = response.data;
      setImageAnalysisResult(payload);

      const detected = payload.detection_result?.total_detected ?? 0;
      const created = payload.hazards_created?.length ?? 0;

      notify(
        detected === 0
          ? 'YOLO analysis complete: no hazard detected.'
          : `YOLO analysis complete: ${detected} detection(s), ${created} hazard report(s) saved.`,
        detected === 0 ? 'info' : 'success'
      );
    } catch (error) {
      notify(
        error.response?.data?.detail ||
        `Image analysis failed: ${error.message}`,
        'error'
      );
    } finally {
      setImageAnalysisLoading(false);
    }
  };

  const filteredIncidents = useMemo(() => {
    if (hazardFilter === 'PENDING') return incidents.filter((i) => i.status === 'PENDING_REVIEW');
    if (hazardFilter === 'ACTIVE') return incidents.filter((i) => i.status === 'BLOCKADE_ACTIVE');
    return incidents;
  }, [incidents, hazardFilter]);

  const truckList = Object.values(trucks);
  const selectedTruck = trucks[selectedTruckId] || truckList[0] || null;

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      background: '#070a13',
      color: '#f8fafc',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      overflow: 'hidden',
      position: 'relative'
    }}>

      {/* ════════════════════════════════════════════
          TACTICAL COMMAND SIDEBAR (LEFT)
      ════════════════════════════════════════════ */}
      <aside style={{
        width: sidebarOpen ? 260 : 72,
        minWidth: sidebarOpen ? 260 : 72,
        height: '100%',
        background: 'rgba(11, 15, 25, 0.95)',
        borderRight: '1px solid rgba(0, 243, 255, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 40,
        flexShrink: 0
      }}>
        {/* Brand & Emblem */}
        <div style={{
          height: 64,
          padding: sidebarOpen ? '0 18px' : '0 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00f3ff, #0284c7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 16px rgba(0, 243, 255, 0.4)'
          }}>
            <Radar size={22} color="#060913" />
          </div>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '-0.02em', color: '#00f3ff' }}>
                D.R.I.S.H.T.I.
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>
                LOGISTICS COMMAND
              </div>
            </div>
          )}
        </div>

        {/* 3 Master Admin Tabs Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Tab 1: Fleet Radar & Telemetry */}
          <button
            onClick={() => setActiveTab('radar')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: sidebarOpen ? '12px 14px' : '12px 0',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              borderRadius: '10px',
              border: activeTab === 'radar' ? '1px solid rgba(0, 243, 255, 0.5)' : '1px solid transparent',
              background: activeTab === 'radar' ? 'rgba(0, 243, 255, 0.12)' : 'transparent',
              color: activeTab === 'radar' ? '#00f3ff' : '#94a3b8',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              transition: 'all 0.2s ease'
            }}
            title="Tab 1: Fleet Radar & Telemetry"
          >
            <Radar size={19} color={activeTab === 'radar' ? '#00f3ff' : '#94a3b8'} />
            {sidebarOpen && <span>Fleet Radar & Telemetry</span>}
          </button>

          {/* Tab 2: Hazard & Disruption Control */}
          <button
            onClick={() => setActiveTab('hazard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: sidebarOpen ? '12px 14px' : '12px 0',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              borderRadius: '10px',
              border: activeTab === 'hazard' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid transparent',
              background: activeTab === 'hazard' ? 'rgba(239, 68, 68, 0.12)' : 'transparent',
              color: activeTab === 'hazard' ? '#ef4444' : '#94a3b8',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            title="Tab 2: Hazard & Disruption Control"
          >
            <AlertTriangle size={19} color={activeTab === 'hazard' ? '#ef4444' : '#94a3b8'} />
            {sidebarOpen && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span>Disruption Control</span>
                {incidents.length > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: 'white',
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    fontSize: '10px',
                    fontWeight: 800
                  }}>
                    {incidents.length}
                  </span>
                )}
              </div>
            )}
          </button>

          {/* Tab 3: Regional Weather & Multi-Modal Early Warning */}
          <button
            onClick={() => setActiveTab('weather')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: sidebarOpen ? '12px 14px' : '12px 0',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              borderRadius: '10px',
              border: activeTab === 'weather' ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid transparent',
              background: activeTab === 'weather' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
              color: activeTab === 'weather' ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              transition: 'all 0.2s ease'
            }}
            title="Tab 3: Regional Weather & Multi-Modal Early Warning"
          >
            <CloudRain size={19} color={activeTab === 'weather' ? '#38bdf8' : '#94a3b8'} />
            {sidebarOpen && <span>Regional Weather & NER</span>}
          </button>
        </nav>

        {/* User Info & Collapse Sidebar */}
        <div style={{
          padding: '14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(6, 9, 19, 0.6)'
        }}>
          {sidebarOpen && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>OPERATOR CLEARANCE</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#bae6fd', fontFamily: 'monospace' }}>
                {user?.email || 'kirasensei'}
              </div>
              <div style={{
                display: 'inline-block',
                marginTop: 4,
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(0, 243, 255, 0.15)',
                border: '1px solid rgba(0, 243, 255, 0.3)',
                color: '#00f3ff',
                fontSize: '9px',
                fontWeight: 700
              }}>
                LEVEL-1 COMMAND
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={logout}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
              title="Secure Sign Out"
            >
              <LogOut size={14} />
              {sidebarOpen && <span>Sign Out</span>}
            </button>

            <button
              onClick={() => setSidebarOpen((p) => !p)}
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
              title={sidebarOpen ? 'Collapse' : 'Expand'}
            >
              {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════════════════
          MAIN CONTENT VIEWPORT
      ════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

        {/* ──── COMMAND TOP BAR ──── */}
        <header style={{
          height: 64,
          padding: '0 20px',
          background: 'rgba(11, 15, 25, 0.94)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(0, 243, 255, 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 30,
          flexShrink: 0
        }}>
          {/* Active Tab Title & SOI Compliance */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
              {activeTab === 'radar' && 'Fleet Radar & Telemetry Command'}
              {activeTab === 'hazard' && 'Disruption Inbox & PostGIS Edge Blocker'}
              {activeTab === 'weather' && 'Regional Weather & Multi-Modal Early Warning'}
            </h1>
            <span style={{
              padding: '3px 8px',
              borderRadius: '9999px',
              background: 'rgba(0, 243, 255, 0.12)',
              border: '1px solid rgba(0, 243, 255, 0.35)',
              color: '#00f3ff',
              fontSize: '10px',
              fontWeight: 700,
              fontFamily: 'monospace'
            }}>
              SOI BOUNDARY VERIFIED
            </span>
          </div>

          {/* Center: Live Overview Metrics (Active Phone Convoys vs Monitored Road Hazards) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            background: 'rgba(15, 23, 42, 0.85)',
            padding: '6px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {/* Live Phone Convoys */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>PHONE CONVOYS:</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: truckList.length > 0 ? '#34d399' : '#64748b', fontFamily: 'monospace' }}>
                {truckList.length} Connected
              </span>
            </div>

            <span style={{ color: '#475569' }}>|</span>

            {/* Road Hazards on Map */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>ROAD HAZARDS:</span>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 8px #ef4444',
                animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite'
              }} />
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#f87171', fontFamily: 'monospace' }}>
                {incidents.length} Monitored
              </span>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                ({incidents.filter((i) => i.status === 'BLOCKADE_ACTIVE').length} Blockades, {incidents.filter((i) => i.status === 'PENDING_REVIEW').length} Review{backendPredictions.length ? `, ${backendPredictions.filter((p) => ['HIGH', 'CRITICAL'].includes(String(p.risk_level).toUpperCase())).length} High Risk` : ''})
              </span>
            </div>
          </div>

          {/* Right Action Bar & Operator Profile Widget */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Live Socket Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 10px',
              borderRadius: '9999px',
              background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 243, 255, 0.12)',
              border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(0, 243, 255, 0.35)'}`,
              fontSize: '11px',
              fontWeight: 700,
              color: isConnected ? '#34d399' : '#00f3ff'
            }}>
              <div style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: isConnected ? '#10b981' : '#00f3ff',
                boxShadow: isConnected ? '0 0 8px #10b981' : '0 0 8px #00f3ff'
              }} />
              {isConnected ? '1Hz Live' : 'Active'}
            </div>

            {/* Quick Report Hazard Button */}
            <button
              onClick={() => setShowReportModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 0 12px rgba(239, 68, 68, 0.35)'
              }}
            >
              <AlertTriangle size={14} />
              Report Hazard
            </button>

            {/* User Profile Widget */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 10px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00f3ff, #0284c7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#060913',
                fontWeight: 900,
                fontSize: '12px'
              }}>
                {(user?.username || user?.email || 'k').charAt(0).toUpperCase()}
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
                  {user?.username || 'kirasensei'}
                </div>
                <div style={{ fontSize: '9px', color: '#00f3ff', fontFamily: 'monospace' }}>LEVEL-1 COMMAND</div>
              </div>
            </div>
          </div>
        </header>

        {/* ──── PERSISTENT LIVE CORRIDOR HAZARD ALERT BANNER ──── */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.2), rgba(15, 23, 42, 0.95), rgba(245, 158, 11, 0.2))',
          borderBottom: '1px solid rgba(239, 68, 68, 0.45)',
          padding: '7px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          zIndex: 25,
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(239, 68, 68, 0.25)',
              border: '1px solid rgba(239, 68, 68, 0.6)',
              padding: '2px 8px',
              borderRadius: '4px',
              color: '#fca5a5',
              fontWeight: 800,
              flexShrink: 0
            }}>
              <AlertTriangle size={13} color="#ef4444" />
              <span>LIVE HAZARD ALERT ({incidents.length} ZONES)</span>
            </div>
            <span style={{ color: '#ffffff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {incidents.filter((i) => i.status === 'BLOCKADE_ACTIVE').length > 0
                ? `🚨 CRITICAL BLOCKADE ENFORCED: ${incidents.find((i) => i.status === 'BLOCKADE_ACTIVE')?.location_name || 'NH-10 Teesta Valley Corridor'} • PostGIS Edge Cost Set to Infinity (999999) • Dynamic Detour Route Active`
                : '⚠️ Active Corridor Monitoring: Saturated Slopes (>32°) & River Swell Discharge Tracked'}
            </span>
          </div>

          <button
            onClick={() => setActiveTab('hazard')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#00f3ff',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              flexShrink: 0
            }}
          >
            <span>View Disruption Inbox</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* ──── MAP CANVAS CONTAINER ──── */}
        <div style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Map canvas */}
          <div
            ref={mapContainer}
            className={mapStyle === 'dark' ? 'drishti-dark-canvas' : ''}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              visibility: activeTab === 'radar' ? 'visible' : 'hidden',
              pointerEvents: activeTab === 'radar' ? 'auto' : 'none'
            }}
          />

          {/* ──── TAB 1: RADAR OVERLAYS ──── */}
          {activeTab === 'radar' && (
            <>
              {/* Floating Map Style Selector (Top Left) */}
              <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
                <div style={{
                  background: 'rgba(11, 15, 25, 0.92)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(249, 115, 22, 0.35)',
                  borderRadius: '10px',
                  padding: 4,
                  display: 'flex',
                  gap: 4,
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)'
                }}>
                  {Object.entries(MAP_STYLES).map(([k, s]) => {
                    const Icon = s.icon;
                    const active = mapStyle === k;
                    return (
                      <button
                        key={k}
                        onClick={() => changeMapStyle(k)}
                        title={s.label}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '8px',
                          background: active ? 'rgba(249, 115, 22, 0.25)' : 'transparent',
                          border: active ? '1.5px solid #f97316' : '1px solid transparent',
                          color: active ? '#f97316' : '#94a3b8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Icon size={16} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Live Transponder & Phone IMU Sensor Cockpit Widget (Shown Only When Driver is Selected) */}
              {selectedTruck && (
                <div style={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  right: showFleetPanel ? 390 : 16,
                  zIndex: 10,
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                  <div style={{
                    background: 'rgba(11, 15, 25, 0.95)',
                    backdropFilter: 'blur(24px)',
                    border: '1.5px solid #00f3ff',
                    borderRadius: '16px',
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.8), 0 0 25px rgba(0, 243, 255, 0.2)'
                  }}>
                    {/* Left: Driver & Device ID */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: '#00f3ff',
                        boxShadow: '0 0 12px #00f3ff',
                        animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite'
                      }} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 900, color: '#ffffff' }}>
                            {selectedTruck.truck_id}
                          </span>
                          <span style={{
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: 'rgba(0, 243, 255, 0.2)',
                            color: '#00f3ff',
                            fontSize: '10px',
                            fontWeight: 800,
                            fontFamily: 'monospace'
                          }}>
                            PHONE IMU ACTIVE
                          </span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            • Driver: <strong style={{ color: '#bae6fd' }}>{selectedTruck.driver || 'Mobile Client'}</strong>
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#00f3ff', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} color="#00f3ff" />
                          <span>{selectedTruck.location_name || 'Live GPS Location Fix'}</span>
                          <span style={{ color: '#64748b', marginLeft: 4 }}>
                            ({selectedTruck.device_model || 'Android Phone IMU'})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: REAL PHONE IMU & GPS SENSOR GAUGES */}
                    <div style={{ display: 'flex', gap: 18, fontSize: '12px' }}>
                      {/* IMU Pitch / Slope */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#64748b', fontSize: '9px', fontWeight: 700, letterSpacing: '0.05em' }}>IMU PITCH / SLOPE</div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 900, color: '#00f3ff', marginTop: 1 }}>
                          {(selectedTruck.imu_pitch != null ? selectedTruck.imu_pitch : (selectedTruck.slope != null ? selectedTruck.slope : 0)).toFixed(1)}°
                        </div>
                      </div>

                      {/* IMU Roll / Lateral Tilt */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#64748b', fontSize: '9px', fontWeight: 700, letterSpacing: '0.05em' }}>IMU ROLL TILT</div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 900, color: '#38bdf8', marginTop: 1 }}>
                          {(selectedTruck.imu_roll != null ? selectedTruck.imu_roll : 0.0).toFixed(1)}°
                        </div>
                      </div>

                      {/* Accelerometer G-Force */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#64748b', fontSize: '9px', fontWeight: 700, letterSpacing: '0.05em' }}>G-FORCE ACCEL</div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 900, color: '#ffffff', marginTop: 1 }}>
                          {(selectedTruck.imu_gforce != null ? selectedTruck.imu_gforce : 1.0).toFixed(2)} G
                        </div>
                      </div>

                      {/* GPS Speed */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#64748b', fontSize: '9px', fontWeight: 700, letterSpacing: '0.05em' }}>GPS SPEED</div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 900, color: '#34d399', marginTop: 1 }}>
                          {selectedTruck.speed ? selectedTruck.speed.toFixed(1) : '0.0'} km/h
                        </div>
                      </div>

                      {/* Barometer / GPS Altitude */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#64748b', fontSize: '9px', fontWeight: 700, letterSpacing: '0.05em' }}>ALTITUDE</div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 900, color: '#ffffff', marginTop: 1 }}>
                          {selectedTruck.altitude ? selectedTruck.altitude.toFixed(0) : '120'}m
                        </div>
                      </div>

                      {/* Status */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#64748b', fontSize: '9px', fontWeight: 700, letterSpacing: '0.05em' }}>STATUS</div>
                        <div style={{
                          marginTop: 1,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: selectedTruck.hazard_status === 'WARNING' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: selectedTruck.hazard_status === 'WARNING' ? '#ef4444' : '#10b981',
                          fontWeight: 800,
                          fontSize: '10px'
                        }}>
                          {selectedTruck.hazard_status || 'NORMAL'}
                        </div>
                      </div>
                    </div>

                    {/* Right Actions: Focus & Deselect */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => flyTo(selectedTruck)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: 'rgba(0, 243, 255, 0.15)',
                          border: '1px solid rgba(0, 243, 255, 0.4)',
                          color: '#00f3ff',
                          fontSize: '11px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <Crosshair size={13} />
                        Focus GPS
                      </button>

                      <button
                        onClick={() => setSelectedTruckId(null)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#94a3b8',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                        title="Deselect Driver"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Right Floating Fleet & Telemetry Live Sidebar Widget */}
              {showFleetPanel && (
                <div style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bottom: 16,
                  width: 360,
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{
                    background: 'rgba(11, 15, 25, 0.92)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0, 243, 255, 0.25)',
                    borderRadius: '16px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
                  }}>
                    {/* Header */}
                    <div style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Truck size={16} color="#00f3ff" />
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>Active Mobile Transponders</span>
                      </div>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: truckList.length > 0 ? 'rgba(0, 243, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: truckList.length > 0 ? '#00f3ff' : '#64748b',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {truckList.length} Connected
                      </span>
                    </div>

                    {/* List of Vehicles OR Clean Empty State */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {truckList.length === 0 ? (
                        <div style={{
                          padding: '32px 18px',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flex: 1
                        }}>
                          <div style={{
                            width: 54,
                            height: 54,
                            borderRadius: '50%',
                            background: 'rgba(0, 243, 255, 0.08)',
                            border: '1px dashed rgba(0, 243, 255, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 16,
                            animation: 'radar-ping 3s infinite'
                          }}>
                            <Radio size={24} color="#00f3ff" />
                          </div>
                          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>
                            Awaiting Real Mobile Handshake
                          </h4>
                          <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 14px', lineHeight: 1.6 }}>
                            No fake drivers loaded. Connect a phone running the <strong>D.R.I.S.H.T.I. Driver App</strong> to stream live GPS, IMU accelerometer &amp; gyro tilt telemetry directly to this radar.
                          </p>
                          <div style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            background: 'rgba(0, 243, 255, 0.06)',
                            border: '1px solid rgba(0, 243, 255, 0.15)',
                            fontSize: '10px',
                            color: '#00f3ff',
                            fontFamily: 'monospace'
                          }}>
                            FastAPI Gateway: http://127.0.0.1:8000
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ fontSize: '11px', color: '#94a3b8', padding: '0 4px', marginBottom: 2 }}>
                            👆 Click a driver below to focus &amp; lock onto their live IMU sensor stream:
                          </div>

                          {truckList.map((t) => {
                            const isSelected = selectedTruckId === t.truck_id;
                            return (
                              <div
                                key={t.truck_id}
                                onClick={() => {
                                  setSelectedTruckId(t.truck_id);
                                  flyTo(t);
                                }}
                                style={{
                                  padding: '14px',
                                  borderRadius: '12px',
                                  background: isSelected ? 'rgba(0, 243, 255, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                                  border: isSelected ? '1.5px solid #00f3ff' : '1px solid rgba(255, 255, 255, 0.06)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  boxShadow: isSelected ? '0 0 20px rgba(0, 243, 255, 0.15)' : 'none'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{
                                      width: 10,
                                      height: 10,
                                      borderRadius: '50%',
                                      background: '#00f3ff',
                                      boxShadow: '0 0 8px #00f3ff'
                                    }} />
                                    <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '14px', color: '#ffffff' }}>
                                      {t.truck_id}
                                    </span>
                                  </div>
                                  <span style={{
                                    fontSize: '10px',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    background: t.hazard_status === 'WARNING' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                    color: t.hazard_status === 'WARNING' ? '#ef4444' : '#10b981',
                                    fontWeight: 700
                                  }}>
                                    {t.hazard_status || 'ONLINE'}
                                  </span>
                                </div>

                                {/* Phone Hardware Model & Reverse Geocoded Location */}
                                <div style={{
                                  margin: '8px 0 10px',
                                  fontSize: '12px',
                                  color: '#bae6fd',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 5
                                }}>
                                  <MapPin size={13} color="#00f3ff" style={{ flexShrink: 0 }} />
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {t.location_name || `${(t.lat || 0).toFixed(3)}°N, ${(t.lng || 0).toFixed(3)}°E`}
                                  </span>
                                </div>

                                {/* Real Phone IMU Telemetry Stats */}
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(3, 1fr)',
                                  gap: 8,
                                  padding: '8px',
                                  borderRadius: '8px',
                                  background: 'rgba(0, 0, 0, 0.35)',
                                  fontSize: '11px'
                                }}>
                                  <div>
                                    <div style={{ color: '#64748b', fontSize: '9px', fontWeight: 600 }}>IMU PITCH</div>
                                    <div style={{ color: '#00f3ff', fontWeight: 700, fontFamily: 'monospace' }}>
                                      {(t.imu_pitch != null ? t.imu_pitch : (t.slope != null ? t.slope : 0)).toFixed(1)}°
                                    </div>
                                  </div>
                                  <div>
                                    <div style={{ color: '#64748b', fontSize: '9px', fontWeight: 600 }}>GPS SPEED</div>
                                    <div style={{ color: '#ffffff', fontWeight: 700, fontFamily: 'monospace' }}>
                                      {t.speed != null ? `${t.speed.toFixed(1)} km/h` : '0.0 km/h'}
                                    </div>
                                  </div>
                                  <div>
                                    <div style={{ color: '#64748b', fontSize: '9px', fontWeight: 600 }}>ALTITUDE</div>
                                    <div style={{ color: '#ffffff', fontWeight: 700, fontFamily: 'monospace' }}>
                                      {t.altitude != null ? `${t.altitude.toFixed(0)}m` : '120m'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ──── TAB 2: HAZARD & DISRUPTION INBOX VIEW ──── */}
          {activeTab === 'hazard' && (
            <div style={{
              position: 'absolute',
              inset: 0,
              zIndex: 20,
              padding: '24px',
              overflowY: 'auto',
              background: 'radial-gradient(ellipse at 50% 10%, #0d1527 0%, #070a13 100%)'
            }}>
              {/* Header / Summary Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    Driver Incident Photo Inbox & PostGIS Edge Blocker
                  </h2>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>
                    Review field photos submitted by convoys. Click thumbnail to inspect in high resolution. Approving immediately blocks the road edge in PostGIS (Cost: 999999) and triggers fleet dynamic reroutes.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  {/* Filter tabs */}
                  <div style={{
                    display: 'flex',
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderRadius: '8px',
                    padding: 3,
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    {['ALL', 'PENDING', 'ACTIVE'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setHazardFilter(f)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: hazardFilter === f ? 'rgba(0, 243, 255, 0.2)' : 'transparent',
                          color: hazardFilter === f ? '#00f3ff' : '#94a3b8',
                          border: 'none',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {f === 'ALL' && `All (${incidents.length})`}
                        {f === 'PENDING' && `Pending Review (${incidents.filter((i) => i.status === 'PENDING_REVIEW').length})`}
                        {f === 'ACTIVE' && `Active Blockades (${incidents.filter((i) => i.status === 'BLOCKADE_ACTIVE').length})`}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowReportModal(true)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
                    }}
                  >
                    <Plus size={16} />
                    New Disruption Report
                  </button>
                </div>
              </div>

              {/* Grid of Incidents */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '18px',
                marginBottom: '28px'
              }}>
                {filteredIncidents.map((inc) => {
                  const isBlocked = inc.status === 'BLOCKADE_ACTIVE';
                  const isPending = inc.status === 'PENDING_REVIEW';

                  return (
                    <div
                      key={inc.incident_id}
                      style={{
                        background: 'rgba(15, 23, 42, 0.88)',
                        border: isBlocked ? '1px solid rgba(239, 68, 68, 0.6)' : isPending ? '1px solid rgba(245, 158, 11, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      {/* Photo / Thumbnail with Lightbox Click */}
                      <div
                        onClick={() => setLightboxImage(inc.image_url)}
                        style={{
                          position: 'relative',
                          height: '170px',
                          background: '#0f172a',
                          cursor: 'pointer'
                        }}
                      >
                        <img
                          src={inc.image_url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600'}
                          alt={inc.incident_type}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {/* Zoom Hint Badge */}
                        <div style={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: 'rgba(0,0,0,0.7)',
                          color: '#00f3ff',
                          fontSize: '10px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          <ZoomIn size={12} />
                          Inspect Photo
                        </div>

                        {/* Status Tag */}
                        <div style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          background: isBlocked ? 'rgba(239, 68, 68, 0.9)' : 'rgba(245, 158, 11, 0.9)',
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '0.04em'
                        }}>
                          {isBlocked ? 'BLOCKADE ENFORCED (Cost: ∞)' : 'PENDING INBOX REVIEW'}
                        </div>

                        {/* GPS Accuracy Overlay */}
                        <div style={{
                          position: 'absolute',
                          bottom: 8,
                          left: 10,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'rgba(0,0,0,0.75)',
                          fontSize: '10px',
                          fontFamily: 'monospace',
                          color: '#bae6fd'
                        }}>
                          Accuracy: {inc.gps_accuracy || '±3.5m GNSS'}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Vehicle ID & Category Tag */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'rgba(0, 243, 255, 0.15)',
                            border: '1px solid rgba(0, 243, 255, 0.3)',
                            color: '#00f3ff',
                            fontSize: '11px',
                            fontWeight: 800,
                            fontFamily: 'monospace'
                          }}>
                            {inc.vehicle_id || inc.reporter_id || 'TRK-NER-101'}
                          </span>

                          <span style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            color: inc.incident_type?.includes('LANDSLIDE') ? '#ef4444' : inc.incident_type?.includes('FLOOD') ? '#38bdf8' : '#f59e0b'
                          }}>
                            {inc.incident_type}
                          </span>
                        </div>

                        {/* Reverse-geocoded road name */}
                        <div style={{
                          fontSize: '12px',
                          color: '#bae6fd',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginBottom: '8px'
                        }}>
                          <MapPin size={14} color="#00f3ff" style={{ flexShrink: 0 }} />
                          <span style={{ fontWeight: 600 }}>{inc.location_name}</span>
                        </div>

                        {/* Description */}
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px', flex: 1, lineHeight: 1.5 }}>
                          {inc.description}
                        </p>

                        <div style={{
                          fontSize: '11px',
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingBottom: '12px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                          marginBottom: '12px'
                        }}>
                          <span>Driver: <strong>{inc.driver_name || 'Relief Operator'}</strong></span>
                          <span>{inc.timestamp ? new Date(inc.timestamp).toLocaleTimeString() : 'Just now'}</span>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 'auto' }}>
                          <button
                            onClick={() => handleApproveBlockade(inc)}
                            disabled={isBlocked}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: 'none',
                              background: isBlocked ? 'rgba(239, 68, 68, 0.2)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                              color: isBlocked ? '#f87171' : 'white',
                              fontSize: '11px',
                              fontWeight: 800,
                              cursor: isBlocked ? 'default' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 4
                            }}
                          >
                            <CheckCircle2 size={13} />
                            {isBlocked ? 'Blocked' : 'Approve'}
                          </button>

                          <button
                            onClick={() => handleAiVerifyHazard(inc)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: '1px solid rgba(0, 243, 255, 0.4)',
                              background: 'rgba(0, 243, 255, 0.12)',
                              color: '#00f3ff',
                              fontSize: '11px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 4
                            }}
                          >
                            <Bot size={13} />
                            AI Verify
                          </button>

                          <button
                            onClick={() => handleDismissIncident(inc)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '8px',
                              background: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              color: '#e2e8f0',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 4
                            }}
                          >
                            <XCircle size={13} />
                            Dismiss
                          </button>
                        </div>

                        {/* AI Verification Breakdown Drawer */}
                        {inc.ai_verification && (
                          <div style={{
                            marginTop: 10,
                            padding: 10,
                            borderRadius: 10,
                            background: 'rgba(0, 0, 0, 0.45)',
                            border: '1px solid rgba(0, 243, 255, 0.3)',
                            fontSize: '10px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                              <span style={{ color: '#00f3ff', fontWeight: 800 }}>🤖 AI DECISION:</span>
                              <span style={{ color: '#34d399', fontWeight: 900, fontFamily: 'monospace' }}>
                                {inc.ai_verification.ai_decision} ({inc.ai_verification.confidence_percentage})
                              </span>
                            </div>
                            <div style={{ color: '#cbd5e1', marginBottom: 6, lineHeight: 1.3 }}>
                              {inc.ai_verification.recommendation}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {(inc.ai_verification.cross_validation_factors || []).map((f, idx) => (
                                <div key={idx} style={{ color: f.matched ? '#34d399' : '#94a3b8' }}>
                                  • {f.factor}: {f.detail}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Audit Log Table */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '14px' }}>
                  <FileText size={16} color="#00f3ff" />
                  <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    Disruption Audit Log & Edge Graph Records
                  </h3>
                </div>

                {auditLogs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '13px' }}>
                    No operator actions recorded yet this session.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', textAlign: 'left' }}>
                          <th style={{ padding: '8px 12px' }}>Time</th>
                          <th style={{ padding: '8px 12px' }}>Incident ID</th>
                          <th style={{ padding: '8px 12px' }}>Action</th>
                          <th style={{ padding: '8px 12px' }}>Operator</th>
                          <th style={{ padding: '8px 12px' }}>Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log) => (
                          <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#f1f5f9' }}>
                            <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{log.timestamp}</td>
                            <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#00f3ff' }}>{log.incident_id}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 700 }}>{log.action}</td>
                            <td style={{ padding: '10px 12px', color: '#bae6fd' }}>{log.operator}</td>
                            <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{log.location}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ──── TAB 3: REGIONAL WEATHER & MULTI-MODAL EARLY WARNING VIEW ──── */}
          {activeTab === 'weather' && (
            <div style={{
              position: 'absolute',
              inset: 0,
              zIndex: 20,
              padding: '24px',
              overflowY: 'auto',
              background: 'radial-gradient(ellipse at 50% 10%, #0c182c 0%, #070a13 100%)'
            }}>
              {/* Header & Feature 5: Weather Radar Layer Toggles */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                      Regional Weather & Multi-Modal Hazard Engine
                    </h2>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>
                      Multi-hazard radar layers, 72h antecedent rainfall bar charts, DEM slope vectors, HydroRIVERS swell discharge, and live Open-Meteo triggers for NER corridors.
                    </p>
                  </div>
                </div>

                {/* FEATURE 5: INTERACTIVE LAYER TOGGLES BAR */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'rgba(15, 23, 42, 0.85)',
                  padding: '12px 18px',
                  borderRadius: '14px',
                  border: '1px solid rgba(0, 243, 255, 0.25)',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#00f3ff', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Layers size={16} />
                    Active Radar Layers:
                  </span>

                  {/* 🌧️ Heavy Rainfall Toggle */}
                  <button
                    onClick={() => setWeatherLayers((p) => ({ ...p, rainfall: !p.rainfall }))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: weatherLayers.rainfall ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${weatherLayers.rainfall ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'}`,
                      color: weatherLayers.rainfall ? '#38bdf8' : '#94a3b8',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <CloudRain size={14} />
                    <span>🌧️ Heavy Rainfall (&gt;45 mm/h or 72h &gt; 100mm)</span>
                  </button>

                  {/* 💨 Severe Wind Gale Toggle */}
                  <button
                    onClick={() => setWeatherLayers((p) => ({ ...p, wind: !p.wind }))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: weatherLayers.wind ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${weatherLayers.wind ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)'}`,
                      color: weatherLayers.wind ? '#f59e0b' : '#94a3b8',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Wind size={14} />
                    <span>💨 Severe Wind Gale (&gt;65 km/h)</span>
                  </button>

                  {/* 🌊 HydroRIVERS Swell Toggle */}
                  <button
                    onClick={() => setWeatherLayers((p) => ({ ...p, rivers: !p.rivers }))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: weatherLayers.rivers ? 'rgba(0, 243, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${weatherLayers.rivers ? '#00f3ff' : 'rgba(255, 255, 255, 0.1)'}`,
                      color: weatherLayers.rivers ? '#00f3ff' : '#94a3b8',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Droplets size={14} />
                    <span>🌊 HydroRIVERS Swell &amp; Discharge</span>
                  </button>

                  {/* ⛰️ Saturated Mountain Slopes Toggle */}
                  <button
                    onClick={() => setWeatherLayers((p) => ({ ...p, slopes: !p.slopes }))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: weatherLayers.slopes ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${weatherLayers.slopes ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                      color: weatherLayers.slopes ? '#ef4444' : '#94a3b8',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Mountain size={14} />
                    <span>⛰️ Saturated Slopes (&gt;32° DEM)</span>
                  </button>
                </div>
              </div>

              {/* ════════════════════════════════════════════
                  LIVE ML CONTROL PANEL — XGBOOST + YOLO
              ════════════════════════════════════════════ */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                gap: 18,
                marginBottom: 28
              }}>
                {/* XGBoost susceptibility form */}
                <form
                  onSubmit={runSusceptibilityPrediction}
                  style={{
                    background: 'rgba(15, 23, 42, 0.88)',
                    border: '1px solid rgba(0, 243, 255, 0.35)',
                    borderRadius: 16,
                    padding: 20,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Activity size={18} color="#00f3ff" />
                    <div>
                      <h3 style={{ margin: 0, color: '#ffffff', fontSize: 16, fontWeight: 800 }}>
                        XGBoost Hazard Susceptibility
                      </h3>
                      <p style={{ margin: '3px 0 0', color: '#94a3b8', fontSize: 11 }}>
                        Run the trained tabular model using terrain and rainfall features.
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 10,
                    marginTop: 16
                  }}>
                    {[
                      ['location_id', 'Location ID'],
                      ['elevation_m', 'Elevation (m)'],
                      ['slope_deg', 'Slope (°)'],
                      ['aspect_deg', 'Aspect (°)'],
                      ['dist_to_river_m', 'Distance to River (m)'],
                      ['dist_to_road_m', 'Distance to Road (m)'],
                      ['rainfall_72h_mm', 'Rainfall 72h (mm)'],
                      ['rainfall_24h_mm', 'Rainfall 24h (mm)'],
                      ['rainfall_intensity_mmh', 'Rainfall Intensity (mm/h)']
                    ].map(([field, label]) => (
                      <label key={field} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <span style={{ color: '#94a3b8', fontSize: 10, fontWeight: 700 }}>{label}</span>
                        <input
                          type="number"
                          step="any"
                          value={mlForm[field]}
                          onChange={(e) => handleMlFormChange(field, e.target.value)}
                          required
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '9px 10px',
                            borderRadius: 8,
                            background: '#0b1220',
                            border: '1px solid rgba(255,255,255,0.12)',
                            color: '#ffffff',
                            fontFamily: 'monospace',
                            fontSize: 12
                          }}
                        />
                      </label>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={mlPredictionLoading}
                    style={{
                      width: '100%',
                      marginTop: 16,
                      padding: '11px 14px',
                      borderRadius: 9,
                      border: 'none',
                      background: mlPredictionLoading ? 'rgba(0,243,255,0.25)' : 'linear-gradient(135deg, #0284c7, #00b8d4)',
                      color: '#ffffff',
                      fontWeight: 800,
                      cursor: mlPredictionLoading ? 'wait' : 'pointer'
                    }}
                  >
                    {mlPredictionLoading ? 'Running XGBoost Model...' : 'Run Susceptibility Prediction'}
                  </button>

                  {mlPredictionResult?.data && (
                    <div style={{
                      marginTop: 14,
                      padding: 14,
                      borderRadius: 10,
                      background: 'rgba(0, 0, 0, 0.28)',
                      border: '1px solid rgba(0, 243, 255, 0.22)'
                    }}>
                      <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 800 }}>LATEST MODEL OUTPUT</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginTop: 6 }}>
                        <div>
                          <div style={{ color: '#00f3ff', fontSize: 28, fontWeight: 900, fontFamily: 'monospace' }}>
                            {(((mlPredictionResult.data.hazard_probability ?? mlPredictionResult.data.probability ?? 0) * 100)).toFixed(2)}%
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: 11 }}>Hazard Probability</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#ffffff', fontSize: 13, fontWeight: 900 }}>
                            {mlPredictionResult.data.risk_level}
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: 10 }}>
                            Prediction #{mlPredictionResult.prediction_id ?? '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </form>

                {/* YOLO image analysis */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.88)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: 16,
                  padding: 20,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Eye size={18} color="#f87171" />
                    <div>
                      <h3 style={{ margin: 0, color: '#ffffff', fontSize: 16, fontWeight: 800 }}>
                        YOLO Hazard Image Analysis
                      </h3>
                      <p style={{ margin: '3px 0 0', color: '#94a3b8', fontSize: 11 }}>
                        Upload a field image. Detected hazards are saved to PostgreSQL automatically.
                      </p>
                    </div>
                  </div>

                  <div style={{
                    marginTop: 16,
                    padding: 16,
                    borderRadius: 12,
                    border: '1px dashed rgba(248,113,113,0.45)',
                    background: 'rgba(239,68,68,0.04)'
                  }}>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, fontWeight: 700, marginBottom: 7 }}>
                      IMAGE LOCATION ID: {mlForm.location_id}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedHazardImage(e.target.files?.[0] || null)}
                      style={{ width: '100%', color: '#cbd5e1', fontSize: 12 }}
                    />
                    <div style={{ marginTop: 10, color: selectedHazardImage ? '#34d399' : '#64748b', fontSize: 11 }}>
                      {selectedHazardImage ? `Selected: ${selectedHazardImage.name}` : 'Choose a JPG, PNG, WEBP, or other supported image.'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={analyzeUploadedHazardImage}
                    disabled={imageAnalysisLoading || !selectedHazardImage}
                    style={{
                      width: '100%',
                      marginTop: 16,
                      padding: '11px 14px',
                      borderRadius: 9,
                      border: 'none',
                      background: imageAnalysisLoading || !selectedHazardImage ? 'rgba(239,68,68,0.22)' : 'linear-gradient(135deg, #dc2626, #ef4444)',
                      color: '#ffffff',
                      fontWeight: 800,
                      cursor: imageAnalysisLoading || !selectedHazardImage ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {imageAnalysisLoading ? 'Running YOLO Analysis...' : 'Analyze Hazard Image'}
                  </button>

                  {imageAnalysisResult && (
                    <div style={{
                      marginTop: 14,
                      padding: 14,
                      borderRadius: 10,
                      background: 'rgba(0,0,0,0.28)',
                      border: '1px solid rgba(239,68,68,0.25)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ color: '#94a3b8', fontSize: 11 }}>TOTAL DETECTED</span>
                        <strong style={{ color: '#f87171', fontFamily: 'monospace' }}>
                          {imageAnalysisResult.detection_result?.total_detected ?? 0}
                        </strong>
                      </div>
                      {(imageAnalysisResult.detection_result?.detections || []).length === 0 ? (
                        <div style={{ color: '#94a3b8', fontSize: 12 }}>No hazard detected in this image.</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {imageAnalysisResult.detection_result.detections.map((detection, index) => (
                            <div key={`${detection.hazard_type}-${index}`} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: 10,
                              padding: '8px 10px',
                              borderRadius: 7,
                              background: 'rgba(255,255,255,0.04)',
                              fontSize: 11
                            }}>
                              <span style={{ color: '#ffffff', fontWeight: 700 }}>{detection.hazard_type}</span>
                              <span style={{ color: '#fbbf24', fontFamily: 'monospace' }}>
                                {(Number(detection.confidence || 0) * 100).toFixed(2)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Weather Metric Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '18px',
                marginBottom: '28px'
              }}>
                {predictionCards.map((c) => {
                  const isCrit = c.risk_level === 'CRITICAL';
                  return (
                    <div
                      key={c.id}
                      style={{
                        background: 'rgba(15, 23, 42, 0.85)',
                        border: isCrit ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(14, 165, 233, 0.3)',
                        borderRadius: '16px',
                        padding: '20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace', fontWeight: 700 }}>
                            {c.code} • {c.highway}
                          </span>
                          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', margin: '2px 0 0' }}>
                            {c.name}
                          </h3>
                        </div>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: isCrit ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: isCrit ? '#ef4444' : '#f59e0b',
                          fontSize: '11px',
                          fontWeight: 800
                        }}>
                          {c.risk_level}
                        </span>
                      </div>

                      {/* 72h Rainfall Total */}
                      <div style={{ margin: '12px 0', display: 'flex', alignItems: 'baseline', gap: 10 }}>
                        <span style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'monospace', color: '#00f3ff' }}>
                          {c.rainfall_72h}
                        </span>
                        <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>
                          {c.isBackendPrediction ? '% confidence' : 'mm / 72h total'}
                        </span>
                      </div>

                      {/* 72h Antecedent Rainfall Bar Chart */}
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                          {c.isBackendPrediction ? 'Model Confidence & Risk Trend' : 'Antecedent Rainfall Inundation (Last 7 Epochs)'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: '48px', padding: '4px 0' }}>
                          {c.sparkline.map((val, idx) => {
                            const heightPct = Math.min(100, Math.max(15, (val / 220) * 100));
                            return (
                              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                <div
                                  style={{
                                    width: '100%',
                                    height: `${heightPct}%`,
                                    borderRadius: '3px',
                                    background: isCrit ? 'linear-gradient(to top, #0284c7, #ef4444)' : 'linear-gradient(to top, #0284c7, #00f3ff)'
                                  }}
                                  title={`${val} mm`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Multi-Modal Metrics */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 8,
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'rgba(0,0,0,0.35)',
                        fontSize: '11px',
                        marginTop: 'auto'
                      }}>
                        <div>
                          <span style={{ color: '#64748b', display: 'block' }}>Slope Inclination</span>
                          <strong style={{ color: '#ffffff' }}>{c.isBackendPrediction ? 'Prediction model' : `${c.slope}° DEM High-Res`}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', display: 'block' }}>{c.isBackendPrediction ? 'Predicted At' : 'HydroRIVERS Swell'}</span>
                          <strong style={{ color: isCrit ? '#ef4444' : '#38bdf8' }}>{c.hydros_discharge}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', display: 'block' }}>{c.isBackendPrediction ? 'Model Confidence' : 'Instant Rain Rate'}</span>
                          <strong style={{ color: '#ffffff' }}>{c.isBackendPrediction ? (c.confidence == null ? 'Not provided' : `${c.rain_rate}%`) : `${c.rain_rate} mm/h`}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b', display: 'block' }}>{c.isBackendPrediction ? 'Hazard Type' : 'Wind Speed Gale'}</span>
                          <strong style={{ color: c.isBackendPrediction ? '#ffffff' : (c.wind_speed > 60 ? '#ef4444' : '#ffffff') }}>{c.isBackendPrediction ? (c.hazard_type || 'Hazard') : `${c.wind_speed} km/h`}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          FEATURE 3: AUTO-DISCOVERY SATELLITE TOAST
      ════════════════════════════════════════════ */}
      {discoveryToast && (
        <div
          className="animate-toast"
          style={{
            position: 'fixed',
            top: 80,
            right: 24,
            zIndex: 150,
            width: 380,
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(6, 9, 19, 0.95))',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid #00f3ff',
            borderRadius: '16px',
            padding: '16px 18px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(0, 243, 255, 0.3)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14
          }}
        >
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00f3ff, #0284c7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#04101d',
            flexShrink: 0,
            boxShadow: '0 0 16px rgba(0, 243, 255, 0.5)'
          }}>
            <Satellite size={22} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(0, 243, 255, 0.2)',
                color: '#00f3ff',
                fontSize: '9px',
                fontWeight: 800,
                letterSpacing: '0.05em'
              }}>
                AUTO-DISCOVERY
              </span>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>Just Now</span>
            </div>

            <h4 style={{ margin: '4px 0 2px', fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
              🛰️ New Convoy Registered
            </h4>
            <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 800, color: '#00f3ff' }}>
              {discoveryToast.truck_id || discoveryToast.device_id}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: 2 }}>
              Model: <strong style={{ color: '#bae6fd' }}>{discoveryToast.device_model || 'Android Relief Transponder'}</strong>
            </div>
          </div>

          <button
            onClick={() => setDiscoveryToast(null)}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════
          FEATURE 4: HIGH-RES LIGHTBOX MODAL
      ════════════════════════════════════════════ */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="animate-lightbox"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 250,
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            cursor: 'zoom-out'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              background: '#0f172a',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(0, 243, 255, 0.4)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 40px rgba(0, 243, 255, 0.2)'
            }}
          >
            <img
              src={lightboxImage}
              alt="Driver Hazard Inspection"
              style={{
                width: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                display: 'block'
              }}
            />
            <div style={{
              padding: '14px 20px',
              background: 'rgba(15, 23, 42, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
                  Field Driver Incident Inspection Photo
                </span>
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                  High-Resolution Evidence Capture • Authenticated PostGIS Incident Payload
                </p>
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          HAZARD REPORT MODAL
      ════════════════════════════════════════════ */}
      {showReportModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }} onClick={(e) => { if (e.target === e.currentTarget) setShowReportModal(false); }}>
          <div style={{
            width: '100%',
            maxWidth: 480,
            background: '#0f172a',
            borderRadius: '20px',
            border: '1px solid rgba(0, 243, 255, 0.3)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.8), 0 0 30px rgba(0, 243, 255, 0.15)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertTriangle size={18} color="#ef4444" />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#ffffff' }}>Report Corridor Hazard</h3>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>Dispatches report to PostGIS Moderation Inbox</p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleManualReportSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Hazard Classification
                </label>
                <select
                  value={incForm.incident_type}
                  onChange={(e) => setIncForm({ ...incForm, incident_type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: '13px'
                  }}
                >
                  <option>LANDSLIDE / MUDFLOW</option>
                  <option>FLASH FLOOD / WATERLOGGED</option>
                  <option>DAMAGED BRIDGE</option>
                  <option>TREE / ROCKFALL</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Road / Landmark Location Name
                </label>
                <input
                  type="text"
                  value={incForm.location_name}
                  onChange={(e) => setIncForm({ ...incForm, location_name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={incForm.lat}
                    onChange={(e) => setIncForm({ ...incForm, lat: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: '#1e293b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      fontFamily: 'monospace'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={incForm.lng}
                    onChange={(e) => setIncForm({ ...incForm, lng: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: '#1e293b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      fontFamily: 'monospace'
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea
                  rows={3}
                  value={incForm.description}
                  onChange={(e) => setIncForm({ ...incForm, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Submit for Moderation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          FLOATING TOAST NOTIFICATION
      ════════════════════════════════════════════ */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 200,
          maxWidth: 420,
          background: notification.type === 'error' ? '#ef4444' : notification.type === 'success' ? '#10b981' : '#0284c7',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '14px 18px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: '13px',
          fontWeight: 700
        }}>
          {notification.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span style={{ flex: 1 }}>{notification.msg}</span>
          <button
            onClick={() => setNotification(null)}
            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <AIChat />
    </div>
  );
}