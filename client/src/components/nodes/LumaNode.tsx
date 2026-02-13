import { memo } from "react";
import { NodeProps } from "reactflow";
import { NodeWrapper } from "./NodeWrapper";
import { Loader2, Play } from "lucide-react";

export const LumaNode = memo(({ data, selected }: NodeProps) => {
  return (
    <NodeWrapper label={data.label} selected={selected} cost={data.cost} headerColor="bg-gradient-to-r from-[#28282B] to-[#28282B]">
      <div className="space-y-3">
        {/* Preview Area */}
        <div className="relative aspect-video bg-black/50 rounded-lg overflow-hidden border border-[#333] group">
          {data.status === 'success' && data.previewUrl ? (
            <>
              {/* Using descriptive comment for dynamic image */}
              <img 
                src={data.previewUrl} 
                alt="Generation preview" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <span className="text-xs text-white/90 font-medium">Generated successfully</span>
              </div>
            </>
          ) : data.status === 'running' ? (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 text-[#C084FC] animate-spin" />
              <span className="text-xs text-muted-foreground">Generating...</span>
            </div>
          ) : (
             <div className="w-full h-full flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20">
               <span className="text-xs text-muted-foreground">No output</span>
             </div>
          )}
        </div>

        {/* Action Button */}
        <button 
          className="w-full py-1.5 rounded bg-[#C084FC]/10 text-[#C084FC] hover:bg-[#C084FC]/20 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
          onClick={(e) => e.stopPropagation()} // Prevent selecting node when clicking button
        >
          <Play className="w-3 h-3 fill-current" />
          Run Model
        </button>
      </div>
    </NodeWrapper>
  );
});
