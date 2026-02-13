import { Search, Box, Sparkles, Video, Image as ImageIcon, Music, Type, Database, Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const TOOLS = [
  { icon: Search, label: "Search" },
  { icon: Box, label: "Models" },
  { icon: Sparkles, label: "AI Tools" },
  { icon: Video, label: "Video" },
  { icon: ImageIcon, label: "Image" },
  { icon: Music, label: "Audio" },
  { icon: Type, label: "Text" },
  { icon: Database, label: "Data" },
];

export function Sidebar() {
  return (
    <aside className="w-14 bg-[#0A0A0A] border-r border-[#222224] flex flex-col items-center py-4 z-20 gap-4">
      {TOOLS.map((tool, i) => (
        <Tooltip key={i}>
          <TooltipTrigger asChild>
            <button className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#222] transition-all group relative">
              <tool.icon className="w-5 h-5" />
              {/* Active Indicator mock */}
              {i === 1 && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#C084FC] rounded-r-full" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-[#1C1C1E] border-[#333] text-white">
            {tool.label}
          </TooltipContent>
        </Tooltip>
      ))}
      
      <div className="mt-auto">
        <button className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#222] transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
