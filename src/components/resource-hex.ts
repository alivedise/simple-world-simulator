import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ResourceType } from '../types/resource.types';

@customElement('resource-hex')
export class ResourceHexElement extends LitElement {
  @property({ type: String })
  type!: ResourceType;

  @property({ type: Number })
  amount: number = 0;

  @property({ type: Number })
  maxAmount: number = 100;

  @property({ type: Number })
  x: number = 0;

  @property({ type: Number })
  y: number = 0;

  static styles = css`
    :host {
      display: block;
      position: absolute;
      width: 12px;
      height: 14px;
      transform: translate(-50%, -50%);
      clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      transition: all 0.3s ease;
    }

    .hex {
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .hex::after {
      content: '';
      position: absolute;
      width: 90%;
      height: 90%;
      clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      background: rgba(255, 255, 255, 0.3);
    }

    .amount-indicator {
      width: 80%;
      height: 2px;
      background: rgba(255, 255, 255, 0.8);
      position: absolute;
      bottom: 20%;
      left: 10%;
      transform-origin: left;
    }
  `;

  private getResourceColor(type: ResourceType): string {
    const colors: Record<ResourceType, string> = {
      [ResourceType.FOOD]: '#90EE90',
      [ResourceType.WATER]: '#87CEEB',
      [ResourceType.MINERAL]: '#B8860B',
      [ResourceType.WOOD]: '#8B4513',
      [ResourceType.HERB]: '#98FB98'
    };
    return colors[type] || '#CCCCCC';
  }

  render() {
    const amountPercentage = (this.amount / this.maxAmount) * 100;
    const backgroundColor = this.getResourceColor(this.type);
    
    return html`
      <div class="hex" style="background-color: ${backgroundColor}">
        <div class="amount-indicator" 
             style="transform: scaleX(${amountPercentage / 100})">
        </div>
      </div>
    `;
  }
} 