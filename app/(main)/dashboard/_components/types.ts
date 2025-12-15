// Types
export interface Asset {
  id: string;
  name: string;
  type: 'fleet' | 'industrial' | 'city';
  color: string;
  position: [number, number];
  trail?: [number, number][];
}
// AÑADIR este nuevo tipo (no modificar Asset)
export interface HeatmapPoint {
  id: string;
  position: [number, number];
  intensity: number; // 0-1
  category?: string; // Ej: 'traffic', 'pollution', 'temperature', 'crowd'
}
export interface ParkArea {
  id: string;
  name: string;
  description: string;
  status: 'ok' | 'warning' | 'critical';
  color: string;
  polygon: [number, number][][];
  location?: [number, number] | GeoJSON.FeatureCollection | GeoJSON.Feature;
}

// Si necesitas el namespace GeoJSON, añade esto también:
declare namespace GeoJSON {
  interface Feature {
    type: 'Feature';
    geometry: Geometry;
    properties?: any;
  }

  interface FeatureCollection {
    type: 'FeatureCollection';
    features: Feature[];
  }

  interface Geometry {
    type: 'Polygon' | 'MultiPolygon' | 'Point' | 'LineString' | 'MultiPoint' | 'MultiLineString';
    coordinates: any;
  }
}

interface Dataset {
  name: string;
  assets: number;
  status: 'active' | 'warning';
  color: string;
}

interface Alert {
  type: 'critical' | 'warning';
  message: string;
  dataset: string;
  time: string;
}

// Asset data in Barcelona with correct coordinates [longitude, latitude] and trails following real roads

export const staticAssets: Asset[] = [
  {
    id: 'industrial-1',
    name: 'Port of Barcelona',
    type: 'industrial',
    color: '#3b82f6',
    position: [2.1833, 41.3640]
  },
  {
    id: 'industrial-2',
    name: 'Torre Glòries',
    type: 'industrial',
    color: '#3b82f6',
    position: [2.1897, 41.4036]
  },
  {
    id: 'industrial-3',
    name: 'Camp Nou',
    type: 'industrial',
    color: '#3b82f6',
    position: [2.1228, 41.3809]
  },
  {
    id: 'city-1',
    name: 'Pl. Catalunya',
    type: 'city',
    color: '#f59e0b',
    position: [2.1686, 41.3874]
  },
  {
    id: 'city-2',
    name: 'Parc Güell',
    type: 'city',
    color: '#f59e0b',
    position: [2.1527, 41.4145]
  },
  {
    id: 'city-3',
    name: 'Barceloneta',
    type: 'city',
    color: '#f59e0b',
    position: [2.1896, 41.3773]
  }
];



export  const datasets: Dataset[] = [
    { name: 'Public Transport BCN', assets: 342, status: 'active', color: 'from-emerald-500 to-teal-500' },
    { name: 'IoT Infrastructure', assets: 589, status: 'active', color: 'from-blue-500 to-cyan-500' },
    { name: 'Smart City Barcelona', assets: 316, status: 'warning', color: 'from-amber-500 to-orange-500' }
  ];

export  const alerts: Alert[] = [
    { type: 'critical', message: 'Temperature exceeded in Port sensor', dataset: 'IoT Infrastructure', time: '2m ago' },
    { type: 'warning', message: 'TMB bus out of service', dataset: 'Public Transport BCN', time: '8m ago' }
  ];


  // AÑADIR al final de tu archivo de datos
export const heatmapData: HeatmapPoint[] = [
  
  // Tráfico en zonas clave de Barcelona
    // Tráfico en zonas clave y ejes principales de Barcelona (73 puntos densificados)
    // --- ZONA CENTRAL Y EIXAMPLE CRÍTICO ---
    { id: 'traffic-1', position: [2.1700, 41.3875], intensity: 0.95, category: 'traffic' }, // Plaça de Catalunya (Eje Central)
    { id: 'traffic-2', position: [2.1620, 41.3890], intensity: 0.88, category: 'traffic' }, // Passeig de Gràcia / Diputació
    { id: 'traffic-4', position: [2.1740, 41.3850], intensity: 0.80, category: 'traffic' }, // Via Laietana / Jaume I
    { id: 'traffic-13', position: [2.1760, 41.3960], intensity: 0.88, category: 'traffic' }, // Carrer d'Aragó / Nàpols
    { id: 'traffic-14', position: [2.1600, 41.3840], intensity: 0.85, category: 'traffic' }, // Ronda de Sant Antoni / Urgell
    { id: 'traffic-15', position: [2.1810, 41.3930], intensity: 0.80, category: 'traffic' }, // Plaça de Tetuan / Gran Vía
    { id: 'traffic-22', position: [2.1680, 41.4000], intensity: 0.82, category: 'traffic' }, // Carrer de Mallorca / Balmes
    { id: 'traffic-23', position: [2.1600, 41.3780], intensity: 0.70, category: 'traffic' }, // Carrer de Sepúlveda / Aribau
    { id: 'traffic-31', position: [2.1520, 41.3930], intensity: 0.78, category: 'traffic' }, // Carrer de Balmes / Diagonal
    { id: 'traffic-36', position: [2.1480, 41.3830], intensity: 0.70, category: 'traffic' }, // Carrer de Comte d'Urgell / Aragó
    { id: 'traffic-37', position: [2.1400, 41.3930], intensity: 0.80, category: 'traffic' }, // Travessera de Gràcia / Muntaner
    { id: 'traffic-44', position: [2.1680, 41.3950], intensity: 0.70, category: 'traffic' }, // Passeig de Sant Joan / Còrsega
    { id: 'traffic-47', position: [2.1780, 41.3820], intensity: 0.80, category: 'traffic' }, // Carrer dels Tarongers / Arc de Triomf
    { id: 'traffic-67', position: [2.1640, 41.3830], intensity: 0.75, category: 'traffic' }, // Carrer d'Aragó / Enric Granados
    { id: 'traffic-68', position: [2.1800, 41.3980], intensity: 0.78, category: 'traffic' }, // Carrer de Padilla / Gran Vía
    { id: 'traffic-71', position: [2.1600, 41.3920], intensity: 0.85, category: 'traffic' }, // Carrer d'Aribau / Còrsega

    // --- ZONA GLÒRIES Y ACCESOS NORTE/ESTE (Densificación Crítica) ---
    { id: 'traffic-9', position: [2.1880, 41.4030], intensity: 0.95, category: 'traffic' }, // Plaça de les Glòries (Núcleo)
    { id: 'traffic-10', position: [2.1960, 41.4150], intensity: 0.85, category: 'traffic' }, // Av. Meridiana (Entrada/Salida B-20)
    { id: 'traffic-30', position: [2.1700, 41.4180], intensity: 0.85, category: 'traffic' }, // Av. Meridiana / Fabra i Puig
    { id: 'traffic-48', position: [2.1780, 41.4080], intensity: 0.75, category: 'traffic' }, // Av. Meridiana / Trinitat Vella
    { id: 'traffic-49', position: [2.1870, 41.4040], intensity: 0.95, category: 'traffic' }, // Glòries - Acceso Meridiana (Densificado 1)
    { id: 'traffic-50', position: [2.1900, 41.4020], intensity: 0.92, category: 'traffic' }, // Glòries - Gran Via Salida Centro (Densificado 2)
    { id: 'traffic-51', position: [2.1895, 41.4060], intensity: 0.90, category: 'traffic' }, // Glòries - Cruce Diagonal (Densificado 3)

    // --- PLAÇA D'ESPANYA Y ACCESOS SUR/OESTE (Densificación Crítica) ---
    { id: 'traffic-6', position: [2.1520, 41.3750], intensity: 0.98, category: 'traffic' }, // Plaça d'Espanya (Núcleo Máximo)
    { id: 'traffic-7', position: [2.1640, 41.3700], intensity: 0.85, category: 'traffic' }, // Av. Paral·lel / Ronda de Sant Pau
    { id: 'traffic-24', position: [2.1200, 41.3500], intensity: 0.90, category: 'traffic' }, // Ronda Litoral (Salida Zona Franca)
    { id: 'traffic-29', position: [2.1300, 41.3680], intensity: 0.88, category: 'traffic' }, // Ronda Litoral (Salida 15 - La Campana)
    { id: 'traffic-45', position: [2.1350, 41.3750], intensity: 0.75, category: 'traffic' }, // Gran Vía / Vilamarí
    { id: 'traffic-52', position: [2.1490, 41.3760], intensity: 0.98, category: 'traffic' }, // Pl. Espanya - Gran Vía Oeste (Densificado 1)
    { id: 'traffic-53', position: [2.1540, 41.3745], intensity: 0.95, category: 'traffic' }, // Pl. Espanya - Av. Paral·lel Acceso (Densificado 2)
    { id: 'traffic-54', position: [2.1510, 41.3735], intensity: 0.95, category: 'traffic' }, // Pl. Espanya - Tarragona (Densificado 3)
    { id: 'traffic-69', position: [2.1250, 41.3700], intensity: 0.70, category: 'traffic' }, // Carrer de Badal / Rambla Badal
    { id: 'traffic-72', position: [2.1320, 41.3650], intensity: 0.90, category: 'traffic' }, // Gran Via / Mèxic (Acceso Fira)

    // --- ACCESOS PORTUARIOS Y LITORAL ---
    { id: 'traffic-3', position: [2.1850, 41.3650], intensity: 0.90, category: 'traffic' }, // Acceso al Puerto (Ronda Litoral)
    { id: 'traffic-5', position: [2.1900, 41.3800], intensity: 0.75, category: 'traffic' }, // Passeig de Joan de Borbó (Barceloneta)
    { id: 'traffic-16', position: [2.1820, 41.3730], intensity: 0.80, category: 'traffic' }, // Av. Icària / Marina (Vila Olímpica)
    { id: 'traffic-21', position: [2.1740, 41.3700], intensity: 0.75, category: 'traffic' }, // Passeig de Colom
    { id: 'traffic-28', position: [2.1800, 41.3680], intensity: 0.88, category: 'traffic' }, // Passeig de Josep Carner (Acceso Puerto)
    { id: 'traffic-40', position: [2.1620, 41.3650], intensity: 0.80, category: 'traffic' }, // Plaça de les Drassanes / Colom
    { id: 'traffic-62', position: [2.1860, 41.3660], intensity: 0.92, category: 'traffic' }, // Ronda Litoral - Salida 21 (Port) (Densificado)
    { id: 'traffic-66', position: [2.1750, 41.3700], intensity: 0.80, category: 'traffic' }, // Passeig Colom - Via Laietana (Densificado)

    // --- ESTACIÓ DE SANTS Y ÁREA OESTE ---
    { id: 'traffic-8', position: [2.1380, 41.3780], intensity: 0.92, category: 'traffic' }, // Estació de Sants / Plaça Països Catalans (Núcleo)
    { id: 'traffic-19', position: [2.1300, 41.3850], intensity: 0.78, category: 'traffic' }, // Gran Vía / Comte d'Urgell
    { id: 'traffic-20', position: [2.1220, 41.3800], intensity: 0.70, category: 'traffic' }, // Avinguda de Joan XXIII / Diagonal (Zona Camp Nou)
    { id: 'traffic-60', position: [2.1400, 41.3800], intensity: 0.90, category: 'traffic' }, // Estació Sants - Av. Roma/Numancia (Densificado 1)
    { id: 'traffic-61', position: [2.1350, 41.3820], intensity: 0.85, category: 'traffic' }, // Estació Sants - Plaça Països Catalans (Densificado 2)

    // --- DIAGONAL Y RONDAS (ZONA ALTA) ---
    { id: 'traffic-11', position: [2.1480, 41.3960], intensity: 0.90, category: 'traffic' }, // Av. Diagonal / Plaça Francesc Macià (Núcleo)
    { id: 'traffic-12', position: [2.1260, 41.3930], intensity: 0.80, category: 'traffic' }, // Ronda del Mig (Via Augusta)
    { id: 'traffic-17', position: [2.1450, 41.4050], intensity: 0.70, category: 'traffic' }, // Via Augusta (Travessera de Gràcia)
    { id: 'traffic-18', position: [2.1520, 41.4180], intensity: 0.65, category: 'traffic' }, // Túnel de la Rovira (Entrada/Salida)
    { id: 'traffic-27', position: [2.1380, 41.4000], intensity: 0.75, category: 'traffic' }, // Plaça Gal·la Placídia
    { id: 'traffic-33', position: [2.1220, 41.3900], intensity: 0.65, category: 'traffic' }, // Av. de Pedralbes / Esplugues
    { id: 'traffic-38', position: [2.1640, 41.4050], intensity: 0.85, category: 'traffic' }, // Ronda del General Mitre / Via Augusta
    { id: 'traffic-39', position: [2.1150, 41.3750], intensity: 0.75, category: 'traffic' }, // Av. Diagonal (Acceso Ronda de Dalt)
    { id: 'traffic-42', position: [2.1500, 41.4130], intensity: 0.60, category: 'traffic' }, // Passeig de la Bonanova / Sarrià
    { id: 'traffic-58', position: [2.1470, 41.3950], intensity: 0.88, category: 'traffic' }, // Diagonal/Macià - Lateral (Densificado 1)
    { id: 'traffic-59', position: [2.1500, 41.3970], intensity: 0.85, category: 'traffic' }, // Diagonal/Macià - Túnel Salida (Densificado 2)
    { id: 'traffic-64', position: [2.1280, 41.3980], intensity: 0.80, category: 'traffic' }, // Ronda de Dalt - Salida 10 (Pedralbes)
    { id: 'traffic-65', position: [2.1580, 41.4000], intensity: 0.82, category: 'traffic' }, // Ronda del Mig - Túnel de Ganduxer

    // --- OTRAS CONEXIONES Y CUERPOS DE AGUA ---
    { id: 'traffic-25', position: [2.1740, 41.4130], intensity: 0.60, category: 'traffic' }, // Av. Gaudí
    { id: 'traffic-26', position: [2.1930, 41.3900], intensity: 0.85, category: 'traffic' }, // Ronda Litoral (Salida 23 - Bac de Roda)
    { id: 'traffic-32', position: [2.1960, 41.3980], intensity: 0.90, category: 'traffic' }, // Ronda Litoral (Acceso Besòs)
    { id: 'traffic-34', position: [2.1880, 41.3850], intensity: 0.75, category: 'traffic' }, // Av. d'Icària / Marina (Port Olímpic)
    { id: 'traffic-35', position: [2.1720, 41.3780], intensity: 0.82, category: 'traffic' }, // Carrer de la Marina / Gran Vía
    { id: 'traffic-41', position: [2.1850, 41.4100], intensity: 0.78, category: 'traffic' }, // Carrer de Pere IV / Selva de Mar
    { id: 'traffic-43', position: [2.1950, 41.3700], intensity: 0.72, category: 'traffic' }, // Av. del Litoral (Frente al Fòrum)
    { id: 'traffic-63', position: [2.1930, 41.3910], intensity: 0.88, category: 'traffic' }, // Ronda Litoral - Salida 23 (Diagonal Mar) (Densificado)
    { id: 'traffic-70', position: [2.1760, 41.4110], intensity: 0.65, category: 'traffic' }, // Carrer de Provença / Sagrada Família
    { id: 'traffic-73', position: [2.1830, 41.3950], intensity: 0.75, category: 'traffic' }, // Carrer de Marina / Pujades


  // Contaminación en zonas industriales
  { id: 'pollution-1', position: [2.1833, 41.3640], intensity: 0.8, category: 'pollution' }, // Port
  { id: 'pollution-2', position: [2.1450, 41.3680], intensity: 0.6, category: 'pollution' }, // Zona Franca
  { id: 'pollution-3', position: [2.1686, 41.3874], intensity: 0.7, category: 'pollution' }, // Centro
  
  // Temperatura/calor urbano
  { id: 'temp-1', position: [2.1686, 41.3874], intensity: 0.85, category: 'temperature' }, // Centro
  { id: 'temp-2', position: [2.1540, 41.3888], intensity: 0.75, category: 'temperature' }, // Eixample
  { id: 'temp-3', position: [2.1527, 41.4145], intensity: 0.4, category: 'temperature' }, // Parc Güell (más fresco)
  
  // Densidad de personas (crowd)
  
   // Original points refined
  { id: 'crowd-1', position: [2.1737, 41.3808], intensity: 1.0, category: 'crowd' }, // Las Ramblas [web:11]
  { id: 'crowd-2', position: [2.1700, 41.3870], intensity: 0.98, category: 'crowd' }, // Plaça de Catalunya [web:12]
  { id: 'crowd-3', position: [2.1581, 41.3890], intensity: 0.85, category: 'crowd' }, // Passeig de Gràcia [web:13]

  // Added high-density tourist spots
  // Sagrada Família + Eixample
  { id: 'crowd-4', position: [2.1744, 41.4036], intensity: 0.95, category: 'crowd' }, // Sagrada Família [web:21]
  { id: 'crowd-5', position: [2.1650, 41.3950], intensity: 0.75, category: 'crowd' }, // Dreta de l’Eixample comercial [web:2]

  // Barri Gòtic + Born + Raval
  { id: 'crowd-6', position: [2.1750, 41.3830], intensity: 0.90, category: 'crowd' }, // Gòtic central [web:26]
  { id: 'crowd-7', position: [2.1800, 41.3840], intensity: 0.80, category: 'crowd' }, // El Born / Santa Maria del Mar [web:26]
  { id: 'crowd-8', position: [2.1700, 41.3795], intensity: 0.78, category: 'crowd' }, // Raval junto a Ramblas [web:26]
  { id: 'crowd-9', position: [2.1710, 41.3810], intensity: 0.92, category: 'crowd' }, // Mercat de la Boqueria [web:29]

  // Ramblas → mar
  { id: 'crowd-10', position: [2.1720, 41.3780], intensity: 0.80, category: 'crowd' }, // Colom / Port Vell [web:26]

  // Playas (Barceloneta)
  { id: 'crowd-11', position: [2.1894, 41.3809], intensity: 0.88, category: 'crowd' }, // Barceloneta playa [web:22][web:27]
  { id: 'crowd-12', position: [2.1930, 41.3785], intensity: 0.82, category: 'crowd' }, // Paseo marítimo este [web:24]
  { id: 'crowd-13', position: [2.1870, 41.3830], intensity: 0.75, category: 'crowd' }, // Barceloneta interior bares [web:24]

  // Montjuïc área turística
  { id: 'crowd-14', position: [2.1527, 41.3689], intensity: 0.70, category: 'crowd' }, // MNAC / fuentes mágicas [web:26]
  { id: 'crowd-15', position: [2.1663, 41.3645], intensity: 0.60, category: 'crowd' }, // Castillo de Montjuïc miradores [web:26]

  // Camp Nou (Spotify Camp Nou)
  { id: 'crowd-16', position: [2.1218, 41.3809], intensity: 0.85, category: 'crowd' }, // Estadio en día de partido / tours [web:23][web:28]

  // Gràcia
  { id: 'crowd-17', position: [2.1570, 41.4030], intensity: 0.70, category: 'crowd' }, // Vila de Gràcia / Plaça del Sol [web:2]
  { id: 'crowd-18', position: [2.1510, 41.4145], intensity: 0.78, category: 'crowd' }, // Park Güell accesos [web:21]
  
  // Continuación de Puntos de Interés / Afluencia
{ id: 'crowd-19', position: [2.1643, 41.3752], intensity: 0.65, category: 'crowd' }, // Plaça d'Espanya / Arenas
{ id: 'crowd-20', position: [2.1804, 41.3915], intensity: 0.60, category: 'crowd' }, // Arc de Triomf / Estació del Nord
{ id: 'crowd-21', position: [2.1873, 41.3910], intensity: 0.55, category: 'crowd' }, // Parc de la Ciutadella
{ id: 'crowd-22', position: [2.1534, 41.3855], intensity: 0.70, category: 'crowd' }, // L'Illa Diagonal
{ id: 'crowd-23', position: [2.1465, 41.3780], intensity: 0.65, category: 'crowd' }, // Sants Estació
{ id: 'crowd-24', position: [2.1630, 41.4110], intensity: 0.58, category: 'crowd' }, // Travessera de Gràcia
{ id: 'crowd-25', position: [2.1620, 41.3830], intensity: 0.72, category: 'crowd' }, // Universitat
{ id: 'crowd-26', position: [2.1795, 41.3750], intensity: 0.70, category: 'crowd' }, // Moll de la Fusta / Maremagnum
{ id: 'crowd-27', position: [2.1600, 41.3920], intensity: 0.80, category: 'crowd' }, // Passeig de Gràcia (Alto)
{ id: 'crowd-28', position: [2.1680, 41.4010], intensity: 0.80, category: 'crowd' }, // Hospital de Sant Pau
{ id: 'crowd-29', position: [2.2030, 41.4030], intensity: 0.55, category: 'crowd' }, // Diagonal Mar
{ id: 'crowd-30', position: [2.1480, 41.3990], intensity: 0.62, category: 'crowd' }, // Plaça de Lesseps
{ id: 'crowd-31', position: [2.1440, 41.4080], intensity: 0.60, category: 'crowd' }, // Mercat de Sant Gervasi
{ id: 'crowd-32', position: [2.1560, 41.3730], intensity: 0.58, category: 'crowd' }, // Poble Sec
{ id: 'crowd-33', position: [2.1670, 41.3740], intensity: 0.75, category: 'crowd' }, // Paral·lel (Teatros / ocio)
{ id: 'crowd-34', position: [2.1530, 41.4000], intensity: 0.68, category: 'crowd' }, // Plaça de Gal·la Placídia
{ id: 'crowd-35', position: [2.1865, 41.4080], intensity: 0.50, category: 'crowd' }, // Glòries
{ id: 'crowd-36', position: [2.1790, 41.3880], intensity: 0.65, category: 'crowd' }, // Mercat de Santa Caterina
{ id: 'crowd-37', position: [2.1840, 41.3850], intensity: 0.70, category: 'crowd' }, // Estació de França
{ id: 'crowd-38', position: [2.1640, 41.3980], intensity: 0.82, category: 'crowd' }, // Av. Diagonal / Palau Robert
{ id: 'crowd-39', position: [2.1820, 41.3780], intensity: 0.68, category: 'crowd' }, // Barceloneta (Acceso restaurantes)
{ id: 'crowd-40', position: [2.1700, 41.3850], intensity: 0.95, category: 'crowd' }, // Portal de l'Àngel (Máx. comercial)


];

// Función helper para filtrar por categoría
export const getHeatmapByCategory = (category: string): HeatmapPoint[] => {
  return heatmapData.filter(point => point.category === category);
};