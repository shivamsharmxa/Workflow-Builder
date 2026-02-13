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

      {/* Form Fields */}
      <div className="p-4 space-y-6">
        
        {/* Dynamic fields based on node type */}
        {selectedNode.type === 'luma' && (
          <>
            <div className="space-y-3">
              <label className="text-xs font-medium text-gray-400 flex items-center justify-between">
                Duration
                <span className="text-xs text-gray-600">{data.duration}s</span>
              </label>
              <Slider 
                defaultValue={[data.duration || 5]} 
                max={10} 
                step={1} 
                onValueChange={(val) => updateNodeData(selectedNode.id, { duration: val[0] })}
                className="[&_.bg-primary]:bg-[#C084FC]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Aspect Ratio</label>
              <select 
                className="w-full bg-[#1C1C1E] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#C084FC]"
                value={data.aspectRatio}
                onChange={(e) => updateNodeData(selectedNode.id, { aspectRatio: e.target.value })}
              >
                <option value="16:9">16:9 Landscape</option>
                <option value="9:16">9:16 Portrait</option>
                <option value="1:1">1:1 Square</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="text-xs font-medium text-gray-400 flex items-center gap-2">
                Loop Video
                <HelpCircle className="w-3 h-3 text-gray-600" />
              </label>
              <Switch 
                checked={data.loop}
                onCheckedChange={(checked) => updateNodeData(selectedNode.id, { loop: checked })}
              />
            </div>
          </>
        )}

        {selectedNode.type === 'prompt' && (
           <div className="space-y-2">
             <label className="text-xs font-medium text-gray-400">Prompt Text</label>
             <textarea 
                className="w-full h-32 bg-[#1C1C1E] border border-[#333] rounded-lg p-3 text-sm text-gray-200 resize-none focus:outline-none focus:border-[#C084FC]"
                value={data.prompt}
                onChange={(e) => updateNodeData(selectedNode.id, { prompt: e.target.value })}
             />
           </div>
        )}

        {/* Generic Add Button */}
        <button className="w-full py-2 border border-dashed border-[#333] rounded-lg text-gray-500 text-xs hover:border-[#C084FC] hover:text-[#C084FC] transition-colors flex items-center justify-center gap-2">
          <Plus className="w-3 h-3" />
          Add Parameter
        </button>
      </div>

    </aside>
  );
}
