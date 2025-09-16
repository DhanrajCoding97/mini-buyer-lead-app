// lib/rateLimiter.ts
interface RateLimitData {
    count: number;
    resetTime: number;
  }
  
  class RateLimiter {
    private store = new Map<string, RateLimitData>();
    private maxRequests: number;
    private windowMs: number;
  
    constructor(maxRequests: number = 10, windowMs: number = 60 * 1000) { // 10 requests per minute by default
      this.maxRequests = maxRequests;
      this.windowMs = windowMs;
    }
  
    isRateLimited(identifier: string): boolean {
      const now = Date.now();
      const data = this.store.get(identifier);
  
      if (!data || now > data.resetTime) {
        // Reset or create new entry
        this.store.set(identifier, {
          count: 1,
          resetTime: now + this.windowMs
        });
        return false;
      }
  
      if (data.count >= this.maxRequests) {
        return true;
      }
  
      // Increment count
      data.count++;
      this.store.set(identifier, data);
      return false;
    }
  
    getRemainingRequests(identifier: string): number {
      const data = this.store.get(identifier);
      if (!data || Date.now() > data.resetTime) {
        return this.maxRequests;
      }
      return Math.max(0, this.maxRequests - data.count);
    }
  
    getResetTime(identifier: string): number {
      const data = this.store.get(identifier);
      if (!data || Date.now() > data.resetTime) {
        return Date.now() + this.windowMs;
      }
      return data.resetTime;
    }
  
    // Clean up expired entries periodically
    cleanup(): void {
      const now = Date.now();
      for (const [key, data] of this.store.entries()) {
        if (now > data.resetTime) {
          this.store.delete(key);
        }
      }
    }
  }
  
  // Create rate limiter instances
  export const createRateLimiter = new RateLimiter(5, 60 * 1000); // 5 creates per minute
  export const updateRateLimiter = new RateLimiter(10, 60 * 1000); // 10 updates per minute
  
  // Helper function to get client identifier
  export function getClientIdentifier(request: Request, userId?: string): string {
    // Prefer user ID if available, fallback to IP
    if (userId) {
      return `user:${userId}`;
    }
    
    // Get IP from various headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIp || 'unknown';
    
    return `ip:${ip}`;
  }
  
  // Cleanup expired entries every 5 minutes
  setInterval(() => {
    createRateLimiter.cleanup();
    updateRateLimiter.cleanup();
  }, 5 * 60 * 1000);