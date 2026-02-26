/**
 * Sanitize a string for safe interpolation into PostgREST filter expressions.
 * Strips characters that have special meaning in PostgREST filter syntax.
 */
export function sanitizePostgrestValue(value: string): string {
  // Remove PostgREST filter metacharacters: commas, parentheses, curly braces, backslashes
  // Also strip any control characters
  return value
    .replace(/[,(){}\\]/g, '')
    .replace(/\./g, ' ')
    .replace(/[\x00-\x1f]/g, '')
    .trim();
}
