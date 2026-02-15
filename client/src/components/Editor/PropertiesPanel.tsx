import { useWorkflowStore } from "@/lib/store";
import { Plus, X, HelpCircle, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

export function PropertiesPanel() {
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);
  const nodes = useWorkflowStore((state) => state.nodes);
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <aside className="w-72 bg-[#121212] border-l border-[#222224] flex items-center justify-center text-muted-foreground text-sm z-20">
        <div className="flex flex-col items-center gap-2 text-center px-6">
          <Info className="w-8 h-8 opacity-20" />
          <p>Select a node to view properties</p>
        </div>
      </aside>
    );
  }

  const { data } = selectedNode;

  return (
    <aside className="w-72 bg-[#121212] border-l border-[#222224] flex flex-col z-20 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-[#222224]">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-white">{data.label}</h2>
          {data.cost && (
            <span className="text-xs font-mono text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">
              {data.cost}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">ID: {selectedNode.id}</p>
      </div>

Tool call argument 'replace' pruned from message history.

    </aside>
  );
}
