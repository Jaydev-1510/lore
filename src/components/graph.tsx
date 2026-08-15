import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { GraphData, GraphNode } from '../lib/types';

interface Props {
  data: GraphData;
  onNodeSelect: (node: GraphNode) => void;
  selectedId?: string;
}

const COLORS = {
  0: { fill: '#7C3AED', text: '#EDE9FE' },
  1: { fill: '#0F766E', text: '#CCFBF1' },
  2: { fill: '#334155', text: '#CBD5E1' },
};

function wrapLabel(label: string): [string, string] {
  const words = label.split(' ');
  if (words.length === 1) return [label, ''];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

export default function Graph({ data, onNodeSelect, selectedId }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const el = svgRef.current;
    const W = el.clientWidth || 700;
    const H = el.clientHeight || 500;

    d3.select(el).selectAll('*').remove();

    const svg = d3.select(el);
    const g = svg.append('g');

    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.25, 3])
        .on('zoom', (e) => g.attr('transform', e.transform))
    );

    const nodes: GraphNode[] = data.nodes.map(n => ({ ...n }));
    const links = data.links.map(l => ({ ...l }));

    const sim = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(d => {
        const src = d.source as GraphNode;
        return src.depth === 0 ? 130 : 100;
      }).strength(0.9))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide(d => (d as GraphNode).depth === 0 ? 44 : 36));

    const linkEl = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#1E293B')
      .attr('stroke-width', 1.5);

    const nodeG = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, GraphNode>()
          .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
          .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
      )
      .on('click', (_, d) => onNodeSelect(d));

    const radius = (d: GraphNode) => d.depth === 0 ? 32 : d.depth === 1 ? 26 : 18;

    nodeG.append('circle')
      .attr('r', radius)
      .attr('fill', d => COLORS[d.depth as 0|1|2]?.fill ?? COLORS[2].fill)
      .attr('stroke', d => d.id === selectedId ? '#FCD34D' : 'transparent')
      .attr('stroke-width', 3);

    // Two-line label
    nodeG.each(function(d) {
      const group = d3.select(this);
      const [line1, line2] = wrapLabel(d.label);
      const fontSize = d.depth === 0 ? '11px' : d.depth === 1 ? '10px' : '9px';
      const color = COLORS[d.depth as 0|1|2]?.text ?? COLORS[2].text;
      const weight = d.depth === 0 ? '600' : '400';

      if (line2) {
        group.append('text')
          .text(line1)
          .attr('text-anchor', 'middle')
          .attr('dy', '-0.3em')
          .attr('font-size', fontSize)
          .attr('font-weight', weight)
          .attr('fill', color)
          .attr('pointer-events', 'none');
        group.append('text')
          .text(line2)
          .attr('text-anchor', 'middle')
          .attr('dy', '0.9em')
          .attr('font-size', fontSize)
          .attr('font-weight', weight)
          .attr('fill', color)
          .attr('pointer-events', 'none');
      } else {
        group.append('text')
          .text(line1)
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('font-size', fontSize)
          .attr('font-weight', weight)
          .attr('fill', color)
          .attr('pointer-events', 'none');
      }
    });

    sim.on('tick', () => {
      linkEl
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      nodeG.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => { sim.stop(); };
  }, [data]);

  // Update selected highlight without full re-render
  useEffect(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current)
      .selectAll<SVGCircleElement, GraphNode>('circle')
      .attr('stroke', d => d.id === selectedId ? '#FCD34D' : 'transparent')
      .attr('stroke-width', 3);
  }, [selectedId]);

  return <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}
