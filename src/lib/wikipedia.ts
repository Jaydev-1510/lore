const WIKI_REST = 'https://en.wikipedia.org/api/rest_v1';
const WIKI_API  = 'https://en.wikipedia.org/w/api.php';

const WIKI_HEADERS = {
  'User-Agent': 'Lore/1.0 (knowledge-graph-explorer; https://github.com/your-username/lore)',
  'Accept': 'application/json',
};

export interface WikiSummary {
  id: string;
  label: string;
  summary: string;
  url: string;
}

export async function getArticleSummary(title: string): Promise<WikiSummary | null> {
  try {
    const res = await fetch(
      `${WIKI_REST}/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`,
      { headers: WIKI_HEADERS }
    );
    if (!res.ok) return null;
    const d = await res.json();
    if (d.type === 'disambiguation') return null;
    return {
      id: d.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      label: d.title,
      summary: d.extract ? d.extract.slice(0, 220).trimEnd() + '…' : 'No summary available.',
      url: d.content_urls?.desktop?.page ?? '',
    };
  } catch {
    return null;
  }
}

// Primary: REST related endpoint — semantically curated by Wikipedia
export async function getRelatedArticles(title: string): Promise<string[]> {
  try {
    const res = await fetch(
      `${WIKI_REST}/page/related/${encodeURIComponent(title.replace(/ /g, '_'))}`,
      { headers: WIKI_HEADERS }
    );
    if (!res.ok) return [];
    const d = await res.json();
    return (d.pages ?? []).map((p: any) => p.title as string);
  } catch {
    return [];
  }
}

// Fallback: action API links with aggressive filtering
export async function getArticleLinks(title: string): Promise<string[]> {
  const params = new URLSearchParams({
    action: 'query',
    titles: title,
    prop: 'links',
    pllimit: '100',
    plnamespace: '0',
    format: 'json',
    origin: '*',
  });
  try {
    const res = await fetch(`${WIKI_API}?${params}`, { headers: WIKI_HEADERS });
    if (!res.ok) return [];
    const d = await res.json();
    const pages = Object.values(d.query?.pages ?? {}) as any[];
    return (pages[0]?.links ?? [])
      .map((l: any) => l.title as string)
      .filter((t: string) => {
        if (t.includes(':')) return false;          // namespace links
        if (/^\d+$/.test(t)) return false;          // pure numbers / years
        if (/^\d/.test(t)) return false;            // starts with digit
        if (t.length <= 3) return false;            // single letters, "A", "BC"
        if (/^List of/i.test(t)) return false;      // list articles
        if (/ film$/.test(t)) return false;         // "110 film", "126 film"
        if (/^(ISO |ANSI|IEEE|IEC )/.test(t)) return false; // standards bodies
        return true;
      });
  } catch {
    return [];
  }
}
