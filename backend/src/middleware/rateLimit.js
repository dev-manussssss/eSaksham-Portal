/**
 * SAKSHAM In-Memory Sliding Window Rate Limiter (AUD-013)
 * Protects auth, document analysis, and public endpoints from abuse.
 */

class SimpleRateLimiter {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.hits = new Map();

    // Periodic cleanup of stale entries
    setInterval(() => {
      const now = Date.now();
      for (const [key, timestamps] of this.hits.entries()) {
        const valid = timestamps.filter(t => now - t < this.windowMs);
        if (valid.length === 0) {
          this.hits.delete(key);
        } else {
          this.hits.set(key, valid);
        }
      }
    }, windowMs);
  }

  middleware(errorMessage = 'Too many requests. Please slow down and try again later.') {
    return (req, res, next) => {
      const key = req.ip || req.connection.remoteAddress || 'unknown-client';
      const now = Date.now();
      const clientTimestamps = this.hits.get(key) || [];

      // Filter out timestamps outside the active window
      const recent = clientTimestamps.filter(t => now - t < this.windowMs);

      if (recent.length >= this.limit) {
        return res.status(429).json({
          success: false,
          error: errorMessage,
          retryAfterMs: this.windowMs - (now - recent[0]),
        });
      }

      recent.push(now);
      this.hits.set(key, recent);
      next();
    };
  }
}

// 1. Auth Rate Limiter: 10 attempts per minute
export const authRateLimiter = new SimpleRateLimiter(10, 60 * 1000).middleware(
  'Too many login attempts. Please wait 1 minute before trying again.'
);

// 2. AI & OCR Analysis Limiter: 15 document uploads per minute
export const documentAnalysisLimiter = new SimpleRateLimiter(15, 60 * 1000).middleware(
  'Document analysis rate limit reached. Please wait before submitting additional files.'
);

// 3. Global API Limiter: 200 requests per minute
export const globalApiLimiter = new SimpleRateLimiter(200, 60 * 1000).middleware(
  'API request rate limit exceeded.'
);
