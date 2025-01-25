import { VitalSigns } from '../../types/entity.types';

export class BasicVitalSigns implements VitalSigns {
  constructor(
    public health: number = 100,
    public energy: number = 100,
    public hunger: number = 0
  ) {}

  updateVitals(): void {
    // 基本的生命體徵更新邏輯
    this.energy = Math.max(0, this.energy - 0.1);
    this.hunger = Math.min(100, this.hunger + 0.1);
    
    if (this.hunger > 80) {
      this.health = Math.max(0, this.health - 0.1);
    }
  }
} 