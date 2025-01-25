import { TerrainType, TerrainProperties, MapTile, WorldMap, MapGeneratorConfig } from '../types/map.types';

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

  private getTerrainType(elevation: number, moisture: number): TerrainType {
    if (elevation < this.config.oceanRatio) {
      return TerrainType.OCEAN;
    }
    if (elevation > 1 - this.config.mountainRatio) {
      return TerrainType.MOUNTAIN;
    }
    if (moisture < 0.3) {
      return TerrainType.DESERT;
    }
    if (moisture < 0.6) {
      return TerrainType.GRASSLAND;
    }
    return TerrainType.FOREST;
  }

  private generateTerrainProperties(x: number, y: number): TerrainProperties {
    const elevation = this.generateNoise(x, y);
    const moisture = this.generateNoise(x + 1000, y + 1000);
    const type = this.getTerrainType(elevation, moisture);

    const baseProperties: Record<TerrainType, Partial<TerrainProperties>> = {
      [TerrainType.OCEAN]: {
        temperature: 20,
        humidity: 90,
        fertility: 30
      },
      [TerrainType.DESERT]: {
        temperature: 40,
        humidity: 10,
        fertility: 5
      },
      [TerrainType.GRASSLAND]: {
        temperature: 25,
        humidity: 60,
        fertility: 70
      },
      [TerrainType.FOREST]: {
        temperature: 22,
        humidity: 80,
        fertility: 90
      },
      [TerrainType.MOUNTAIN]: {
        temperature: 10,
        humidity: 40,
        fertility: 20
      }
    };

    return {
      type,
      elevation: elevation * 100,
      ...baseProperties[type],
    } as TerrainProperties;
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