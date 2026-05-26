export interface InputState {
  forward: boolean;
  backward: boolean;
  toggleCamera: boolean;
  targetX: number;
  targetY: number;
}

export class InputSystem {
  private state: InputState = {
    forward: false, backward: false, toggleCamera: false,
    targetX: 0, targetY: 0
  };

  init() {
    window.addEventListener('keydown', e => this.onKey(e, true));
    window.addEventListener('keyup', e => this.onKey(e, false));
    window.addEventListener('mousemove', e => this.onMouse(e));
  }

  private onKey(e: KeyboardEvent, down: boolean) {
    if (['KeyW', 'ArrowUp'].includes(e.code)) this.state.forward = down;
    if (['KeyS', 'ArrowDown'].includes(e.code)) this.state.backward = down;
    if (e.code === 'KeyC' && down) this.state.toggleCamera = true;
    if (!down && e.code === 'KeyC') this.state.toggleCamera = false;
  }

  private onMouse(e: MouseEvent) {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    // Tighter deadzone for precise gate navigation
    this.state.targetX = Math.abs(x) > 0.02 ? x : this.state.targetX;
    this.state.targetY = Math.abs(y) > 0.02 ? y : this.state.targetY;
  }

  getState(): Readonly<InputState> {
    const s = { ...this.state };
    this.state.toggleCamera = false;
    return s;
  }
}