import { Entity, Position } from '../types/entity.types';

export class EntityManager {
  private static instance: EntityManager;
  private entities: Map<string, Entity> = new Map();
  private entitiesToRemove: Set<string> = new Set();
  private lastUpdate: number = Date.now();

  private constructor() {}

  public static getInstance(): EntityManager {
    if (!EntityManager.instance) {
      EntityManager.instance = new EntityManager();
    }
    return EntityManager.instance;
  }

  public addEntity(entity: Entity): void {
    this.entities.set(entity.id, entity);
  }

  public removeEntity(entityId: string): void {
    this.entitiesToRemove.add(entityId);
  }

  public getEntity(entityId: string): Entity | undefined {
    return this.entities.get(entityId);
  }

  public getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  public getEntitiesInRange(position: Position, range: number): Entity[] {
    return Array.from(this.entities.values()).filter(entity => {
      const dx = entity.position.x - position.x;
      const dy = entity.position.y - position.y;
      return Math.sqrt(dx * dx + dy * dy) <= range;
    });
  }

  public update(): void {
    try {
      const currentTime = Date.now();
      const deltaTime = currentTime - this.lastUpdate;
      this.lastUpdate = currentTime;

      // 處理待移除的實體
      this.entitiesToRemove.forEach(entityId => {
        this.entities.delete(entityId);
      });
      this.entitiesToRemove.clear();

      // 更新所有實體
      this.entities.forEach(entity => {
        try {
          if (entity && typeof entity.tick === 'function') {
            entity.tick(deltaTime);
          }
        } catch (error) {
          console.warn(`Error updating entity ${entity.id}:`, error);
          // 如果實體更新失敗，將其標記為待移除
          this.entitiesToRemove.add(entity.id);
        }
      });
    } catch (error) {
      console.error('Error in EntityManager update:', error);
    }
  }

  public clear(): void {
    this.entities.clear();
    this.entitiesToRemove.clear();
  }

  // 用於調試
  public getEntityCount(): number {
    return this.entities.size;
  }

  public validateEntity(entity: Entity): boolean {
    return (
      entity &&
      typeof entity.id === 'string' &&
      typeof entity.position === 'object' &&
      typeof entity.position.x === 'number' &&
      typeof entity.position.y === 'number' &&
      typeof entity.tick === 'function'
    );
  }
} 