import { useState, useEffect } from "react";
import { X, ChevronLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { useWorkflowStore } from "@/lib/store";
import { useWorkflowRuns } from "@/hooks/use-workflows";

interface NodeExecution {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: "pending" | "running" | "success" | "failed";
  inputs?: any;
  outputs?: any;
  error?: string;
  executionTime?: number;
  completedAt?: string;
}

export function WorkflowHistory({ workflowId, isOpen = true }: { workflowId: number | null; isOpen?: boolean }) {
  const isRunning = useWorkflowStore((state) => state.isRunning);
  const [selectedRun, setSelectedRun] = useState<number | null>(null);
  
  // Fetch workflow runs from database
  const { data: dbRuns, refetch } = useWorkflowRuns(workflowId);
  
  // Refetch runs when workflow execution completes
  useEffect(() => {
    if (!isRunning) {
      const timer = setTimeout(() => {
        refetch();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isRunning, refetch]);
  
  if (!isOpen) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      running: "bg-blue-500",
      success: "bg-green-500",
      failed: "bg-red-500",
    }[status] || "bg-gray-500";
    
    return <div className={cn("w-2 h-2 rounded-full", styles)} />;
  };
  
  const runs = dbRuns || [];
  const selectedRunData = runs.find((r) => r.id === selectedRun);
  
  // Convert node results to node executions for display
  const getNodeExecutions = (run: any): NodeExecution[] => {
    if (!run.nodeResults || typeof run.nodeResults !== 'object') {
      return [];
    }
    
    return Object.entries(run.nodeResults).map(([nodeId, result]: [string, any]) => ({
      nodeId,
      nodeName: result.nodeName || nodeId,
      nodeType: result.nodeType || 'unknown',
      status: result.status || 'pending',
      error: result.error,
      executionTime: result.executionTime,
      completedAt: result.completedAt,
      inputs: result.inputs,
      outputs: result.outputs,
    }));
  };

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
                  {selectedRunData.startedAt ? formatDistanceToNow(new Date(selectedRunData.startedAt), { addSuffix: true }) : 'N/A'}
                </span>
              </div>
              {selectedRunData.completedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Duration</span>
                  <span className="text-xs text-white">
                    {selectedRunData.duration ? `${(selectedRunData.duration / 1000).toFixed(2)}s` : 'N/A'}
                  </span>
                </div>
              )}
            </div>

            {/* Node executions */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Node Executions
              </h3>
              {getNodeExecutions(selectedRunData).map((exec, idx) => (
                <div
                  key={`${exec.nodeId}-${idx}`}
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
              runs.map((run: any) => {
                const nodeExecs = getNodeExecutions(run);
                return (
                  <button
                    key={run.id}
                    onClick={() => setSelectedRun(run.id)}
                    className="w-full bg-[#1C1C1E] hover:bg-[#28282B] border border-[#333] hover:border-[#F7FF9E] rounded-lg p-3 text-left transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(run.status)}
                        <span className="text-sm font-medium text-white group-hover:text-[#F7FF9E]">
                          Run #{run.id}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {run.startedAt ? formatDistanceToNow(new Date(run.startedAt), { addSuffix: true }) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{nodeExecs.length} nodes executed</span>
                      {run.duration && (
                        <span>
                          {(run.duration / 1000).toFixed(2)}s
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
