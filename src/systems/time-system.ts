import { GameLoop } from './game-loop';

export interface TimeState {
  gameTime: number;      // 遊戲內的時間（毫秒）
  dayTime: number;       // 一天中的時間（小時）
  day: number;          // 天數
  month: number;        // 月份
  year: number;         // 年份
  timeScale: number;    // 時間流逝速度
}

export class TimeSystem {
  private static instance: TimeSystem;
  private state: TimeState;
  private listeners: Set<(state: TimeState) => void>;

  private constructor() {
    this.state = {
      gameTime: 0,
      dayTime: 12,
      day: 1,
      month: 1,
      year: 1,
      timeScale: 1,
    };
    this.listeners = new Set();

    // 訂閱遊戲循環
    GameLoop.getInstance().subscribe(this.update.bind(this));
  }

  public static getInstance(): TimeSystem {
    if (!TimeSystem.instance) {
      TimeSystem.instance = new TimeSystem();
    }
    return TimeSystem.instance;
  }

  public getState(): TimeState {
    return { ...this.state };
  }

  public setTimeScale(scale: number): void {
    this.state.timeScale = Math.max(0, Math.min(10, scale));
  }

  public subscribe(callback: (state: TimeState) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private update(deltaTime: number): void {
    // 更新遊戲時間（1秒真實時間 = 1小時遊戲時間）
    const gameTimeDelta = deltaTime * this.state.timeScale;
    this.state.gameTime += gameTimeDelta;

    // 更新日期時間
    const hourDelta = (gameTimeDelta / 1000); // 轉換為小時
    this.state.dayTime += hourDelta;

    // 處理日期變更
    while (this.state.dayTime >= 24) {
      this.state.dayTime -= 24;
      this.state.day += 1;

      if (this.state.day > 30) {
        this.state.day = 1;
        this.state.month += 1;

        if (this.state.month > 12) {
          this.state.month = 1;
          this.state.year += 1;
        }
      }
    }

    // 通知所有監聽者
    this.notifyListeners();
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in time listener:', error);
      }
    });
  }
} 