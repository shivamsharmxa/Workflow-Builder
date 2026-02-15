import { memo, useState, useEffect } from "react";
import { NodeProps } from "reactflow";
import { NodeWrapper } from "./NodeWrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Film } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";
import { useFetchWithAuth } from "@/lib/fetchWithAuth";

export interface ExtractFrameNodeData {
  label: string;
  videoUrl?: string;
  timestamp: number;
  isPercentage: boolean;
  frameUrl?: string;
  status?: "idle" | "running" | "success" | "error";
  error?: string;
}

export const ExtractFrameNode = memo(({ id, data, selected }: NodeProps<ExtractFrameNodeData>) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const getNodeInputs = useWorkflowStore((state) => state.getNodeInputs);
  const [isRunning, setIsRunning] = useState(false);
  const fetchWithAuth = useFetchWithAuth();

  // Auto-get video from connected node
  useEffect(() => {
    const inputs = getNodeInputs(id);
    const inputValues = Object.values(inputs);
    if (inputValues.length > 0 && !data.videoUrl) {
      updateNodeData(id, { videoUrl: String(inputValues[0]) });
    }
  }, []);

  const handleExtract = async () => {
    // Get latest input
    const inputs = getNodeInputs(id);
    const inputValues = Object.values(inputs);
    const videoUrl = inputValues.length > 0 ? String(inputValues[0]) : data.videoUrl;
    
    if (!videoUrl) {
      alert("No input video. Connect a video source first.");
      return;
    }

    setIsRunning(true);
    updateNodeData(id, { status: "running" });

    try {
      // Call API to extract frame via Trigger.dev (with auth token)
      const response = await fetchWithAuth("/api/execute/extract-frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: videoUrl,
          timestamp: data.timestamp || 0,
          isPercentage: data.isPercentage || false,
        }),
      });

      const result = await response.json();

      if (result.success) {
        updateNodeData(id, {
          frameUrl: result.result,
          status: "success",
        });
      } else {
        throw new Error(result.error || "Frame extraction failed");
      }
    } catch (error: any) {
      updateNodeData(id, {
        status: "error",
        error: error.message,
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <NodeWrapper
      label={data.label}
      selected={selected}
    >
      <div className="space-y-3">
        {/* Timestamp input */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400">
            Timestamp {data.isPercentage ? "(%)  " : "(seconds)"}
          </label>
          <Input
            type="number"
            min="0"
            max={data.isPercentage ? 100 : undefined}
            value={data.timestamp || 0}
            onChange={(e) => updateNodeData(id, { timestamp: Number(e.target.value) })}
            className="bg-[#28282B] border-[#333] text-white text-sm"
          />
        </div>

        {/* Percentage toggle */}
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-400">Use Percentage</label>
          <Switch
            checked={data.isPercentage || false}
            onCheckedChange={(checked) => updateNodeData(id, { isPercentage: checked })}
          />
        </div>

        {/* Run button */}
        <Button
          onClick={handleExtract}
          disabled={isRunning || !data.videoUrl}
          className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white"
          size="sm"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Extracting...
            </>
          ) : (
            <>
              <Film className="w-3 h-3 mr-2" />
              Extract Frame
            </>
          )}
        </Button>

        {/* Preview */}
        {data.frameUrl && (
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Extracted Frame</label>
            <img
              src={data.frameUrl}
              alt="Extracted frame"
              className="w-full h-32 object-cover rounded border border-[#333]"
            />
          </div>
        )}

        {/* Error */}
        {data.error && (
          <div className="text-xs text-red-500 bg-red-500/10 p-2 rounded">
            {data.error}
          </div>
        )}
      </div>
    </NodeWrapper>
  );
});

ExtractFrameNode.displayName = "ExtractFrameNode";
