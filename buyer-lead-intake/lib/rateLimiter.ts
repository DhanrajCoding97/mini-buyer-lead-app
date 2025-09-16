// // lib/rateLimiter.ts
// interface RateLimitData {
//     count: number;
//     resetTime: number;
//   }
  
//   class RateLimiter {
//     private store = new Map<string, RateLimitData>();
//     private maxRequests: number;
//     private windowMs: number;
  
//     constructor(maxRequests: number = 10, windowMs: number = 60 * 1000) { // 10 requests per minute by default
//       this.maxRequests = maxRequests;
//       this.windowMs = windowMs;
//     }
  
//     isRateLimited(identifier: string): boolean {
//       const now = Date.now();
//       const data = this.store.get(identifier);
  
//       if (!data || now > data.resetTime) {
//         // Reset or create new entry
//         this.store.set(identifier, {
//           count: 1,
//           resetTime: now + this.windowMs
//         });
//         return false;
//       }
  
//       if (data.count >= this.maxRequests) {
//         return true;
//       }
  
//       // Increment count
//       data.count++;
//       this.store.set(identifier, data);
//       return false;
//     }
  
//     getRemainingRequests(identifier: string): number {
//       const data = this.store.get(identifier);
//       if (!data || Date.now() > data.resetTime) {
//         return this.maxRequests;
//       }
//       return Math.max(0, this.maxRequests - data.count);
//     }
  
//     getResetTime(identifier: string): number {
//       const data = this.store.get(identifier);
//       if (!data || Date.now() > data.resetTime) {
//         return Date.now() + this.windowMs;
//       }
//       return data.resetTime;
//     }
  
//     // Clean up expired entries periodically
//     cleanup(): void {
//       const now = Date.now();
//       for (const [key, data] of this.store.entries()) {
//         if (now > data.resetTime) {
//           this.store.delete(key);
//         }
//       }
//     }
//   }
  
//   // Create rate limiter instances
//   export const createRateLimiter = new RateLimiter(5, 60 * 1000); // 5 creates per minute
//   export const updateRateLimiter = new RateLimiter(10, 60 * 1000); // 10 updates per minute
  
//   // Helper function to get client identifier
//   export function getClientIdentifier(request: Request, userId?: string): string {
//     // Prefer user ID if available, fallback to IP
//     if (userId) {
//       return `user:${userId}`;
//     }
    
//     // Get IP from various headers
//     const forwarded = request.headers.get('x-forwarded-for');
//     const realIp = request.headers.get('x-real-ip');
//     const ip = forwarded?.split(',')[0] || realIp || 'unknown';
    
//     return `ip:${ip}`;
//   }
  
//   // Cleanup expired entries every 5 minutes
//   setInterval(() => {
//     createRateLimiter.cleanup();
//     updateRateLimiter.cleanup();
//   }, 5 * 60 * 1000);


// lib/rateLimiter.ts
interface RateLimitData {
  count: number;
  resetTime: number;
  requests: number[]; // Array of timestamps
}

class InMemoryRateLimiter {
  private store = new Map<string, RateLimitData>();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  checkRateLimit(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get or create entry
    let data = this.store.get(identifier);
    if (!data) {
      data = { count: 0, resetTime: now + this.windowMs, requests: [] };
      this.store.set(identifier, data);
    }

    // Clean up old requests (sliding window approach)
    data.requests = data.requests.filter(timestamp => timestamp > windowStart);

    // Check if we're within limits
    if (data.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...data.requests);
      const retryAfter = Math.ceil((oldestRequest + this.windowMs - now) / 1000);
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: oldestRequest + this.windowMs,
        retryAfter: Math.max(1, retryAfter)
      };
    }

    // Add current request
    data.requests.push(now);
    data.count = data.requests.length;
    
    // Clean up expired entries periodically
    this.cleanup();

    return {
      allowed: true,
      remaining: this.maxRequests - data.requests.length,
      resetTime: data.requests[0] + this.windowMs
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [key, data] of this.store.entries()) {
      // Remove entries that have no recent requests
      data.requests = data.requests.filter(timestamp => timestamp > windowStart);
      
      if (data.requests.length === 0) {
        this.store.delete(key);
      }
    }
  }

  // Method to get current status without incrementing
  getStatus(identifier: string): {
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const data = this.store.get(identifier);

    if (!data) {
      return {
        remaining: this.maxRequests,
        resetTime: now + this.windowMs
      };
    }

    // Filter recent requests
    const recentRequests = data.requests.filter(timestamp => timestamp > windowStart);
    const oldestRequest = recentRequests.length > 0 ? Math.min(...recentRequests) : now;

    return {
      remaining: this.maxRequests - recentRequests.length,
      resetTime: oldestRequest + this.windowMs
    };
  }
}

// Create rate limiter instances
export const createRateLimiter = new InMemoryRateLimiter(5, 60 * 1000); // 5 creates per minute
export const updateRateLimiter = new InMemoryRateLimiter(10, 60 * 1000); // 10 updates per minute

// Helper function to get client identifier
export function getClientIdentifier(request: Request, userId?: string): string {
  // For interview purposes, primarily use user ID
  if (userId) {
    return `user:${userId}`;
  }
  
  // Fallback to IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return `ip:${ip}`;
}

// Optional: Clean up expired entries every 2 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    createRateLimiter['cleanup']();
    updateRateLimiter['cleanup']();
  }, 2 * 60 * 1000);
}