import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('world-map')
export class WorldMap extends LitElement {
  @state()
  private creatures: any[] = [];

  @state()
  private environmentFactors = {
    temperature: 25,
    humidity: 60,
    timeOfDay: 12,
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
      background-color: #8ab4f8;
    }

    .map-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
  `;

  render() {
    return html`
      <div class="map-container">
        <div class="environment-info">
          溫度: ${this.environmentFactors.temperature}°C
          濕度: ${this.environmentFactors.humidity}%
          時間: ${this.environmentFactors.timeOfDay}:00
        </div>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.startSimulation();
  }

  private startSimulation() {
    setInterval(() => {
      this.updateEnvironment();
      this.updateCreatures();
    }, 1000);
  }

  private updateEnvironment() {
    // 更新環境因素
    this.environmentFactors = {
      ...this.environmentFactors,
      timeOfDay: (this.environmentFactors.timeOfDay + 1) % 24,
      temperature: this.calculateTemperature(),
    };
  }

  private calculateTemperature() {
    // 根據時間計算溫度
    const baseTemp = 25;
    const timeEffect = Math.sin((this.environmentFactors.timeOfDay / 24) * 2 * Math.PI);
    return Math.round(baseTemp + timeEffect * 5);
  }

  private updateCreatures() {
    // 更新生物狀態
    this.creatures = this.creatures.map(creature => ({
      ...creature,
      // 在這裡添加生物行為邏輯
    }));
  }
} 