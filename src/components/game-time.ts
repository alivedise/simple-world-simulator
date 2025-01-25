import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { TimeSystem, TimeState } from '../systems/time-system';
import { GameLoop } from '../systems/game-loop';

@customElement('game-time')
export class GameTimeElement extends LitElement {
  @state()
  private timeState: TimeState;

  private unsubscribe?: () => void;

  static styles = css`
    :host {
      display: block;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: 'Arial', sans-serif;
    }

    .time-controls {
      margin-top: 10px;
      display: flex;
      gap: 5px;
    }

    button {
      background-color: #4CAF50;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
    }

    button:hover {
      background-color: #45a049;
    }

    .time-display {
      display: grid;
      grid-template-columns: auto auto;
      gap: 5px 10px;
    }

    .label {
      font-weight: bold;
    }
  `;

  constructor() {
    super();
    this.timeState = TimeSystem.getInstance().getState();
  }

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = TimeSystem.getInstance().subscribe(state => {
      this.timeState = state;
    });
    GameLoop.getInstance().start();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  private formatTime(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.floor((hours % 1) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  private setTimeScale(scale: number) {
    TimeSystem.getInstance().setTimeScale(scale);
  }

  render() {
    return html`
      <div class="time-display">
        <span class="label">年份:</span>
        <span>${this.timeState.year}</span>
        
        <span class="label">月份:</span>
        <span>${this.timeState.month}</span>
        
        <span class="label">日期:</span>
        <span>${this.timeState.day}</span>
        
        <span class="label">時間:</span>
        <span>${this.formatTime(this.timeState.dayTime)}</span>
        
        <span class="label">時間流速:</span>
        <span>${this.timeState.timeScale}x</span>
      </div>

      <div class="time-controls">
        <button @click=${() => this.setTimeScale(0)}>暫停</button>
        <button @click=${() => this.setTimeScale(1)}>1x</button>
        <button @click=${() => this.setTimeScale(2)}>2x</button>
        <button @click=${() => this.setTimeScale(5)}>5x</button>
        <button @click=${() => this.setTimeScale(10)}>10x</button>
      </div>
    `;
  }
} 