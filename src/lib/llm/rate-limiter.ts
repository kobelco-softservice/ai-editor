// src/lib/llm/rate-limiter.ts
export class RateLimiter {
    private requests: number = 0;
    private lastReset: number = Date.now();
    private LIMIT = 10; // 10リクエスト/分
    private RESET_INTERVAL = 60000; // 1分

    constructor(limit:number, interval:number) {
      this.LIMIT = limit;
      this.RESET_INTERVAL = interval;
    }
  
    async checkLimit(): Promise<void> {
      const now = Date.now();
      
      if (now - this.lastReset >= this.RESET_INTERVAL) {
        this.requests = 0;
        this.lastReset = now;
      }
  
      if (this.requests >= this.LIMIT) {
        throw new Error('Rate limit exceeded');
      }
  
      this.requests++;
    }
  }