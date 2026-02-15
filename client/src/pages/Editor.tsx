import React from "react";
import ReactFlow, { Background, Controls, MiniMap, BackgroundVariant } from "reactflow";
import "reactflow/dist/style.css";
import { useWorkflowStore } from "@/lib/store";
import { TextNode } from "@/components/nodes/TextNode";
import { UploadImageNode } from "@/components/nodes/UploadImageNode";
import { UploadVideoNode } from "@/components/nodes/UploadVideoNode";
import { LLMNode } from "@/components/nodes/LLMNode";
import { CropImageNode } from "@/components/nodes/CropImageNode";
import { ExtractFrameNode } from "@/components/nodes/ExtractFrameNode";
import { Sidebar } from "@/components/Editor/Sidebar";
import { TopNav } from "@/components/Editor/TopNav";
import { PropertiesPanel } from "@/components/Editor/PropertiesPanel";
import { BottomBar } from "@/components/Editor/BottomBar";
import { WorkflowHistory } from "@/components/Editor/WorkflowHistory";

// Assignment Requirement: All 6 node types registered
const nodeTypes = {
  text: TextNode,
  uploadImage: UploadImageNode,
  uploadVideo: UploadVideoNode,
  llm: LLMNode,
  cropImage: CropImageNode,
  extractFrame: ExtractFrameNode,
};

export default function Editor() {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect,
    setSelectedNode,
    addNode
  } = useWorkflowStore();

  const reactFlowWrapper = React.useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<any>(null);

  const onDragOver = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      
      if (typeof type === 'undefined' || !type || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Create proper node data based on type
      const nodeData: any = {
        label: type.charAt(0).toUpperCase() + type.slice(1),
      };

      // Add type-specific default data
      switch(type) {
        case 'text':
          nodeData.text = '';
          break;
        case 'uploadImage':
          nodeData.label = 'Upload Image';
          break;
        case 'uploadVideo':
          nodeData.label = 'Upload Video';
          break;
        case 'llm':
          nodeData.label = 'Run Any LLM';
          nodeData.model = 'gemini-2.5-flash';
          nodeData.systemPrompt = '';
          nodeData.userMessage = '';
          break;
        case 'cropImage':
          nodeData.label = 'Crop Image';
          nodeData.x = 0;
          nodeData.y = 0;
          nodeData.width = 100;
          nodeData.height = 100;
          break;
        case 'extractFrame':
          nodeData.label = 'Extract Frame';
          nodeData.timestamp = 0;
          nodeData.isPercentage = false;
          break;
      }

      addNode(type, position, nodeData);
    },
    [reactFlowInstance, addNode]
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-black text-white overflow-hidden font-sans selection:bg-[#C084FC] selection:text-white">
      <TopNav />
      
      <main className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node.id)}
            onPaneClick={() => setSelectedNode(null)}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.1}
            maxZoom={4}
            className="bg-black"
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              style: {
                stroke: '#C084FC',
                strokeWidth: 2,
              },
            }}
          >
            {/* Dot Grid Background - Assignment Requirement */}
            <Background 
              variant={BackgroundVariant.Dots}
              gap={16}
              size={1}
              color="#333333"
              className="bg-black"
            />
            
            {/* Controls in bottom-left */}
            <Controls 
              className="!absolute !bottom-4 !left-4 !bg-[#1C1C1E] !border !border-[#333333] !rounded-lg"
              showInteractive={false}
            />
            
            {/* MiniMap in bottom-right - Assignment Requirement */}
            <MiniMap 
              nodeColor={(node) => {
                switch (node.type) {
                  case 'llm': return '#8B5CF6';
                  case 'text': return '#3B82F6';
                  case 'uploadImage': return '#10B981';
                  case 'uploadVideo': return '#EF4444';
                  case 'cropImage': return '#F59E0B';
                  case 'extractFrame': return '#06B6D4';
                  case 'prompt': return '#C084FC';
                  case 'luma': return '#F59E0B';
                  case 'flux': return '#EC4899';
                  default: return '#6B7280';
                }
              }}
              maskColor="rgba(0, 0, 0, 0.6)"
              className="!absolute !bottom-4 !right-4 !bg-[#0A0A0A] !border !border-[#333333] !rounded-lg"
              style={{ width: 200, height: 150 }}
            />
          </ReactFlow>

          <BottomBar />
        </div>

        {/* Right Sidebar - Assignment Requirement: Workflow History */}
        <WorkflowHistory />
      </main>
    </div>
  );
}
