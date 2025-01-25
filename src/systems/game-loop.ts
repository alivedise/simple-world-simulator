import { EntityManager } from './entity-manager';
import { ResourceManager } from './resource-manager';
import { TimeSystem } from './time-system';

type UpdateCallback = (deltaTime: number) => void;

export class GameLoop {
  private static instance: GameLoop;
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private frameId: number = 0;
  private subscribers: Set<UpdateCallback> = new Set();

  private constructor() {}

  public static getInstance(): GameLoop {
    if (!GameLoop.instance) {
      GameLoop.instance = new GameLoop();
    }
    return GameLoop.instance;
  }

  public subscribe(callback: UpdateCallback): void {
    this.subscribers.add(callback);
  }

  public unsubscribe(callback: UpdateCallback): void {
    this.subscribers.delete(callback);
  }

  public start(): void {
    console.log('Game loop starting...');
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.tick();
    }
  }

  public stop(): void {
    console.log('Game loop stopping...');
    this.isRunning = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
  }

  private tick = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    try {
      // 更新時間系統
      TimeSystem.getInstance().update(deltaTime);

      // 更新實體
      const entityManager = EntityManager.getInstance();
      console.log('Updating entities, count:', entityManager.getEntityCount());
      entityManager.update();

      // 通知所有訂閱者
      this.subscribers.forEach(callback => {
        try {
          callback(deltaTime);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });

      // 請求下一幀
      this.frameId = requestAnimationFrame(this.tick);
    } catch (error) {
      console.error('Error in game loop:', error);
      this.stop();
    }
  };

  public isGameRunning(): boolean {
    return this.isRunning;
  }
} 