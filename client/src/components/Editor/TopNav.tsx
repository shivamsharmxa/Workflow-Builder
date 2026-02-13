import { Share2, ChevronDown, Check } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";

export function TopNav() {
  const credits = useWorkflowStore((state) => state.credits);

  return (
    <header className="h-14 bg-[#0A0A0A] border-b border-[#222224] flex items-center justify-between px-4 z-20 shrink-0">
      {/* Left: Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C084FC] to-[#8040C0] flex items-center justify-center shadow-lg shadow-purple-900/20">
          <span className="font-bold text-white text-lg">W</span>
        </div>
        
        <div className="flex items-center gap-2 bg-[#1C1C1E] px-3 py-1.5 rounded-full border border-[#2A2A2C] hover:border-[#3A3A3C] transition-colors group cursor-text">
          <span className="text-sm font-medium text-gray-200">Cyberpunk City Gen</span>
          <span className="text-[10px] text-gray-500 bg-[#2A2A2C] px-1.5 rounded group-hover:bg-black transition-colors">v3</span>
        </div>
      </div>

      {/* Right: Credits & Actions */}
      <div className="flex items-center gap-3">
        {/* Credits Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1C1C1E] border border-[#2A2A2C]">
          <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
          <span className="text-xs font-mono font-medium text-gray-300">
            {credits} credits
          </span>
        </div>

        {/* Share Button */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1C1C1E] text-gray-300 hover:bg-[#2A2A2C] hover:text-white transition-colors border border-transparent hover:border-[#333] text-sm font-medium">
          <Share2 className="w-4 h-4" />
          Share
        </button>

        {/* Profile / Tasks */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border border-gray-500" />
      </div>
    </header>
  );
}
