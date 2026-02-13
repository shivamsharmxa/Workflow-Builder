import { memo } from "react";
import { NodeProps } from "reactflow";
import { NodeWrapper } from "./NodeWrapper";
import { Loader2, Play } from "lucide-react";

export const FluxNode = memo(({ data, selected }: NodeProps) => {
  return (
    <NodeWrapper label={data.label} selected={selected} cost={data.cost}>
      <div className="space-y-3">
        {/* Preview Area */}
        <div className="relative aspect-square bg-black/50 rounded-lg overflow-hidden border border-[#333]">
          {data.status === 'success' && data.previewUrl ? (
            <img 
              src={data.previewUrl} 
              alt="Flux generation" 
              className="w-full h-full object-cover"
            />
          ) : data.status === 'running' ? (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
              <span className="text-xs text-muted-foreground">Processing...</span>
            </div>
          ) : (
             <div className="w-full h-full flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20">
               <span className="text-xs text-muted-foreground">Waiting for input</span>
             </div>
          )}
        </div>

        <button 
          className="w-full py-1.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
        >
          <Play className="w-3 h-3 fill-current" />
          Run Flux
        </button>
      </div>
    </NodeWrapper>
  );
});
