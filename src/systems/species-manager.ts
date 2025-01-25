import { 
  SpeciesDefinition, 
  SpeciesCategory
} from '../types/species.types';
import { TerrainType } from '../types/map.types';
import { ResourceType } from '../types/resource.types';

export class SpeciesManager {
  private static instance: SpeciesManager;
  private species: Map<string, SpeciesDefinition> = new Map();

  private constructor() {
    this.initializeDefaultSpecies();
  }

  public static getInstance(): SpeciesManager {
    if (!SpeciesManager.instance) {
      SpeciesManager.instance = new SpeciesManager();
    }
    return SpeciesManager.instance;
  }

  private initializeDefaultSpecies() {
    // 草食性動物：鹿
    this.registerSpecies({
      id: 'deer',
      name: '鹿',
      description: '溫和的草食性動物，適應森林和草原環境',
      category: SpeciesCategory.HERBIVORE,
      baseStats: {
        maxHealth: 100,
        maxEnergy: 120,
        maxHunger: 100,
        movementSpeed: 1.2,
        energyConsumption: 0.8,
        size: 2
      },
      terrainAdaptation: {
        preferredTerrains: [
          TerrainType.GRASSLAND,
          TerrainType.FOREST,
          TerrainType.SAVANNA
        ],
        avoidTerrains: [
          TerrainType.DESERT,
          TerrainType.SNOW_MOUNTAIN,
          TerrainType.DEEP_OCEAN
        ],
        terrainEffects: {
          [TerrainType.FOREST]: {
            energyModifier: 0.8,
            speedModifier: 1.2,
            healthModifier: 1.1
          },
          [TerrainType.DESERT]: {
            energyModifier: 1.5,
            speedModifier: 0.7,
            healthModifier: 0.8
          }
        }
      },
      resourceNeeds: {
        primaryFood: [ResourceType.FOOD],
        secondaryFood: [ResourceType.HERB],
        otherNeeds: [ResourceType.WATER],
        consumptionRates: {
          [ResourceType.FOOD]: 1.0,
          [ResourceType.WATER]: 0.8,
          [ResourceType.HERB]: 0.3
        }
      },
      traits: {
        canSwim: true,
        canClimb: false,
        isNocturnal: false,
        isSocial: true,
        isAggressive: false,
        isTerritorial: false,
        specialAbilities: ['快速奔跑', '警覺性高']
      },
      behaviorModifiers: {
        explorationChance: 0.6,
        restFrequency: 0.4,
        territorySize: 10,
        socialDistance: 3,
        resourcePriority: 0.7,
        dangerAvoidance: 0.9
      }
    });

    // 雜食性動物：浣熊
    this.registerSpecies({
      id: 'raccoon',
      name: '浣熊',
      description: '機靈的雜食性動物，適應能力強',
      category: SpeciesCategory.OMNIVORE,
      baseStats: {
        maxHealth: 80,
        maxEnergy: 100,
        maxHunger: 90,
        movementSpeed: 0.9,
        energyConsumption: 0.7,
        size: 1
      },
      terrainAdaptation: {
        preferredTerrains: [
          TerrainType.FOREST,
          TerrainType.GRASSLAND
        ],
        avoidTerrains: [
          TerrainType.DESERT,
          TerrainType.SNOW_MOUNTAIN
        ],
        terrainEffects: {
          [TerrainType.FOREST]: {
            energyModifier: 0.9,
            speedModifier: 1.1,
            healthModifier: 1.1
          }
        }
      },
      resourceNeeds: {
        primaryFood: [ResourceType.FOOD, ResourceType.HERB],
        secondaryFood: [ResourceType.WOOD],
        otherNeeds: [ResourceType.WATER],
        consumptionRates: {
          [ResourceType.FOOD]: 0.8,
          [ResourceType.WATER]: 0.7,
          [ResourceType.HERB]: 0.5,
          [ResourceType.WOOD]: 0.2
        }
      },
      traits: {
        canSwim: true,
        canClimb: true,
        isNocturnal: true,
        isSocial: false,
        isAggressive: false,
        isTerritorial: true,
        specialAbilities: ['夜視', '靈活攀爬']
      },
      behaviorModifiers: {
        explorationChance: 0.8,
        restFrequency: 0.5,
        territorySize: 6,
        socialDistance: 5,
        resourcePriority: 0.8,
        dangerAvoidance: 0.7
      }
    });

    // 可以繼續添加更多物種...
  }

  public registerSpecies(speciesDefinition: SpeciesDefinition): void {
    this.species.set(speciesDefinition.id, speciesDefinition);
  }

  public getSpecies(id: string): SpeciesDefinition | undefined {
    return this.species.get(id);
  }

  public getAllSpecies(): SpeciesDefinition[] {
    return Array.from(this.species.values());
  }

  public getSpeciesByCategory(category: SpeciesCategory): SpeciesDefinition[] {
    return this.getAllSpecies().filter(species => species.category === category);
  }
} 