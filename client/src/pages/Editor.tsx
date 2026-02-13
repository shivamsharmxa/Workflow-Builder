import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import { useWorkflowStore } from "@/lib/store";
import { PromptNode } from "@/components/nodes/PromptNode";
import { LumaNode } from "@/components/nodes/LumaNode";
import { FluxNode } from "@/components/nodes/FluxNode";
import { Sidebar } from "@/components/Editor/Sidebar";
import { TopNav } from "@/components/Editor/TopNav";
import { PropertiesPanel } from "@/components/Editor/PropertiesPanel";
import { BottomBar } from "@/components/Editor/BottomBar";

const nodeTypes = {
  prompt: PromptNode,
  luma: LumaNode,
  flux: FluxNode,
};

export default function Editor() {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect,
    setSelectedNode 
  } = useWorkflowStore();

  return (
    <div className="h-screen w-screen flex flex-col bg-black text-white overflow-hidden font-sans selection:bg-[#C084FC] selection:text-white">
      <TopNav />
      
      <main className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node.id)}
            onPaneClick={() => setSelectedNode(null)}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.5}
            maxZoom={2}
            className="bg-black"
          >
            <Background color="#222" gap={20} size={1} />
            <Controls className="!bg-[#1C1C1E] !border-[#333] [&>button]:!border-b-[#333] [&_svg]:!fill-gray-400" />
            <MiniMap 
              className="!bg-[#1C1C1E] !border-[#333]" 
              nodeColor="#333" 
              maskColor="rgba(0,0,0,0.6)"
            />
          </ReactFlow>

          <BottomBar />
        </div>

        <PropertiesPanel />
      </main>
    </div>
  );
}
