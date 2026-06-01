import { useState } from "react";
import Graph from "./graph";
import { MOCK_GRAPH } from "@/lib/mockData";
import type { GraphNode } from "@/lib/types";

export default function LoreApp() {
  const [selectedNode, setSelectedNode] = useState<GraphNode>(
    MOCK_GRAPH.nodes[0],
  );
  const [story, setStory] = useState(
    "Click any node to generate a narrative connecting it to the rest of the graph...",
  );

  function handleNodeSelect(node: GraphNode) {
    setSelectedNode(node);
    setStory("Generating narrative...");
    setTimeout(() => {
      setStory(
        `${node.label} sits at a fascinating crossroads in the knowledge graph. Its connections reveal a deeper pattern — each linked concept both shapes and is shaped by it, forming a web of ideas that spans centuries of human thought.`,
      );
    }, 600);
  }

  return (
    <div className="flex flex-1 overflow-hidden, h-full">
      <div className="flex-1 relative">
        <Graph
          data={MOCK_GRAPH}
          selectedId={selectedNode.id}
          onNodeSelect={handleNodeSelect}
        />
      </div>

      <aside className="w-65 border-l border-[#1a1a1a] flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-[#1a1a1a]">
          <div className="text-[10px] uppercase tracking-widest color text-gray-600">
            Selected
          </div>
          <div className="text-lg font-semibold mb-1.5">
            {selectedNode.label}
          </div>
          <div className="text-sm text-gray-400 leading-relaxed">
            {selectedNode.summary}
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-widest color text-gray-600 mb-2.5">
            AI Narrative
          </div>
          <div className="text-xs text-gray-400 italic leading-relaxed">
            {story}
          </div>
        </div>

        <div className="px-4 py-3 bg-[#0a0a0a] border-t border-[#1a1a1a] flex gap-2">
          <button className="flex-1 bg-transparent border border-[#1a1a1a] rounded-md p-2 text-gray-400 text-xs cursor-pointer">
            Share
          </button>
          <button className="flex-1 bg-[#7c3aed] rounded-md p-2 text-xs cursor-pointer">
            + Expand
          </button>
        </div>
      </aside>
    </div>
  );
}
