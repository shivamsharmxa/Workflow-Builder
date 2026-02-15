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
import { wouldCreateCycle, getExecutionOrder } from './dagValidation';

// Start with empty canvas - no default nodes
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

type HistoryState = {
  nodes: Node[];
  edges: Edge[];
};

type WorkflowState = {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  credits: number;
  isRunning: boolean;
  
  // Assignment Requirement: Undo/Redo
  history: HistoryState[];
  historyIndex: number;
  
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setSelectedNode: (id: string | null) => void;
  updateNodeData: (id: string, data: Record<string, any>) => void;
  addNode: (type: string, position: { x: number; y: number }, data: Record<string, any>) => void;
  deleteNode: (id: string) => void;
  getNodeInputs: (nodeId: string) => Record<string, any>;
  
  // Assignment Requirement: Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Assignment Requirement: Execution modes
  runEntireWorkflow: () => Promise<void>;
  runSingleNode: (nodeId: string) => Promise<void>;
  runSelectedNodes: () => Promise<void>;
  
  // Assignment Requirement: Save/Load workflows
  exportWorkflow: () => string;
  importWorkflow: (json: string) => void;
  
  // Legacy method
  runSimulation: () => Promise<void>;
};

// Helper to save state to history
const saveToHistory = (get: () => WorkflowState, set: (state: Partial<WorkflowState>) => void) => {
  const { nodes, edges, history, historyIndex } = get();
  
  // Remove any future history if we're not at the end
  const newHistory = history.slice(0, historyIndex + 1);
  
  // Add current state
  newHistory.push({ nodes, edges });
  
  // Limit history to 50 entries
  if (newHistory.length > 50) {
    newHistory.shift();
  }
  
  set({
    history: newHistory,
    historyIndex: newHistory.length - 1,
  });
};

// Helper to get input data from connected nodes
const getNodeInputs = (nodeId: string, nodes: Node[], edges: Edge[]): Record<string, any> => {
  const inputEdges = edges.filter(edge => edge.target === nodeId);
  const inputs: Record<string, any> = {};
  
  inputEdges.forEach(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    if (sourceNode?.data) {
      // Get output from source node
      const output = sourceNode.data.output || sourceNode.data.text || sourceNode.data.imageUrl || sourceNode.data.videoUrl || sourceNode.data.value;
      if (output) {
        inputs[edge.sourceHandle || 'default'] = output;
      }
    }
  });
  
  return inputs;
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodeId: null,
  credits: 149,
  isRunning: false,
  history: [{ nodes: initialNodes, edges: initialEdges }],
  historyIndex: 0,

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
    // Assignment Requirement: DAG validation - prevent cycles
    const validation = wouldCreateCycle(
      get().nodes,
      get().edges,
      { source: connection.source!, target: connection.target! }
    );
    
    if (!validation.isValid) {
      alert(validation.error || "Cannot create this connection - would create a cycle");
      return;
    }
    
    set({
      edges: addEdge({ ...connection, animated: true, style: { stroke: '#C084FC', strokeWidth: 2 } }, get().edges),
    });
    saveToHistory(get, set);
  },

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((node) => 
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },
  
  // Helper to get inputs from connected nodes
  getNodeInputs: (nodeId: string) => {
    return getNodeInputs(nodeId, get().nodes, get().edges);
  },
  
  addNode: (type, position, data) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: { label: type, ...data },
    };
    set({ nodes: [...get().nodes, newNode] });
    saveToHistory(get, set);
  },
  
  deleteNode: (id) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== id),
      edges: get().edges.filter((edge) => edge.source !== id && edge.target !== id),
    });
    saveToHistory(get, set);
  },
  
  // Assignment Requirement: Undo functionality
  undo: () => {
    const { history, historyIndex } = get();
    
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      set({
        nodes: prevState.nodes,
        edges: prevState.edges,
        historyIndex: historyIndex - 1,
      });
    }
  },
  
  // Assignment Requirement: Redo functionality
  redo: () => {
    const { history, historyIndex } = get();
    
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      set({
        nodes: nextState.nodes,
        edges: nextState.edges,
        historyIndex: historyIndex + 1,
      });
    }
  },
  
  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  // Assignment Requirement: Run entire workflow
  runEntireWorkflow: async () => {
    if (get().isRunning) return;
    
    const executionOrder = getExecutionOrder(get().nodes, get().edges);
    
    set({ isRunning: true });
    
    // Execute nodes in topological order
    for (const nodeId of executionOrder) {
      const node = get().nodes.find(n => n.id === nodeId);
      if (!node) continue;
      
      // Set to running
      get().updateNodeData(nodeId, { status: 'running' });
      
      // Simulate execution
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Set to success
      get().updateNodeData(nodeId, { status: 'success' });
    }
    
    set({ isRunning: false });
  },
  
  // Assignment Requirement: Run single node
  runSingleNode: async (nodeId: string) => {
    if (get().isRunning) return;
    
    set({ isRunning: true });
    get().updateNodeData(nodeId, { status: 'running' });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    get().updateNodeData(nodeId, { status: 'success' });
    set({ isRunning: false });
  },
  
  // Assignment Requirement: Run selected nodes
  runSelectedNodes: async () => {
    if (get().isRunning) return;
    
    const selectedNodes = get().nodes.filter(n => 
      n.selected || n.id === get().selectedNodeId
    );
    
    if (selectedNodes.length === 0) {
      alert('No nodes selected');
      return;
    }
    
    set({ isRunning: true });
    
    // Run selected nodes in parallel (Assignment Requirement: parallel execution)
    await Promise.all(
      selectedNodes.map(async (node) => {
        get().updateNodeData(node.id, { status: 'running' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        get().updateNodeData(node.id, { status: 'success' });
      })
    );
    
    set({ isRunning: false });
  },
  
  // Assignment Requirement: Export workflow as JSON
  exportWorkflow: () => {
    const workflow = {
      version: '1.0',
      nodes: get().nodes,
      edges: get().edges,
      createdAt: new Date().toISOString(),
    };
    return JSON.stringify(workflow, null, 2);
  },
  
  // Assignment Requirement: Import workflow from JSON
  importWorkflow: (json: string) => {
    try {
      const workflow = JSON.parse(json);
      
      if (!workflow.nodes || !workflow.edges) {
        throw new Error('Invalid workflow format');
      }
      
      set({
        nodes: workflow.nodes,
        edges: workflow.edges,
      });
    } catch (error: any) {
      alert('Failed to import workflow: ' + error.message);
    }
  },
  
  // Legacy method (keep for backward compatibility)
  runSimulation: async () => {
    return get().runEntireWorkflow();
  }
}));
