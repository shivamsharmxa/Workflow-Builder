import { ReactNode } from "react";
import { Handle, Position } from "reactflow";
import { cn } from "@/lib/utils";

interface NodeWrapperProps {
  label: string;
  selected?: boolean;
  children: ReactNode;
  cost?: number;
  headerColor?: string;
}

export function NodeWrapper({ label, selected, children, cost, headerColor }: NodeWrapperProps) {
  return (
    <div className={cn(
      "w-[280px] rounded-xl bg-[#1C1C1E] border-2 shadow-xl transition-all duration-200 overflow-hidden",
      selected ? "border-[#C084FC] shadow-[#C084FC]/20" : "border-[#333333] shadow-black/40"
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
        {cost !== undefined && cost > 0 && (
          <span className="text-xs font-mono text-yellow-200/80 bg-yellow-500/10 px-1.5 py-0.5 rounded">
            {cost}
          </span>
        )}
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
