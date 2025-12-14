// Types
export interface Asset {
  id: string;
  name: string;
  type: 'fleet' | 'industrial' | 'city';
  color: string;
  position: [number, number];
  trail?: [number, number][];
}

export interface ParkArea {
  id: string;
  name: string;
  status: 'ok' | 'warning' | 'critical';
  color: string;
  polygon: [number, number][][];
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

export const parks: ParkArea[] = [
  {
    id: 'park-1',
    name: 'Parc de la Ciutadella',
    status: 'ok',
    color: '#22c55e',
    polygon: [
      [
        [2.1865, 41.3893],
        [2.1906, 41.3891],
        [2.1919, 41.3873],
        [2.1908, 41.3858],
        [2.1872, 41.3856],
        [2.1845, 41.3869],
        [2.1847, 41.3884],
        [2.1865, 41.3893]
      ]
    ]
  },

  {
    id: 'park-2',
    name: 'Parc Güell',
    status: 'warning',
    color: '#facc15',
    polygon: [
      [
        [2.1492, 41.4149],
        [2.1535, 41.4171],
        [2.1578, 41.4163],
        [2.1586, 41.4128],
        [2.1551, 41.4108],
        [2.1503, 41.4115],
        [2.1492, 41.4149]
      ]
    ]
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