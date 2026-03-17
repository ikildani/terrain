// ────────────────────────────────────────────────────────────
// Perplexity AI Client — Silent real-time intelligence layer
// Users see "Live Market Intelligence", never "Perplexity"
// ────────────────────────────────────────────────────────────

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/v1/responses';

interface PerplexityResponse {
  output: { content: string; citations?: { url: string; title?: string }[] }[];
}

export async function queryPerplexity(
  query: string,
  options?: { preset?: string },
): Promise<{
  content: string;
  citations: { url: string; title: string }[];
} | null> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) return null; // Graceful degradation when not configured

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preset: options?.preset || 'fast-search',
        input: query,
      }),
      signal: AbortSignal.timeout(15000), // 15s timeout
    });

    if (!response.ok) return null;
    const data = (await response.json()) as PerplexityResponse;

    // Extract content and citations from response
    const output = data.output?.[0];
    if (!output) return null;

    return {
      content: output.content || '',
      citations: (output.citations || []).map((c) => ({
        url: c.url,
        title: c.title || new URL(c.url).hostname,
      })),
    };
  } catch {
    return null; // Never crash the main analysis if Perplexity fails
  }
}
