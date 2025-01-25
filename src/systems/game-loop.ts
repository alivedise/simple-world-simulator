export type TickCallback = (deltaTime: number) => void;

export class GameLoop {
  private static instance: GameLoop;
  private isRunning: boolean = false;
  private lastTimestamp: number = 0;
  private subscribers: Set<TickCallback> = new Set();
  private targetFPS: number = 60;
  private frameInterval: number = 1000 / 60;

  private constructor() {}

  public static getInstance(): GameLoop {
    if (!GameLoop.instance) {
      GameLoop.instance = new GameLoop();
    }
    return GameLoop.instance;
  }

  public start(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTimestamp = performance.now();
      this.tick();
    }
  }

  public stop(): void {
    this.isRunning = false;
  }

  public subscribe(callback: TickCallback): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  public setTargetFPS(fps: number): void {
    this.targetFPS = fps;
    this.frameInterval = 1000 / fps;
  }

  private tick = (timestamp: number = performance.now()): void => {
    if (!this.isRunning) return;

    const deltaTime = timestamp - this.lastTimestamp;

    if (deltaTime >= this.frameInterval) {
      this.lastTimestamp = timestamp - (deltaTime % this.frameInterval);
      
      // 執行所有訂閱者的 tick
      this.subscribers.forEach(callback => {
        try {
          callback(deltaTime);
        } catch (error) {
          console.error('Error in tick callback:', error);
        }
      });
    }

    requestAnimationFrame(this.tick);
  };
} 