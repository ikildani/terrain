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

/**
 * Sanitize a string for safe use in PostgREST `.ilike()` patterns.
 * In addition to PostgREST metacharacter removal, this escapes SQL
 * wildcard characters (% and _) that would otherwise allow an attacker
 * to broaden pattern matches beyond the intended search term.
 */
export function sanitizePostgrestSearch(value: string): string {
  const base = sanitizePostgrestValue(value);
  return base.replace(/%/g, '\\%').replace(/_/g, '\\_');
}
