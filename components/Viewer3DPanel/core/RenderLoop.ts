import * as THREE from 'three';

export type AnimationCallback = (deltaTime: number, elapsedTime: number) => void;

export class RenderLoop {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;
  private callbacks: Set<AnimationCallback> = new Set();
  private lastTime: number = 0;
  private elapsedTime: number = 0;
  private needsRender: boolean = true;
  private continuousMode: boolean = false;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    continuousMode: boolean = true
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.continuousMode = continuousMode;
  }

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.needsRender = true;
    this.animate();
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private animate = (): void => {
    if (!this.isRunning) return;

    // Solicitar siguiente frame PRIMERO (evita pérdida de frames)
    this.animationFrameId = requestAnimationFrame(this.animate);

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    this.elapsedTime += deltaTime;

    // Ejecutar callbacks (pueden marcar needsRender)
    let callbacksNeedRender = false;
    this.callbacks.forEach(callback => {
      try {
        callback(deltaTime, this.elapsedTime);
        callbacksNeedRender = true;
      } catch (error) {
        console.error('Error in animation callback:', error);
      }
    });

    // Renderizar solo si es necesario
    if (this.continuousMode || this.needsRender || callbacksNeedRender) {
      this.renderer.render(this.scene, this.camera);
      this.needsRender = false;
    }
  };

  addCallback(callback: AnimationCallback): void {
    this.callbacks.add(callback);
    this.needsRender = true;
  }

  removeCallback(callback: AnimationCallback): void {
    this.callbacks.delete(callback);
  }

  clearCallbacks(): void {
    this.callbacks.clear();
  }

  isActive(): boolean {
    return this.isRunning;
  }

  getElapsedTime(): number {
    return this.elapsedTime;
  }

  resetElapsedTime(): void {
    this.elapsedTime = 0;
  }

  setCamera(camera: THREE.Camera): void {
    this.camera = camera;
    this.needsRender = true;
  }

  setScene(scene: THREE.Scene): void {
    this.scene = scene;
    this.needsRender = true;
  }

  // Solicitar un render en el próximo frame
  requestRender(): void {
    this.needsRender = true;
  }

  // Cambiar entre modo continuo y on-demand
  setContinuousMode(enabled: boolean): void {
    this.continuousMode = enabled;
    if (enabled) {
      this.needsRender = true;
    }
  }

  dispose(): void {
    this.stop();
    this.clearCallbacks();
  }
}