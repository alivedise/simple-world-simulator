import { Perception, PerceptionInfo, Position } from '../../types/entity.types';
import { EntityManager } from '../../systems/entity-manager';
import { ResourceManager } from '../../systems/resource-manager';
import { ResourceType, ResourceProperties } from '../../types/resource.types';

export class BasicPerception implements Perception {
  constructor(
    public range: number,
    private position: Position
  ) {}

  perceive(worldState: any): PerceptionInfo {
    const entityManager = EntityManager.getInstance();
    const resourceManager = ResourceManager.getInstance();
    
    // 檢測附近的實體
    const nearbyEntities = entityManager.getEntitiesInRange(this.position, this.range);
    
    // 檢測附近的資源
    const nearbyResources = resourceManager.getResourcesInRange(
      this.position.x,
      this.position.y,
      this.range
    );

    return {
      nearbyEntities: nearbyEntities.map(e => ({
        id: e.id,
        position: e.position,
        type: e.type,
        size: e.size
      })),
      nearbyResources,
      surroundingTerrains: [],
      visibleRange: this.range
    };
  }
} 