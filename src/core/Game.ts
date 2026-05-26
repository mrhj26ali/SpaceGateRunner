import * as THREE from 'three';
import { GameScene } from './GameScene';
import { InputSystem } from './InputSystem';
import { UI } from './UI';
import { Spaceship } from '../entities/Spaceship';
import { LightingSystem } from '../systems/LightingSystem';
import { GateSystem } from '../systems/GateSystem';
import { StarfieldSystem } from '../systems/StarfieldSystem'; 
type CamMode = 'follow' | 'zoom' | 'orbit';

export class Game {
  private scene: GameScene;
  private input: InputSystem;
  private ui: UI;
  private ship: Spaceship;
  private lights: LightingSystem;
  private gates: GateSystem;
  private stars: StarfieldSystem;
  private cam: CamMode = 'follow';
  private orbit = 0;
  private last = 0;
  private running = false;

  constructor() {
    this.scene = new GameScene();
    this.input = new InputSystem();
    this.ui = new UI();
    this.lights = new LightingSystem(this.scene.scene);
    this.stars = new StarfieldSystem(this.scene.world);
    this.ship = new Spaceship(this.scene.world);
    this.gates = new GateSystem(this.scene.world);
    this.input.init();
  }

  async start(): Promise<void> {
    this.running = true;
    this.last = performance.now();
    this.animate(this.last); 
    return new Promise(resolve => setTimeout(resolve, 100));
  }

  private animate = (t: number) => {
    if (!this.running) return;
    requestAnimationFrame(this.animate);
    const dt = Math.min((t - this.last) / 1000, 0.1);
    this.last = t;

    const state = this.input.getState();
    if (state.toggleCamera) this.cycleCam();

    this.ship.update(state, dt);
    this.gates.update(this.ship.mesh.position.z, this.ship.mesh.position);
    this.stars.update(this.ship.mesh.position.z, this.ship.speed, dt); 
    this.updateCam(dt);

    this.ui.update({
      score: this.gates.score,
      speed: this.ship.speed,
      pattern: this.gates.pattern,
      idx: this.gates.patternIdx,
      cam: this.cam.charAt(0).toUpperCase() + this.cam.slice(1)
    });

    this.scene.renderer.render(this.scene.scene, this.scene.camera);
  };

  private cycleCam() {
    const modes: CamMode[] = ['follow', 'zoom', 'orbit'];
    this.cam = modes[(modes.indexOf(this.cam) + 1) % 3];
  }

  private updateCam(dt: number) {
    const p = this.ship.mesh.position;
    let target = new THREE.Vector3();
    let look = new THREE.Vector3(p.x, p.y + 0.5, p.z - 8);

    if (this.cam === 'follow') target.set(p.x, p.y + 3, p.z + 10);
    else if (this.cam === 'zoom') { target.set(p.x, p.y + 1.5, p.z + 5); look.set(p.x, p.y, p.z - 4); }
    else { this.orbit += dt * 0.5; target.set(p.x + Math.cos(this.orbit) * 14, p.y + 8, p.z + Math.sin(this.orbit) * 14); look.copy(p); }

    this.scene.camera.position.lerp(target, 0.06);
    this.scene.camera.lookAt(look);
  }
}