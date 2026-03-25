/**
 * Логгер SQL-запросов для выявления N+1 проблем
 * Включается только в development режиме
 */

interface QueryLog {
  query: string;
  duration: number;
  timestamp: Date;
}

class QueryAnalyzer {
  private logs: QueryLog[] = [];
  private enabled: boolean;
  private requestId: string | null = null;

  constructor() {
    this.enabled = process.env.NODE_ENV === "development";
  }

  /** Начинает отслеживание для запроса */
  startRequest(id: string): void {
    if (!this.enabled) return;
    this.requestId = id;
    this.logs = [];
  }

  /** Записывает выполненный SQL-запрос */
  logQuery(query: string, duration: number): void {
    if (!this.enabled || !this.requestId) return;

    this.logs.push({
      query: query.replace(/\s+/g, " ").trim(),
      duration,
      timestamp: new Date(),
    });
  }

  /** Завершает отслеживание и выводит анализ */
  endRequest(): void {
    if (!this.enabled || !this.requestId) return;

    const totalQueries = this.logs.length;
    const totalDuration = this.logs.reduce((sum, log) => sum + log.duration, 0);

    // Анализируем паттерны N+1
    const queryPatterns = this.detectN1Patterns();

    if (totalQueries > 5 || queryPatterns.length > 0) {
      console.log("\n" + "=".repeat(60));
      console.log(`⚠️  SQL ANALYSIS [${this.requestId}]`);
      console.log("=".repeat(60));
      console.log(`Total Queries: ${totalQueries}`);
      console.log(`Total Duration: ${totalDuration.toFixed(2)}ms`);

      if (queryPatterns.length > 0) {
        console.log("\n🔴 DETECTED N+1 PATTERNS:");
        queryPatterns.forEach((pattern) => {
          console.log(`   - ${pattern.table}: ${pattern.count} repeating queries`);
        });
      }

      if (totalQueries > 5) {
        console.log("\n📋 All Queries:");
        this.logs.forEach((log, i) => {
          console.log(`   ${i + 1}. [${log.duration.toFixed(1)}ms] ${log.query.slice(0, 120)}${log.query.length > 120 ? '...' : ''}`);
        });
      }

      console.log("=".repeat(60) + "\n");
    }

    this.requestId = null;
    this.logs = [];
  }

  /** Находит повторяющиеся паттерны запросов */
  private detectN1Patterns(): Array<{ table: string; count: number }> {
    const patterns = new Map<string, number>();

    for (const log of this.logs) {
      // Извлекаем имя таблицы из SELECT запроса
      // Ищем паттерн: SELECT ... FROM "table_name"
      const match = log.query.match(/SELECT .* FROM "?(\w+)"?/i);
      if (match) {
        const table = match[1];
        patterns.set(table, (patterns.get(table) || 0) + 1);
      }
    }

    return Array.from(patterns.entries())
      .filter(([_, count]) => count > 3)
      .map(([table, count]) => ({ table, count }));
  }
}

export const queryAnalyzer = new QueryAnalyzer();
