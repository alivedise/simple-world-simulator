import { Entity, Position, Action, PerceptionInfo } from '../types/entity.types';
import { BasicPerception } from './components/perception';
import { BasicDecisionMaking } from './components/decision-making';
import { BasicVitalSigns } from './components/vital-signs';

export class BasicEntity implements Entity {
  public id: string;
  public perception: BasicPerception;
  public decisionMaking: BasicDecisionMaking;
  public vitalSigns: BasicVitalSigns;

  constructor(
    public position: Position,
    public type: string,
    public size: number = 1
  ) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.perception = new BasicPerception(5, position);
    this.decisionMaking = new BasicDecisionMaking(position);
    this.vitalSigns = new BasicVitalSigns();
  }

  tick(deltaTime: number): void {
    // 1. 更新生命體徵
    this.vitalSigns.updateVitals();

    // 2. 感知環境
    const perceptionInfo = this.perception.perceive(/* 需要世界狀態 */);

    // 3. 決策
    const action = this.decisionMaking.decide(perceptionInfo);

    // 4. 執行行動
    action.execute(this);
  }
} 