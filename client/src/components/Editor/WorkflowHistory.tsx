import { useState, useEffect } from "react";
import { ChevronRight, Clock, CheckCircle2, XCircle, Loader2, ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useWorkflowStore } from "@/lib/store";

interface NodeExecution {
  id: string;
  nodeId: string;
  nodeName: string;
  status: "pending" | "running" | "success" | "failed";
  inputs?: any;
  outputs?: any;
  error?: string;
  executionTime?: number;
}

interface WorkflowRun {
  id: string;
  workflowId: string;
  status: "running" | "success" | "failed";
  startedAt: Date;
  completedAt?: Date;
  nodeExecutions: NodeExecution[];
}

// Mock data for demonstration
const mockRuns: WorkflowRun[] = [
  {
    id: "run-1",
    workflowId: "wf-1",
    status: "success",
    startedAt: new Date(Date.now() - 5 * 60 * 1000),
    completedAt: new Date(Date.now() - 2 * 60 * 1000),
    nodeExecutions: [
      {
        id: "exec-1",
        nodeId: "node-1",
        nodeName: "Text Input",
        status: "success",
        inputs: {},
        outputs: { text: "Hello world" },
        executionTime: 10,
      },
      {
        id: "exec-2",
        nodeId: "node-2",
        nodeName: "Run LLM",
        status: "success",
        inputs: { userMessage: "Hello world" },
        outputs: { result: "Hello! How can I assist you today?" },
        executionTime: 2500,
      },
    ],
  },
  {
    id: "run-2",
    workflowId: "wf-1",
    status: "failed",
    startedAt: new Date(Date.now() - 15 * 60 * 1000),
    completedAt: new Date(Date.now() - 14 * 60 * 1000),
    nodeExecutions: [
      {
        id: "exec-3",
        nodeId: "node-1",
        nodeName: "Upload Image",
        status: "failed",
        error: "Failed to upload image: Network error",
        executionTime: 1000,
      },
    ],
  },
];

export function WorkflowHistory({ isOpen = true }: { isOpen?: boolean }) {
  const nodes = useWorkflowStore((state) => state.nodes);
  const isRunning = useWorkflowStore((state) => state.isRunning);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  
  // Track workflow executions
  useEffect(() => {
    if (isRunning && !currentRunId) {
      // Start a new run
      const runId = `run-${Date.now()}`;
      const newRun: WorkflowRun = {
        id: runId,
        workflowId: 'wf-1',
        status: 'running',
        startedAt: new Date(),
        nodeExecutions: nodes.map(n => ({
          id: `exec-${n.id}`,
          nodeId: n.id,
          nodeName: n.data.label || n.type,
          status: n.data.status === 'running' ? 'running' : 'pending',
          inputs: {},
          outputs: n.data.output ? { result: n.data.output } : undefined,
        }))
      };
      setRuns(prev => [newRun, ...prev]);
      setCurrentRunId(runId);
    } else if (!isRunning && currentRunId) {
      // Finish the run
      setRuns(prev => prev.map(run => 
        run.id === currentRunId 
          ? {
              ...run,
              status: nodes.some(n => n.data.status === 'error') ? 'failed' : 'success',
              completedAt: new Date(),
              nodeExecutions: nodes.map(n => ({
                id: `exec-${n.id}`,
                nodeId: n.id,
                nodeName: n.data.label || n.type,
                status: n.data.status === 'error' ? 'failed' : 
                       n.data.status === 'success' ? 'success' : 'pending',
                inputs: {},
                outputs: n.data.output ? { result: n.data.output } : undefined,
                error: n.data.error,
                executionTime: 1000,
              }))
            }
          : run
      ));
      setCurrentRunId(null);
    }
  }, [isRunning, currentRunId, nodes]);
  
  if (!isOpen) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "text-blue-500 bg-blue-500/10";
      case "success":
        return "text-green-500 bg-green-500/10";
      case "failed":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  if (collapsed) {
    return (
      <aside className="w-12 bg-[#0A0A0A] border-l border-[#222] flex flex-col items-center py-4">
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1C1C1E] transition-colors"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
      </aside>
    );
  }

  const selectedRunData = runs.find((r) => r.id === selectedRun);

  return (
    <aside className="w-96 bg-[#0A0A0A] border-l border-[#222] flex flex-col z-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#222]">
        <h2 className="text-sm font-semibold text-white">Workflow History</h2>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1C1C1E] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <ScrollArea className="flex-1">
        {selectedRunData ? (
          // Detailed view
          <div className="p-4 space-y-4">
            {/* Back button */}
            <button
              onClick={() => setSelectedRun(null)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ChevronDown className="w-4 h-4 rotate-90" />
              Back to runs
            </button>

            {/* Run summary */}
            <div className="bg-[#1C1C1E] border border-[#333] rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Status</span>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full",
                    getStatusColor(selectedRunData.status)
                  )}
                >
                  {selectedRunData.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Started</span>
                <span className="text-xs text-white">
                  {formatDistanceToNow(selectedRunData.startedAt, { addSuffix: true })}
                </span>
              </div>
              {selectedRunData.completedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Duration</span>
                  <span className="text-xs text-white">
                    {Math.round(
                      (selectedRunData.completedAt.getTime() - selectedRunData.startedAt.getTime()) /
                        1000
                    )}
                    s
                  </span>
                </div>
              )}
            </div>

            {/* Node executions */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Node Executions
              </h3>
              {selectedRunData.nodeExecutions.map((exec) => (
                <div
                  key={exec.id}
                  className="bg-[#1C1C1E] border border-[#333] rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(exec.status)}
                      <span className="text-sm font-medium text-white">{exec.nodeName}</span>
                    </div>
                    {exec.executionTime && (
                      <span className="text-xs text-gray-500">{exec.executionTime}ms</span>
                    )}
                  </div>

                  {exec.inputs && Object.keys(exec.inputs).length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs text-gray-400">Inputs:</span>
                      <pre className="text-xs bg-[#0A0A0A] border border-[#222] rounded p-2 overflow-auto max-h-24">
                        {JSON.stringify(exec.inputs, null, 2)}
                      </pre>
                    </div>
                  )}

                  {exec.outputs && Object.keys(exec.outputs).length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs text-gray-400">Outputs:</span>
                      <pre className="text-xs bg-[#0A0A0A] border border-[#222] rounded p-2 overflow-auto max-h-24">
                        {JSON.stringify(exec.outputs, null, 2)}
                      </pre>
                    </div>
                  )}

                  {exec.error && (
                    <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded p-2">
                      {exec.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          // List view
          <div className="p-4 space-y-2">
            {runs.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                No workflow runs yet
                <p className="text-xs mt-2">Run your workflow to see execution history</p>
              </div>
            ) : (
              runs.map((run) => (
                <button
                  key={run.id}
                  onClick={() => setSelectedRun(run.id)}
                  className="w-full bg-[#1C1C1E] hover:bg-[#28282B] border border-[#333] hover:border-[#F7FF9E] rounded-lg p-3 text-left transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(run.status)}
                      <span className="text-sm font-medium text-white group-hover:text-[#F7FF9E]">
                        Run #{run.id.split("-")[1]}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(run.startedAt, { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{run.nodeExecutions.length} nodes executed</span>
                    {run.completedAt && (
                      <span>
                        {Math.round(
                          (run.completedAt.getTime() - run.startedAt.getTime()) / 1000
                        )}
                        s
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
