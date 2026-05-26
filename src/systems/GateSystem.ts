import * as THREE from 'three';

const COLORS = [new THREE.Color('#ff3333'), new THREE.Color('#3399ff'), new THREE.Color('#33ff33')];
const NAMES = ['RED', 'BLUE', 'GREEN'];
const GATE_RADIUS = 1.0;
const PLANE_DIST = 35;
const CHECK_DIST = 3.0;

interface GateCircle {
  mesh: THREE.Group;
  color: THREE.Color;
  name: string;
  isTarget: boolean;
  passed: boolean;
}

export class GateSystem {
  private planes: { group: THREE.Group; circles: GateCircle[]; scored: boolean; missed: boolean }[] = [];
  private scene: THREE.Group;
  public score = 0;
  public pattern: string[] = [];
  public patternIdx = 0;
  private spawnZ = -30;

  constructor(scene: THREE.Group) {
    this.scene = scene;
    for (let i = 0; i < 4; i++) this.spawnPlane();
    this.updateActivePattern(); // Set initial pattern
  }

  private spawnPlane() {
    const planeGroup = new THREE.Group();
    const circles: GateCircle[] = [];

    planeGroup.add(new THREE.Mesh(
      new THREE.PlaneGeometry(12, 8),
      new THREE.MeshBasicMaterial({ color: 0x0a112a, transparent: true, opacity: 0.08, side: THREE.DoubleSide })
    ));

    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < 3; i++) {
      let pos: THREE.Vector3;
      let attempts = 0;
      do {
        pos = new THREE.Vector3(THREE.MathUtils.randFloat(-4, 4), THREE.MathUtils.randFloat(-2.5, 2.5), 0);
        attempts++;
      } while (attempts < 20 && positions.some(p => p.distanceTo(pos) < GATE_RADIUS * 3));
      positions.push(pos);
    }

    const targetIdx = Math.floor(Math.random() * positions.length);
    positions.forEach((pos, i) => {
      const isTarget = (i === targetIdx);
      const colorIdx = isTarget ? Math.floor(Math.random() * 3) : (targetIdx + 1 + i) % 3;
      const circle = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: 0x11111a, emissive: COLORS[colorIdx], emissiveIntensity: 0.4, metalness: 0.8, roughness: 0.2 });
      circle.add(new THREE.Mesh(new THREE.TorusGeometry(GATE_RADIUS, 0.08, 12, 32), mat));
      circle.add(new THREE.Mesh(new THREE.TorusGeometry(GATE_RADIUS + 0.04, 0.03, 12, 32), new THREE.MeshBasicMaterial({ color: COLORS[colorIdx], transparent: true, opacity: 0.7 })));
      circle.position.copy(pos);
      planeGroup.add(circle);
      circles.push({ mesh: circle, color: COLORS[colorIdx], name: NAMES[colorIdx], isTarget, passed: false });
    });

    planeGroup.position.set(0, 0, this.spawnZ);
    this.scene.add(planeGroup);
    this.planes.push({ group: planeGroup, circles, scored: false, missed: false });
    this.spawnZ -= PLANE_DIST;
  }

  //  Dynamically fetch pattern from the closest unpassed plane
  private updateActivePattern() {
    const active = this.planes.find(p => !p.scored && !p.missed);
    if (active) {
      const target = active.circles.find(c => c.isTarget);
      if (target) this.pattern = [target.name];
    }
  }

  update(shipZ: number, shipPos: THREE.Vector3) {
    if (this.spawnZ > shipZ - 150) this.spawnPlane();

    this.planes = this.planes.filter(plane => {
      // Recycle
      if (plane.group.position.z > shipZ + 25) {
        this.scene.remove(plane.group);
        plane.group.traverse(c => {
          if (c instanceof THREE.Mesh) {
            c.geometry?.dispose();
            const mat = c.material;
            if (Array.isArray(mat)) mat.forEach(m => m.dispose());
            else mat?.dispose();
          }
        });
        return false;
      }

      // Collision Check
      if (!plane.scored && !plane.missed && shipZ < plane.group.position.z && shipZ > plane.group.position.z - CHECK_DIST) {
        plane.circles.forEach(circle => {
          if (!circle.passed) {
            const dx = shipPos.x - (plane.group.position.x + circle.mesh.position.x);
            const dy = shipPos.y - (plane.group.position.y + circle.mesh.position.y);
            if (Math.sqrt(dx * dx + dy * dy) < GATE_RADIUS + 0.5) {
              circle.passed = true;
              plane.scored = true;

              if (circle.isTarget) {
                this.score += 100;
                circle.mesh.children.forEach(c => {
                  if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshStandardMaterial) {
                    c.material.emissive.setHex(0x33ff33); c.material.emissiveIntensity = 1.5;
                  }
                });
              } else {
                this.score = Math.max(0, this.score - 50);
                circle.mesh.children.forEach(c => {
                  if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshStandardMaterial) {
                    c.material.emissive.setHex(0xff0000); c.material.emissiveIntensity = 1.5;
                  }
                });
              }
              setTimeout(() => {
                circle.mesh.children.forEach(c => {
                  if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshStandardMaterial) {
                    c.material.emissive.copy(circle.color); c.material.emissiveIntensity = 0.4;
                  }
                });
              }, 300);

              //  Switch pattern immediately after hit/miss
              this.updateActivePattern();
            }
          }
        });

        // Mark as missed if ship passed the plane without hitting anything
        if (!plane.scored && shipZ < plane.group.position.z - CHECK_DIST) {
          plane.missed = true;
          this.score = Math.max(0, this.score - 25); // Minor penalty for skipping
          this.updateActivePattern();
        }
      }
      return true;
    });
  }
}