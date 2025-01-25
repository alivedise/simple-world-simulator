import { ResourceType, ResourceProperties, ResourceDefinition } from '../types/resource.types';
import { TerrainType } from '../types/map.types';
import { GameLoop } from './game-loop';
import { TimeSystem } from './time-system';
import { Position } from '../types/entity.types';

export class ResourceManager {
  private static instance: ResourceManager;
  private resources: Map<string, ResourceProperties> = new Map();
  
  private resourceDefinitions: Record<ResourceType, ResourceDefinition> = {
    [ResourceType.FOOD]: {
      type: ResourceType.FOOD,
      maxAmount: 100,
      regenerationRate: 0.5,
      validTerrains: [
        TerrainType.GRASSLAND,
        TerrainType.FOREST,
        TerrainType.SAVANNA
      ],
      baseRegenerationTime: 1000
    },
    [ResourceType.WATER]: {
      type: ResourceType.WATER,
      maxAmount: 200,
      regenerationRate: 1,
      validTerrains: [
        TerrainType.OCEAN,
        TerrainType.DEEP_OCEAN,
        TerrainType.SWAMP
      ],
      baseRegenerationTime: 500
    },
    [ResourceType.MINERAL]: {
      type: ResourceType.MINERAL,
      maxAmount: 50,
      regenerationRate: 0.1,
      validTerrains: [
        TerrainType.MOUNTAIN,
        TerrainType.SNOW_MOUNTAIN
      ],
      baseRegenerationTime: 5000
    },
    [ResourceType.WOOD]: {
      type: ResourceType.WOOD,
      maxAmount: 150,
      regenerationRate: 0.3,
      validTerrains: [
        TerrainType.FOREST,
        TerrainType.RAINFOREST
      ],
      baseRegenerationTime: 2000
    },
    [ResourceType.HERB]: {
      type: ResourceType.HERB,
      maxAmount: 30,
      regenerationRate: 0.2,
      validTerrains: [
        TerrainType.FOREST,
        TerrainType.SWAMP,
        TerrainType.RAINFOREST
      ],
      baseRegenerationTime: 3000
    }
  };

  private constructor() {
    GameLoop.getInstance().subscribe((deltaTime: number) => {
      this.update(deltaTime);
    });
  }

  public static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager();
    }
    return ResourceManager.instance;
  }

  public generateResources(worldMap: any): void {
    this.resources.clear();
    
    worldMap.tiles.forEach((row: any[], y: number) => {
      row.forEach((tile: any, x: number) => {
        const terrainType = tile.terrain.type;
        
        // 檢查每種資源是否可以在這個地形生成
        Object.values(this.resourceDefinitions).forEach(definition => {
          if (
            definition.validTerrains.includes(terrainType) &&
            Math.random() < 0.3 // 30% 機率生成資源
          ) {
            const resource: ResourceProperties = {
              type: definition.type,
              amount: definition.maxAmount,
              maxAmount: definition.maxAmount,
              regenerationRate: definition.regenerationRate,
              lastRegenTime: Date.now(),
              position: { x, y }
            };
            
            const key = `${x},${y},${definition.type}`;
            this.resources.set(key, resource);
          }
        });
      });
    });
  }

  public getResourcesAt(x: number, y: number): ResourceProperties[] {
    const resources: ResourceProperties[] = [];
    this.resources.forEach((resource, key) => {
      if (resource.position.x === x && resource.position.y === y) {
        resources.push({ ...resource });
      }
    });
    return resources;
  }

  public consumeResource(x: number, y: number, type: ResourceType, amount: number): number {
    const key = `${x},${y},${type}`;
    const resource = this.resources.get(key);
    
    if (!resource) return 0;

    const actualAmount = Math.min(resource.amount, amount);
    resource.amount -= actualAmount;
    resource.lastRegenTime = Date.now();
    
    return actualAmount;
  }

  public update(deltaTime: number): void {
    const currentTime = Date.now();
    
    this.resources.forEach((resource, key) => {
      const definition = this.resourceDefinitions[resource.type];
      const timeSinceLastRegen = currentTime - resource.lastRegenTime;
      
      if (
        resource.amount < resource.maxAmount &&
        timeSinceLastRegen >= definition.baseRegenerationTime
      ) {
        resource.amount = Math.min(
          resource.maxAmount,
          resource.amount + resource.regenerationRate
        );
        resource.lastRegenTime = currentTime;
      }
    });
  }

  public getAllResources(): ResourceProperties[] {
    return Array.from(this.resources.values());
  }

  public getResourcesInRange(x: number, y: number, range: number): ResourceProperties[] {
    return Array.from(this.resources.values()).filter(resource => {
      const dx = resource.position.x - x;
      const dy = resource.position.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= range;
    });
  }

  private getResourceKey(x: number, y: number, type: ResourceType): string {
    return `${x},${y},${type}`;
  }

  public addResource(resource: ResourceDefinition): void {
    const key = this.getResourceKey(
      resource.position.x,
      resource.position.y,
      resource.type
    );
    
    this.resources.set(key, {
      ...resource,
      lastRegenTime: Date.now()
    });
  }

  public getResource(x: number, y: number, type: ResourceType): ResourceProperties | undefined {
    const key = this.getResourceKey(x, y, type);
    return this.resources.get(key);
  }

  public clear(): void {
    this.resources.clear();
  }
} 