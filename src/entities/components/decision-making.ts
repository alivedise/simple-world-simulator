import { DecisionMaking, PerceptionInfo, Action, Position, DecisionFactors, ActionResult } from '../../types/entity.types';

export class BasicDecisionMaking implements DecisionMaking {
  private decisionFactors: DecisionFactors = {
    energy: 100,
    hunger: 0,
    health: 100,
    restThreshold: 30,    // 能量低於此值時傾向休息
    moveChance: 0.3       // 基礎移動機率
  };

  constructor(private position: Position) {}

  private evaluateState(vitalSigns: { energy: number; hunger: number; health: number }): ActionResult {
    // 更新決策因子
    this.decisionFactors = {
      ...this.decisionFactors,
      ...vitalSigns
    };

    // 如果能量太低，優先休息
    if (this.decisionFactors.energy < this.decisionFactors.restThreshold) {
      return {
        type: 'stay',
        reason: '能量不足，需要休息'
      };
    }

    // 如果健康狀況不佳，傾向休息
    if (this.decisionFactors.health < 50) {
      return {
        type: 'stay',
        reason: '健康狀況不佳，需要恢復'
      };
    }

    // 根據當前狀態計算移動機率
    const adjustedMoveChance = this.calculateMoveChance();
    
    // 隨機決定是否移動
    if (Math.random() > adjustedMoveChance) {
      return {
        type: 'stay',
        reason: '選擇待在原地'
      };
    }

    // 決定移動
    const targetPosition = this.calculateNextPosition();
    return {
      type: 'move',
      targetPosition,
      reason: '決定探索新的位置'
    };
  }

  private calculateMoveChance(): number {
    let chance = this.decisionFactors.moveChance;
    
    // 能量越低，移動機率越低
    chance *= (this.decisionFactors.energy / 100);
    
    // 飢餓度越高，移動機率越高（尋找食物）
    chance *= (1 + this.decisionFactors.hunger / 200);
    
    return Math.min(0.8, Math.max(0.1, chance));
  }

  private calculateNextPosition(): Position {
    // 隨機選擇一個相鄰的位置
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

    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    
    return {
      x: Math.max(0, Math.min(29, this.position.x + randomDirection.x)),
      y: Math.max(0, Math.min(19, this.position.y + randomDirection.y))
    };
  }

  decide(perception: PerceptionInfo): Action {
    // 獲取生命體徵
    const vitalSigns = (perception as any).vitalSigns;
    
    // 評估當前狀態並做出決策
    const decision = this.evaluateState(vitalSigns);

    // 根據決策返回相應的行動
    if (decision.type === 'stay') {
      return {
        type: 'stay',
        execute: (entity) => {
          // 停留時恢復一些能量
          entity.vitalSigns.energy = Math.min(100, entity.vitalSigns.energy + 0.5);
        }
      };
    }

    return {
      type: 'move',
      targetPosition: decision.targetPosition!,
      execute: (entity) => {
        entity.position = decision.targetPosition!;
        this.position = decision.targetPosition!;
        // 移動消耗能量
        entity.vitalSigns.energy = Math.max(0, entity.vitalSigns.energy - 2);
      }
    };
  }
} 