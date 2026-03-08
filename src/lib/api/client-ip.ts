/**
 * Extract the client IP address from request headers.
 *
 * TRUST MODEL:
 * Terrain runs exclusively behind Vercel's edge network. Vercel sets
 * `x-forwarded-for` and `x-real-ip` at the edge and strips any
 * client-supplied values for these headers. This means we can trust
 * them in production.
 *
 * When headers are missing (e.g., local development, or an unexpected
 * deployment environment), we fall back to a fingerprint derived from
 * User-Agent + Accept-Language. This is not a perfect identifier but
 * prevents trivial bypass by omitting headers — an attacker would also
 * need to rotate their UA/language to evade rate limits.
 *
 * Reference: https://vercel.com/docs/edge-network/headers#x-forwarded-for
 */

/**
 * Get a stable identifier for the requesting client, suitable for
 * rate-limiting keys.
 *
 * Priority:
 * 1. x-forwarded-for (first IP = client IP, set by Vercel edge)
 * 2. x-real-ip (set by Vercel edge)
 * 3. Fingerprint hash of User-Agent + Accept-Language (fallback)
 */
export function getClientIp(request: Request): string {
  // Vercel sets x-forwarded-for with the real client IP as the first entry.
  // In a chain like "client, proxy1, proxy2", take only the first IP.
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const firstIp = xff.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  // Fallback: x-real-ip (also set by Vercel)
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  // Final fallback: generate a fingerprint from available headers.
  // This is intentionally weak — it only needs to prevent the most
  // trivial rate-limit bypasses when proxy headers are absent.
  const ua = request.headers.get('user-agent') ?? '';
  const lang = request.headers.get('accept-language') ?? '';
  return `fp:${simpleHash(ua + '|' + lang)}`;
}

/**
 * Simple non-cryptographic hash for fingerprinting.
 * Uses djb2 — fast and produces well-distributed 32-bit integers.
 */
function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}
