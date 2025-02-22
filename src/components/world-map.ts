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
import './resource-hex';
import './entity-creature';
import { SpeciesManager } from '../systems/species-manager';
import './fps-counter';
import { GameLoop } from '../systems/game-loop';

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

  private gameLoop = GameLoop.getInstance();

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
    const speciesManager = SpeciesManager.getInstance();
    const availableSpecies = speciesManager.getAllSpecies();
    
    // 清除現有實體
    this.entities.forEach(entity => {
      this.entityManager.removeEntity(entity.id);
    });

    // 為每種物種分配不同的數量
    const speciesDistribution = new Map<string, number>([
      ['deer', 65],    // 草食性動物較多
      ['raccoon', 35]  // 雜食性動物較少
    ]);

    // 生成實體
    const newEntities = availableSpecies.flatMap(species => {
      const count = speciesDistribution.get(species.id) || 0;
      return Array.from({ length: count }, () => {
        // 隨機生成群組位置作為中心點
        const centerX = Math.floor(Math.random() * (this.worldMap?.width || 30));
        const centerY = Math.floor(Math.random() * (this.worldMap?.height || 20));
        
        // 在中心點周圍隨機分散
        const scatter = 3; // 分散範圍
        const x = Math.max(0, Math.min(this.worldMap?.width || 30,
          centerX + (Math.random() - 0.5) * scatter * 2));
        const y = Math.max(0, Math.min(this.worldMap?.height || 20,
          centerY + (Math.random() - 0.5) * scatter * 2));

        const entity = new BasicEntity(
          {
            x: Math.floor(x),
            y: Math.floor(y)
          },
          species.id
        );
        this.entityManager.addEntity(entity);
        return entity;
      });
    });

    this.entities = newEntities;

    // 確保遊戲循環在實體生成後運行
    if (!this.gameLoop.isGameRunning()) {
      console.log('Restarting game loop after entity spawn...');
      this.gameLoop.start();
    }
  }

  private renderEntities() {
    if (!this.worldMap) return '';
    
    const tileWidth = 100 / this.worldMap.width;
    const tileHeight = 100 / this.worldMap.height;
    
    return this.entities.map(entity => {
      const left = `${(entity.position.x + 0.5) * tileWidth}%`;
      const top = `${(entity.position.y + 0.5) * tileHeight}%`;
      
      return html`
        <entity-creature
          .species=${entity.species}
          .health=${entity.vitalSigns.health}
          .energy=${entity.vitalSigns.energy}
          .hunger=${entity.vitalSigns.hunger}
          .status=${entity.vitalSigns.getStatus()}
          style="left: ${left}; top: ${top};"
        ></entity-creature>
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
        <resource-hex
          .type=${resource.type}
          .amount=${resource.amount}
          .maxAmount=${resource.maxAmount}
          style="left: ${left}; top: ${top};"
          title="${resource.type}
數量: ${Math.floor(resource.amount)}/${resource.maxAmount}
恢復率: ${resource.regenerationRate}/秒"
        ></resource-hex>
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
        <fps-counter></fps-counter>
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

    // 確保遊戲循環在地圖重新生成後運行
    if (!this.gameLoop.isGameRunning()) {
      console.log('Restarting game loop after map regeneration...');
      this.gameLoop.start();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    console.log('WorldMap connected, starting game loop...');
    this.gameLoop.start();
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

  disconnectedCallback() {
    super.disconnectedCallback();
    console.log('WorldMap disconnected, stopping game loop...');
    this.gameLoop.stop();
  }
} 