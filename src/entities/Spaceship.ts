import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { InputState } from '../core/InputSystem';

export class Spaceship {
  public mesh: THREE.Group;
  public speed = 0;
  private maxSpeed = 0.6;
  private accel = 0.015;
  private drag = 0.96;
  private targetPos = new THREE.Vector3();

  constructor(scene: THREE.Group) {
    this.mesh = new THREE.Group();
    scene.add(this.mesh);
    this.loadModel();
  }

  private loadModel() {
    const loader = new GLTFLoader();
    loader.load('/models/spaceship.glb', gltf => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      model.scale.setScalar(1.5 / Math.max(size.x, size.y, size.z));
      model.rotation.y = Math.PI;
      model.traverse(c => { if ((c as THREE.Mesh).isMesh) { c.castShadow = true; c.receiveShadow = true; } });
      this.mesh.add(model);
    }, undefined, () => this.createFallback());
  }

  private createFallback() {
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.4, 2.2, 8), new THREE.MeshStandardMaterial({ color: 0x2244aa, metalness: 0.9, roughness: 0.2 }));
    body.rotation.x = Math.PI / 2;
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.6), new THREE.MeshStandardMaterial({ color: 0x113388, emissive: 0x112244, emissiveIntensity: 0.3 }));
    wing.position.set(-0.7, 0, 0.3); wing.rotation.z = 0.2;
    const wing2 = wing.clone(); wing2.position.x = 0.7; wing2.rotation.z = -0.2;
    this.mesh.add(body, wing, wing2);
  }

  update(input: InputState, dt: number) {
    if (input.forward) this.speed = Math.min(this.speed + this.accel, this.maxSpeed);
    else if (input.backward) this.speed = Math.max(this.speed - this.accel * 1.5, 0);
    else this.speed *= this.drag;

    //  Map mouse to world bounds
    this.targetPos.x = input.targetX * 6;
    this.targetPos.y = input.targetY * 4;
    this.targetPos.z = this.mesh.position.z;

    //  Smooth but responsive interpolation (increased factor for precision)
    const smoothFactor = 0.18 + dt * 2; // Frame-independent smoothing
    this.mesh.position.x = THREE.MathUtils.lerp(this.mesh.position.x, this.targetPos.x, smoothFactor);
    this.mesh.position.y = THREE.MathUtils.lerp(this.mesh.position.y, this.targetPos.y, smoothFactor);
    this.mesh.position.z -= this.speed;

    // Banking based on lateral velocity
    const dx = this.targetPos.x - this.mesh.position.x;
    this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, -dx * 0.6, 0.12);
    this.mesh.rotation.x = THREE.MathUtils.lerp(this.mesh.rotation.x, (input.targetY - this.mesh.position.y/4) * 0.3, 0.1);
  }
}