import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { SpeciesDefinition, SpeciesCategory } from '../types/species.types';

@customElement('entity-creature')
export class EntityCreatureElement extends LitElement {
  @property({ type: Object })
  species!: SpeciesDefinition;

  @property({ type: Number })
  health: number = 100;

  @property({ type: Number })
  energy: number = 100;

  @property({ type: Number })
  hunger: number = 0;

  @property({ type: String })
  status: string = '正常';

  @property({ type: Number })
  x: number = 0;

  @property({ type: Number })
  y: number = 0;

  static styles = css`
    :host {
      display: block;
      position: absolute;
      width: 16px;
      height: 16px;
      transform: translate(-50%, -50%);
      transition: all 0.3s ease;
    }

    .creature {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .creature::after {
      content: '';
      position: absolute;
      width: 70%;
      height: 70%;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
    }

    .status-indicator {
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      height: 2px;
      background: rgba(255, 255, 255, 0.8);
    }

    .health-bar {
      position: absolute;
      top: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      height: 2px;
      background: #ff4444;
    }

    /* 不同狀態的動畫 */
    @keyframes rest {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(0.9); }
    }

    @keyframes hungry {
      0%, 100% { transform: rotate(-5deg); }
      50% { transform: rotate(5deg); }
    }

    .resting {
      animation: rest 2s ease-in-out infinite;
    }

    .hungry {
      animation: hungry 0.5s ease-in-out infinite;
    }
  `;

  private getSpeciesColor(category: SpeciesCategory): string {
    const colors: Record<SpeciesCategory, string> = {
      [SpeciesCategory.HERBIVORE]: '#4CAF50',
      [SpeciesCategory.CARNIVORE]: '#f44336',
      [SpeciesCategory.OMNIVORE]: '#9C27B0',
      [SpeciesCategory.SCAVENGER]: '#FF9800'
    };
    return colors[category] || '#999999';
  }

  private getStatusClass(): string {
    switch (this.status) {
      case '休息中': return 'resting';
      case '飢餓': return 'hungry';
      default: return '';
    }
  }

  render() {
    const backgroundColor = this.getSpeciesColor(this.species.category);
    const statusClass = this.getStatusClass();
    const size = this.species.baseStats.size * 8; // 基礎大小轉換為像素

    return html`
      <div class="creature ${statusClass}"
           style="background-color: ${backgroundColor}; 
                  width: ${size}px; 
                  height: ${size}px;"
           title="${this.species.name}
狀態: ${this.status}
生命: ${Math.floor(this.health)}
能量: ${Math.floor(this.energy)}
飢餓: ${Math.floor(this.hunger)}">
        <div class="health-bar" 
             style="transform: translateX(-50%) scaleX(${this.health / 100})">
        </div>
        <div class="status-indicator" 
             style="transform: translateX(-50%) scaleX(${this.energy / 100})">
        </div>
      </div>
    `;
  }
} 