import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('fps-counter')
export class FPSCounter extends LitElement {
  @state()
  private fps: number = 0;

  @state()
  private frameTime: number = 0;

  private frames: number = 0;
  private lastTime: number = performance.now();
  private frameTimeHistory: number[] = [];
  private readonly historySize: number = 30; // 保存最近30幀的數據

  static styles = css`
    :host {
      display: block;
      position: fixed;
      bottom: 10px;
      left: 10px;
      background-color: rgba(0, 0, 0, 0.7);
      color: #00ff00;
      padding: 8px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      z-index: 1000;
    }

    .fps-high {
      color: #00ff00;
    }

    .fps-medium {
      color: #ffff00;
    }

    .fps-low {
      color: #ff0000;
    }

    .stats {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
      gap: 10px;
    }

    .label {
      opacity: 0.8;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.startMonitoring();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    cancelAnimationFrame(this.rafId);
  }

  private rafId: number = 0;

  private startMonitoring() {
    const updateStats = () => {
      const currentTime = performance.now();
      const elapsed = currentTime - this.lastTime;
      this.frames++;

      // 每秒更新一次 FPS
      if (elapsed >= 1000) {
        this.fps = Math.round((this.frames * 1000) / elapsed);
        this.frames = 0;
        this.lastTime = currentTime;
      }

      // 計算這一幀的時間
      const frameTime = currentTime - this.lastFrameTime;
      this.frameTimeHistory.push(frameTime);
      if (this.frameTimeHistory.length > this.historySize) {
        this.frameTimeHistory.shift();
      }

      // 計算平均幀時間
      this.frameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / 
                      this.frameTimeHistory.length;

      this.lastFrameTime = currentTime;
      this.requestUpdate();
      this.rafId = requestAnimationFrame(updateStats);
    };

    this.rafId = requestAnimationFrame(updateStats);
  }

  private lastFrameTime: number = performance.now();

  private getFPSClass(fps: number): string {
    if (fps >= 50) return 'fps-high';
    if (fps >= 30) return 'fps-medium';
    return 'fps-low';
  }

  render() {
    return html`
      <div class="stats">
        <div class="stat-row">
          <span class="label">FPS:</span>
          <span class="${this.getFPSClass(this.fps)}">${this.fps}</span>
        </div>
        <div class="stat-row">
          <span class="label">Frame Time:</span>
          <span>${this.frameTime.toFixed(2)}ms</span>
        </div>
      </div>
    `;
  }
} 