import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
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
  
  const { data: dbRuns, refetch } = useWorkflowRuns(workflowId);
  
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

  const runs = dbRuns || [];
  const selectedRunData = runs.find((r) => r.id === selectedRun);
  
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-blue-500";
      case "success": return "bg-green-500";
      case "failed": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <aside className="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <h3 className="text-sm font-medium text-white">History</h3>
      </div>

      <ScrollArea className="flex-1">
        {selectedRunData ? (
          /* Detail View */
          <div className="p-4">
            <button
              onClick={() => setSelectedRun(null)}
              className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <div className="space-y-4">
              {/* Run Info */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("w-2 h-2 rounded-full", getStatusColor(selectedRunData.status))} />
                  <span className="text-sm text-white font-medium">Run #{selectedRunData.id}</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Status</span>
                    <span className="text-zinc-300 capitalize">{selectedRunData.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Started</span>
                    <span className="text-zinc-300">
                      {selectedRunData.startedAt ? format(new Date(selectedRunData.startedAt), 'HH:mm:ss') : '-'}
                    </span>
                  </div>
                  {selectedRunData.duration && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Duration</span>
                      <span className="text-zinc-300">{(selectedRunData.duration / 1000).toFixed(2)}s</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Nodes */}
              <div>
                <h4 className="text-xs font-medium text-zinc-500 uppercase mb-2">Nodes</h4>
                <div className="space-y-2">
                  {getNodeExecutions(selectedRunData).map((exec, idx) => (
                    <div key={`${exec.nodeId}-${idx}`} className="border border-zinc-800 rounded p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-1.5 h-1.5 rounded-full", getStatusColor(exec.status))} />
                          <span className="text-sm text-white">{exec.nodeName}</span>
                        </div>
                        {exec.executionTime && (
                          <span className="text-xs text-zinc-500">{exec.executionTime}ms</span>
                        )}
                      </div>
                      
                      {exec.error && (
                        <p className="text-xs text-red-400 mt-2">{exec.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="p-4">
            {runs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-zinc-500">No runs yet</p>
                <p className="text-xs text-zinc-600 mt-1">Run your workflow to see history</p>
              </div>
            ) : (
              <div className="space-y-2">
                {runs.map((run: any) => {
                  const nodeCount = getNodeExecutions(run).length;
                  return (
                    <button
                      key={run.id}
                      onClick={() => setSelectedRun(run.id)}
                      className="w-full text-left border border-zinc-800 hover:border-zinc-700 rounded p-3 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", getStatusColor(run.status))} />
                          <span className="text-sm text-white font-medium">Run #{run.id}</span>
                        </div>
                        <span className="text-xs text-zinc-500">
                          {run.startedAt ? formatDistanceToNow(new Date(run.startedAt), { addSuffix: true }) : '-'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span>{nodeCount} nodes</span>
                        {run.duration && <span>{(run.duration / 1000).toFixed(1)}s</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
