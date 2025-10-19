import { useState, useEffect, useMemo, useRef } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, Grid3x3, Info, X } from 'lucide-react';
import * as THREE from 'three';

interface NormalizedPoint {
  value: number;
  x: number | null;
  y: number | null;
  z: number | null;
  sensorId: string | null;
  sensorType: string | null;
  timestamp: Date | string;
  unit: string | null;
}

interface LivePreviewCanvasProps {
  normalizedPoints: NormalizedPoint[];
}

interface SelectedPoint {
  point: NormalizedPoint;
  position: { x: number; y: number };
}

export default function LivePreviewCanvas({ normalizedPoints }: LivePreviewCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pointMeshesRef = useRef<THREE.Mesh[]>([]);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Control de cámara manual
  const isDraggingRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const cameraRotationRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 4, radius: 15 });

  const ranges = useMemo(() => {
    if (normalizedPoints.length === 0) return null;
    
    const values = normalizedPoints.map(p => p.value).filter(v => !isNaN(v));
    const xCoords = normalizedPoints.map(p => p.x).filter((v): v is number => v !== null && !isNaN(v));
    const yCoords = normalizedPoints.map(p => p.y).filter((v): v is number => v !== null && !isNaN(v));
    const zCoords = normalizedPoints.map(p => p.z).filter((v): v is number => v !== null && !isNaN(v));
    
    return {
      value: { 
        min: Math.min(...values), 
        max: Math.max(...values) 
      },
      x: xCoords.length > 0 ? {
        min: Math.min(...xCoords),
        max: Math.max(...xCoords)
      } : null,
      y: yCoords.length > 0 ? {
        min: Math.min(...yCoords),
        max: Math.max(...yCoords)
      } : null,
      z: zCoords.length > 0 ? {
        min: Math.min(...zCoords),
        max: Math.max(...zCoords)
      } : null,
    };
  }, [normalizedPoints]);

  // Función para actualizar posición de cámara
  const updateCameraPosition = (camera: THREE.PerspectiveCamera) => {
    const { theta, phi, radius } = cameraRotationRef.current;
    camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(0, 0, 0);
  };

  // Inicializar escena Three.js
  useEffect(() => {
    if (!containerRef.current) return;

    // Limpiar cualquier canvas previo
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.02);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    updateCameraPosition(camera);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Iluminación mejorada
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x8b5cf6, 1.2);
    mainLight.position.set(10, 15, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x06b6d4, 0.8);
    fillLight.position.set(-10, 10, -10);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xec4899, 0.6, 30);
    rimLight.position.set(0, 10, 0);
    scene.add(rimLight);

    // Grid mejorado
    const grid = new THREE.GridHelper(30, 30, 0x8b5cf6, 0x27272a);
    (grid.material as THREE.Material).opacity = 0.2;
    (grid.material as THREE.Material).transparent = true;
    scene.add(grid);
    gridRef.current = grid;

    const axesHelper = new THREE.AxesHelper(8);
    (axesHelper.material as THREE.Material).opacity = 0.6;
    (axesHelper.material as THREE.Material).transparent = true;
    scene.add(axesHelper);

    // Partículas de fondo para ambiente
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const positions = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 50;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x3f3f46,
      size: 0.05,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Limpiar geometrías y materiales
      pointMeshesRef.current.forEach(mesh => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      pointMeshesRef.current = [];
      
      // Limpiar scene
      if (sceneRef.current) {
        sceneRef.current.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            if (obj.material instanceof THREE.Material) {
              obj.material.dispose();
            }
          }
        });
      }
      
      // Limpiar renderer
      if (renderer) {
        renderer.dispose();
        if (containerRef.current && renderer.domElement && containerRef.current.contains(renderer.domElement)) {
          containerRef.current.removeChild(renderer.domElement);
        }
      }
      
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
    };
  }, []);

  // Controles de mouse mejorados
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMouseRef.current = { x: e.clientX, y: e.clientY };
      setIsAutoRotating(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDraggingRef.current) {
        const deltaX = e.clientX - previousMouseRef.current.x;
        const deltaY = e.clientY - previousMouseRef.current.y;

        cameraRotationRef.current.theta -= deltaX * 0.005;
        cameraRotationRef.current.phi = Math.max(
          0.1,
          Math.min(Math.PI - 0.1, cameraRotationRef.current.phi - deltaY * 0.005)
        );

        if (cameraRef.current) {
          updateCameraPosition(cameraRef.current);
        }

        previousMouseRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraRotationRef.current.radius = Math.max(
        5,
        Math.min(30, cameraRotationRef.current.radius + e.deltaY * 0.01)
      );
      if (cameraRef.current) {
        updateCameraPosition(cameraRef.current);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!raycasterRef.current || !cameraRef.current || !sceneRef.current) return;
      
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(pointMeshesRef.current);

      if (intersects.length > 0) {
        const index = pointMeshesRef.current.indexOf(intersects[0].object as THREE.Mesh);
        if (index !== -1) {
          setSelectedPoint({
            point: normalizedPoints[index],
            position: { x: e.clientX, y: e.clientY }
          });
        }
      } else {
        setSelectedPoint(null);
      }
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('click', handleClick);
    };
  }, [normalizedPoints]);

  // Actualizar puntos con meshes interactivos
// Actualizar puntos con meshes interactivos
  useEffect(() => {
    if (!sceneRef.current || !ranges || normalizedPoints.length === 0) return;

    // Limpiar meshes existentes
    pointMeshesRef.current.forEach(mesh => {
      sceneRef.current?.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    pointMeshesRef.current = [];

    // Limpiar cualquier objeto adicional (glows, tubes) que no queremos duplicar
    const objectsToRemove: THREE.Object3D[] = [];
    sceneRef.current.traverse((obj) => {
      if (obj instanceof THREE.Mesh && !pointMeshesRef.current.includes(obj)) {
        if (obj.geometry instanceof THREE.RingGeometry || obj.geometry instanceof THREE.TubeGeometry) {
          objectsToRemove.push(obj);
        }
      }
    });
    objectsToRemove.forEach(obj => sceneRef.current?.remove(obj));

    normalizedPoints.forEach((point, index) => {
      // Validar que el punto tenga valores válidos
      if (isNaN(point.value) || !isFinite(point.value)) {
        console.warn(`Skipping point ${index} due to invalid value:`, point.value);
        return;
      }

      let x = 0, y = 0, z = 0;

      if (point.x !== null && ranges.x && !isNaN(point.x) && isFinite(point.x)) {
        x = ((point.x - ranges.x.min) / (ranges.x.max - ranges.x.min) - 0.5) * 12;
      } else {
        x = (Math.random() - 0.5) * 10;
      }

      if (point.y !== null && ranges.y && !isNaN(point.y) && isFinite(point.y)) {
        y = ((point.y - ranges.y.min) / (ranges.y.max - ranges.y.min) - 0.5) * 12;
      } else {
        y = (Math.random() - 0.5) * 10;
      }

      if (point.z !== null && ranges.z && !isNaN(point.z) && isFinite(point.z)) {
        z = ((point.z - ranges.z.min) / (ranges.z.max - ranges.z.min) - 0.5) * 12;
      } else {
        z = (Math.random() - 0.5) * 10;
      }

      // Validar coordenadas finales
      if (isNaN(x) || isNaN(y) || isNaN(z) || !isFinite(x) || !isFinite(y) || !isFinite(z)) {
        console.warn(`Skipping point ${index} due to invalid coordinates:`, { x, y, z });
        return;
      }

      const valueNormalized = (point.value - ranges.value.min) / (ranges.value.max - ranges.value.min);
      
      // Validar valueNormalized
      if (isNaN(valueNormalized) || !isFinite(valueNormalized)) {
        console.warn(`Skipping point ${index} due to invalid normalized value:`, valueNormalized);
        return;
      }
      
      // Geometría de esfera más prominente
      const geometry = new THREE.SphereGeometry(0.2 + valueNormalized * 0.25, 32, 32);
      
      // Material con emisión para efecto glow
      const color = new THREE.Color();
      if (valueNormalized < 0.5) {
        color.setHSL(0.75 - valueNormalized * 0.3, 1, 0.6);
      } else {
        color.setHSL(0.55 - (valueNormalized - 0.5) * 0.65, 1, 0.6);
      }

      const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.6,
        metalness: 0.5,
        roughness: 0.3,
        transparent: true,
        opacity: 0.95
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      if(sceneRef.current !== null){
          sceneRef.current.add(mesh);
      }

      pointMeshesRef.current.push(mesh);
    });

    // Líneas de conexión simplificadas
    if (pointMeshesRef.current.length > 1) {
      const points: THREE.Vector3[] = [];
      pointMeshesRef.current.forEach(mesh => {
        const pos = mesh.position.clone();
        // Validar que la posición sea válida antes de añadirla
        if (!isNaN(pos.x) && !isNaN(pos.y) && !isNaN(pos.z) && 
            isFinite(pos.x) && isFinite(pos.y) && isFinite(pos.z)) {
          points.push(pos);
        }
      });

      // Solo crear la curva si tenemos suficientes puntos válidos
      if (points.length > 1) {
        try {
          const curve = new THREE.CatmullRomCurve3(points, false);
          const tubeGeometry = new THREE.TubeGeometry(curve, points.length * 2, 0.015, 8, false);
          const tubeMaterial = new THREE.MeshBasicMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending
          });
          const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
          sceneRef.current.add(tube);
        } catch (error) {
          console.warn('Error creating tube geometry:', error);
        }
      }
    }

  }, [normalizedPoints, ranges]);

  // Detección de hover
  useEffect(() => {
    if (!raycasterRef.current || !cameraRef.current || pointMeshesRef.current.length === 0) return;

    let hoverCheckInterval: NodeJS.Timeout | null = null;

    const checkHover = () => {
      if (!cameraRef.current || pointMeshesRef.current.length === 0) return;
      
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(pointMeshesRef.current);

      if (intersects.length > 0) {
        const index = pointMeshesRef.current.indexOf(intersects[0].object as THREE.Mesh);
        setHoveredIndex(index);
        
        // Efecto de hover
        pointMeshesRef.current.forEach((mesh, i) => {
          const scale = i === index ? 1.5 : 1;
          mesh.scale.setScalar(scale);
          (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = i === index ? 0.8 : 0.4;
        });
      } else {
        setHoveredIndex(null);
        pointMeshesRef.current.forEach((mesh) => {
          mesh.scale.setScalar(1);
          (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4;
        });
      }
    };

    hoverCheckInterval = setInterval(checkHover, 50);
    
    return () => {
      if (hoverCheckInterval) {
        clearInterval(hoverCheckInterval);
      }
    };
  }, [normalizedPoints.length]);

  // Animation loop
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    let animationFrameId: number | null = null;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isAutoRotating && !isDraggingRef.current) {
        cameraRotationRef.current.theta += 0.003;
        updateCameraPosition(cameraRef.current!);
      }

      // Animación sutil de puntos
      pointMeshesRef.current.forEach((mesh, i) => {
        const time = Date.now() * 0.001;
        mesh.position.y += Math.sin(time + i) * 0.001;
        mesh.rotation.y += 0.01;
      });

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isAutoRotating]);

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.visible = showGrid;
    }
  }, [showGrid]);

  const handleReset = () => {
    cameraRotationRef.current = { theta: Math.PI / 4, phi: Math.PI / 4, radius: 15 };
    if (cameraRef.current) {
      updateCameraPosition(cameraRef.current);
    }
    setSelectedPoint(null);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // Usar requestAnimationFrame para asegurar que el DOM se actualice primero
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cameraRef.current && rendererRef.current && containerRef.current) {
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;
          
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(width, height);
        }
      });
    });
  };

  if (normalizedPoints.length === 0) {
    return (
      <div className={`relative w-full bg-gradient-to-br from-[#0a0a0a] via-[#18181b] to-[#0a0a0a] rounded-xl border border-zinc-800/50 overflow-hidden ${
        isFullscreen ? 'h-screen' : 'h-[500px]'
      }`}>
        {/* Fondo con patrón sutil */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(161, 161, 170) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Contenido centrado */}
        <div className="relative h-full flex flex-col items-center justify-center px-6">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/30 to-cyan-500/30 blur-3xl animate-pulse" />
            <div className="relative z-10 p-6 bg-zinc-900/80 rounded-3xl border border-zinc-700/50 backdrop-blur-sm">
              <Grid3x3 className="w-20 h-20 text-zinc-500" strokeWidth={1.5} />
            </div>
          </div>
          
          <div className="text-center space-y-4 max-w-lg">
            <h3 className="text-zinc-200 text-xl font-semibold tracking-tight">
              Configura los campos para visualizar datos
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Selecciona los campos de <span className="text-violet-400 font-medium">valor</span>, coordenadas <span className="text-cyan-400 font-medium">X</span>, <span className="text-cyan-400 font-medium">Y</span>, <span className="text-pink-400 font-medium">Z</span> en el panel de configuración.
            </p>
            <p className="text-zinc-500 text-xs">
              La vista 3D interactiva se generará automáticamente con tus datos
            </p>
          </div>
          
          <div className="mt-10 flex items-center gap-3 px-4 py-2 bg-zinc-900/50 rounded-full border border-zinc-800/50">
            <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
            <span className="text-xs text-zinc-500 font-medium">Esperando configuración</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      <div 
        ref={containerRef}
        className={`bg-gradient-to-br from-[#0a0a0a] via-[#18181b] to-[#0a0a0a] ${!isFullscreen && 'rounded-xl border border-zinc-800/50'} overflow-hidden backdrop-blur shadow-2xl cursor-grab active:cursor-grabbing ${
          isFullscreen ? 'w-full h-full' : 'w-full h-[500px]'
        }`}
      />
      
      {/* Info Panel */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 p-4 min-w-[220px] shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Puntos</span>
            <span className="text-sm font-semibold text-white tabular-nums">{normalizedPoints.length}</span>
          </div>
          {ranges && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Valor</span>
                <span className="text-xs font-mono text-zinc-300 tabular-nums">
                  {ranges.value.min.toFixed(1)} → {ranges.value.max.toFixed(1)}
                </span>
              </div>
              {ranges.x && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-violet-400 uppercase tracking-wider">X</span>
                  <span className="text-xs font-mono text-zinc-300 tabular-nums">
                    {ranges.x.min.toFixed(1)} → {ranges.x.max.toFixed(1)}
                  </span>
                </div>
              )}
              {ranges.y && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Y</span>
                  <span className="text-xs font-mono text-zinc-300 tabular-nums">
                    {ranges.y.min.toFixed(1)} → {ranges.y.max.toFixed(1)}
                  </span>
                </div>
              )}
              {ranges.z && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-pink-400 uppercase tracking-wider">Z</span>
                  <span className="text-xs font-mono text-zinc-300 tabular-nums">
                    {ranges.z.min.toFixed(1)} → {ranges.z.max.toFixed(1)}
                  </span>
                </div>
              )}
            </>
          )}
          <div className="pt-2 border-t border-white/10 text-xs text-zinc-500">
            🖱️ Arrastra para rotar<br/>
            🔍 Scroll para zoom
          </div>
        </div>
      </div>

      {/* Selected Point Info */}
      {selectedPoint && (
        <div 
          className="fixed bg-black/90 backdrop-blur-xl rounded-lg border border-white/20 p-4 shadow-2xl z-50 min-w-[250px]"
          style={{
            left: `${Math.min(selectedPoint.position.x + 10, window.innerWidth - 270)}px`,
            top: `${Math.min(selectedPoint.position.y + 10, window.innerHeight - 200)}px`
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-white">Detalles del Punto</h3>
            </div>
            <button
              onClick={() => setSelectedPoint(null)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2 text-xs">
            {selectedPoint.point.sensorId && (
              <div className="flex justify-between">
                <span className="text-zinc-400">Sensor ID:</span>
                <span className="text-white font-mono">{selectedPoint.point.sensorId}</span>
              </div>
            )}
            {selectedPoint.point.sensorType && (
              <div className="flex justify-between">
                <span className="text-zinc-400">Tipo:</span>
                <span className="text-cyan-400 font-medium">{selectedPoint.point.sensorType}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-400">Valor:</span>
              <span className="text-violet-400 font-bold">
                {selectedPoint.point.value.toFixed(2)} {selectedPoint.point.unit || ''}
              </span>
            </div>
            {selectedPoint.point.x !== null && (
              <div className="flex justify-between">
                <span className="text-zinc-400">X:</span>
                <span className="text-white font-mono">{selectedPoint.point.x.toFixed(2)}</span>
              </div>
            )}
            {selectedPoint.point.y !== null && (
              <div className="flex justify-between">
                <span className="text-zinc-400">Y:</span>
                <span className="text-white font-mono">{selectedPoint.point.y.toFixed(2)}</span>
              </div>
            )}
            {selectedPoint.point.z !== null && (
              <div className="flex justify-between">
                <span className="text-zinc-400">Z:</span>
                <span className="text-white font-mono">{selectedPoint.point.z.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-white/10">
              <span className="text-zinc-400">Timestamp:</span>
              <span className="text-zinc-300 font-mono text-xs">
                {new Date(selectedPoint.point.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`group relative p-3 backdrop-blur-xl rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg ${
            showGrid 
              ? 'bg-white/10 border-white/20 text-white' 
              : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white'
          }`}
        >
          <Grid3x3 className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className={`group relative p-3 backdrop-blur-xl rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg ${
            isAutoRotating 
              ? 'bg-violet-500/20 border-violet-500/50 text-violet-300' 
              : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white'
          }`}
        >
          {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <button
          onClick={handleReset}
          className="group relative p-3 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={toggleFullscreen}
          className="group relative p-3 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Color Legend */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 p-3 shadow-2xl">
        <p className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Gradiente</p>
        <div className="flex items-center gap-2">
          <div className="w-32 h-2 rounded-full bg-gradient-to-r from-violet-500 via-cyan-400 to-pink-500" />
          <span className="text-xs text-zinc-500">Bajo → Alto</span>
        </div>
      </div>
    </div>
  );
}