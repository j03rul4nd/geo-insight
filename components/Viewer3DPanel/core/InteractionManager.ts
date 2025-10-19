import * as THREE from 'three';

export interface InteractionCallbacks {
  onClick?: (intersects: THREE.Intersection[]) => void;
  onHover?: (intersects: THREE.Intersection[]) => void;
  onDragStart?: (event: MouseEvent) => void;
  onDrag?: (deltaX: number, deltaY: number, event: MouseEvent) => void;
  onDragEnd?: (event: MouseEvent) => void;
  onWheel?: (delta: number, event: WheelEvent) => void;
}

export class InteractionManager {
  private container: HTMLElement;
  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private callbacks: InteractionCallbacks;
  
  private isDragging: boolean = false;
  private lastMousePos: { x: number; y: number } = { x: 0, y: 0 };
  private interactableObjects: THREE.Object3D[] = [];

  constructor(
    container: HTMLElement,
    camera: THREE.Camera,
    scene: THREE.Scene,
    callbacks: InteractionCallbacks = {}
  ) {
    this.container = container;
    this.camera = camera;
    this.scene = scene;
    this.callbacks = callbacks;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.container.addEventListener('click', this.handleClick);
    this.container.addEventListener('mousemove', this.handleMouseMove);
    this.container.addEventListener('mousedown', this.handleMouseDown);
    this.container.addEventListener('mouseup', this.handleMouseUp);
    this.container.addEventListener('mouseleave', this.handleMouseLeave);
    this.container.addEventListener('wheel', this.handleWheel, { passive: false });
  }

  private removeEventListeners(): void {
    this.container.removeEventListener('click', this.handleClick);
    this.container.removeEventListener('mousemove', this.handleMouseMove);
    this.container.removeEventListener('mousedown', this.handleMouseDown);
    this.container.removeEventListener('mouseup', this.handleMouseUp);
    this.container.removeEventListener('mouseleave', this.handleMouseLeave);
    this.container.removeEventListener('wheel', this.handleWheel);
  }

  private updateMousePosition(event: MouseEvent): void {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private getIntersects(): THREE.Intersection[] {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    const objects = this.interactableObjects.length > 0 
      ? this.interactableObjects 
      : this.scene.children;
    
    return this.raycaster.intersectObjects(objects, true);
  }

  private handleClick = (event: MouseEvent): void => {
    if (this.isDragging) return; // No procesar clicks si estamos arrastrando
    
    this.updateMousePosition(event);
    const intersects = this.getIntersects();
    
    if (this.callbacks.onClick) {
      this.callbacks.onClick(intersects);
    }
  };

  private handleMouseMove = (event: MouseEvent): void => {
    this.updateMousePosition(event);

    if (this.isDragging) {
      const deltaX = event.clientX - this.lastMousePos.x;
      const deltaY = event.clientY - this.lastMousePos.y;
      
      if (this.callbacks.onDrag) {
        this.callbacks.onDrag(deltaX, deltaY, event);
      }
      
      this.lastMousePos = { x: event.clientX, y: event.clientY };
    } else {
      const intersects = this.getIntersects();
      
      if (this.callbacks.onHover) {
        this.callbacks.onHover(intersects);
      }
    }
  };

  private handleMouseDown = (event: MouseEvent): void => {
    this.isDragging = true;
    this.lastMousePos = { x: event.clientX, y: event.clientY };
    
    if (this.callbacks.onDragStart) {
      this.callbacks.onDragStart(event);
    }
  };

  private handleMouseUp = (event: MouseEvent): void => {
    this.isDragging = false;
    
    if (this.callbacks.onDragEnd) {
      this.callbacks.onDragEnd(event);
    }
  };

  private handleMouseLeave = (event: MouseEvent): void => {
    if (this.isDragging) {
      this.isDragging = false;
      
      if (this.callbacks.onDragEnd) {
        this.callbacks.onDragEnd(event);
      }
    }
  };

  private handleWheel = (event: WheelEvent): void => {
    event.preventDefault();
    
    const delta = event.deltaY;
    
    if (this.callbacks.onWheel) {
      this.callbacks.onWheel(delta, event);
    }
  };

  // Métodos públicos
  setInteractableObjects(objects: THREE.Object3D[]): void {
    this.interactableObjects = objects;
  }

  addInteractableObject(object: THREE.Object3D): void {
    this.interactableObjects.push(object);
  }

  removeInteractableObject(object: THREE.Object3D): void {
    const index = this.interactableObjects.indexOf(object);
    if (index > -1) {
      this.interactableObjects.splice(index, 1);
    }
  }

  clearInteractableObjects(): void {
    this.interactableObjects = [];
  }

  updateCallbacks(callbacks: InteractionCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  setCamera(camera: THREE.Camera): void {
    this.camera = camera;
  }

  getDragging(): boolean {
    return this.isDragging;
  }

  getMousePosition(): THREE.Vector2 {
    return this.mouse.clone();
  }

  // Raycasting manual para casos de uso específicos
  raycast(objects?: THREE.Object3D[]): THREE.Intersection[] {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const targets = objects || this.interactableObjects || this.scene.children;
    return this.raycaster.intersectObjects(targets, true);
  }

  dispose(): void {
    this.removeEventListeners();
    this.clearInteractableObjects();
  }
}