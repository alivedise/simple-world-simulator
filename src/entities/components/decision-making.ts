import { DecisionMaking, PerceptionInfo, Action, Position, DecisionFactors, ActionResult } from '../../types/entity.types';
import { SpeciesDefinition } from '../../types/species.types';
import { ResourceManager } from '../../systems/resource-manager';
import { ResourceType } from '../../types/resource.types';

export class BasicDecisionMaking implements DecisionMaking {
  private readonly RESOURCE_INTERACTION_RANGE = 1;
  private readonly MIN_RESOURCE_AMOUNT = 20;  // 資源低於此量時離開
  private readonly MAX_CONSUMPTION_RATE = 5;  // 每次最大消耗量

  private decisionFactors: DecisionFactors = {
    energy: 100,
    hunger: 0,
    health: 100,
    restThreshold: 20,     // 降低休息閾值
    moveChance: 0.3
  };

  constructor(
    private position: Position,
    private species: SpeciesDefinition
  ) {}

  decide(perception: PerceptionInfo): Action {
    const vitalSigns = (perception as any).vitalSigns;
    const nearbyResources = perception.nearbyResources || [];

    // 檢查附近的資源
    const neededResource = this.findNeededResource(nearbyResources);
    
    if (neededResource) {
      const distance = Math.sqrt(
        Math.pow(this.position.x - neededResource.position.x, 2) +
        Math.pow(this.position.y - neededResource.position.y, 2)
      );

      if (distance <= this.RESOURCE_INTERACTION_RANGE) {
        return this.createResourceInteractionAction(neededResource, vitalSigns);
      }

      return this.createMoveToResourceAction(neededResource.position);
    }

    // 如果沒有找到資源，進行隨機移動
    return this.createRandomMoveAction();
  }

  private findNeededResource(nearbyResources: any[]): any {
    if (!Array.isArray(nearbyResources)) return null;
    
    return nearbyResources.find(resource => {
      if (!resource || !resource.type) return false;
      
      const isPrimaryFood = this.species.resourceNeeds.primaryFood.includes(resource.type);
      const isSecondaryFood = this.species.resourceNeeds.secondaryFood.includes(resource.type);
      const isOtherNeed = this.species.resourceNeeds.otherNeeds.includes(resource.type);

      return (isPrimaryFood || isSecondaryFood || isOtherNeed) && 
             resource.amount > this.MIN_RESOURCE_AMOUNT;
    });
  }

  private createRandomMoveAction(): Action {
    // 生成隨機移動方向
    const directions = [
      { x: -1, y: 0 }, { x: 1, y: 0 },
      { x: 0, y: -1 }, { x: 0, y: 1 },
      { x: -1, y: -1 }, { x: -1, y: 1 },
      { x: 1, y: -1 }, { x: 1, y: 1 }
    ];

    const direction = directions[Math.floor(Math.random() * directions.length)];
    const moveSpeed = this.species.baseStats.movementSpeed;
    
    const newPosition = {
      x: Math.max(0, Math.min(29, this.position.x + direction.x * moveSpeed)),
      y: Math.max(0, Math.min(19, this.position.y + direction.y * moveSpeed))
    };

    return {
      type: 'move',
      targetPosition: newPosition,
      execute: (entity) => {
        entity.position = newPosition;
        this.position = newPosition;
        
        // 移動消耗能量
        if (entity.vitalSigns) {
          entity.vitalSigns.energy = Math.max(0, 
            entity.vitalSigns.energy - this.species.baseStats.energyConsumption);
        }
      }
    };
  }

  private createMoveToResourceAction(targetPos: Position): Action {
    const moveSpeed = this.species.baseStats.movementSpeed;
    const dx = targetPos.x - this.position.x;
    const dy = targetPos.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 如果距離很近，直接移動到目標位置
    if (distance < moveSpeed) {
      return {
        type: 'move',
        targetPosition: targetPos,
        execute: (entity) => {
          entity.position = targetPos;
          this.position = targetPos;
          if (entity.vitalSigns) {
            entity.vitalSigns.energy = Math.max(0, 
              entity.vitalSigns.energy - this.species.baseStats.energyConsumption);
          }
        }
      };
    }

    // 否則朝目標方向移動一步
    const ratio = moveSpeed / distance;
    const newPosition = {
      x: Math.max(0, Math.min(29, this.position.x + dx * ratio)),
      y: Math.max(0, Math.min(19, this.position.y + dy * ratio))
    };

    return {
      type: 'move',
      targetPosition: newPosition,
      execute: (entity) => {
        entity.position = newPosition;
        this.position = newPosition;
        if (entity.vitalSigns) {
          entity.vitalSigns.energy = Math.max(0, 
            entity.vitalSigns.energy - this.species.baseStats.energyConsumption);
        }
      }
    };
  }

  private createResourceInteractionAction(resource: any, vitalSigns: any): Action {
    const resourceManager = ResourceManager.getInstance();
    const consumptionRate = this.species.resourceNeeds.consumptionRates[resource.type] || 1;

    return {
      type: 'interact',
      execute: (entity) => {
        const desiredAmount = Math.min(
          this.MAX_CONSUMPTION_RATE * consumptionRate,
          resource.amount - this.MIN_RESOURCE_AMOUNT
        );

        const consumedAmount = resourceManager.consumeResource(
          resource.position.x,
          resource.position.y,
          resource.type,
          desiredAmount
        );

        if (consumedAmount > 0) {
          this.applyResourceEffects(entity, resource.type, consumedAmount);
        }
      }
    };
  }

  private applyResourceEffects(entity: any, resourceType: ResourceType, amount: number): void {
    if (!entity.vitalSigns) return;

    switch (resourceType) {
      case ResourceType.FOOD:
        entity.vitalSigns.hunger = Math.max(0, entity.vitalSigns.hunger - amount * 2);
        entity.vitalSigns.energy = Math.min(100, entity.vitalSigns.energy + amount);
        break;
      case ResourceType.WATER:
        entity.vitalSigns.energy = Math.min(100, entity.vitalSigns.energy + amount);
        break;
      case ResourceType.HERB:
        entity.vitalSigns.health = Math.min(100, entity.vitalSigns.health + amount);
        break;
    }
  }

  private getMovementReason(): string {
    if (this.decisionFactors.hunger > 80) return '尋找食物中';
    if (this.decisionFactors.energy < 30) return '緩慢移動中';
    if (this.decisionFactors.health < 50) return '謹慎移動中';
    return '探索中';
  }

  private calculateNextPosition(): Position {
    // 根據生物狀態調整移動範圍
    const movementRange = this.calculateMovementRange();
    
    // 可能的移動方向
    const directions = [
      { x: -1, y: 0 },  // 左
      { x: 1, y: 0 },   // 右
      { x: 0, y: -1 },  // 上
      { x: 0, y: 1 },   // 下
      { x: -1, y: -1 }, // 左上
      { x: -1, y: 1 },  // 左下
      { x: 1, y: -1 },  // 右上
      { x: 1, y: 1 }    // 右下
    ];

    // 根據物種的移動速度和當前狀態選擇移動方向
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const moveDistance = this.species.baseStats.movementSpeed * movementRange;

    return {
      x: Math.max(0, Math.min(29, this.position.x + direction.x * moveDistance)),
      y: Math.max(0, Math.min(19, this.position.y + direction.y * moveDistance))
    };
  }

  private calculateMovementRange(): number {
    let range = 1.0;

    // 根據能量調整移動範圍
    if (this.decisionFactors.energy < 30) {
      range *= 0.5;
    }

    // 根據健康狀況調整移動範圍
    if (this.decisionFactors.health < 50) {
      range *= 0.7;
    }

    // 飢餓時增加移動範圍（尋找食物）
    if (this.decisionFactors.hunger > 80) {
      range *= 1.3;
    }

    return range;
  }
} 