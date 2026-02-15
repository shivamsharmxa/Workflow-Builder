import { memo } from "react";
import { NodeProps, Handle, Position } from "reactflow";
import { NodeWrapper } from "./NodeWrapper";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflowStore } from "@/lib/store";

export interface TextNodeData {
  label: string;
  text: string;
  status?: "idle" | "running" | "success" | "error";
}

export const TextNode = memo(({ id, data, selected }: NodeProps<TextNodeData>) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  return (
    <div className="relative">
      <NodeWrapper
        label={data.label}
        selected={selected}
      >
        <div className="space-y-2">
          <label className="text-xs text-gray-400">Text</label>
          <Textarea
            value={data.text || ""}
            onChange={(e) => updateNodeData(id, { text: e.target.value })}
            placeholder="Enter text..."
            className="min-h-[100px] bg-[#28282B] border-[#333] text-white text-sm resize-none"
          />
          <div className="text-xs text-gray-500">
            {(data.text || "").length} characters
          </div>
        </div>
      </NodeWrapper>

      {/* Output handle for text data */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-blue-500 !w-3 !h-3"
      />
    </div>
  );
});

TextNode.displayName = "TextNode";
