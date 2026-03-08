/**
 * Request body size validation utility.
 *
 * Protects API routes against oversized payloads by checking both the
 * Content-Length header (fast reject) and the actual body size after reading.
 *
 * Usage:
 *   const body = await parseBodyWithLimit(request);          // 100 KB default
 *   const body = await parseBodyWithLimit(request, 50_000);  // 50 KB custom
 */

export class BodyTooLargeError extends Error {
  constructor(maxBytes: number) {
    super(`Request body too large (max ${Math.round(maxBytes / 1000)}KB).`);
    this.name = 'BodyTooLargeError';
  }
}

/**
 * Parse a request body as JSON with a size limit.
 *
 * @param request  - The incoming Request object
 * @param maxBytes - Maximum allowed body size in bytes (default: 100,000 = 100KB)
 * @returns Parsed JSON body
 * @throws {BodyTooLargeError} if the body exceeds the limit
 * @throws {SyntaxError} if the body is not valid JSON
 */
export async function parseBodyWithLimit(request: Request, maxBytes: number = 100_000): Promise<unknown> {
  // Fast reject: check Content-Length header before reading the stream
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > maxBytes) {
    throw new BodyTooLargeError(maxBytes);
  }

  // Read and check actual size (Content-Length can be absent or spoofed)
  const text = await request.text();
  if (text.length > maxBytes) {
    throw new BodyTooLargeError(maxBytes);
  }

  return JSON.parse(text);
}
