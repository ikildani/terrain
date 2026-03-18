// ────────────────────────────────────────────────────────────
// Perplexity AI Client — Silent real-time intelligence layer
// Users see "Live Market Intelligence", never "Perplexity"
// ────────────────────────────────────────────────────────────

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/v1/responses';

interface PerplexityOutputItem {
  type: string;
  // search_results type
  queries?: string[];
  results?: { url: string; title: string; snippet: string }[];
  // message type
  content?: { text: string; type: string }[];
  role?: string;
}

interface PerplexityResponse {
  output: PerplexityOutputItem[];
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

    // Extract content from the message output (type: "message")
    const messageOutput = data.output?.find((o) => o.type === 'message');
    const searchOutput = data.output?.find((o) => o.type === 'search_results');

    // Content is an array of { text, type } objects
    const contentText =
      messageOutput?.content
        ?.filter((c) => c.type === 'output_text')
        .map((c) => c.text)
        .join('\n') || '';

    if (!contentText) return null;

    // Extract citations from search results
    const citations =
      searchOutput?.results?.map((r) => ({
        url: r.url,
        title: r.title || new URL(r.url).hostname,
      })) || [];

    return { content: contentText, citations };
  } catch {
    return null; // Never crash the main analysis if Perplexity fails
  }
}
