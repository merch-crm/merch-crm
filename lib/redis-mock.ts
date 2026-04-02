export class RedisMock {
  private data: Map<string, string> = new Map();
  
  async get(key: string) { return this.data.get(key) || null; }
  async set(key: string, value: string, _mode?: string, _duration?: number) { 
    this.data.set(key, value); 
    return "OK"; 
  }
  async setex(key: string, seconds: number, value: string) {
    this.data.set(key, value);
    return "OK";
  }
  async del(...keys: string[]) { 
    let count = 0;
    for (const key of keys) {
      if (this.data.delete(key)) count++;
    }
    return count;
  }
  async incr(key: string) {
    const val = parseInt(this.data.get(key) || "0") + 1;
    this.data.set(key, val.toString());
    return val;
  }
  async expire(_key: string, _seconds: number) { return 1; }
  async ttl(_key: string) { return 60; }
  async smembers(_key: string) { return []; }
  async sadd(_key: string, _member: string) { return 1; }
  async dbsize() { return this.data.size; }
  async info(_section?: string) { return "used_memory_human:0B"; }
  
  multi() {
    const commands: (() => Promise<unknown>)[] = [];
    const proxy = {
      incr: (key: string) => {
        commands.push(() => this.incr(key));
        return proxy;
      },
      expire: (key: string, seconds: number) => {
        commands.push(() => this.expire(key, seconds));
        return proxy;
      },
      ttl: (key: string) => {
        commands.push(() => this.ttl(key));
        return proxy;
      },
      sadd: (key: string, member: string) => {
        commands.push(() => this.sadd(key, member));
        return proxy;
      },
      exec: async () => {
        const results = [];
        for (const cmd of commands) {
          results.push([null, await cmd()]);
        }
        return results;
      }
    };
    return proxy;
  }

  pipeline() {
    return this.multi();
  }

  async keys(pattern: string) {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    return Array.from(this.data.keys()).filter(key => regex.test(key));
  }
  
  async scan(cursor: string | number, matchParam: string, pattern: string, _countParam?: string, _count?: number) {
    // Простая реализация мока: возвращает все совпадающие ключи за один раз
    const keys = await this.keys(pattern);
    return ["0", keys]; // "0" - признак окончания сканирования
  }
  
  async ping() { return "PONG"; }
  
  async flushall() { this.data.clear(); return "OK"; }
}
