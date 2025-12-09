export type ViewType = 'gis' | 'threejs';

export interface Dataset {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: 'active' | 'idle' | 'error' | 'archived' | 'processing';
  source: 'csv_upload' | 'json_upload' | 'mqtt_stream' | 'webhook' | 'api';

  // 🆕 View type - define cómo se visualizan los datos
  viewType: ViewType;

  // MQTT config
  mqttBroker?: string;
  mqttTopic?: string;
  mqttUsername?: string;
  mqttPassword?: string;

  // Webhook config
  webhookUrl?: string;
  webhookSecret?: string;

  // API config
  apiEndpoint?: string;

  // Bounding box para renderizado 3D
  boundingBox?: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  };

  // Estadísticas
  totalDataPoints: number;
  dataPointsToday: number;
  lastDataReceived?: string; // ISO8601 string
  avgUpdateFreq?: number;

  // Config de alertas
  alertsEnabled: boolean;
  alertThresholds?: Record<string, { max?: number; min?: number }>;

  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601

  // Métricas calculadas (del endpoint)
  health: number;
  trend: string;
  trendPercent: number;
  activeAlertsCount: number;
}

export interface DataPoint {
  id: string;
  datasetId: string;
  value: number;
  sensorId: string;
  
  // 🆕 Coordenadas directas
  // Para GIS: x=longitude, y=latitude, z=altitude
  // Para ThreeJS: x, y, z en espacio cartesiano
  x?: number;
  y?: number;
  z?: number;
  
  metadata?: Record<string, any>;
  timestamp: string; // ISO8601
  createdAt: string; // ISO8601
  isLatest: boolean;
  sensorConfigId?: string;
}

export interface DatasetMapping {
  id: string;
  datasetId: string;
  
  // Paths para mapear campos del payload
  valuePath: string;
  
  // 🆕 Paths para coordenadas (flexibles según viewType)
  xPath?: string;
  yPath?: string;
  zPath?: string;
  
  sensorIdPath?: string;
  sensorTypePath?: string;
  timestampPath: string;
  unitPath?: string;
  
  metadata?: Record<string, any>;
  transforms?: Record<string, any>;
  
  createdAt: string;
  updatedAt: string;
}


interface old_v3_Dataset {
  id: string;
  name: string;
  status: string;
  [key: string]: any;
}

interface v2_old_Dataset {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  source: string;
  totalDataPoints: number;
  dataPointsToday: number;
  lastDataReceived: Date | null;
  health: number;
  trend: string;
  trendPercent: number;
  activeAlertsCount: number;
  createdAt: Date;
  updatedAt: Date;
}


export interface OLD_Dataset {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'idle' | 'error' | 'archived' | 'processing';
  source: 'csv_upload' | 'json_upload' | 'mqtt_stream' | 'webhook' | 'api';
  totalDataPoints: number;
  dataPointsToday: number;
  lastDataReceived?: Date;
  avgUpdateFreq?: number;
  createdAt: Date;
  updatedAt: Date;
  
  // MQTT config
  mqttBroker?: string;
  mqttTopic?: string;
  mqttUsername?: string;
  
  // Stats calculadas
  health?: number;
  trend?: 'up' | 'down' | 'neutral';
  trendPercent?: number;
}