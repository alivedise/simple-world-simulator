import { TerrainType, TerrainProperties } from '../types/map.types';

export class TerrainSystem {
  private static readonly terrainDefinitions: Record<TerrainType, TerrainProperties> = {
    [TerrainType.DEEP_OCEAN]: {
      type: TerrainType.DEEP_OCEAN,
      temperature: 10,
      humidity: 100,
      fertility: 20,
      elevation: -1000,
      resources: ['魚群', '珊瑚', '海藻'],
      habitability: 0,
      waterLevel: 100,
      vegetationDensity: 10
    },
    [TerrainType.OCEAN]: {
      type: TerrainType.OCEAN,
      temperature: 15,
      humidity: 95,
      fertility: 30,
      elevation: -200,
      resources: ['魚群', '貝類'],
      habitability: 0,
      waterLevel: 90,
      vegetationDensity: 20
    },
    [TerrainType.BEACH]: {
      type: TerrainType.BEACH,
      temperature: 25,
      humidity: 70,
      fertility: 40,
      elevation: 0,
      resources: ['貝殼', '椰子'],
      habitability: 60,
      waterLevel: 30,
      vegetationDensity: 30
    },
    [TerrainType.DESERT]: {
      type: TerrainType.DESERT,
      temperature: 40,
      humidity: 10,
      fertility: 5,
      elevation: 400,
      resources: ['礦物', '仙人掌'],
      habitability: 20,
      waterLevel: 5,
      vegetationDensity: 5
    },
    [TerrainType.SAVANNA]: {
      type: TerrainType.SAVANNA,
      temperature: 30,
      humidity: 40,
      fertility: 50,
      elevation: 500,
      resources: ['草食動物', '藥草'],
      habitability: 70,
      waterLevel: 30,
      vegetationDensity: 50
    },
    [TerrainType.GRASSLAND]: {
      type: TerrainType.GRASSLAND,
      temperature: 25,
      humidity: 60,
      fertility: 70,
      elevation: 300,
      resources: ['草食動物', '農作物'],
      habitability: 90,
      waterLevel: 50,
      vegetationDensity: 70
    },
    [TerrainType.FOREST]: {
      type: TerrainType.FOREST,
      temperature: 22,
      humidity: 80,
      fertility: 90,
      elevation: 600,
      resources: ['木材', '野果', '藥草'],
      habitability: 80,
      waterLevel: 60,
      vegetationDensity: 90
    },
    [TerrainType.RAINFOREST]: {
      type: TerrainType.RAINFOREST,
      temperature: 28,
      humidity: 90,
      fertility: 100,
      elevation: 400,
      resources: ['珍稀植物', '熱帶水果'],
      habitability: 60,
      waterLevel: 80,
      vegetationDensity: 100
    },
    [TerrainType.MOUNTAIN]: {
      type: TerrainType.MOUNTAIN,
      temperature: 10,
      humidity: 40,
      fertility: 20,
      elevation: 2000,
      resources: ['礦物', '岩石'],
      habitability: 30,
      waterLevel: 20,
      vegetationDensity: 30
    },
    [TerrainType.SNOW_MOUNTAIN]: {
      type: TerrainType.SNOW_MOUNTAIN,
      temperature: -10,
      humidity: 30,
      fertility: 10,
      elevation: 3000,
      resources: ['冰', '珍稀礦物'],
      habitability: 10,
      waterLevel: 10,
      vegetationDensity: 5
    },
    [TerrainType.TUNDRA]: {
      type: TerrainType.TUNDRA,
      temperature: -5,
      humidity: 20,
      fertility: 15,
      elevation: 100,
      resources: ['苔蘚', '野生動物'],
      habitability: 20,
      waterLevel: 40,
      vegetationDensity: 20
    },
    [TerrainType.SWAMP]: {
      type: TerrainType.SWAMP,
      temperature: 23,
      humidity: 95,
      fertility: 80,
      elevation: 50,
      resources: ['藥草', '沼氣'],
      habitability: 30,
      waterLevel: 85,
      vegetationDensity: 80
    },
    [TerrainType.VOLCANO]: {
      type: TerrainType.VOLCANO,
      temperature: 45,
      humidity: 10,
      fertility: 60,
      elevation: 1500,
      resources: ['火山岩', '硫磺'],
      habitability: 0,
      waterLevel: 0,
      vegetationDensity: 0
    }
  };

  public static getTerrainProperties(type: TerrainType): TerrainProperties {
    return { ...this.terrainDefinitions[type] };
  }

  public static determineTerrainType(elevation: number, moisture: number, temperature: number): TerrainType {
    // 海拔決定基本地形
    if (elevation < 0.2) {
      if (elevation < 0.1) return TerrainType.DEEP_OCEAN;
      return TerrainType.OCEAN;
    }
    if (elevation < 0.22) return TerrainType.BEACH;
    
    // 高海拔地形
    if (elevation > 0.8) {
      if (temperature < 0.3) return TerrainType.SNOW_MOUNTAIN;
      if (temperature > 0.8) return TerrainType.VOLCANO;
      return TerrainType.MOUNTAIN;
    }

    // 根據溫度和濕度決定地形
    if (temperature < 0.2) return TerrainType.TUNDRA;
    if (moisture < 0.2) return TerrainType.DESERT;
    if (moisture < 0.4) return TerrainType.SAVANNA;
    if (moisture > 0.8 && temperature > 0.6) return TerrainType.RAINFOREST;
    if (moisture > 0.8 && temperature < 0.6) return TerrainType.SWAMP;
    if (moisture > 0.6) return TerrainType.FOREST;
    
    return TerrainType.GRASSLAND;
  }

  public static getTerrainColor(type: TerrainType): string {
    const colors: Record<TerrainType, string> = {
      [TerrainType.DEEP_OCEAN]: '#000080',
      [TerrainType.OCEAN]: '#0077be',
      [TerrainType.BEACH]: '#ffd700',
      [TerrainType.DESERT]: '#f4a460',
      [TerrainType.SAVANNA]: '#deb887',
      [TerrainType.GRASSLAND]: '#90ee90',
      [TerrainType.FOREST]: '#228b22',
      [TerrainType.RAINFOREST]: '#004d00',
      [TerrainType.MOUNTAIN]: '#808080',
      [TerrainType.SNOW_MOUNTAIN]: '#fffafa',
      [TerrainType.TUNDRA]: '#e0ffff',
      [TerrainType.SWAMP]: '#2f4f4f',
      [TerrainType.VOLCANO]: '#8b0000'
    };
    return colors[type];
  }

  public static modifyTerrainProperties(
    baseProperties: TerrainProperties,
    elevation: number,
    moisture: number,
    temperature: number
  ): TerrainProperties {
    // 根據環境因素調整地形屬性
    const modified = { ...baseProperties };
    
    // 調整溫度
    modified.temperature += Math.round((temperature - 0.5) * 10);
    
    // 調整濕度
    modified.humidity += Math.round((moisture - 0.5) * 20);
    
    // 確保數值在合理範圍內
    modified.temperature = Math.max(-50, Math.min(50, modified.temperature));
    modified.humidity = Math.max(0, Math.min(100, modified.humidity));
    
    return modified;
  }
} 