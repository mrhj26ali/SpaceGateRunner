import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export class LightingSystem {
  constructor(scene: THREE.Scene) {
    this.setupBase(scene);
    this.setupHDR(scene);
  }

  private setupBase(scene: THREE.Scene) {
    scene.add(new THREE.AmbientLight(0x111122, 0.4));
    const sun = new THREE.DirectionalLight(0xffeedd, 1.2);
    sun.position.set(50, 80, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 150;
    sun.shadow.camera.left = -40; sun.shadow.camera.right = 40;
    sun.shadow.camera.top = 40; sun.shadow.camera.bottom = -40;
    scene.add(sun);
  }

  private setupHDR(scene: THREE.Scene) {
    new RGBELoader().load(
      'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_03_1k.hdr',
      tex => { tex.mapping = THREE.EquirectangularReflectionMapping; scene.environment = tex; },
      undefined, () => scene.background = new THREE.Color(0x020208)
    );
  }
}