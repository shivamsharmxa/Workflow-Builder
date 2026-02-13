import { create } from 'zustand';
import { 
  Connection, 
  Edge, 
  EdgeChange, 
  Node, 
  NodeChange, 
  addEdge, 
  OnNodesChange, 
  OnEdgesChange, 
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';

// Mock initial data
const initialNodes: Node[] = [
  { 
    id: '1', 
    type: 'prompt', 
    position: { x: 100, y: 200 }, 
    data: { label: 'Prompt', prompt: 'A cinematic scene of a cyberpunk city with neon rain...', cost: 0 } 
  },
  { 
    id: '2', 
    type: 'luma', 
    position: { x: 500, y: 150 }, 
    data: { 
      label: 'Luma Ray 2 Flash', 
      cost: 36,
      duration: 5,
      aspectRatio: '16:9',
      loop: true,
      concepts: 'Cinematic',
      status: 'idle',
      previewUrl: 'https://images.unsplash.com/photo-1614726365723-49cfa272861a?w=500&q=80' // Cyberpunk Rain
    } 
  },
  { 
    id: '3', 
    type: 'flux', 
    position: { x: 900, y: 200 }, 
    data: { 
      label: 'Flux Fast', 
      cost: 12,
      status: 'idle',
      previewUrl: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=500&q=80' // Neon effect
    } 
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#C084FC', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#C084FC', strokeWidth: 2 } },
];

type WorkflowState = {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  credits: number;
  isRunning: boolean;
  
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setSelectedNode: (id: string | null) => void;
  updateNodeData: (id: string, data: Record<string, any>) => void;
  runSimulation: () => Promise<void>;
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodeId: null,
  credits: 149,
  isRunning: false,

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    set({
      edges: addEdge({ ...connection, animated: true, style: { stroke: '#C084FC', strokeWidth: 2 } }, get().edges),
    });
  },

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((node) => 
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },

  runSimulation: async () => {
    if (get().isRunning) return;
    
    set({ isRunning: true });
    
    // Set all runnable nodes to 'running'
    set({
      nodes: get().nodes.map(n => 
        (n.type === 'luma' || n.type === 'flux') 
          ? { ...n, data: { ...n.data, status: 'running' } } 
          : n
      )
    });

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Set to success
    set({
      isRunning: false,
      nodes: get().nodes.map(n => 
        (n.type === 'luma' || n.type === 'flux') 
          ? { ...n, data: { ...n.data, status: 'success' } } 
          : n
      ),
      credits: Math.max(0, get().credits - 48) // Deduct mock cost
    });
  }
}));
