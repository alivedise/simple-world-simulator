import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { MapGenerator } from '../generators/map-generator';
import { WorldMap, TerrainType } from '../types/map.types';
import { TerrainSystem } from '../systems/terrain-system';
import { GameTimeElement } from './game-time';
import { EntityManager } from '../systems/entity-manager';
import { BasicEntity } from '../entities/basic-entity';
import { Entity } from '../types/entity.types';
import { ResourceManager } from '../systems/resource-manager';

@customElement('world-map')
export class WorldMapElement extends LitElement {
  @property({ type: Object })
  private worldMap?: WorldMap;

  @state()
  private entities: Entity[] = [];

  private entityManager = EntityManager.getInstance();
  private resourceManager = ResourceManager.getInstance();

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

    .controls {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 1;
      display: flex;
      gap: 10px;
    }

    .time-display {
      position: absolute;
      top: 20px;
      left: 20px;
      z-index: 1;
    }

    .generate-btn {
      padding: 10px 20px;
      font-size: 16px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .generate-btn:hover {
      background-color: #45a049;
    }

    .map-grid {
      display: grid;
      gap: 1px;
      background-color: #333;
      padding: 1px;
      margin-top: 80px;
      position: relative;
    }

    .map-tile {
      width: 100%;
      height: 100%;
      min-width: 20px;
      min-height: 20px;
      position: relative;
    }

    .entity {
      position: absolute;
      width: 10px;
      height: 10px;
      background-color: #ff4444;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: all 0.3s ease;
      pointer-events: none;
      z-index: 2;
    }

    .resource {
      position: absolute;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
    }

    .resource.FOOD { background-color: #90EE90; }
    .resource.WATER { background-color: #87CEEB; }
    .resource.MINERAL { background-color: #B8860B; }
    .resource.WOOD { background-color: #8B4513; }
    .resource.HERB { background-color: #98FB98; }
  `;

  private getTerrainColor(type: TerrainType): string {
    return TerrainSystem.getTerrainColor(type);
  }

  private spawnEntities() {
    // 清除現有實體
    this.entities.forEach(entity => {
      this.entityManager.removeEntity(entity.id);
    });

    // 隨機生成10個實體
    const newEntities: Entity[] = [];
    for (let i = 0; i < 10; i++) {
      const entity = new BasicEntity(
        {
          x: Math.floor(Math.random() * (this.worldMap?.width || 30)),
          y: Math.floor(Math.random() * (this.worldMap?.height || 20))
        },
        'basic',
        1
      );
      this.entityManager.addEntity(entity);
      newEntities.push(entity);
    }
    this.entities = newEntities;
  }

  private renderEntities() {
    if (!this.worldMap) return '';
    
    const tileWidth = 100 / this.worldMap.width;
    const tileHeight = 100 / this.worldMap.height;

    return this.entities.map(entity => {
      const left = `${(entity.position.x + 0.5) * tileWidth}%`;
      const top = `${(entity.position.y + 0.5) * tileHeight}%`;
      
      return html`
        <div class="entity" 
             style="left: ${left}; top: ${top};"
             title="ID: ${entity.id}
位置: (${entity.position.x}, ${entity.position.y})
生命: ${entity.vitalSigns.health}
能量: ${entity.vitalSigns.energy}
飢餓: ${entity.vitalSigns.hunger}"></div>
      `;
    });
  }

  private renderResources() {
    if (!this.worldMap) return '';
    
    const tileWidth = 100 / this.worldMap.width;
    const tileHeight = 100 / this.worldMap.height;
    
    return this.resourceManager.getAllResources().map(resource => {
      const left = `${(resource.position.x + 0.5) * tileWidth}%`;
      const top = `${(resource.position.y + 0.5) * tileHeight}%`;
      
      return html`
        <div class="resource ${resource.type}"
             style="left: ${left}; top: ${top};"
             title="${resource.type}
數量: ${Math.floor(resource.amount)}/${resource.maxAmount}"></div>
      `;
    });
  }

  private renderMap() {
    if (!this.worldMap) return html``;

    return html`
      <div class="map-grid" style="
        grid-template-columns: repeat(${this.worldMap.width}, 1fr);
        grid-template-rows: repeat(${this.worldMap.height}, 1fr);
      ">
        ${this.worldMap.tiles.flat().map(tile => html`
          <div class="map-tile" 
               style="background-color: ${TerrainSystem.getTerrainColor(tile.terrain.type)}"
               title="地形: ${tile.terrain.type}"></div>
        `)}
        ${this.renderResources()}
        ${this.renderEntities()}
      </div>
    `;
  }

  render() {
    return html`
      <div class="map-container">
        <game-time class="time-display"></game-time>
        <div class="controls">
          <button class="generate-btn" @click=${this.regenerateMap}>
            重新生成地圖
          </button>
          <button class="generate-btn" @click=${this.spawnEntities}>
            生成生物
          </button>
        </div>
        ${this.renderMap()}
      </div>
    `;
  }

  private regenerateMap() {
    const mapGenerator = new MapGenerator({
      width: 30,
      height: 20
    });
    this.worldMap = mapGenerator.generate();
    this.resourceManager.generateResources(this.worldMap);
    this.spawnEntities();
  }

  connectedCallback() {
    super.connectedCallback();
    this.initializeMap();
    
    // 訂閱實體更新
    requestAnimationFrame(this.updateEntities.bind(this));
  }

  private updateEntities() {
    this.entities = this.entityManager.getAllEntities();
    this.requestUpdate();
    requestAnimationFrame(this.updateEntities.bind(this));
  }

  private initializeMap() {
    this.regenerateMap();
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