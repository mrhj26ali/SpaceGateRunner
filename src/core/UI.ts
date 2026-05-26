export class UI {
  private el: HTMLDivElement;
  constructor() {
    this.el = document.createElement('div');
    Object.assign(this.el.style, {
      position: 'fixed', top: '20px', left: '20px', color: '#e0e0e0',
      fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.5',
      pointerEvents: 'none', zIndex: '100', userSelect: 'none'
    });
    document.body.appendChild(this.el);
    document.body.style.cursor = 'none';
    window.addEventListener('blur', () => document.body.style.cursor = 'default');
    window.addEventListener('focus', () => document.body.style.cursor = 'none');
  }

  update(data: { score: number; speed: number; pattern: string[]; idx: number; cam: string }) {
    const seq = data.pattern.map((c, i) => {
      const col = c === 'RED' ? '#ff3333' : c === 'BLUE' ? '#3399ff' : '#33ff33';
      const active = i === data.idx ? 'font-weight:bold; text-shadow: 0 0 8px ' + col : 'opacity:0.3';
      return `<span style="color:${col}; ${active}">●</span>`;
    }).join(' → ');

    const speedDisplay = Math.floor(data.speed * 1000);
    const speedPercent = Math.min((data.speed / 0.6) * 100, 100);

    this.el.innerHTML = `
      <div style="background:rgba(0,10,30,0.75); padding:12px; border-radius:8px; border:1px solid rgba(0,255,255,0.3); margin-bottom:10px; backdrop-filter: blur(4px);">
        <div style="font-size:16px; color:#00ffff; margin-bottom:4px;">🚀 SPACE GATE RUNNER</div>
        <div>Score: <span style="color:#ffcc00; font-weight:bold">${data.score}</span></div>
        <div style="margin-top:6px;">Speed: <span style="color:#00ffcc; font-weight:bold">${speedDisplay}</span> <span style="font-size:11px; opacity:0.7">KM/H</span></div>
        <div style="width:100%; height:4px; background:#112; border-radius:2px; margin-top:4px; overflow:hidden;">
          <div style="width:${speedPercent}%; height:100%; background:linear-gradient(90deg, #00ffcc, #0088ff); border-radius:2px; transition: width 0.1s;"></div>
        </div>
      </div>

      <div style="background:rgba(0,10,30,0.75); padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.15); backdrop-filter: blur(4px);">
        <div style="color:#aaa; font-weight:bold; margin-bottom:4px; font-size:12px; letter-spacing:1px;">🎮 CONTROLS</div>
        <div style="display:grid; grid-template-columns: auto 1fr; gap:3px 10px; font-size:12px; opacity:0.9;">
          <span style="color:#00ffff">W / ↑</span><span>Accelerate</span>
          <span style="color:#00ffff">S / ↓</span><span>Brake</span>
          <span style="color:#00ffff">MOUSE</span><span>Steer XY Plane</span>
          <span style="color:#00ffff">C</span><span>Switch Camera</span>
        </div>
      </div>

      <div style="margin-top:10px; background:rgba(0,10,30,0.6); padding:10px; border-radius:8px; border:1px solid rgba(0,255,255,0.2); backdrop-filter: blur(4px);">
        <div style="color:#00ffff; font-size:12px;">🎯 Target Gate: ${seq}</div>
        <div style="color:#888; font-size:11px; margin-top:4px;">📷 View: ${data.cam}</div>
      </div>
    `;
  }
}