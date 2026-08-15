import { useState, useCallback } from 'react';
import Graph from './graph';
import { MOCK_GRAPH } from '../lib/mockData';
import type { GraphData, GraphNode } from '../lib/types';

export default function LoreApp() {
  const [graphData, setGraphData] = useState<GraphData>(MOCK_GRAPH);
  const [selectedNode, setSelectedNode] = useState<GraphNode>(MOCK_GRAPH.nodes[0]);
  const [story, setStory] = useState('Click any node to see its summary here.');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nodeCount, setNodeCount] = useState(MOCK_GRAPH.nodes.length);

  const handleSearch = useCallback(async () => {
    const topic = query.trim();
    if (!topic || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/graph?topic=${encodeURIComponent(topic)}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Failed to fetch');
      }
      const data: GraphData = await res.json();
      setGraphData(data);
      setSelectedNode(data.nodes[0]);
      setStory('Click any node to explore its connections.');
      setNodeCount(data.nodes.length);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [query, loading]);

  function handleNodeSelect(node: GraphNode) {
    setSelectedNode(node);
    setStory(`${node.label} connects to ${
      graphData.links.filter(l =>
        (typeof l.source === 'string' ? l.source : (l.source as GraphNode).id) === node.id ||
        (typeof l.target === 'string' ? l.target : (l.target as GraphNode).id) === node.id
      ).length
    } other concepts in this graph. Groq narrative generation is a feature planned for future version.`);
  }

  return (
    <>
      {/* Search bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', gap: 0, padding: '12px 20px',
        borderBottom: '1px solid #2E2E2E', background: '#000000',
        zIndex: 10, flexShrink: 0
      }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Enter any topic — Nikola Tesla, Quantum Mechanics, Roman Empire..."
          style={{
            flex: 1, background: '#0A0A0A', border: '1px solid #2E2E2E',
            borderRadius: '8px 0 0 8px', padding: '10px 14px',
            color: '#F1F5F9', fontSize: '13px', outline: 'none', fontStyle: 'italic'
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            background: loading ? '#4C1D95' : '#7C3AED', color: 'white',
            border: 'none', borderRadius: '0 8px 8px 0',
            padding: '10px 20px', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
            minWidth: '100px',
          }}
        >
          {loading ? 'Loading…' : 'Explore'}
        </button>
        {error && (
          <span style={{ marginLeft: '12px', fontSize: '12px', color: '#F87171', alignSelf: 'center' }}>
            {error}
          </span>
        )}
      </div>

      {/* Graph + Sidebar */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', marginTop: '57px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Graph data={graphData} selectedId={selectedNode.id} onNodeSelect={handleNodeSelect} />
        </div>

        <aside style={{
          width: '260px', borderLeft: '1px solid #2E2E2E',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #2E2E2E' }}>
            <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A1A1A1', marginBottom: '8px' }}>
              Selected · {nodeCount} nodes
            </div>
            <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '6px', fontFamily: 'Playfair Display, serif' }}>{selectedNode.label}</div>
            <div style={{ fontSize: '12px', color: '#A1A1A1', lineHeight: 1.6 }}>{selectedNode.summary}</div>
            {selectedNode.url && (
              <a href={selectedNode.url} target="_blank" rel="noreferrer"
                style={{ fontSize: '11px', color: '#7C3AED', marginTop: '8px', display: 'inline-block' }}>
                Wikipedia ↗
              </a>
            )}
          </div>

          <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FFFFFF', marginBottom: '10px' }}>
              AI Narrative
            </div>
            <div style={{ fontSize: '12px', color: '#A1A1A1', lineHeight: 1.8, fontStyle: 'italic' }}>
              {story}
            </div>
          </div>

          <div style={{ padding: '12px 16px', borderTop: '1px solid #2E2E2E', display: 'flex', gap: '8px' }}>
            <button title="This feature is planned for future version." style={{ flex: 1, background: 'transparent', border: '1px solid #2E2E2E', borderRadius: '6px', padding: '8px', color: '#94A3B8', fontSize: '12px', cursor: 'pointer' }}>
              Share
            </button>
            <button title="This feature is planned for future version." style={{ flex: 1, background: '#7C3AED', border: 'none', borderRadius: '6px', padding: '8px', color: 'white', fontSize: '12px', cursor: 'pointer' }}>
              + Expand
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
