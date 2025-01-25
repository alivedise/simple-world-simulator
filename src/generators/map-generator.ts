import { TerrainType, TerrainProperties, MapTile, WorldMap, MapGeneratorConfig } from '../types/map.types';
import { TerrainSystem } from '../systems/terrain-system';

export class MapGenerator {
  private config: Required<MapGeneratorConfig>;
  private readonly defaultConfig = {
    seed: Date.now(),
    oceanRatio: 0.3,
    mountainRatio: 0.1
  };

  constructor(config: MapGeneratorConfig) {
    this.config = {
      ...this.defaultConfig,
      ...config
    };
  }

  private generateNoise(x: number, y: number): number {
    // 簡單的偽隨機數生成，之後可以替換成更好的噪聲算法（如柏林噪聲）
    const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
    return value - Math.floor(value);
  }

  private generateTerrainProperties(x: number, y: number): TerrainProperties {
    const elevation = this.generateNoise(x, y);
    const moisture = this.generateNoise(x + 1000, y + 1000);
    const temperature = this.generateNoise(x + 2000, y + 2000);

    const terrainType = TerrainSystem.determineTerrainType(elevation, moisture, temperature);
    const baseProperties = TerrainSystem.getTerrainProperties(terrainType);
    
    return TerrainSystem.modifyTerrainProperties(
      baseProperties,
      elevation,
      moisture,
      temperature
    );
  }

  public generate(): WorldMap {
    const tiles: MapTile[][] = [];

    for (let y = 0; y < this.config.height; y++) {
      const row: MapTile[] = [];
      for (let x = 0; x < this.config.width; x++) {
        row.push({
          x,
          y,
          terrain: this.generateTerrainProperties(x, y)
        });
      }
      tiles.push(row);
    }

    return {
      width: this.config.width,
      height: this.config.height,
      tiles
    };
  }
} 