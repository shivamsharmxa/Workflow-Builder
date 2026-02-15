import { MousePointer2, Hand, Undo2, Redo2, Minus, Plus, Play } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function BottomBar() {
  const isRunning = useWorkflowStore((state) => state.isRunning);
  const runEntireWorkflow = useWorkflowStore((state) => state.runEntireWorkflow);
  const undo = useWorkflowStore((state) => state.undo);
  const redo = useWorkflowStore((state) => state.redo);
  const canUndo = useWorkflowStore((state) => state.canUndo);
  const canRedo = useWorkflowStore((state) => state.canRedo);
  const credits = useWorkflowStore((state) => state.credits);

  // Mock costs for calculation
  const totalCost = 10; 

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-72 z-30 flex items-center gap-4">
      
      {/* Canvas Controls */}
      <div className="hidden md:flex items-center gap-1 bg-[#1C1C1E] border border-[#2A2A2C] p-1 rounded-lg shadow-lg">
        <button className="p-2 rounded hover:bg-[#333] text-gray-400 hover:text-white transition-colors">
          <MousePointer2 className="w-4 h-4" />
        </button>
        <button className="p-2 rounded hover:bg-[#333] text-gray-400 hover:text-white transition-colors">
          <Hand className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-[#333] mx-1" />
        <button 
          onClick={undo}
          disabled={!canUndo()}
          className="p-2 rounded hover:bg-[#333] text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button 
          onClick={redo}
          disabled={!canRedo()}
          className="p-2 rounded hover:bg-[#333] text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Run Controls */}
      <div className="flex items-center gap-0 bg-[#1C1C1E] border border-[#2A2A2C] rounded-lg shadow-xl overflow-hidden">
        <div className="px-4 py-2 flex flex-col justify-center border-r border-[#2A2A2C]">
          <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Est. Cost</span>
          <span className="text-sm font-mono text-yellow-400">{totalCost}</span>
        </div>
        
        <button 
          onClick={runEntireWorkflow}
          disabled={isRunning}
          className={cn(
            "px-6 py-3 bg-[#F5F5DC] hover:bg-[#EBEBC0] text-black font-semibold text-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
            isRunning && "bg-yellow-200/50"
          )}
        >
          {isRunning ? (
            <>
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Run Workflow
            </>
          )}
        </button>
      </div>
    </div>
  );
}
