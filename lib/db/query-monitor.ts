/**
 * Модуль мониторинга производительности SQL-запросов
 * 
 * @description Логирует медленные запросы, собирает статистику,
 * помогает выявить проблемы производительности.
 */

interface QueryLog {
  query: string;
  params?: unknown[];
  duration: number;
  timestamp: Date;
}

interface QueryStats {
  totalQueries: number;
  slowQueries: number;
  avgDuration: number;
  maxDuration: number;
  patterns: Map<string, { count: number; totalTime: number }>;
}

const SLOW_QUERY_THRESHOLD = 100;
const MAX_LOGS = 1000;

class QueryMonitor {
  private logs: QueryLog[] = [];
  private stats: QueryStats = {
    totalQueries: 0,
    slowQueries: 0,
    avgDuration: 0,
    maxDuration: 0,
    patterns: new Map(),
  };
  private enabled = process.env.NODE_ENV === "development";
  private requestId: string | null = null;

  startRequest(id: string) {
    this.requestId = id;
  }

  endRequest() {
    if (!this.enabled) return;

    const requestLogs = this.logs.filter(
      log => log.timestamp.getTime() > Date.now() - 5000
    );

    if (requestLogs.length > 10) {
      console.warn(
        `[QueryMonitor] Много запросов (${requestLogs.length}) за один HTTP-запрос. ` +
        `Возможен N+1.`
      );
    }
    this.requestId = null;
  }

  logQuery(query: string, duration: number, params?: unknown[]) {
    if (!this.enabled) return;

    const log: QueryLog = {
      query: this.normalizeQuery(query),
      params,
      duration,
      timestamp: new Date(),
    };

    this.logs.push(log);
    if (this.logs.length > MAX_LOGS) {
      this.logs.shift();
    }

    this.stats.totalQueries++;
    this.stats.avgDuration = 
      (this.stats.avgDuration * (this.stats.totalQueries - 1) + duration) / 
      this.stats.totalQueries;
    this.stats.maxDuration = Math.max(this.stats.maxDuration, duration);

    const pattern = this.getQueryPattern(query);
    
    // Радикально: если общее число запросов растет, а сброс не помогает, 
    // значит мы имеем дело с утечкой или множественными инстансами.
    // Сбрасываем каждые 10 запросов и принудительно обнуляем старые объекты.
    if (this.stats.totalQueries % 10 === 0) {
        this.stats.patterns.clear();
        this.stats.patterns.set(pattern, { count: 1, totalTime: duration });
        return;
    }

    const patternStats = this.stats.patterns.get(pattern) || { count: 0, totalTime: 0 };

    patternStats.count++;
    patternStats.totalTime += duration;
    this.stats.patterns.set(pattern, patternStats);

    if (duration > SLOW_QUERY_THRESHOLD) {
      this.stats.slowQueries++;
      console.warn(
        `[SLOW QUERY ${duration.toFixed(0)}ms]`,
        this.truncateQuery(query, 200)
      );
    }

    if (patternStats.count > 3) {
      console.warn(
        `[N+1 DETECTED] Паттерн выполнен ${patternStats.count} раз:`,
        this.truncateQuery(pattern, 100)
      );
    }
  }

  private normalizeQuery(query: string): string {
    return query
      .replace(/\$\d+/g, "?")
      .replace(/'[^']*'/g, "'?'")
      .replace(/\d+/g, "N")
      .trim();
  }

  private getQueryPattern(query: string): string {
    const normalized = this.normalizeQuery(query);
    return normalized.slice(0, 100);
  }

  private truncateQuery(query: string, maxLength: number): string {
    if (query.length <= maxLength) return query;
    return query.slice(0, maxLength) + "...";
  }

  getStats(): QueryStats {
    return { ...this.stats };
  }

  getSlowPatterns(limit = 10): Array<{ pattern: string; count: number; avgTime: number }> {
    return Array.from(this.stats.patterns.entries())
      .map(([pattern, stats]) => ({
        pattern,
        count: stats.count,
        avgTime: stats.totalTime / stats.count,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, limit);
  }

  reset() {
    this.logs = [];
    this.stats = {
      totalQueries: 0,
      slowQueries: 0,
      avgDuration: 0,
      maxDuration: 0,
      patterns: new Map(),
    };
  }
}

export const queryMonitor = new QueryMonitor();
