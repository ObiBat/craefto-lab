// ============================================================================
// RATE LIMITING — lightweight sliding window using in-memory Map
// ============================================================================

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

/** Evict expired entries every 5 minutes to prevent memory leaks. */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * Check if a request is within the rate limit.
 *
 * @param key      Unique identifier (e.g. userId, IP)
 * @param limit    Maximum number of requests in the window
 * @param windowMs Window duration in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  cleanup(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove expired timestamps
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= limit) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(retryAfterMs, 1000),
    };
  }

  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: limit - entry.timestamps.length,
    retryAfterMs: 0,
  };
}

// ============================================================================
// PRE-CONFIGURED LIMITERS
// ============================================================================

const ONE_MINUTE_MS = 60 * 1000;

/**
 * Rate limit update creation: max 10 per minute per user.
 */
export function checkUpdateRateLimit(userId: string): RateLimitResult {
  return checkRateLimit(`update:${userId}`, 10, ONE_MINUTE_MS);
}

/**
 * Rate limit sign-in attempts: max 5 per minute per IP.
 * In demo mode, limit is relaxed to 20 per minute.
 */
export function checkSignInRateLimit(ip: string, isDemoMode: boolean): RateLimitResult {
  const limit = isDemoMode ? 20 : 5;
  return checkRateLimit(`signin:${ip}`, limit, ONE_MINUTE_MS);
}

/**
 * Build a 429 JSON response with Retry-After header.
 */
export function rateLimitResponse(retryAfterMs: number): Response {
  const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again later.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSeconds),
      },
    },
  );
}
