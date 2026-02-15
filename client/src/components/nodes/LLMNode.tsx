import { memo, useState } from "react";
import { NodeProps, Handle, Position } from "reactflow";
import { NodeWrapper } from "./NodeWrapper";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";
import { useFetchWithAuth } from "@/lib/fetchWithAuth";

export interface LLMNodeData {
  label: string;
  model: string;
  systemPrompt?: string;
  userMessage: string;
  images?: string[];
  output?: string;
  status?: "idle" | "running" | "success" | "error";
  error?: string;
}

const MODELS = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Recommended)" },
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
];

export const LLMNode = memo(({ id, data, selected }: NodeProps<LLMNodeData>) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const [isRunning, setIsRunning] = useState(false);
  const fetchWithAuth = useFetchWithAuth();

  const handleRun = async () => {
    if (!data.userMessage) {
      alert("Please enter a user message");
      return;
    }

    setIsRunning(true);
    updateNodeData(id, { status: "running" });

    try {
      // Get inputs from connected nodes
      const inputs = useWorkflowStore.getState().getNodeInputs(id);
      
      // Separate text, image, and video inputs
      const textInputs: string[] = [];
      const imageInputs: string[] = [];
      const videoInputs: string[] = [];
      
      Object.values(inputs).forEach((input: any) => {
        if (typeof input === 'string') {
          // Check type
          if (input.startsWith('data:video/')) {
            videoInputs.push(input);
          } else if (input.startsWith('data:image/') || input.startsWith('http')) {
            imageInputs.push(input);
          } else {
            textInputs.push(input);
          }
        }
      });
      
      // Handle video inputs - Gemini doesn't support direct video analysis via generateContent
      if (videoInputs.length > 0) {
        updateNodeData(id, {
          status: "error",
          error: "Video analysis not supported. Use 'Extract Frame' node to convert video to image first, then connect to LLM.",
        });
        setIsRunning(false);
        return;
      }
      
      // Replace {input} placeholder with text input
      let processedMessage = data.userMessage;
      if (processedMessage.includes('{input}') && textInputs.length > 0) {
        processedMessage = processedMessage.replace(/\{input\}/g, textInputs[0]);
      }
      
      // Combine images from connected nodes and manual uploads
      const allImages = [...imageInputs, ...(data.images || [])];
      
      console.log('LLM Node - Processing:', {
        message: processedMessage,
        imageCount: allImages.length,
        hasImages: allImages.length > 0
      });
      
      // Call API to run LLM via Trigger.dev (with auth token)
      const response = await fetchWithAuth("/api/execute/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: data.model || "gemini-2.5-flash",
          systemPrompt: data.systemPrompt,
          userMessage: processedMessage,
          images: allImages,
        }),
      });

      const result = await response.json();

      if (result.success) {
        updateNodeData(id, {
          output: result.result,
          status: "success",
        });
      } else {
        throw new Error(result.error || "LLM execution failed");
      }
    } catch (error: any) {
      console.error('LLM Node Error:', error);
      updateNodeData(id, {
        status: "error",
        error: error.message || String(error),
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="relative">
      {/* Multiple image input handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="image-1"
        style={{ top: "30%" }}
        className="!bg-green-500 !w-3 !h-3"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="image-2"
        style={{ top: "50%" }}
        className="!bg-green-500 !w-3 !h-3"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="text"
        style={{ top: "70%" }}
        className="!bg-purple-500 !w-3 !h-3"
      />

      <NodeWrapper
        label={data.label}
        selected={selected}
      >
        <div className="space-y-3">
          {/* Model selector */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Model</label>
            <Select
              value={data.model || "gemini-2.5-flash"}
              onValueChange={(value) => updateNodeData(id, { model: value })}
            >
              <SelectTrigger className="bg-[#28282B] border-[#333] text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* System prompt */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">System Prompt (Optional)</label>
            <Textarea
              value={data.systemPrompt || ""}
              onChange={(e) => updateNodeData(id, { systemPrompt: e.target.value })}
              placeholder="You are a helpful assistant..."
              className="min-h-[60px] bg-[#28282B] border-[#333] text-white text-sm resize-none"
            />
          </div>

          {/* User message */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">User Message</label>
            <Textarea
              value={data.userMessage || ""}
              onChange={(e) => updateNodeData(id, { userMessage: e.target.value })}
              placeholder="Enter your prompt..."
              className="min-h-[80px] bg-[#28282B] border-[#333] text-white text-sm resize-none"
            />
          </div>

          {/* Run button */}
          <Button
            onClick={handleRun}
            disabled={isRunning || !data.userMessage}
            className="w-full bg-[#C084FC] hover:bg-[#A855F7] text-white"
            size="sm"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-2" />
                Run LLM
              </>
            )}
          </Button>

          {/* Output */}
          {data.output && (
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Output</label>
              <div className="bg-[#28282B] border border-[#333] rounded p-2 text-xs text-white max-h-[120px] overflow-y-auto">
                {data.output}
              </div>
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

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-[#555] !w-3 !h-3"
      />
    </div>
  );
});

LLMNode.displayName = "LLMNode";
