import * as THREE from 'three';

export class StarfieldSystem {
  private stars: THREE.Points;
  private readonly MIN_Z_OFFSET = 180; // Slightly wider spawn range

  constructor(scene: THREE.Group) {
    const count = 4000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 180;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 120;
      pos[i * 3 + 2] = -Math.random() * this.MIN_Z_OFFSET;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.stars = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xffffff, size: 0.4, transparent: true, opacity: 0.9
    }));
    scene.add(this.stars);
  }

  update(shipZ: number, speed: number, dt: number) {
    // Only move when ship is actually moving
    if (speed < 0.005) return;

    const arr = this.stars.geometry.attributes.position.array as Float32Array;
    const move = speed * dt * 100; // Smooth, frame-independent travel

    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 2] += move;
      //  Recycle when star passes behind camera threshold
      if (arr[i + 2] > shipZ + 20) {
        arr[i + 2] = shipZ - this.MIN_Z_OFFSET;
        arr[i] = (Math.random() - 0.5) * 180;
        arr[i + 1] = (Math.random() - 0.5) * 120;
      }
    }
    this.stars.geometry.attributes.position.needsUpdate = true;
  }
}