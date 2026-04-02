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
  
  async scan(cursor: string | number, ...args: (string | number)[]) {
    // Sort keys to have a stable order for pagination
    const allKeys = Array.from(this.data.keys()).sort();
    
    let start = 0;
    if (cursor !== "0" && cursor !== 0) {
      const cursorStr = cursor.toString();
      // Find where we left off. If the cursor key was deleted, 
      // we find the next available key in sorted order.
      const idx = allKeys.findIndex(k => k >= cursorStr);
      if (idx !== -1) {
        start = allKeys[idx] === cursorStr ? idx + 1 : idx;
      } else {
        start = allKeys.length;
      }
    }
    
    // Default Redis values
    let pattern = '*';
    let count = 10; 

    // Extract MATCH and COUNT from variadic arguments
    for (let i = 0; i < args.length; i++) {
      if (args[i] === 'MATCH' && args[i+1]) {
        pattern = args[i+1] as string;
        i++;
      } else if (args[i] === 'COUNT' && args[i+1]) {
        count = parseInt(args[i+1] as string, 10);
        i++;
      }
    }

    const end = Math.min(start + count, allKeys.length);
    const chunk = allKeys.slice(start, end);
    
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    const matchedKeys = chunk.filter(key => regex.test(key));
    
    // The next cursor is the last key we looked at in this batch, or "0" if we're done
    const nextCursor = end >= allKeys.length ? "0" : allKeys[end - 1];
    
    return [nextCursor, matchedKeys];
  }
  
  async ping() { return "PONG"; }
  
  async flushall() { this.data.clear(); return "OK"; }
}
