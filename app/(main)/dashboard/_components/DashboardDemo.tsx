"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Activity, Database, MapPin, Bell, TrendingUp, ArrowUpRight } from 'lucide-react';
import HeatmapControls from './HeatmapControls';

import { staticAssets, datasets, alerts, getHeatmapByCategory } from './types';
import type { Asset } from './types';

import { MapboxManager, renderMapboxError } from './mapbox-manager';

export function DigitalTwinDashboard() {
  const mapManager = useRef<MapboxManager | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [time, setTime] = useState<Date>(new Date());
  const [activeAssets, setActiveAssets] = useState<number>(1247);
  const [messageRate, setMessageRate] = useState<number>(3821);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(420);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const mapContainer = useRef<HTMLDivElement | null>(null);

  // Detectar si es mobile (solo en el cliente)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const statsTimer = setInterval(() => {
      setActiveAssets(prev => prev + Math.floor(Math.random() * 10 - 5));
      setMessageRate(prev => prev + Math.floor(Math.random() * 200 - 100));
    }, 2000);
    return () => {
      clearInterval(timer);
      clearInterval(statsTimer);
    };
  }, []);

  // Inicializar mapa usando MapboxManager
  useEffect(() => {
    if (mapManager.current || !mapContainer.current) return;

    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
    script.async = true;
    
    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
    link.rel = 'stylesheet';
    
    document.head.appendChild(link);
    document.head.appendChild(script);

    script.onload = async () => {
      if (!mapContainer.current) return;

      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    
      if (!mapboxToken || mapboxToken.includes('example')) {
        console.error('Mapbox token not configured. Please set a valid token.');
        renderMapboxError(mapContainer.current);
        return;
      }

      try {
        // Inyectar estilos CSS
        MapboxManager.injectStyles();

        // Crear instancia del manager
        mapManager.current = new MapboxManager(mapboxToken);

        // Inicializar el mapa
        mapManager.current.initMap({
          container: mapContainer.current,
          center: [2.1686, 41.3874],
          zoom: 12.5,
          pitch: 60,
          bearing: -17.6
        });

        // Agregar edificios 3D
        mapManager.current.add3DBuildings();

        // Fleet assets con rutas reales
        const fleetAssets: Asset[] = await Promise.all([
          mapManager.current.createFleetAsset({
            id: 'fleet-1',
            name: 'TMB Bus L17',
            type: 'fleet',
            color: '#10b981',
            start: [2.1346, 41.3854],
            end: [2.1734, 41.3851]
          }),
          mapManager.current.createFleetAsset({
            id: 'fleet-2',
            name: 'Metro L3',
            type: 'fleet',
            color: '#10b981',
            start: [2.1218, 41.3809],
            end: [2.1540, 41.3888]
          }),
          mapManager.current.createFleetAsset({
            id: 'fleet-3',
            name: 'Barcelona Taxi',
            type: 'fleet',
            color: '#10b981',
            start: [2.1896, 41.3773],
            end: [2.1540, 41.3773]
          })
        ]);

        const allAssets: Asset[] = [
        ...fleetAssets,
        ...staticAssets
        ];

        // Agregar trails de los assets
        mapManager.current.addAssetTrails(allAssets);

        // Agregar marcadores
        mapManager.current.addAssetMarkers(allAssets);


        // Assets en movimiento
        // Assets en movimiento
const fleet = await Promise.all([
  mapManager.current!.createFleetAsset({
    id: 'bus-1',
    name: 'TMB Bus',
    type: 'fleet',
    color: '#10b981',
    start: [2.1346, 41.3854], // Les Corts
    end: [2.1734, 41.3851]    // Arc de Triomf
  }),
  // --- Nuevos Assets Añadidos ---

  // 1. Metro/Tram (Simulado como un vehículo de superficie para el mapa 3D)
  mapManager.current!.createFleetAsset({
    id: 'tram-T4',
    name: 'TRAM Tramvia',
    type: 'fleet',
    color: '#f97316',
    start: [2.2132, 41.4018], // Sant Adrià de Besòs (Final T4)
    end: [2.1965, 41.4111]    // Forum
  }),

  // 2. Taxi Eléctrico (Servicio de movilidad bajo demanda)
  mapManager.current!.createFleetAsset({
    id: 'taxi-electric-22',
    name: 'Electric Taxi',
    type: 'fleet',
    color: '#fde047',
    start: [2.1764, 41.3824], // Eixample
    end: [2.1950, 41.3891]    // Poblenou
  }),

  // 3. Vehículo de Servicios de Emergencia (Ambulancia)
  mapManager.current!.createFleetAsset({
    id: 'ambulance-05',
    name: 'Ambulance SEM',
    type: 'fleet',
    color: '#ef4444',
    start: [2.1528, 41.3934], // Hospital Clínic Area
    end: [2.1740, 41.3780]    // Gothic Quarter
  }),

  // 4. Vehículo de Recogida de Residuos (Smart Waste Management)
  mapManager.current!.createFleetAsset({
    id: 'waste-truck-3',
    name: 'Waste Management Truck',
    type: 'fleet',
    color: '#0369a1',
    start: [2.1370, 41.4180], // Horta
    end: [2.1645, 41.4022]    // Gràcia
  }),

  // 5. Vehículo de Reparto de Última Milla (Mensajería)
  mapManager.current!.createFleetAsset({
    id: 'delivery-van-A',
    name: 'Last Mile Delivery Van',
    type: 'fleet',
    color: '#65a30d',
    start: [2.1480, 41.3970], // Sants
    end: [2.1585, 41.3800]    // Raval
  }),

  // 6. Bicicleta de Alquiler (Simulación de un asset de micromovilidad)
  mapManager.current!.createFleetAsset({
    id: 'bicing-E1',
    name: 'Bicing Bike',
    type: 'fleet',
    color: '#9333ea',
    start: [2.1880, 41.3900], // Ciutadella Park
    end: [2.1785, 41.3855]    // Born
  })

]);

mapManager.current.addAnimatedAssetMarkers(fleet, {
  speed: 2.5,
  loop: true,
});



        // Crear parks con polígonos exactos
       const parks = await mapManager.current.createMultipleParkAreas(
        [
          {
            id: 'central-lake',
            name: 'Central Boating Lake',
            description: 'Main recreational lake - water quality optimal, boat rental system active',
            status: 'ok',
            color: '#10b981',
            location: {
            "type": "FeatureCollection",
            "features": [
                {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "coordinates": [
                    [
                        [
                        2.1865089846697003,
                        41.388879401764626
                        ],
                        [
                        2.186474392589986,
                        41.38884830654462
                        ],
                        [
                        2.1864491934707075,
                        41.388830976609654
                        ],
                        [
                        2.18639377474139,
                        41.38879158623564
                        ],
                        [
                        2.1863301020003405,
                        41.388737845116026
                        ],
                        [
                        2.1863046329030453,
                        41.3886852982003
                        ],
                        [
                        2.1863046329030453,
                        41.38859811799662
                        ],
                        [
                        2.1863296955138196,
                        41.38854118370199
                        ],
                        [
                        2.186402498124636,
                        41.388488170468975
                        ],
                        [
                        2.1864924307620868,
                        41.388409453771345
                        ],
                        [
                        2.1865063489086083,
                        41.388358850129265
                        ],
                        [
                        2.1865117020414004,
                        41.38824880715259
                        ],
                        [
                        2.1865309733206857,
                        41.388202219559304
                        ],
                        [
                        2.186626259090872,
                        41.388130731635385
                        ],
                        [
                        2.1867151211019404,
                        41.38809779896948
                        ],
                        [
                        2.1867943474728406,
                        41.388084143956746
                        ],
                        [
                        2.1869035513886104,
                        41.388080127776334
                        ],
                        [
                        2.186983828371382,
                        41.388095441156565
                        ],
                        [
                        2.1871254759313956,
                        41.38815029061121
                        ],
                        [
                        2.1872031536254326,
                        41.38820171193299
                        ],
                        [
                        2.187216861454459,
                        41.38823085066426
                        ],
                        [
                        2.187310531614969,
                        41.3883062684956
                        ],
                        [
                        2.1873750524224533,
                        41.38841890639151
                        ],
                        [
                        2.1873869707866334,
                        41.388524716296445
                        ],
                        [
                        2.1873829979988955,
                        41.388600720488284
                        ],
                        [
                        2.1873591612715018,
                        41.38868268569345
                        ],
                        [
                        2.1872658007564496,
                        41.388748257783305
                        ],
                        [
                        2.186973800848932,
                        41.38890771690714
                        ],
                        [
                        2.18680297097157,
                        41.38893603203803
                        ],
                        [
                        2.186737419971564,
                        41.38893305149861
                        ],
                        [
                        2.1866420730630978,
                        41.388918148798865
                        ],
                        [
                        2.1865526853366646,
                        41.38889728501374
                        ],
                        [
                        2.1865089846697003,
                        41.388879401764626
                        ]
                    ]
                    ],
                    "type": "Polygon"
                }
                }
            ]
            }
        }, 
        {
             id: 'monumental-cascade',
              name: 'Monumental Cascade',
              description: 'Iconic waterfall structure designed by Josep Fontserè - all water pumps operational',
              status: 'ok',
              color: '#10b981',
            location: {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [
          [
            [
              2.186442327215019,
              41.38995880279964
            ],
            [
              2.186410369466074,
              41.389925503395915
            ],
            [
              2.1863730854271353,
              41.389884212112634
            ],
            [
              2.1863695345655287,
              41.38964445575377
            ],
            [
              2.1861387286061245,
              41.3896497836829
            ],
            [
              2.186135177745342,
              41.38955388089954
            ],
            [
              2.186168910924266,
              41.389552548915134
            ],
            [
              2.186247029863779,
              41.389451318043996
            ],
            [
              2.1863730854271353,
              41.389382054725786
            ],
            [
              2.186472509532365,
              41.389356746956224
            ],
            [
              2.186616319399718,
              41.3893514190037
            ],
            [
              2.1867459258230895,
              41.38939137863835
            ],
            [
              2.1868471253591224,
              41.38946863386249
            ],
            [
              2.186907489994553,
              41.389537897088445
            ],
            [
              2.1869447740342878,
              41.389541893041724
            ],
            [
              2.1869412231735055,
              41.389633799895364
            ],
            [
              2.186705090922487,
              41.389640459807396
            ],
            [
              2.186701540061705,
              41.38988687606712
            ],
            [
              2.1866180948297256,
              41.38996279872646
            ],
            [
              2.186442327215019,
              41.38995880279964
            ]
          ]
        ],
        "type": "Polygon"
      }
    }
  ]
}
        },
        {
          id: 'fiveller-pond',
          name: 'Joan Fiveller Square Pond',
          description: 'Small ornamental pond - water quality sensors functioning normally',
          status: 'ok',
          color: '#10b981',
          location: {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [
          [
            [
              2.1879854303906257,
              41.38774698598618
            ],
            [
              2.1879745693395307,
              41.387728360771064
            ],
            [
              2.1879714661814376,
              41.387714391856605
            ],
            [
              2.1879714661814376,
              41.387681797710115
            ],
            [
              2.1879978430199856,
              41.38762126568088
            ],
            [
              2.1880785251140367,
              41.38756189767406
            ],
            [
              2.1881700682577048,
              41.387542108326215
            ],
            [
              2.1881902387816012,
              41.387566553990126
            ],
            [
              2.1881855840451863,
              41.38760729674286
            ],
            [
              2.1881592072066383,
              41.38767597732502
            ],
            [
              2.1880785251140367,
              41.387735345227696
            ],
            [
              2.188004049334694,
              41.38775629859202
            ],
            [
              2.1879854303906257,
              41.38774698598618
            ]
          ]
        ],
        "type": "Polygon"
      }
    }
  ]
}
        },

        {
          id: 'fountain-expo-1888',
          name: 'Universal Exhibition Memorial Fountain',
          description: 'Historic monument (1888) - water pressure irregularities detected',
          status: 'warning',
          color: '#f59e0b',
          location: {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [
          [
            [
              2.184525690290826,
              41.38918499384101
            ],
            [
              2.1843543211436156,
              41.38906054718504
            ],
            [
              2.184442202757481,
              41.388991318478475
            ],
            [
              2.184614670423514,
              41.38912153431764
            ],
            [
              2.184525690290826,
              41.38918499384101
            ]
          ]
        ],
        "type": "Polygon"
      }
    }
  ]
}
        }, 
        {
          id: 'fountain-main-left',
          name: 'Main Entrance Fountain (West)',
          description: 'Water circulation system critical - maintenance required immediately',
          status: 'critical',
          color: '#ef4444',
          location: {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [
          [
            [
              2.1837117292129165,
              41.388623542898046
            ],
            [
              2.18367379732328,
              41.388608712613404
            ],
            [
              2.183646550472986,
              41.38858666758992
            ],
            [
              2.183631591418049,
              41.388556205362875
            ],
            [
              2.1836096870879658,
              41.38857263893419
            ],
            [
              2.183557330395672,
              41.38853536277864
            ],
            [
              2.1836123583475455,
              41.38849167349326
            ],
            [
              2.183634796929965,
              41.38851051199589
            ],
            [
              2.183644947717056,
              41.388486863661655
            ],
            [
              2.183666317795769,
              41.38850690462331
            ],
            [
              2.1836892906304968,
              41.38851091281532
            ],
            [
              2.18371226346423,
              41.38850690462331
            ],
            [
              2.1837272225191953,
              41.38849447922772
            ],
            [
              2.183735770550328,
              41.38847644235889
            ],
            [
              2.183732565039378,
              41.38846121122168
            ],
            [
              2.183706920945042,
              41.388445579261145
            ],
            [
              2.1837854559830134,
              41.38845119073457
            ],
            [
              2.183839415431237,
              41.38847964891434
            ],
            [
              2.1838607855089833,
              41.388509710357795
            ],
            [
              2.1837117292129165,
              41.388623542898046
            ]
          ]
        ],
        "type": "Polygon"
      }
    }
  ]
}
        },

        {
          id: 'zoo-bcn',
          name: 'Barcelona Zoo',
          description: 'Wildlife facility monitoring - visitor flow and animal welfare systems operational',
          status: 'ok',
          color: '#c4c4c4',
          location: {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [
          [
            [
              2.186230679435596,
              41.38562934044302
            ],
            [
              2.186386682836485,
              41.38547309730083
            ],
            [
              2.186317644373929,
              41.3854393159296
            ],
            [
              2.186407694542538,
              41.38533346751959
            ],
            [
              2.1867258718048674,
              41.38512177018271
            ],
            [
              2.187482299250007,
              41.38489205272933
            ],
            [
              2.1881666805297755,
              41.38479295977177
            ],
            [
              2.188349782539831,
              41.384806472456745
            ],
            [
              2.189067182215865,
              41.38486052316824
            ],
            [
              2.1893853594781945,
              41.384914573834806
            ],
            [
              2.190099757527207,
              41.38517581818749
            ],
            [
              2.1906310535215994,
              41.3854167925613
            ],
            [
              2.1910813045621182,
              41.38567353129406
            ],
            [
              2.1913574584123694,
              41.38590549552029
            ],
            [
              2.1919938135517896,
              41.38655859462287
            ],
            [
              2.19243806105041,
              41.387164394119225
            ],
            [
              2.1919818089416196,
              41.387513458968584
            ],
            [
              2.1914084895351493,
              41.387914317320764
            ],
            [
              2.190408281610388,
              41.38863707700625
            ],
            [
              2.189123077626249,
              41.3896210064575
            ],
            [
              2.188343193072427,
              41.39021267130235
            ],
            [
              2.1869937304560096,
              41.39120534106402
            ],
            [
              2.1865059368004154,
              41.390872261078016
            ],
            [
              2.187133933726358,
              41.390394551765155
            ],
            [
              2.1873383978408185,
              41.39019294861646
            ],
            [
              2.187431868162406,
              41.39000010966461
            ],
            [
              2.187472760985571,
              41.389778783092424
            ],
            [
              2.1873237942728565,
              41.38923532455024
            ],
            [
              2.1873079790680947,
              41.389094467120344
            ],
            [
              2.1873570724178535,
              41.38896555624092
            ],
            [
              2.187452804448327,
              41.38882927874778
            ],
            [
              2.1876246311690863,
              41.388702208935825
            ],
            [
              2.187848005907483,
              41.38862486197192
            ],
            [
              2.1879363739352016,
              41.388639594734
            ],
            [
              2.1880037069169873,
              41.38871089421721
            ],
            [
              2.188327731695722,
              41.388810737464695
            ],
            [
              2.1884665994580246,
              41.38866748406207
            ],
            [
              2.1889005612161156,
              41.38885414752471
            ],
            [
              2.1898566901307106,
              41.38772059459109
            ],
            [
              2.1892226647713358,
              41.387378248746586
            ],
            [
              2.1893064926099726,
              41.387294373475754
            ],
            [
              2.189268066830607,
              41.38716824544218
            ],
            [
              2.1883698642382967,
              41.38674661566827
            ],
            [
              2.1876926098773595,
              41.38651597942115
            ],
            [
              2.1872363037477953,
              41.38624930524085
            ],
            [
              2.186669996838475,
              41.38579859926023
            ],
            [
              2.186515642074653,
              41.38584314098071
            ],
            [
              2.186230679435596,
              41.38562934044302
            ]
          ]
        ],
        "type": "Polygon"
      }
    }
  ]
}
        }

      ]);

        // Añadir al mapa
        mapManager.current.addParkAreas(parks);



        // NUEVO: Añadir heatmap de tráfico
          mapManager.current.addHeatmap(
            getHeatmapByCategory('traffic'),
            {
              id: 'traffic-heatmap',
              radius: 35,
              maxIntensity: 1.2,
              opacity: 0.6,
              colorScheme: 'traffic',
              visible: false
            }
          );

          // NUEVO: Añadir heatmap de contaminación (opcional, múltiples heatmaps)
          mapManager.current.addHeatmap(
            getHeatmapByCategory('pollution'),
            {
              id: 'pollution-heatmap',
              radius: 40,
              maxIntensity: 1,
              opacity: 0.5,
              colorScheme: 'pollution',
              visible: false
            }
          );

          mapManager.current.addHeatmap(
            getHeatmapByCategory('temperature'),
            {
              id: 'temperature-heatmap',
              radius: 40,
              maxIntensity: 1,
              opacity: 0.5,
              colorScheme: 'temperature',
              visible: false
            }
          );

          mapManager.current.addHeatmap(
            getHeatmapByCategory('crowd'),
            {
              id: 'crowd-heatmap',
              radius: 40,          // MÁS grande
              maxIntensity: 1,   // Hace que los picos destaquen
              opacity: 0.6,       // Un poco más visible
              colorScheme: 'crowd',
              visible: true
            }
          );






      } catch (error) {
        console.error('Error initializing map:', error);
        if (mapContainer.current) {
          renderMapboxError(mapContainer.current);
        }
      }
    };

    return () => {
      mapManager.current?.destroy();
      mapManager.current = null;
    };
  }, []);


  // Función para manejar el toggle de heatmaps
  const handleHeatmapToggle = (heatmapId: string, visible: boolean) => {
    if (mapManager.current) {
      mapManager.current.toggleHeatmap(heatmapId, visible);
    }
  };

  // Calcular si estamos cerca de un snap point
  const nearSnapPoint = [320, 420, 520].some(snap => Math.abs(sidebarWidth - snap) < 15);

  // Manejar el resize del sidebar
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      
      // Snap points
      const snapPoints = [320, 420, 520];
      const snapThreshold = 15;
      
      let finalWidth = newWidth;
      
      // Buscar snap point más cercano
      for (const snapPoint of snapPoints) {
        if (Math.abs(newWidth - snapPoint) < snapThreshold) {
          finalWidth = snapPoint;
          break;
        }
      }
      
      // Limitar el ancho entre 280px y 650px
      if (finalWidth >= 280 && finalWidth <= 650) {
        setSidebarWidth(finalWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

return (
    <div className="fixed inset-0 bg-black text-white font-sans antialiased overflow-hidden">
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
        }
        
        @keyframes resize-pulse {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.2); }
        }
        
        .resize-active {
          animation: resize-pulse 0.6s ease-in-out infinite;
        }
      `}</style>

      {/* Map Container - Full screen background */}
      <div className="fixed inset-0 z-0">
        <div ref={mapContainer} className="w-full h-full relative">
          {/* Map Legend - Floating - Responsive */}
          <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 z-10">
            <div className="bg-black/60 backdrop-blur-2xl px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl border border-white/10 flex items-center gap-3 sm:gap-4 md:gap-6">
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50"></div>
                <span className="text-[10px] sm:text-xs text-white/70 font-light">Fleet</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400 shadow-lg shadow-blue-500/50"></div>
                <span className="text-[10px] sm:text-xs text-white/70 font-light">Industrial</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 shadow-lg shadow-amber-500/50"></div>
                <span className="text-[10px] sm:text-xs text-white/70 font-light">City</span>
              </div>
            </div>
          </div>

          {/* Live Indicator - Top Right - Responsive */}
          <div className="absolute top-4 sm:top-6 md:top-8 right-4 sm:right-6 md:right-8 z-10">
            <div className="bg-black/60 backdrop-blur-2xl px-3.5 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl border border-white/10 flex items-center gap-2 sm:gap-2.5 md:gap-3">
              <div className="relative">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <div className="absolute inset-0 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-ping"></div>
              </div>
              <span className="text-[10px] sm:text-xs text-white/70 font-light uppercase tracking-wider">Live</span>
            </div>
          </div>

          {/* Heatmap Controls */}
          <HeatmapControls onToggle={handleHeatmapToggle} />
        </div>
      </div>

      {/* Sidebar - Resizable - Floating style */}
      <div 
        className={`fixed left-4 sm:left-6 bottom-4 sm:bottom-6 rounded-2xl sm:rounded-3xl z-20 transition-all duration-700 ${
          sidebarCollapsed 
            ? 'w-0 opacity-0 invisible pointer-events-none border-0' 
            : 'opacity-100 visible pointer-events-auto border border-white/[0.08]'
        } ${
          isMobile
            ? 'bg-black/80 backdrop-blur-2xl top-20' // Mobile: empieza después del header
            : 'bg-black/40 backdrop-blur-3xl top-20 sm:top-24' // Desktop: flotante con espacio superior
        }`}
        style={{ 
          boxShadow: sidebarCollapsed ? 'none' : '0 20px 60px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          width: sidebarCollapsed ? '0' : isMobile ? 'calc(100% - 2rem)' : `${sidebarWidth}px`,
          transition: isResizing ? 'none' : 'all 700ms ease-out',
          willChange: isResizing ? 'width' : 'auto' // Optimización de rendimiento
        }}
      >
        {/* Contenedor de scroll - Con margen derecho para separar del resize handle */}
        <div 
          className={`h-full overflow-y-auto overflow-x-hidden transition-opacity duration-500 custom-scrollbar ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}
          style={{
            marginRight: isMobile ? '0' : '32px' // Margen para separar del resize handle en desktop
          }}
        >
          <div className="p-6 sm:p-8 md:p-10">
            {/* Header - Responsive */}
            <div className="mb-8 sm:mb-12 md:mb-16">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="w-0.5 h-4 sm:h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-white/25 font-light">
                  {time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight tracking-tight leading-none mb-2 sm:mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                Overview
              </h1>
              <p className="text-xs sm:text-sm text-white/30 font-light leading-relaxed">
                Real-time digital twin
              </p>
            </div>

            {/* Hero Metric - Responsive */}
            <div className={`mb-6 sm:mb-8 md:mb-12 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border hover:border-white/[0.08] transition-all duration-700 group relative overflow-hidden ${
              isMobile
                ? 'bg-black/60 backdrop-blur-xl border-white/[0.08]' // Mobile: más opaco para legibilidad
                : 'bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-xl border-white/[0.05]' // Desktop
            }`}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative">
                <div className="flex items-center gap-2 sm:gap-2.5 mb-4 sm:mb-6 md:mb-8">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-emerald-500/10 flex items-center justify-center backdrop-blur-xl border border-emerald-500/20">
                    <Activity className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-emerald-400" />
                  </div>
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-white/25 font-light">Live</span>
                </div>
                <div className="mb-4 sm:mb-6">
                  <div className="text-4xl sm:text-5xl md:text-6xl font-extralight tracking-tighter mb-2 sm:mb-3 tabular-nums">{activeAssets.toLocaleString()}</div>
                  <div className="text-xs sm:text-sm text-white/40 font-light">Assets streaming</div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-emerald-400 font-light">All systems operational</span>
                </div>
              </div>
            </div>

            {/* Secondary Metrics - Responsive */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-12">
              <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border hover:border-white/[0.08] transition-all duration-700 ${
                isMobile
                  ? 'bg-black/60 backdrop-blur-xl border-white/[0.08]' // Mobile
                  : 'bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl border-white/[0.05]' // Desktop
              }`}>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 flex items-center justify-center backdrop-blur-xl border border-blue-500/20 mb-3 sm:mb-4 md:mb-6">
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extralight tracking-tighter mb-1 sm:mb-2 tabular-nums">{messageRate.toLocaleString()}</div>
                <div className="text-[9px] sm:text-[10px] text-white/40 font-light uppercase tracking-wider">msg/hour</div>
              </div>
              <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border hover:border-white/[0.08] transition-all duration-700 ${
                isMobile
                  ? 'bg-black/60 backdrop-blur-xl border-white/[0.08]' // Mobile
                  : 'bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl border-white/[0.05]' // Desktop
              }`}>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/10 flex items-center justify-center backdrop-blur-xl border border-purple-500/20 mb-3 sm:mb-4 md:mb-6">
                  <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extralight tracking-tighter mb-1 sm:mb-2 tabular-nums">3</div>
                <div className="text-[9px] sm:text-[10px] text-white/40 font-light uppercase tracking-wider">Datasets</div>
              </div>
            </div>

            {/* Datasets - Responsive */}
            <div className="mb-6 sm:mb-8 md:mb-12">
              <h2 className="text-base sm:text-lg font-light tracking-tight mb-3 sm:mb-4 text-white/60">Datasets</h2>
              <div className="space-y-2 sm:space-y-3">
                {datasets.map((dataset, i) => (
                  <div
                    key={i}
                    className={`rounded-lg sm:rounded-xl p-4 sm:p-5 border hover:border-white/[0.08] transition-all duration-700 cursor-pointer group relative overflow-hidden ${
                      isMobile
                        ? 'bg-black/60 backdrop-blur-xl border-white/[0.08]' // Mobile
                        : 'bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl border-white/[0.05]' // Desktop
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${dataset.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700`}></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${dataset.color} shadow-lg flex-shrink-0`}></div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-light mb-0.5 sm:mb-1 truncate">{dataset.name}</div>
                          <div className="text-[9px] sm:text-[10px] text-white/30 font-light">{dataset.assets} assets</div>
                        </div>
                      </div>
                      <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[8px] sm:text-[9px] font-light uppercase tracking-wider border flex-shrink-0 ${
                        dataset.status === 'active' 
                          ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/5 text-amber-400 border-amber-500/20'
                      }`}>
                        {dataset.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts - Responsive */}
            <div>
              <h2 className="text-base sm:text-lg font-light tracking-tight mb-3 sm:mb-4 text-white/60">Alerts</h2>
              <div className="space-y-2 sm:space-y-3">
                {alerts.map((alert, i) => (
                  <div
                    key={i}
                    className={`rounded-lg sm:rounded-xl p-3 sm:p-4 border hover:border-white/[0.08] transition-all duration-700 cursor-pointer group ${
                      isMobile
                        ? 'bg-black/60 backdrop-blur-xl border-white/[0.08]' // Mobile
                        : 'bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl border-white/[0.05]' // Desktop
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-xl border ${
                        alert.type === 'critical'
                          ? 'bg-red-500/10 border-red-500/20'
                          : 'bg-amber-500/10 border-amber-500/20'
                      }`}>
                        <Bell className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                          alert.type === 'critical' ? 'text-red-400' : 'text-amber-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] sm:text-xs font-light mb-1 sm:mb-1.5 leading-relaxed">{alert.message}</div>
                        <div className="flex items-center gap-2 text-[8px] sm:text-[9px] text-white/30 font-light">
                          <span className="truncate">{alert.dataset}</span>
                          <span>·</span>
                          <span>{alert.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Resize Handle - Posicionado fuera del contenedor de scroll */}
        {!sidebarCollapsed && (
          <>
            {/* Snap point indicators - visible durante resize */}
            {isResizing && (
              <>
                <div className="hidden sm:block absolute top-0 bottom-0 left-0 right-0 pointer-events-none z-30">
                  {[320, 420, 520].map((snapPoint) => (
                    <div
                      key={snapPoint}
                      className="absolute top-0 bottom-0 w-0.5 bg-blue-400/20 transition-all duration-200"
                      style={{
                        left: `${snapPoint}px`,
                        opacity: Math.abs(sidebarWidth - snapPoint) < 15 ? 1 : 0.3,
                        transform: Math.abs(sidebarWidth - snapPoint) < 15 ? 'scaleY(1)' : 'scaleY(0.5)',
                      }}
                    >
                      {/* Snap point dot */}
                      <div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50 transition-all duration-200"
                        style={{
                          transform: Math.abs(sidebarWidth - snapPoint) < 15 
                            ? 'translate(-50%, -50%) scale(1.5)' 
                            : 'translate(-50%, -50%) scale(1)',
                        }}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Width indicator tooltip */}
                <div 
                  className="hidden sm:block absolute top-8 pointer-events-none z-30 transition-all duration-200"
                  style={{ left: `${sidebarWidth - 50}px` }}
                >
                  <div className={`bg-black/90 backdrop-blur-xl px-4 py-2 rounded-lg border transition-all duration-200 ${
                    nearSnapPoint 
                      ? 'border-blue-400/40 shadow-lg shadow-blue-400/20 scale-105' 
                      : 'border-white/10'
                  }`}>
                    <div className="text-xs font-light text-white/90 tabular-nums">
                      {sidebarWidth}px
                    </div>
                  </div>
                </div>
              </>
            )}
            
            <div
              onMouseDown={handleMouseDown}
              className="hidden sm:block absolute top-0 bottom-0 cursor-ew-resize group z-40 pointer-events-auto"
              style={{ 
                right: '0',
                width: '32px', // Ancho aumentado para mejor área de agarre
                transform: 'translateX(0)',
              }}
            >
              {/* Zona de interacción invisible expandida */}
              <div className="absolute inset-0 pointer-events-auto" />
              
              {/* Visual feedback bar */}
              <div 
                className={`absolute inset-y-0 left-1/2 -translate-x-1/2 rounded-full transition-all duration-300 pointer-events-none ${
                  isResizing 
                    ? 'w-1 bg-blue-500 shadow-lg shadow-blue-500/50' 
                    : 'w-0.5 bg-transparent group-hover:bg-blue-400/40 group-hover:w-0.5'
                }`}
              />
              
              {/* Handle indicator */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                isResizing 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'
              }`}>
                <div className="flex flex-col gap-1 items-center">
                  <div className={`w-1 h-2 rounded-full transition-all duration-200 ${
                    isResizing ? 'bg-blue-400' : 'bg-white/40'
                  }`}></div>
                  <div className={`w-1 h-2 rounded-full transition-all duration-200 ${
                    isResizing ? 'bg-blue-400' : 'bg-white/40'
                  }`}></div>
                  <div className={`w-1 h-2 rounded-full transition-all duration-200 ${
                    isResizing ? 'bg-blue-400' : 'bg-white/40'
                  }`}></div>
                </div>
              </div>

              {/* Glow effect cuando está activo */}
              {isResizing && (
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-blue-500/10 blur-xl animate-pulse" />
              )}
            </div>
          </>
        )}
      </div>

      {/* Sidebar Toggle Button - Responsive */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className={`fixed top-1/2 -translate-y-1/2 z-30 w-7 h-14 sm:w-8 sm:h-16 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-r-xl flex items-center justify-center hover:bg-white/5 transition-all duration-300 group ${
          sidebarCollapsed ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        style={{ left: '0' }}
        aria-label="Open sidebar"
      >
        <div className="w-1 h-6 sm:h-8 bg-white/30 rounded-full transition-transform duration-300"></div>
      </button>
      
      {/* Mobile: Show toggle on right when sidebar is open */}
      {!sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(true)}
          className="sm:hidden fixed top-1/2 -translate-y-1/2 right-0 z-30 w-7 h-14 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-l-xl flex items-center justify-center hover:bg-white/5 transition-all duration-300"
          aria-label="Close sidebar"
        >
          <div className="w-1 h-6 bg-white/30 rounded-full rotate-180"></div>
        </button>
      )}
    </div>
  );
}