export interface Dataset {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: 'active' | 'idle' | 'error' | 'archived' | 'processing';
  source: 'csv_upload' | 'json_upload' | 'mqtt_stream' | 'webhook' | 'api';

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

  // Bounding box para renderizado 3D (estructura JSON tipada o any)
  boundingBox?: any; // O define una estructura si está tipada, ej.: { min: { x: number; y: number; z: number }, max: { x: number; y: number; z: number } }

  // Estadísticas
  totalDataPoints: number;
  dataPointsToday: number;
  lastDataReceived?: string; // ISO8601 string (DateTime en Prisma)
  avgUpdateFreq?: number;

  // Config de alertas
  alertsEnabled: boolean;
  alertThresholds?: any; // O estructura tipada según tu backend, ejemplo: {temperature: {max: number, min: number}, vibration: {max: number}}

  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601


  health: number;
  trend: string;
  trendPercent: number;
  activeAlertsCount: number;

  // Relaciones (pueden omitirse si solo representan foreign keys)
  // dataPoints?: DataPoint[];
  // insights?: Insight[];
  // alerts?: Alert[];
  // layers?: Layer[];
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