import type { APIRoute } from 'astro';
import { getArticleSummary, getRelatedArticles, getArticleLinks } from '../../lib/wikipedia';
import type { GraphData } from '../../lib/types';

export const GET: APIRoute = async ({ request }) => {
  const topic = new URL(request.url).searchParams.get('topic')?.trim();
  if (!topic) {
    return new Response(JSON.stringify({ error: 'topic required' }), { status: 400 });
  }

  const root = await getArticleSummary(topic);
  if (!root) {
    return new Response(JSON.stringify({ error: 'Article not found' }), { status: 404 });
  }

  // Try related first, fall back to filtered links
  let depth1Titles = await getRelatedArticles(topic);
  if (depth1Titles.length < 4) {
    depth1Titles = await getArticleLinks(topic);
  }

  const depth1Results = await Promise.all(depth1Titles.slice(0, 14).map(t => getArticleSummary(t)));
  const depth1Nodes = depth1Results
    .filter((n): n is NonNullable<typeof n> => n !== null)
    .slice(0, 7);

  const depth2Pairs = await Promise.all(
    depth1Nodes.map(async (parent) => {
      let links = await getRelatedArticles(parent.label);
      if (links.length < 3) links = await getArticleLinks(parent.label);
      const candidates = links.filter(
        t => t !== topic && !depth1Nodes.find(n => n.label === t)
      ).slice(0, 8);
      const summaries = await Promise.all(candidates.map(t => getArticleSummary(t)));
      const valid = summaries.filter((n): n is NonNullable<typeof n> => n !== null).slice(0, 2);
      return { parentId: parent.id, nodes: valid };
    })
  );

  const seen = new Set<string>([root.id, ...depth1Nodes.map(n => n.id)]);
  const depth2Nodes: typeof depth1Nodes = [];
  const depth2Links: { source: string; target: string }[] = [];

  for (const { parentId, nodes } of depth2Pairs) {
    for (const n of nodes) {
      if (!seen.has(n.id)) {
        seen.add(n.id);
        depth2Nodes.push(n);
        depth2Links.push({ source: parentId, target: n.id });
      }
    }
  }

  const graph: GraphData = {
    nodes: [
      { ...root, depth: 0 },
      ...depth1Nodes.map(n => ({ ...n, depth: 1 })),
      ...depth2Nodes.map(n => ({ ...n, depth: 2 })),
    ],
    links: [
      ...depth1Nodes.map(n => ({ source: root.id, target: n.id })),
      ...depth2Links,
    ],
  };

  return new Response(JSON.stringify(graph), {
    headers: { 'Content-Type': 'application/json' },
  });
};
