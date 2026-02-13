import { memo } from "react";
import { NodeProps } from "reactflow";
import { NodeWrapper } from "./NodeWrapper";
import { useWorkflowStore } from "@/lib/store";

export const PromptNode = memo(({ id, data, selected }: NodeProps) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  return (
    <NodeWrapper label={data.label} selected={selected} cost={data.cost}>
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
          Input Text
        </label>
        <textarea
          className="w-full h-24 bg-[#121212] border border-[#333] rounded-md p-3 text-sm text-gray-200 resize-none focus:outline-none focus:border-[#C084FC] transition-colors placeholder:text-gray-600"
          placeholder="Describe your scene..."
          value={data.prompt}
          onChange={(e) => updateNodeData(id, { prompt: e.target.value })}
        />
      </div>
    </NodeWrapper>
  );
});
