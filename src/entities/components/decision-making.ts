import { DecisionMaking, PerceptionInfo, Action, Position } from '../../types/entity.types';

export class BasicDecisionMaking implements DecisionMaking {
  constructor(private position: Position) {}

  decide(perception: PerceptionInfo): Action {
    // 基本的決策邏輯：隨機移動，但確保在地圖範圍內
    const randomDirection = {
      x: Math.floor(Math.random() * 3) - 1,
      y: Math.floor(Math.random() * 3) - 1
    };

    const targetPosition: Position = {
      x: Math.max(0, Math.min(29, this.position.x + randomDirection.x)),
      y: Math.max(0, Math.min(19, this.position.y + randomDirection.y))
    };

    return {
      type: 'move',
      targetPosition,
      execute: (entity) => {
        entity.position = targetPosition;
        // 更新決策組件的位置引用
        this.position = targetPosition;
      }
    };
  }
} 