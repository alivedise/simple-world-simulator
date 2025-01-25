import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { MapGenerator } from '../generators/map-generator';
import { WorldMap, TerrainType } from '../types/map.types';

@customElement('world-map')
export class WorldMapElement extends LitElement {
  @state()
  private worldMap?: WorldMap;

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
      padding: 20px;
      box-sizing: border-box;
    }

    .environment-info {
      position: absolute;
      top: 20px;
      left: 20px;
      background-color: rgba(255, 255, 255, 0.8);
      padding: 10px;
      border-radius: 5px;
      font-family: Arial, sans-serif;
    }

    .map-grid {
      display: grid;
      gap: 1px;
      background-color: #333;
      padding: 1px;
    }

    .map-tile {
      width: 100%;
      height: 100%;
      min-width: 20px;
      min-height: 20px;
    }
  `;

  private getTerrainColor(type: TerrainType): string {
    const colors: Record<TerrainType, string> = {
      [TerrainType.OCEAN]: '#0077be',
      [TerrainType.DESERT]: '#ffd700',
      [TerrainType.GRASSLAND]: '#90ee90',
      [TerrainType.FOREST]: '#228b22',
      [TerrainType.MOUNTAIN]: '#808080'
    };
    return colors[type];
  }

  private renderMap() {
    if (!this.worldMap) return html``;

    return html`
      <div class="map-grid" style="
        grid-template-columns: repeat(${this.worldMap.width}, 1fr);
        grid-template-rows: repeat(${this.worldMap.height}, 1fr);
      ">
        ${this.worldMap.tiles.flat().map(tile => html`
          <div class="map-tile" style="background-color: ${this.getTerrainColor(tile.terrain.type)}"
               title="地形: ${tile.terrain.type}
溫度: ${tile.terrain.temperature}°C
濕度: ${tile.terrain.humidity}%
肥沃度: ${tile.terrain.fertility}%
海拔: ${tile.terrain.elevation}m"></div>
        `)}
      </div>
    `;
  }

  render() {
    return html`
      <div class="map-container">
        <div class="environment-info">
          時間: ${this.environmentFactors.timeOfDay}:00
        </div>
        ${this.renderMap()}
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.initializeMap();
    this.startSimulation();
  }

  private initializeMap() {
    const mapGenerator = new MapGenerator({
      width: 30,
      height: 20
    });
    this.worldMap = mapGenerator.generate();
  }

  private startSimulation() {
    setInterval(() => {
      this.updateEnvironment();
    }, 1000);
  }

  private updateEnvironment() {
    this.environmentFactors = {
      ...this.environmentFactors,
      timeOfDay: (this.environmentFactors.timeOfDay + 1) % 24,
    };
  }
} 