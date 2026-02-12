// Rate limiting configuration for different actions
// Using Upstash Redis for distributed rate limiting

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message: string;
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Public endpoints
  search: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
    message: "Demasiadas búsquedas. Esperá un minuto.",
  },
  
  // Authentication
  login: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Demasiados intentos de login. Esperá 15 minutos.",
  },
  
  signup: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Demasiados registros desde esta IP. Esperá 1 hora.",
  },
  
  // Vendor actions
  imageUpload: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Demasiadas subidas de imágenes. Esperá 1 hora.",
  },
  
  offerCreate: {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Demasiadas ofertas creadas. Esperá 1 hora.",
  },
};

// Helper to get client identifier (IP or user ID)
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) return `user:${userId}`;
  
  // Try to get IP from various headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfIp = request.headers.get("cf-connecting-ip");
  
  const ip = forwarded?.split(",")[0] ?? realIp ?? cfIp ?? "unknown";
  return `ip:${ip}`;
}

// Note: Actual rate limiting implementation requires @upstash/ratelimit
// Install with: npm install @upstash/ratelimit @upstash/redis
// Then create middleware in src/middleware.ts or API routes

/*
Example usage in API route:

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { RATE_LIMITS, getClientIdentifier } from "@/lib/rate-limit";

const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    RATE_LIMITS.search.maxRequests,
    `${RATE_LIMITS.search.windowMs}ms`
  ),
});

export async function POST(request: Request) {
  const identifier = getClientIdentifier(request);
  const { success, reset } = await ratelimit.limit(identifier);
  
  if (!success) {
    return Response.json(
      { error: RATE_LIMITS.search.message },
      { status: 429, headers: { "X-RateLimit-Reset": reset.toString() } }
    );
  }
  
  // Handle request...
}
*/
