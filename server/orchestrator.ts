/**
 * Server-side workflow orchestrator.
 *
 * Node type strings match exactly what the client Sidebar registers:
 *   text | uploadImage | uploadVideo | llm | cropImage | extractFrame
 *   (plus legacy seed types: prompt | flux | luma)
 *
 * Data field names match what each node component stores via updateNodeData.
 */

import { runGemini } from "./gemini";
import { cropImageWithFFmpeg, extractFrameWithFFmpeg } from "./utils/ffmpeg";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkflowNode {
  id: string;
  type: string;
  data: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export type NodeStatus = "success" | "failed" | "skipped";

export interface NodeResult {
  status: NodeStatus;
  nodeType: string;
  nodeName: string;
  output?: any;
  error?: string;
  executionTime: number;
  completedAt: string;
}

export interface OrchestratorResult {
  status: "success" | "failed";
  nodeResults: Record<string, NodeResult>;
  duration: number;
}

// ─── Topological sort (Kahn's algorithm) ──────────────────────────────────────

function topologicalSort(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const order: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);
    for (const neighbor of adjacency.get(current) ?? []) {
      const newDegree = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  return order;
}

// ─── Input resolver ────────────────────────────────────────────────────────────

function resolveInputs(
  nodeId: string,
  edges: WorkflowEdge[],
  nodeOutputs: Map<string, any>
): Record<string, any> {
  const inputs: Record<string, any> = {};

  for (const edge of edges) {
    if (edge.target !== nodeId) continue;
    const upstreamOutput = nodeOutputs.get(edge.source);
    if (upstreamOutput !== undefined && upstreamOutput !== null) {
      const key = edge.sourceHandle ?? "default";
      inputs[key] = upstreamOutput;
    }
  }

  return inputs;
}

// First non-null upstream value, used as the primary input for chained nodes
function primaryInput(inputs: Record<string, any>): any {
  return inputs["default"] ?? Object.values(inputs).find((v) => v != null) ?? null;
}

// ─── Node executors ────────────────────────────────────────────────────────────

async function executeNode(
  node: WorkflowNode,
  inputs: Record<string, any>
): Promise<any> {
  const { type, data } = node;
  const upstream = primaryInput(inputs);

  switch (type) {
    // ── text ────────────────────────────────────────────────────────────────
    case "text": {
      // TextNode: output its own text content
      return data.text ?? data.value ?? "";
    }

    // ── uploadImage ─────────────────────────────────────────────────────────
    case "uploadImage": {
      // UploadImageNode stores the uploaded URL in data.imageUrl
      return data.imageUrl ?? null;
    }

    // ── uploadVideo ─────────────────────────────────────────────────────────
    case "uploadVideo": {
      // UploadVideoNode stores the uploaded URL in data.videoUrl
      return data.videoUrl ?? null;
    }

    // ── llm ─────────────────────────────────────────────────────────────────
    case "llm": {
      // Build the user message: prefer data.userMessage, then use {input} substitution
      let userMessage: string = data.userMessage ?? data.prompt ?? "";

      const imageInputs: string[] = [];

      // Collect text and image inputs from upstream nodes
      for (const val of Object.values(inputs)) {
        if (typeof val !== "string") continue;
        if (val.startsWith("data:image") || (val.startsWith("http") && !val.startsWith("data:video"))) {
          imageInputs.push(val);
        } else if (typeof val === "string") {
          // Substitute {input} placeholder with the first text input
          if (userMessage.includes("{input}")) {
            userMessage = userMessage.replace(/\{input\}/g, val);
          }
        }
      }

      if (!userMessage) {
        throw new Error("LLMNode: no userMessage configured");
      }

      return runGemini({
        model: data.model ?? "gemini-1.5-flash",
        systemPrompt: data.systemPrompt,
        userMessage,
        images: [...imageInputs, ...(data.images ?? [])],
      });
    }

    // ── cropImage ───────────────────────────────────────────────────────────
    case "cropImage": {
      // Image comes from upstream node output OR the node's own stored imageUrl
      const imageUrl =
        (typeof upstream === "string" && (upstream.startsWith("data:image") || upstream.startsWith("http")))
          ? upstream
          : data.imageUrl ?? null;

      if (!imageUrl) {
        throw new Error("CropImageNode: no image input — connect an Upload Image node or set imageUrl");
      }

      const result = await cropImageWithFFmpeg({
        imageUrl,
        x: Number(data.x ?? 0),
        y: Number(data.y ?? 0),
        width: Number(data.width ?? 100),
        height: Number(data.height ?? 100),
      });

      // Return the base64 data URL (stored as croppedUrl in the component)
      return result.result;
    }

    // ── extractFrame ────────────────────────────────────────────────────────
    case "extractFrame": {
      // Video comes from upstream node output OR the node's own stored videoUrl
      const videoUrl =
        (typeof upstream === "string" && (upstream.startsWith("data:video") || upstream.startsWith("http")))
          ? upstream
          : data.videoUrl ?? null;

      if (!videoUrl) {
        throw new Error("ExtractFrameNode: no video input — connect an Upload Video node or set videoUrl");
      }

      const result = await extractFrameWithFFmpeg({
        videoUrl,
        timestamp: Number(data.timestamp ?? 0),
        isPercentage: Boolean(data.isPercentage),
      });

      return result.result;
    }

    // ── legacy seed node types (pass-through) ───────────────────────────────
    case "prompt": {
      return data.prompt ?? data.text ?? upstream ?? null;
    }

    case "flux":
    case "luma":
    default: {
      // Unknown or stub nodes: pass through whatever came from upstream
      return data.output ?? data.result ?? upstream ?? null;
    }
  }
}

// ─── Main orchestrator ─────────────────────────────────────────────────────────

export async function runWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Promise<OrchestratorResult> {
  const startTime = Date.now();
  const executionOrder = topologicalSort(nodes, edges);
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Stores the primary output of each executed node, keyed by node ID
  const nodeOutputs = new Map<string, any>();
  const nodeResults: Record<string, NodeResult> = {};

  let hasError = false;

  for (const nodeId of executionOrder) {
    const node = nodeMap.get(nodeId);
    if (!node) continue;

    const nodeStart = Date.now();

    try {
      const inputs = resolveInputs(nodeId, edges, nodeOutputs);
      const output = await executeNode(node, inputs);
      nodeOutputs.set(nodeId, output);

      nodeResults[nodeId] = {
        status: "success",
        nodeType: node.type,
        nodeName: node.data.label ?? node.type,
        output,
        executionTime: Date.now() - nodeStart,
        completedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      hasError = true;
      nodeResults[nodeId] = {
        status: "failed",
        nodeType: node.type,
        nodeName: node.data.label ?? node.type,
        error: error.message ?? "Unknown error",
        executionTime: Date.now() - nodeStart,
        completedAt: new Date().toISOString(),
      };
      // Continue executing independent downstream branches
    }
  }

  return {
    status: hasError ? "failed" : "success",
    nodeResults,
    duration: Date.now() - startTime,
  };
}
