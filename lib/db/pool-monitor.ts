import { pool } from "@/lib/db";

interface PoolStats {
  total: number;
  idle: number;
  waiting: number;
  activeQueries: number;
}

class PoolMonitor {
  private checkInterval: NodeJS.Timeout | null = null;
  private stats: PoolStats = { total: 0, idle: 0, waiting: 0, activeQueries: 0 };
  private warningThreshold = 0.8;

  start(intervalMs = 30000) {
    if (this.checkInterval) return;
    this.checkInterval = setInterval(() => this.check(), intervalMs);
    this.check();
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private check() {
    this.stats = {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount,
      activeQueries: pool.totalCount - pool.idleCount,
    };

    const usage = this.stats.activeQueries / pool.totalCount;
    
    if (usage >= this.warningThreshold) {
      console.warn(
        `[PoolMonitor] Высокая загрузка пула: ${(usage * 100).toFixed(0)}% ` +
        `(${this.stats.activeQueries}/${pool.totalCount} соединений активно, ` +
        `${this.stats.waiting} в очереди)`
      );
    }

    if (this.stats.waiting > 0) {
      console.warn(
        `[PoolMonitor] ${this.stats.waiting} запросов ожидают свободное соединение`
      );
    }
  }

  getStats(): PoolStats {
    return { ...this.stats };
  }

  isHealthy(): boolean {
    return this.stats.waiting === 0 && 
           this.stats.activeQueries < pool.totalCount;
  }
}

export const poolMonitor = new PoolMonitor();

if (process.env.NODE_ENV === "development") {
  poolMonitor.start();
}
