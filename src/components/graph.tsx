import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import type { GraphData, GraphNode } from "@/lib/types";

interface Props {
  data: GraphData;
  onNodeSelect: (node: GraphNode) => void;
  selectedId?: string;
}

export default function Graph({ data, onNodeSelect, selectedId }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<d3.Simulation<GraphNode, any> | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const el = svgRef.current;
    const W = el.clientWidth || 700;
    const H = el.clientHeight || 500;

    d3.select(el).selectAll("*").remove();

    const svg = d3.select(el);

    const g = svg.append("g");

    svg.call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 3])
        .on("zoom", (e) => g.attr("transform", e.transform)),
    );

    const nodes: GraphNode[] = data.nodes.map((node) => ({ ...node }));
    const links = data.links.map((link) => ({ ...link }));

    const sim = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(120)
          .strength(0.8),
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(W / 2, H / 2))
      .force("collision", d3.forceCollide(40));

    simRef.current = sim;

    const linkEl = g
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "var(--link-color)")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.5);

    const nodeG = g
      .append("g")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on("start", (event, d) => {
            if (!event.active) sim.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) sim.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }),
      )
      .on("click", (_, d) => onNodeSelect(d));

    nodeG
      .append("circle")
      .attr("r", (d) => (d.depth === 0 ? 32 : d.depth === 1 ? 24 : 16))
      .attr("fill", (d) =>
        d.depth === 0
          ? "var(--node-root)"
          : d.depth === 1
            ? "var(--node-depth1)"
            : "var(--node-depth2)",
      )
      .attr("stroke", "#0A0A0F")
      .attr("stroke-width", 2);

    nodeG
      .append("text")
      .text((d) => (d.label.length > 12 ? d.label.split(" ")[0] : d.label))
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", (d) => (d.depth === 0 ? "11px" : "9px"))
      .attr("font-weight", (d) => (d.depth === 0 ? "600" : "400"))
      .attr("fill", (d) => (d.depth === 0 ? "#1a1a1a" : "#fff"))
      .attr("pointer-events", "none");

    sim.on("tick", () => {
      linkEl
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);
      nodeG.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => {
      sim.stop();
    };
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || !selectedId) return;
    d3.select(svgRef.current)
      .selectAll<SVGCircleElement, GraphNode>("circle")
      .attr("stroke", (d) => (d.id === selectedId ? "#F59E0B" : "#0A0A0F"))
      .attr("stroke-width", (d) => (d.id === selectedId ? 3 : 2));
  }, [selectedId]);

  return (
    <svg
      ref={svgRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
