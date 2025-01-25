import { VitalSigns } from '../../types/entity.types';

export class BasicVitalSigns implements VitalSigns {
  constructor(
    public health: number = 100,
    public energy: number = 100,
    public hunger: number = 0,
    private readonly energyRecoveryRate: number = 0.3,  // 休息時能量恢復速率
    private readonly hungerIncreaseRate: number = 0.1,  // 飢餓值增加速率
    private readonly healthRecoveryRate: number = 0.1,  // 健康恢復速率
    private readonly hungerDamageThreshold: number = 80 // 飢餓傷害閾值
  ) {}

  updateVitals(isResting: boolean = false): void {
    // 更新飢餓值
    this.hunger = Math.min(100, this.hunger + this.hungerIncreaseRate);
    
    // 根據活動狀態更新能量
    if (isResting) {
      // 休息時恢復能量
      this.energy = Math.min(100, this.energy + this.energyRecoveryRate);
    }

    // 飢餓時損失健康
    if (this.hunger > this.hungerDamageThreshold) {
      this.health = Math.max(0, this.health - 0.1);
    } else if (this.health < 100) {
      // 不太飢餓時緩慢恢復健康
      this.health = Math.min(100, this.health + this.healthRecoveryRate);
    }
  }

  public getStatus(): string {
    if (this.energy < 20) return '疲憊';
    if (this.hunger > 80) return '飢餓';
    if (this.health < 50) return '虛弱';
    if (this.energy < 50) return '疲倦';
    return '正常';
  }
} 