import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Type, Image, Video, Sparkles, Crop, Film } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// Assignment Requirement: Exactly 6 buttons in Quick Access
const quickAccessNodes = [
  { type: "text", label: "Text", Icon: Type, description: "Simple text input" },
  { type: "uploadImage", label: "Upload Image", Icon: Image, description: "Upload image file" },
  { type: "uploadVideo", label: "Upload Video", Icon: Video, description: "Upload video file" },
  { type: "llm", label: "Run Any LLM", Icon: Sparkles, description: "Execute LLM model" },
  { type: "cropImage", label: "Crop Image", Icon: Crop, description: "Crop image" },
  { type: "extractFrame", label: "Extract Frame", Icon: Film, description: "Extract video frame" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const addNode = useWorkflowStore((state) => state.addNode);

  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const filteredNodes = quickAccessNodes.filter((node) =>
    node.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside
      className={cn(
        "bg-[#0A0A0A] border-r border-[#222224] flex flex-col transition-all duration-300 z-30 relative",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#222224] flex items-center justify-between">
        {!collapsed && (
          <h2 className="text-white font-semibold text-sm">Nodes</h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded hover:bg-[#1A1A1A] transition-colors text-gray-400 hover:text-white"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1C1C1E] border border-[#333] rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C084FC] transition-colors"
              />
            </div>
          </div>

          {/* Quick Access Section */}
          <div className="px-4 pb-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Quick Access
            </h3>
            <p className="text-xs text-gray-500">
              {quickAccessNodes.length} nodes available
            </p>
          </div>

          {/* Node List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            {filteredNodes.map((node) => {
              const IconComponent = node.Icon;
              return (
                <div
                  key={node.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, node.type)}
                  onClick={() => {
                    const position = {
                      x: Math.random() * 400 + 100,
                      y: Math.random() * 400 + 100,
                    };
                    addNode(node.type as any, position, {});
                  }}
                  className="group cursor-move bg-[#1C1C1E] border border-[#333] rounded-lg p-3 hover:border-[#C084FC] hover:bg-[#252525] transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-5 h-5 text-gray-400 group-hover:text-[#C084FC] transition-colors flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">
                        {node.label}
                      </div>
                      <div className="text-gray-500 text-xs truncate">
                        {node.description}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredNodes.length === 0 && (
              <div className="text-center text-gray-500 py-8 text-sm">
                No nodes found
              </div>
            )}
          </div>
        </>
      )}

      {collapsed && (
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {quickAccessNodes.map((node) => {
            const IconComponent = node.Icon;
            return (
              <button
                key={node.type}
                draggable
                onDragStart={(e) => handleDragStart(e, node.type)}
                onClick={() => {
                  const position = {
                    x: Math.random() * 400 + 100,
                    y: Math.random() * 400 + 100,
                  };
                  addNode(node.type as any, position, {});
                }}
                className="w-full flex items-center justify-center p-3 hover:bg-[#1A1A1A] transition-colors group"
                title={node.label}
              >
                <IconComponent className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
}
