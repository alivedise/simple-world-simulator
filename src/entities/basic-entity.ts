import { Entity, Position } from '../types/entity.types';
import { BasicPerception } from './components/perception';
import { BasicDecisionMaking } from './components/decision-making';
import { BasicVitalSigns } from './components/vital-signs';
import { SpeciesDefinition } from '../types/species.types';
import { SpeciesManager } from '../systems/species-manager';

export class BasicEntity implements Entity {
  public id: string;
  public perception: BasicPerception;
  public decisionMaking: BasicDecisionMaking;
  public vitalSigns: BasicVitalSigns;
  public species: SpeciesDefinition;

  constructor(
    public position: Position,
    speciesId: string
  ) {
    this.id = Math.random().toString(36).substr(2, 9);
    
    // 獲取物種定義
    const speciesManager = SpeciesManager.getInstance();
    const speciesDefinition = speciesManager.getSpecies(speciesId);
    if (!speciesDefinition) {
      throw new Error(`Unknown species: ${speciesId}`);
    }
    this.species = speciesDefinition;

    // 使用物種定義初始化組件
    this.perception = new BasicPerception(
      5 * this.species.behaviorModifiers.dangerAvoidance,
      position
    );

    this.decisionMaking = new BasicDecisionMaking(
      position,
      this.species
    );

    this.vitalSigns = new BasicVitalSigns(
      this.species.baseStats.maxHealth,
      this.species.baseStats.maxEnergy,
      0,
      this.species.behaviorModifiers.restFrequency
    );
  }

  tick(deltaTime: number): void {
    // 確保方法被調用
    console.log(`Entity ${this.id} ticking at position:`, this.position);

    // 更新生命體徵
    this.vitalSigns.updateVitals(false);  // 設置為 false 確保不會進入休息狀態

    // 感知環境
    const perceptionInfo = {
      ...this.perception.perceive({}),  // 暫時傳入空對象
      vitalSigns: {
        energy: this.vitalSigns.energy,
        hunger: this.vitalSigns.hunger,
        health: this.vitalSigns.health
      }
    };

    // 強制進行決策
    const action = this.decisionMaking.decide(perceptionInfo);
    
    // 記錄決策結果
    console.log(`Entity ${this.id} decided action:`, action);

    // 執行決策
    if (action && typeof action.execute === 'function') {
      action.execute(this);
      // 記錄執行後的位置
      console.log(`Entity ${this.id} new position:`, this.position);
    }
  }
} 