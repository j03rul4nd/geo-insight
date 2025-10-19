import * as THREE from 'three';

export interface LightingConfig {
  ambientIntensity?: number;
  directionalIntensity?: number;
  pointIntensity?: number;
  ambientColor?: number;
  directionalColor?: number;
  pointColor?: number;
}

export class LightingManager {
  private scene: THREE.Scene;
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;
  private pointLight: THREE.PointLight;

  constructor(scene: THREE.Scene, config: LightingConfig = {}) {
    this.scene = scene;

    // Luz ambiente
    this.ambientLight = new THREE.AmbientLight(
      config.ambientColor ?? 0xffffff,
      config.ambientIntensity ?? 0.6
    );
    this.scene.add(this.ambientLight);

    // Luz direccional
    this.directionalLight = new THREE.DirectionalLight(
      config.directionalColor ?? 0xffffff,
      config.directionalIntensity ?? 0.8
    );
    this.directionalLight.position.set(50, 100, 50);
    this.scene.add(this.directionalLight);

    // Luz puntual
    this.pointLight = new THREE.PointLight(
      config.pointColor ?? 0xffffff,
      config.pointIntensity ?? 0.5
    );
    this.pointLight.position.set(-50, 50, -50);
    this.scene.add(this.pointLight);
  }

  setAmbientIntensity(intensity: number): void {
    this.ambientLight.intensity = intensity;
  }

  setDirectionalIntensity(intensity: number): void {
    this.directionalLight.intensity = intensity;
  }

  setPointIntensity(intensity: number): void {
    this.pointLight.intensity = intensity;
  }

  setAmbientColor(color: number): void {
    this.ambientLight.color.setHex(color);
  }

  setDirectionalColor(color: number): void {
    this.directionalLight.color.setHex(color);
  }

  setPointColor(color: number): void {
    this.pointLight.color.setHex(color);
  }

  setDirectionalPosition(x: number, y: number, z: number): void {
    this.directionalLight.position.set(x, y, z);
  }

  setPointPosition(x: number, y: number, z: number): void {
    this.pointLight.position.set(x, y, z);
  }

  toggleAmbient(visible: boolean): void {
    this.ambientLight.visible = visible;
  }

  toggleDirectional(visible: boolean): void {
    this.directionalLight.visible = visible;
  }

  togglePoint(visible: boolean): void {
    this.pointLight.visible = visible;
  }

  // Presets de iluminación
  setPreset(preset: 'default' | 'dark' | 'bright' | 'dramatic'): void {
    switch (preset) {
      case 'dark':
        this.setAmbientIntensity(0.3);
        this.setDirectionalIntensity(0.4);
        this.setPointIntensity(0.2);
        break;
      case 'bright':
        this.setAmbientIntensity(0.9);
        this.setDirectionalIntensity(1.2);
        this.setPointIntensity(0.8);
        break;
      case 'dramatic':
        this.setAmbientIntensity(0.2);
        this.setDirectionalIntensity(1.5);
        this.setPointIntensity(1.0);
        break;
      case 'default':
      default:
        this.setAmbientIntensity(0.6);
        this.setDirectionalIntensity(0.8);
        this.setPointIntensity(0.5);
        break;
    }
  }

  dispose(): void {
    this.scene.remove(this.ambientLight);
    this.scene.remove(this.directionalLight);
    this.scene.remove(this.pointLight);
  }
}