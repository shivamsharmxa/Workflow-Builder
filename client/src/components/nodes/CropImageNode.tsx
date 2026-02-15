import { memo, useState, useEffect } from "react";
import { NodeProps } from "reactflow";
import { NodeWrapper } from "./NodeWrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Crop } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";
import { useFetchWithAuth } from "@/lib/fetchWithAuth";

export interface CropImageNodeData {
  label: string;
  imageUrl?: string;
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
  croppedUrl?: string;
  status?: "idle" | "running" | "success" | "error";
  error?: string;
}

export const CropImageNode = memo(({ id, data, selected }: NodeProps<CropImageNodeData>) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const getNodeInputs = useWorkflowStore((state) => state.getNodeInputs);
  const [isRunning, setIsRunning] = useState(false);
  const fetchWithAuth = useFetchWithAuth();

  // Auto-get image from connected node
  useEffect(() => {
    const inputs = getNodeInputs(id);
    const inputValues = Object.values(inputs);
    if (inputValues.length > 0 && !data.imageUrl) {
      updateNodeData(id, { imageUrl: String(inputValues[0]) });
    }
  }, []);

  const handleCrop = async () => {
    // Get latest input
    const inputs = getNodeInputs(id);
    const inputValues = Object.values(inputs);
    const imageUrl = inputValues.length > 0 ? String(inputValues[0]) : data.imageUrl;
    
    if (!imageUrl) {
      alert("No input image. Connect an image source first.");
      return;
    }

    setIsRunning(true);
    updateNodeData(id, { status: "running" });

    try {
      // Call API to crop image via Trigger.dev (with auth token)
      const response = await fetchWithAuth("/api/execute/crop-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: imageUrl,
          x: data.x || 0,
          y: data.y || 0,
          width: data.width || 100,
          height: data.height || 100,
        }),
      });

      const result = await response.json();

      if (result.success) {
        updateNodeData(id, {
          croppedUrl: result.result,
          status: "success",
        });
      } else {
        throw new Error(result.error || "Crop failed");
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
        {/* Crop parameters */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs text-gray-400">X %</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={data.x || 0}
              onChange={(e) => updateNodeData(id, { x: Number(e.target.value) })}
              className="bg-[#28282B] border-[#333] text-white text-sm h-8"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Y %</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={data.y || 0}
              onChange={(e) => updateNodeData(id, { y: Number(e.target.value) })}
              className="bg-[#28282B] border-[#333] text-white text-sm h-8"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Width %</label>
            <Input
              type="number"
              min="1"
              max="100"
              value={data.width || 100}
              onChange={(e) => updateNodeData(id, { width: Number(e.target.value) })}
              className="bg-[#28282B] border-[#333] text-white text-sm h-8"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Height %</label>
            <Input
              type="number"
              min="1"
              max="100"
              value={data.height || 100}
              onChange={(e) => updateNodeData(id, { height: Number(e.target.value) })}
              className="bg-[#28282B] border-[#333] text-white text-sm h-8"
            />
          </div>
        </div>

        {/* Run button */}
        <Button
          onClick={handleCrop}
          disabled={isRunning || !data.imageUrl}
          className="w-full bg-[#10B981] hover:bg-[#059669] text-white"
          size="sm"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Cropping...
            </>
          ) : (
            <>
              <Crop className="w-3 h-3 mr-2" />
              Crop Image
            </>
          )}
        </Button>

        {/* Preview */}
        {data.croppedUrl && (
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Cropped Result</label>
            <img
              src={data.croppedUrl}
              alt="Cropped"
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

CropImageNode.displayName = "CropImageNode";
