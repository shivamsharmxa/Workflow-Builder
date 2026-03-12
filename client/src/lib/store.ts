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
import { apiUrl } from './api';

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
  currentWorkflowId: number | null;
  
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
  setCurrentWorkflowId: (id: number | null) => void;
  
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
  currentWorkflowId: null,
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
  
  setCurrentWorkflowId: (id: number | null) => {
    set({ currentWorkflowId: id });
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

  // Run entire workflow via the server-side orchestrator.
  // The server handles DAG execution and returns node-level results.
  runEntireWorkflow: async () => {
    if (get().isRunning) return;

    const workflowId = get().currentWorkflowId;
    if (!workflowId) {
      alert('Save the workflow before running it.');
      return;
    }

    set({ isRunning: true });

    // Mark all nodes as running while we wait for the server
    for (const node of get().nodes) {
      get().updateNodeData(node.id, { status: 'running' });
    }

    try {
      const response = await fetch(apiUrl(`/api/workflows/${workflowId}/execute`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? 'Workflow execution failed');
      }

      const { nodeResults } = data.result as {
        nodeResults: Record<string, { status: string; output?: any; error?: string }>;
      };

      // Apply per-node results back to the canvas
      for (const [nodeId, result] of Object.entries(nodeResults)) {
        get().updateNodeData(nodeId, {
          status: result.status === 'success' ? 'success' : 'error',
          output: result.output,
          error: result.error,
        });
      }
    } catch (error: any) {
      console.error('Workflow execution failed:', error);
      // Mark all nodes as errored if the whole request failed
      for (const node of get().nodes) {
        get().updateNodeData(node.id, { status: 'error' });
      }
    } finally {
      set({ isRunning: false });
    }
  },

  // Run a single node directly via the individual node execution endpoints.
  runSingleNode: async (nodeId: string) => {
    if (get().isRunning) return;

    const node = get().nodes.find(n => n.id === nodeId);
    if (!node) return;

    set({ isRunning: true });
    get().updateNodeData(nodeId, { status: 'running' });

    try {
      const inputs = getNodeInputs(nodeId, get().nodes, get().edges);
      const primaryInput = inputs['default'] ?? Object.values(inputs)[0];

      let result: any = null;

      if (node.type === 'llm' || node.type === 'llmNode') {
        const resp = await fetch(apiUrl('/api/execute/llm'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            model: node.data.model,
            systemPrompt: node.data.systemPrompt,
            userMessage: node.data.userMessage ?? node.data.prompt ?? (typeof primaryInput === 'string' ? primaryInput : ''),
            images: [],
          }),
        });
        const json = await resp.json();
        if (!json.success) throw new Error(json.error ?? 'LLM failed');
        result = json.result;

      } else if (node.type === 'cropImage' || node.type === 'cropImageNode') {
        const imageUrl = node.data.imageUrl ?? (typeof primaryInput === 'string' ? primaryInput : null);
        if (!imageUrl) throw new Error('No image input for CropImageNode');
        const resp = await fetch(apiUrl('/api/execute/crop-image'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ imageUrl, x: node.data.x ?? 0, y: node.data.y ?? 0, width: node.data.width ?? 100, height: node.data.height ?? 100 }),
        });
        const json = await resp.json();
        if (!json.success) throw new Error(json.error ?? 'Crop failed');
        result = json.result;

      } else if (node.type === 'extractFrame' || node.type === 'extractFrameNode') {
        const videoUrl = node.data.videoUrl ?? (typeof primaryInput === 'string' ? primaryInput : null);
        if (!videoUrl) throw new Error('No video input for ExtractFrameNode');
        const resp = await fetch(apiUrl('/api/execute/extract-frame'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ videoUrl, timestamp: node.data.timestamp ?? 0, isPercentage: node.data.isPercentage ?? false }),
        });
        const json = await resp.json();
        if (!json.success) throw new Error(json.error ?? 'Frame extraction failed');
        result = json.result;
      }

      get().updateNodeData(nodeId, { status: 'success', output: result });
    } catch (error: any) {
      console.error('Single node execution failed:', error);
      get().updateNodeData(nodeId, { status: 'error', error: error.message });
    } finally {
      set({ isRunning: false });
    }
  },

  // Run selected nodes via the server orchestrator with only those nodes included.
  runSelectedNodes: async () => {
    if (get().isRunning) return;

    const selectedNodes = get().nodes.filter(n =>
      n.selected || n.id === get().selectedNodeId
    );

    if (selectedNodes.length === 0) {
      alert('No nodes selected');
      return;
    }

    const selectedIds = new Set(selectedNodes.map(n => n.id));
    const relevantEdges = get().edges.filter(
      e => selectedIds.has(e.source) && selectedIds.has(e.target)
    );

    set({ isRunning: true });
    for (const node of selectedNodes) {
      get().updateNodeData(node.id, { status: 'running' });
    }

    try {
      // Import the orchestrator type at runtime via a direct server call.
      // We re-use the /execute endpoint but only pass the selected subgraph.
      const resp = await fetch(apiUrl('/api/execute/subgraph'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nodes: selectedNodes, edges: relevantEdges }),
      });

      const data = await resp.json();

      if (!resp.ok || !data.success) {
        throw new Error(data.error ?? 'Subgraph execution failed');
      }

      const { nodeResults } = data.result as {
        nodeResults: Record<string, { status: string; output?: any; error?: string }>;
      };

      for (const [nodeId, result] of Object.entries(nodeResults)) {
        get().updateNodeData(nodeId, {
          status: result.status === 'success' ? 'success' : 'error',
          output: result.output,
          error: result.error,
        });
      }
    } catch (error: any) {
      console.error('Selected node execution failed:', error);
      for (const node of selectedNodes) {
        get().updateNodeData(node.id, { status: 'error' });
      }
    } finally {
      set({ isRunning: false });
    }
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
