import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * In-Memory Rate Limiter (Launch-Version)
 *
 * Production-Upgrade:
 * - Ersetze durch Upstash Redis für Multi-Instance Support
 * - Env Vars: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 * - Package: @upstash/redis
 *
 * Aktuell:
 * - Speichert IPs + Timestamps in-memory
 * - Funktioniert nur bei Single-Instance (Vercel Serverless OK für Start)
 * - Wird bei jedem Cold-Start zurückgesetzt (kein Problem für MVP)
 */

// Rate Limit Storage (In-Memory)
const rateLimitStore = new Map<string, number[]>();

// Rate Limit Config
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 Minute
const MAX_REQUESTS_PER_WINDOW = {
  login: 5, // Max 5 Login-Versuche pro Minute
  api: 100, // Max 100 API-Calls pro Minute
  default: 60, // Max 60 Requests pro Minute (allgemein)
};

/**
 * Rate Limiting prüfen
 */
function checkRateLimit(
  ip: string,
  limit: number,
  window: number = RATE_LIMIT_WINDOW
): { allowed: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const windowStart = now - window;

  // Hole bisherige Requests für diese IP
  let requests = rateLimitStore.get(ip) || [];

  // Filtere alte Requests (außerhalb des Zeitfensters)
  requests = requests.filter((timestamp) => timestamp > windowStart);

  // Prüfe Limit
  if (requests.length >= limit) {
    return {
      allowed: false,
      remaining: 0,
      reset: Math.ceil((requests[0] + window) / 1000), // Timestamp in Sekunden
    };
  }

  // Request hinzufügen
  requests.push(now);
  rateLimitStore.set(ip, requests);

  return {
    allowed: true,
    remaining: limit - requests.length,
    reset: Math.ceil((now + window) / 1000),
  };
}

/**
 * IP-Adresse aus Request extrahieren
 */
function getIP(request: NextRequest): string {
  // Vercel setzt x-forwarded-for Header
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  // Fallback
  return request.headers.get("x-real-ip") || "unknown";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths (Sicherheit, Impressum, etc.)
  const publicPaths = ["/sicherheit", "/impressum", "/datenschutz"];
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Auth paths (Login, Register, API Auth)
  const isAuthPath =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth");

  // Rate Limiting anwenden
  const ip = getIP(request);
  let limit = MAX_REQUESTS_PER_WINDOW.default;

  if (isAuthPath) {
    limit = MAX_REQUESTS_PER_WINDOW.login;
  } else if (pathname.startsWith("/api/")) {
    limit = MAX_REQUESTS_PER_WINDOW.api;
  }

  const rateLimitResult = checkRateLimit(ip, limit);

  // Rate Limit Headers hinzufügen
  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
  response.headers.set("X-RateLimit-Reset", rateLimitResult.reset.toString());

  // Rate Limit überschritten
  if (!rateLimitResult.allowed) {
    return new NextResponse(
      JSON.stringify({
        error: "Too Many Requests",
        message: "Zu viele Anfragen. Bitte warten Sie einen Moment.",
        retryAfter: rateLimitResult.reset,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": (rateLimitResult.reset - Math.floor(Date.now() / 1000)).toString(),
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": rateLimitResult.reset.toString(),
        },
      }
    );
  }

  // Security Headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
