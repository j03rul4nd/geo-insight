import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import ZoomControls from './components/ZoomControls';
import ViewControls from './components/ViewControls';
import ViewInfo from './components/ViewInfo';
import SelectedPointInfo from './components/SelectedPointInfo';
import HoveredPointInfo from './components/HoveredPointInfo';

import { SceneManager } from './core/SceneManager';
import { CameraManager, ViewMode } from './core/CameraManager';
import { LightingManager } from './core/LightingManager';
import { RenderLoop } from './core/RenderLoop';

import { getPointColor } from '@/utils/colorUtils';

// ============================================
// TYPES
// ============================================
export interface DataPoint {
  id: string;
  datasetId: string;
  value: number;
  sensorId: string;
  timestamp: Date | string;
  metadata?: {
    x?: number;
    y?: number;
    z?: number;
    sensorType?: string;
    unit?: string;
    [key: string]: any;
  };
}

interface Layer {
  id: string;
  name: string;
  enabled: boolean;
  opacity: number;
}

interface Viewer3DPanelProps {
  dataPoints: DataPoint[];
  layers?: Layer[];
  selectedPoint: DataPoint | null;
  onPointSelect: (point: DataPoint | null) => void;
  colorMode: 'heatmap' | 'sensor-type';
  valueRange: { min: number; max: number };
  isLive: boolean;
  onViewChange?: (view: string) => void;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const Viewer3DPanel: React.FC<Viewer3DPanelProps> = ({
  dataPoints,
  layers,
  selectedPoint,
  onPointSelect,
  colorMode,
  valueRange,
  isLive,
  onViewChange
}) => {
  // ============================================
  // STATE & REFS
  // ============================================
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pointsGroupRef = useRef<THREE.Group | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  
  // Managers
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const cameraManagerRef = useRef<CameraManager | null>(null);
  const lightingManagerRef = useRef<LightingManager | null>(null);
  const renderLoopRef = useRef<RenderLoop | null>(null);
  
  const [viewMode, setViewMode] = useState<ViewMode>('perspective');
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  // ============================================
  // MAP DE ASSETS POR SENSORID (persistent)
  // ============================================
  const assetsMapRef = useRef<Map<string, {
    mesh: THREE.Mesh;
    line?: THREE.Line;
    targetPosition: THREE.Vector3;
    currentPosition: THREE.Vector3;
  }>>(new Map());

const sharedGeometryRef = useRef<THREE.SphereGeometry>(new THREE.SphereGeometry(0.5, 16, 16));
  // ============================================
  // INICIALIZACIÓN DE THREE.JS CON ORBITCONTROLS
  // ============================================
  useEffect(() => {
    if (!containerRef.current) return;

    console.log('🎬 Inicializando THREE.js scene con OrbitControls...');

    // Limpiar cualquier canvas existente
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      console.warn('⚠️ Canvas existente encontrado, removiendo...');
      containerRef.current.removeChild(existingCanvas);
    }

    // 1. Crear SceneManager
    const sceneManager = new SceneManager();
    sceneManagerRef.current = sceneManager;
    sceneManager.addGridHelper(200, 20, 0x27272a);
    sceneManager.addAxesHelper(100);

    // 2. Crear CameraManager
    const cameraManager = new CameraManager(containerRef.current);
    cameraManagerRef.current = cameraManager;

    // 3. Crear Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    console.log('✅ Renderer creado y añadido al DOM');

    // 4. Crear LightingManager
    const lightingManager = new LightingManager(sceneManager.getScene(), {
      ambientIntensity: 0.6,
      directionalIntensity: 0.8,
      pointIntensity: 0.5
    });
    lightingManagerRef.current = lightingManager;

    // 5. Crear grupo para los puntos
    const pointsGroup = new THREE.Group();
    sceneManager.addObject(pointsGroup);
    pointsGroupRef.current = pointsGroup;

    // 6. Crear OrbitControls
    const orbitControls = new OrbitControls(
      cameraManager.getCamera(),
      renderer.domElement
    );
    
    // Configurar OrbitControls
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.screenSpacePanning = false;
    orbitControls.minDistance = 10;
    orbitControls.maxDistance = 200;
    orbitControls.maxPolarAngle = Math.PI / 2;
    orbitControls.target.set(0, 0, 0);
    
    // Listeners para detectar cambios
    orbitControls.addEventListener('change', () => {
      renderLoop.requestRender();
    });
    
    orbitControlsRef.current = orbitControls;

    console.log('✅ OrbitControls configurado');

    // 7. Crear RenderLoop (modo on-demand para mejor performance)
    const renderLoop = new RenderLoop(
      renderer,
      sceneManager.getScene(),
      cameraManager.getCamera(),
      false // modo on-demand
    );
    renderLoopRef.current = renderLoop;

    // 8. Añadir callback para actualizar OrbitControls y rotación live
    const updateCallback = (deltaTime: number) => {
      // Actualizar OrbitControls (necesario para damping)
      if (orbitControls.enabled) {
        orbitControls.update();
      }
      
      // Rotación automática en modo live
      if (isLive && !orbitControls.autoRotate && viewMode === 'perspective') {
        if (pointsGroupRef.current) {
          //pointsGroupRef.current.rotation.y += 0.001;
        }
      }
    };
    renderLoop.addCallback(updateCallback);

    // 9. Iniciar render loop
    renderLoop.start();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraManager.updateAspect(width, height);
      renderer.setSize(width, height);
      renderLoop.requestRender();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      orbitControls.dispose();
      renderLoop.dispose();
      lightingManager.dispose();
      sceneManager.dispose();
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // ============================================
  // ACTUALIZAR ASSETS EN TIEMPO REAL
  // ============================================
  useEffect(() => {
    if (!pointsGroupRef.current) return;

    const pointsGroup = pointsGroupRef.current;
    const assetsMap = assetsMapRef.current;

    // Crear geometría compartida si no existe
    if (!sharedGeometryRef.current) {
      sharedGeometryRef.current = new THREE.SphereGeometry(0.5, 16, 16);
    }

    // Agrupar dataPoints por sensorId (último valor por sensor)
    const latestBySensor = new Map<string, DataPoint>();
    dataPoints.forEach(point => {
      const existing = latestBySensor.get(point.sensorId);
      if (!existing || new Date(point.timestamp) > new Date(existing.timestamp)) {
        latestBySensor.set(point.sensorId, point);
      }
    });

    // Actualizar o crear assets
    latestBySensor.forEach((point, sensorId) => {
      const x = point.metadata?.x ?? 0;
      const y = point.metadata?.y ?? 0;
      const z = point.metadata?.z ?? 0;
      const targetPos = new THREE.Vector3(x, y, z);

      let asset = assetsMap.get(sensorId);

      if (!asset) {
        // Crear nuevo asset
        const color = getPointColor(point, colorMode);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.1,
            metalness: 0.3,
            roughness: 0.7
        });

        const mesh = new THREE.Mesh(sharedGeometryRef.current!, material);
        mesh.position.copy(targetPos);
        mesh.userData = { 
            dataPoint: point,
            sensorId: sensorId
        };

        pointsGroup.add(mesh);

        asset = {
            mesh,
            targetPosition: targetPos.clone(),
            currentPosition: targetPos.clone()
        };
        assetsMap.set(sensorId, asset);
        } else {
        // Actualizar asset existente
        asset.targetPosition.copy(targetPos);
        asset.mesh.userData.dataPoint = point;

        // Actualizar color
        const color: THREE.Color = getPointColor(point, colorMode);
        const material = asset.mesh.material as THREE.MeshStandardMaterial;
        material.color.copy(color);
        material.emissive.copy(color);
      }

      // Actualizar estado visual (selected/hovered)
      const isSelected = selectedPoint?.sensorId === sensorId;
      const isHovered = hoveredPoint?.sensorId === sensorId;
      
      const material = asset.mesh.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = isSelected ? 0.5 : isHovered ? 0.3 : 0.1;
      
      const targetScale = isSelected ? 2 : isHovered ? 1.5 : 1;
      asset.mesh.scale.setScalar(targetScale);

      // Manejar línea al suelo
      if (isSelected || isHovered) {
        if (!asset.line) {
          const lineGeometry = new THREE.BufferGeometry();
          const positions = new Float32Array(6); // 2 puntos * 3 coordenadas
          lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          
          const lineMaterial = new THREE.LineBasicMaterial({
            color: material.color,
            opacity: 0.3,
            transparent: true
          });
          
          asset.line = new THREE.Line(lineGeometry, lineMaterial);
          pointsGroup.add(asset.line);
        }
        
        // Actualizar posiciones de la línea
        const positions = asset.line.geometry.attributes.position.array as Float32Array;
        const pos = asset.mesh.position;
        positions[0] = pos.x;
        positions[1] = pos.y;
        positions[2] = pos.z;
        positions[3] = pos.x;
        positions[4] = 0;
        positions[5] = pos.z;
        asset.line.geometry.attributes.position.needsUpdate = true;
        
        const lineMat = asset.line.material as THREE.LineBasicMaterial;
        lineMat.color.copy(material.color);
      } else if (asset.line) {
        // Remover línea si ya no está selected/hovered
        pointsGroup.remove(asset.line);
        asset.line.geometry.dispose();
        (asset.line.material as THREE.Material).dispose();
        asset.line = undefined;
      }
    });

    // Remover assets que ya no existen en los datos
    const currentSensorIds = new Set(latestBySensor.keys());
    assetsMap.forEach((asset, sensorId) => {
      if (!currentSensorIds.has(sensorId)) {
        pointsGroup.remove(asset.mesh);
        if (asset.line) {
          pointsGroup.remove(asset.line);
          asset.line.geometry.dispose();
          (asset.line.material as THREE.Material).dispose();
        }
        (asset.mesh.material as THREE.Material).dispose();
        assetsMap.delete(sensorId);
      }
    });

    renderLoopRef.current?.requestRender();
  }, [dataPoints, selectedPoint, hoveredPoint, colorMode]);

  // ============================================
  // ANIMACIÓN SUAVE DE MOVIMIENTO (LERP)
  // ============================================
  useEffect(() => {
    if (!renderLoopRef.current) return;

    const animateAssets = () => {
      const assetsMap = assetsMapRef.current;
      let needsUpdate = false;

      assetsMap.forEach(asset => {
        const distance = asset.currentPosition.distanceTo(asset.targetPosition);
        
        if (distance > 0.01) {
          // Interpolación suave (lerp)
          asset.currentPosition.lerp(asset.targetPosition, 0.1);
          asset.mesh.position.copy(asset.currentPosition);
          
          // Actualizar línea si existe
          if (asset.line) {
            const positions = asset.line.geometry.attributes.position.array as Float32Array;
            positions[0] = asset.currentPosition.x;
            positions[1] = asset.currentPosition.y;
            positions[2] = asset.currentPosition.z;
            positions[3] = asset.currentPosition.x;
            positions[4] = 0;
            positions[5] = asset.currentPosition.z;
            asset.line.geometry.attributes.position.needsUpdate = true;
          }
          
          needsUpdate = true;
        }
      });

      if (needsUpdate) {
        renderLoopRef.current?.requestRender();
      }
    };

    const intervalId = setInterval(animateAssets, 16); // ~60fps

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // ============================================
  // CLEANUP AL DESMONTAR
  // ============================================
  useEffect(() => {
    return () => {
      // Limpiar todos los assets
      assetsMapRef.current.forEach(asset => {
        if (asset.line) {
          asset.line.geometry.dispose();
          (asset.line.material as THREE.Material).dispose();
        }
        (asset.mesh.material as THREE.Material).dispose();
      });
      assetsMapRef.current.clear();

      // Limpiar geometría compartida
      // Crear geometría compartida si no existe
        if (!sharedGeometryRef.current) {
        sharedGeometryRef.current = new THREE.SphereGeometry(0.5, 16, 16);
        }
    };
  }, []);

  // ============================================
  // MOUSE INTERACTIONS (Click & Hover)
  // ============================================
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !cameraManagerRef.current || !sceneManagerRef.current) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycasting para hover
      raycasterRef.current.setFromCamera(
        mouseRef.current,
        cameraManagerRef.current!.getCamera()
      );

      // Solo raycast en meshes (no en líneas)
      const meshes = (pointsGroupRef.current?.children || [])
        .filter(child => child instanceof THREE.Mesh);

      const intersects = raycasterRef.current.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh;
        const point = mesh.userData?.dataPoint as DataPoint;
        if (point) {
          setHoveredPoint(point);
          container.style.cursor = 'pointer';
        }
      } else {
        setHoveredPoint(null);
        container.style.cursor = 'grab';
      }
    };

    const handleClick = (event: MouseEvent) => {
      raycasterRef.current.setFromCamera(
        mouseRef.current,
        cameraManagerRef.current!.getCamera()
      );

      const meshes = (pointsGroupRef.current?.children || [])
        .filter(child => child instanceof THREE.Mesh);

      const intersects = raycasterRef.current.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh;
        const point = mesh.userData?.dataPoint as DataPoint;
        if (point) {
          onPointSelect(point);
        }
      } else {
        onPointSelect(null);
      }

      renderLoopRef.current?.requestRender();
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
    };
  }, [onPointSelect]);

  // ============================================
  // ACTUALIZAR ZOOM
  // ============================================
  const handleZoomChange = (newZoom: number) => {
    if (cameraManagerRef.current && orbitControlsRef.current) {
      const camera = cameraManagerRef.current.getCamera();
      const target = orbitControlsRef.current.target;
      
      // Calcular nueva distancia
      const direction = new THREE.Vector3()
        .subVectors(camera.position, target)
        .normalize();
      
      const baseDistance = cameraManagerRef.current.getBaseDistance();
      const distance = baseDistance / newZoom;
      
      camera.position.copy(target).add(direction.multiplyScalar(distance));
      orbitControlsRef.current.update();
      
      renderLoopRef.current?.requestRender();
    }
  };

  // ============================================
  // VIEW PRESETS
  // ============================================
  const handleViewClick = (view: ViewMode) => {
    if (!cameraManagerRef.current || !pointsGroupRef.current || !orbitControlsRef.current) return;

    // Reset rotación del grupo
    pointsGroupRef.current.rotation.set(0, 0, 0);

    const camera = cameraManagerRef.current.getCamera();
    const target = orbitControlsRef.current.target;
    const distance = cameraManagerRef.current.getBaseDistance();

    let newPosition: THREE.Vector3;

    switch (view) {
      case 'top':
        newPosition = new THREE.Vector3(target.x, target.y + distance, target.z);
        break;
      
      case 'front':
        newPosition = new THREE.Vector3(target.x, target.y, target.z + distance);
        break;
      
      case 'side':
        newPosition = new THREE.Vector3(target.x + distance, target.y, target.z);
        break;
      
      case 'perspective':
      default:
        newPosition = new THREE.Vector3(
          target.x + distance * 0.7,
          target.y + distance * 0.7,
          target.z + distance * 0.7
        );
        break;
    }

    camera.position.copy(newPosition);
    camera.lookAt(target);
    orbitControlsRef.current.update();
    
    setViewMode(view);
    onViewChange?.(view);
    renderLoopRef.current?.requestRender();
  };

  const handleResetView = () => {
    if (!cameraManagerRef.current || !pointsGroupRef.current || !orbitControlsRef.current) return;

    pointsGroupRef.current.rotation.set(0, 0, 0);
    
    const camera = cameraManagerRef.current.getCamera();
    const distance = cameraManagerRef.current.getBaseDistance();
    
    camera.position.set(distance, distance, distance);
    orbitControlsRef.current.target.set(0, 0, 0);
    camera.lookAt(0, 0, 0);
    orbitControlsRef.current.update();
    
    setViewMode('perspective');
    renderLoopRef.current?.requestRender();
  };

  // ============================================
  // OBTENER ZOOM ACTUAL
  // ============================================
  const getCurrentZoom = () => {
    if (!cameraManagerRef.current || !orbitControlsRef.current) return 1;
    
    const camera = cameraManagerRef.current.getCamera();
    const target = orbitControlsRef.current.target;
    const distance = camera.position.distanceTo(target);
    const baseDistance = cameraManagerRef.current.getBaseDistance();
    
    return baseDistance / distance;
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="flex-1 relative bg-[#0a0a0a]">
      {/* Three.js Container */}
      <div 
        ref={containerRef}
        className="w-full h-full"
        style={{ cursor: 'grab' }}
      />
      
      {/* Controls Overlay - Bottom Left */}
      <ViewControls 
        viewMode={viewMode}
        onViewChange={handleViewClick}
        onResetView={handleResetView}
      />

      {/* Zoom Controls - Bottom Right */}
      <ZoomControls 
        zoom={getCurrentZoom()}
        onZoomChange={handleZoomChange}
      />

      {/* View Info - Top Left */}
      <ViewInfo 
        viewMode={viewMode}
        zoom={getCurrentZoom()}
      />

      {/* Hovered Point Info - Top Right */}
      <HoveredPointInfo 
        hoveredPoint={hoveredPoint} 
        selectedPoint={selectedPoint} 
      />

      {/* Selected Point Info - Center Top */}
      <SelectedPointInfo selectedPoint={selectedPoint} />

      {/* Data Points Count */}
      <div className="absolute bottom-4 right-1/2 translate-x-1/2 bg-[#18181b]/90 backdrop-blur px-3 py-1 rounded text-xs text-gray-400">
        {assetsMapRef.current.size} active sensors • {dataPoints.length} total readings
      </div>
    </div>
  );
};

export default Viewer3DPanel;