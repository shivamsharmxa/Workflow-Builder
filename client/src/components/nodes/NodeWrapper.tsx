import { ReactNode } from "react";
import { Handle, Position } from "reactflow";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";

interface NodeWrapperProps {
  label: string;
  selected?: boolean;
  children: ReactNode;
  cost?: number;
  headerColor?: string;
  status?: "idle" | "running" | "success" | "error";
  nodeId?: string;
}

export function NodeWrapper({ label, selected, children, cost, headerColor, status, nodeId }: NodeWrapperProps) {
  const runSingleNode = useWorkflowStore((state) => state.runSingleNode);
  const isRunning = useWorkflowStore((state) => state.isRunning);

  const handleRunNode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeId && !isRunning) {
      runSingleNode(nodeId);
    }
  };
  return (
    <div className={cn(
      "w-[280px] rounded-xl bg-[#1C1C1E] border-2 shadow-xl transition-all duration-200 overflow-hidden",
      selected ? "border-[#C084FC] shadow-[#C084FC]/20" : "border-[#333333] shadow-black/40",
      status === "running" && "node-executing",
      status === "success" && "node-success",
      status === "error" && "node-error"
    )}>
      {/* Input Handle */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!bg-[#555] !w-3 !h-3 !border-[#1C1C1E] transition-colors hover:!bg-[#C084FC]" 
      />

      {/* Header */}
      <div className={cn(
        "px-4 py-3 flex justify-between items-center border-b border-[#333333]",
        headerColor || "bg-[#28282B]"
      )}>
        <span className="font-semibold text-sm text-white">{label}</span>
        <div className="flex items-center gap-2">
          {cost !== undefined && cost > 0 && (
            <span className="text-xs font-mono text-yellow-200/80 bg-yellow-500/10 px-1.5 py-0.5 rounded">
              {cost}
            </span>
          )}
          {/* Run Single Node Button */}
          {nodeId && (
            <button
              onClick={handleRunNode}
              disabled={isRunning}
              className={cn(
                "p-1 rounded hover:bg-[#333] transition-colors group",
                isRunning && "opacity-50 cursor-not-allowed"
              )}
              title="Run this node"
            >
              <Play className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#C084FC] transition-colors" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {children}
      </div>

      {/* Output Handle */}
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!bg-[#555] !w-3 !h-3 !border-[#1C1C1E] transition-colors hover:!bg-[#C084FC]"
      />
    </div>
  );
}
