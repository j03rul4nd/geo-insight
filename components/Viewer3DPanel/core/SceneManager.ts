import * as THREE from 'three';

export class SceneManager {
  private scene: THREE.Scene;
  private gridHelper: THREE.GridHelper | null = null;
  private axesHelper: THREE.AxesHelper | null = null;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);
  }

  getScene(): THREE.Scene {
    return this.scene;
  }

  addGridHelper(size: number = 200, divisions: number = 20, color: number = 0x27272a): void {
    if (this.gridHelper) {
      this.scene.remove(this.gridHelper);
      this.gridHelper.dispose();
    }

    this.gridHelper = new THREE.GridHelper(size, divisions, color, color);
    this.scene.add(this.gridHelper);
  }

  addAxesHelper(size: number = 100): void {
    if (this.axesHelper) {
      this.scene.remove(this.axesHelper);
    }

    this.axesHelper = new THREE.AxesHelper(size);
    this.scene.add(this.axesHelper);
  }

  setGridVisibility(visible: boolean): void {
    if (this.gridHelper) {
      this.gridHelper.visible = visible;
    }
  }

  setAxesVisibility(visible: boolean): void {
    if (this.axesHelper) {
      this.axesHelper.visible = visible;
    }
  }

  setBackgroundColor(color: number): void {
    this.scene.background = new THREE.Color(color);
  }

  addObject(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  removeObject(object: THREE.Object3D): void {
    this.scene.remove(object);
  }

  clear(): void {
    // Remover y disponer de todos los objetos
    while (this.scene.children.length > 0) {
      const child = this.scene.children[0];
      this.scene.remove(child);

      // Disponer geometrías y materiales
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    }

    this.gridHelper = null;
    this.axesHelper = null;
  }

  dispose(): void {
    this.clear();
  }
}