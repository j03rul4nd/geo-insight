import * as THREE from 'three';

export type ViewMode = 'perspective' | 'top' | 'front' | 'side';

export interface CameraConfig {
  fov?: number;
  near?: number;
  far?: number;
  initialPosition?: THREE.Vector3;
  baseDistance?: number;
}

export class CameraManager {
  private camera: THREE.PerspectiveCamera;
  private baseDistance: number;
  private zoom: number = 1;
  private targetPosition: THREE.Vector3;
  private currentView: ViewMode = 'perspective';

  constructor(container: HTMLElement, config: CameraConfig = {}) {
    const aspect = container.clientWidth / container.clientHeight;
    
    this.camera = new THREE.PerspectiveCamera(
      config.fov ?? 75,
      aspect,
      config.near ?? 0.1,
      config.far ?? 1000
    );

    this.baseDistance = config.baseDistance ?? 50;
    this.targetPosition = new THREE.Vector3(0, 0, 0);

    // Posición inicial
    const initialPos = config.initialPosition ?? new THREE.Vector3(
      this.baseDistance,
      this.baseDistance,
      this.baseDistance
    );
    
    this.camera.position.copy(initialPos);
    this.camera.lookAt(this.targetPosition);
  }

  // ============================================
  // GETTERS
  // ============================================
  
  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  getZoom(): number {
    return this.zoom;
  }

  getCurrentView(): ViewMode {
    return this.currentView;
  }

  getBaseDistance(): number {
    return this.baseDistance;
  }

  getTargetPosition(): THREE.Vector3 {
    return this.targetPosition.clone();
  }

  // ============================================
  // SETTERS
  // ============================================

  setZoom(zoom: number, smooth: boolean = false): void {
    this.zoom = Math.max(0.2, Math.min(5, zoom));
    
    if (smooth) {
      this.smoothUpdatePosition();
    } else {
      this.updatePosition();
    }
  }

  setBaseDistance(distance: number): void {
    this.baseDistance = distance;
    this.updatePosition();
  }

  setTargetPosition(target: THREE.Vector3): void {
    this.targetPosition.copy(target);
    this.camera.lookAt(this.targetPosition);
  }

  setFOV(fov: number): void {
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  }

  // ============================================
  // ASPECT RATIO
  // ============================================

  updateAspect(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  // ============================================
  // POSICIONAMIENTO
  // ============================================

  private updatePosition(): void {
    const distance = this.baseDistance / this.zoom;
    const direction = new THREE.Vector3()
      .subVectors(this.camera.position, this.targetPosition)
      .normalize();
    
    this.camera.position.copy(
      this.targetPosition.clone().add(direction.multiplyScalar(distance))
    );
  }

  private smoothUpdatePosition(): void {
    const distance = this.baseDistance / this.zoom;
    const currentDistance = this.camera.position.distanceTo(this.targetPosition);
    
    if (Math.abs(currentDistance - distance) > 0.1) {
      const direction = new THREE.Vector3()
        .subVectors(this.camera.position, this.targetPosition)
        .normalize();
      
      const targetPos = this.targetPosition.clone().add(
        direction.multiplyScalar(distance)
      );
      
      // Interpolación suave
      this.camera.position.lerp(targetPos, 0.1);
    }
  }

  // ============================================
  // VISTAS PREDEFINIDAS
  // ============================================

  setView(view: ViewMode, smooth: boolean = false): void {
    this.currentView = view;
    const distance = this.baseDistance / this.zoom;

    let targetPosition: THREE.Vector3;

    switch (view) {
      case 'top':
        targetPosition = new THREE.Vector3(0, distance, 0);
        break;
      
      case 'front':
        targetPosition = new THREE.Vector3(0, 0, distance);
        break;
      
      case 'side':
        targetPosition = new THREE.Vector3(distance, 0, 0);
        break;
      
      case 'perspective':
      default:
        targetPosition = new THREE.Vector3(
          distance * 0.7,
          distance * 0.7,
          distance * 0.7
        );
        break;
    }

    if (smooth) {
      // Animación suave (requiere llamadas continuas en el loop)
      this.animateToPosition(targetPosition);
    } else {
      this.camera.position.copy(targetPosition);
      this.camera.lookAt(this.targetPosition);
    }
  }

  private animateToPosition(target: THREE.Vector3, speed: number = 0.1): void {
    // Interpolación suave hacia la posición objetivo
    this.camera.position.lerp(target, speed);
    this.camera.lookAt(this.targetPosition);
  }

  // ============================================
  // ROTACIÓN
  // ============================================

  rotateAround(
    deltaX: number,
    deltaY: number,
    sensitivity: number = 0.01
  ): void {
    // Calcular el offset desde el target
    const offset = new THREE.Vector3()
      .copy(this.camera.position)
      .sub(this.targetPosition);
    
    // Rotación horizontal (alrededor del eje Y)
    const horizontalAngle = -deltaX * sensitivity;
    const quaternionY = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      horizontalAngle
    );
    offset.applyQuaternion(quaternionY);

    // Rotación vertical con límites
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(
      this.camera.quaternion
    );
    const verticalAngle = -deltaY * sensitivity;
    
    // Calcular ángulo vertical actual
    const currentVerticalAngle = Math.asin(
      offset.y / offset.length()
    );
    
    // Limitar rotación vertical
    const newVerticalAngle = Math.max(
      -Math.PI / 2 + 0.1,
      Math.min(Math.PI / 2 - 0.1, currentVerticalAngle + verticalAngle)
    );
    
    const angleDiff = newVerticalAngle - currentVerticalAngle;
    const quaternionX = new THREE.Quaternion().setFromAxisAngle(
      right,
      angleDiff
    );
    offset.applyQuaternion(quaternionX);

    // Aplicar nueva posición
    this.camera.position.copy(this.targetPosition).add(offset);
    this.camera.lookAt(this.targetPosition);
  }

  orbitAround(angleX: number, angleY: number): void {
    const offset = new THREE.Vector3()
      .copy(this.camera.position)
      .sub(this.targetPosition);
    
    const radius = offset.length();
    const theta = Math.atan2(offset.x, offset.z) + angleX;
    const phi = Math.acos(offset.y / radius) + angleY;
    
    // Limitar phi
    const clampedPhi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));
    
    // Convertir de esféricas a cartesianas
    this.camera.position.set(
      radius * Math.sin(clampedPhi) * Math.sin(theta),
      radius * Math.cos(clampedPhi),
      radius * Math.sin(clampedPhi) * Math.cos(theta)
    ).add(this.targetPosition);
    
    this.camera.lookAt(this.targetPosition);
  }

  // ============================================
  // PAN (Desplazamiento lateral)
  // ============================================

  pan(deltaX: number, deltaY: number, sensitivity: number = 0.1): void {
    const distance = this.camera.position.distanceTo(this.targetPosition);
    const factor = distance * sensitivity;

    // Vectores de la cámara
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    
    this.camera.getWorldDirection(new THREE.Vector3());
    right.setFromMatrixColumn(this.camera.matrix, 0);
    up.setFromMatrixColumn(this.camera.matrix, 1);

    // Aplicar desplazamiento
    const offset = new THREE.Vector3();
    offset.add(right.multiplyScalar(-deltaX * factor));
    offset.add(up.multiplyScalar(deltaY * factor));

    this.camera.position.add(offset);
    this.targetPosition.add(offset);
  }

  // ============================================
  // RESET Y UTILIDADES
  // ============================================

  reset(): void {
    this.zoom = 1;
    this.currentView = 'perspective';
    this.targetPosition.set(0, 0, 0);
    
    this.camera.position.set(
      this.baseDistance,
      this.baseDistance,
      this.baseDistance
    );
    this.camera.lookAt(this.targetPosition);
  }

  focusOn(position: THREE.Vector3, distance?: number): void {
    this.targetPosition.copy(position);
    
    const finalDistance = distance ?? this.baseDistance / this.zoom;
    const direction = new THREE.Vector3()
      .subVectors(this.camera.position, position)
      .normalize();
    
    this.camera.position.copy(
      position.clone().add(direction.multiplyScalar(finalDistance))
    );
    
    this.camera.lookAt(this.targetPosition);
  }

  // Obtener dirección de la cámara
  getDirection(): THREE.Vector3 {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    return direction;
  }

  // Obtener distancia actual al target
  getDistanceToTarget(): number {
    return this.camera.position.distanceTo(this.targetPosition);
  }

  // Convertir coordenadas de pantalla a world
  screenToWorld(x: number, y: number, z: number = 0): THREE.Vector3 {
    const vector = new THREE.Vector3(x, y, z);
    vector.unproject(this.camera);
    return vector;
  }

  // Convertir coordenadas world a pantalla
  worldToScreen(position: THREE.Vector3, width: number, height: number): THREE.Vector2 {
    const vector = position.clone();
    vector.project(this.camera);
    
    return new THREE.Vector2(
      (vector.x + 1) * width / 2,
      (-vector.y + 1) * height / 2
    );
  }

  // ============================================
  // ANIMACIONES
  // ============================================

  // Para usar en el render loop
  update(deltaTime: number): void {
    // Si hay animaciones pendientes, aquí se procesarían
    // Por ahora solo actualizamos la posición suave del zoom
    this.smoothUpdatePosition();
  }

  // ============================================
  // DISPOSE
  // ============================================

  dispose(): void {
    // Las cámaras no requieren dispose explícito
    // pero limpiamos referencias
  }
}