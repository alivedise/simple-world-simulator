import { Perception, PerceptionInfo, Position } from '../../types/entity.types';
import { EntityManager } from '../../systems/entity-manager';

export class BasicPerception implements Perception {
  constructor(
    public range: number,
    private position: Position
  ) {}

  perceive(worldState: any): PerceptionInfo {
    const entityManager = EntityManager.getInstance();
    const nearbyEntities = entityManager.getEntitiesInRange(this.position, this.range);

    // 暫時返回空的地形數據，之後需要整合地圖系統
    return {
      nearbyEntities: nearbyEntities.map(e => ({
        id: e.id,
        position: e.position,
        type: e.type,
        size: e.size
      })),
      surroundingTerrains: [],
      visibleRange: this.range
    };
  }
} 