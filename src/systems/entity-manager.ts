import { Entity, Position } from '../types/entity.types';
import { GameLoop } from './game-loop';

export class EntityManager {
  private static instance: EntityManager;
  private entities: Map<string, Entity> = new Map();

  private constructor() {
    // 訂閱遊戲循環
    GameLoop.getInstance().subscribe(this.updateEntities.bind(this));
  }

  public static getInstance(): EntityManager {
    if (!EntityManager.instance) {
      EntityManager.instance = new EntityManager();
    }
    return EntityManager.instance;
  }

  public addEntity(entity: Entity): void {
    this.entities.set(entity.id, entity);
  }

  public removeEntity(id: string): void {
    this.entities.delete(id);
  }

  public getEntitiesInRange(position: Position, range: number): Entity[] {
    return Array.from(this.entities.values()).filter(entity => {
      const dx = entity.position.x - position.x;
      const dy = entity.position.y - position.y;
      return Math.sqrt(dx * dx + dy * dy) <= range;
    });
  }

  private updateEntities(deltaTime: number): void {
    this.entities.forEach(entity => {
      try {
        entity.tick(deltaTime);
      } catch (error) {
        console.error(`Error updating entity ${entity.id}:`, error);
      }
    });
  }

  public getEntityById(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  public getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }
} 