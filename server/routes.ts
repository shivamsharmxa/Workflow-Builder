import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { runGemini } from "./gemini";
import { cropImageWithFFmpeg, extractFrameWithFFmpeg } from "./utils/ffmpeg";
import { runWorkflow } from "./orchestrator";

// All execution runs directly in-process.
// Trigger.dev task files (server/jobs/) exist as the background-job definitions
// and can be triggered from other tasks, but Express routes always call utilities directly.
// tasks.triggerAndWait() is a task-to-task API and cannot be called from an HTTP handler.

async function invokeLLM(payload: {
  model?: string;
  systemPrompt?: string;
  userMessage: string;
  images?: string[];
}): Promise<string> {
  return runGemini({
    model: (payload.model as any) ?? "gemini-1.5-flash",
    systemPrompt: payload.systemPrompt,
    userMessage: payload.userMessage,
    images: payload.images ?? [],
  });
}

async function invokeCropImage(payload: {
  imageUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
}): Promise<{ result: string; dimensions: { width: number; height: number } }> {
  const result = await cropImageWithFFmpeg(payload);
  return { result: result.result, dimensions: result.dimensions };
}

async function invokeExtractFrame(payload: {
  videoUrl: string;
  timestamp: number;
  isPercentage?: boolean;
}): Promise<{ result: string; timestamp: number }> {
  const result = await extractFrameWithFFmpeg(payload);
  return { result: result.result, timestamp: result.timestamp };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // === WORKFLOWS API ===

  app.get(api.workflows.list.path, async (req, res) => {
    const workflows = await storage.getWorkflows();
    res.json(workflows);
  });

  app.get(api.workflows.get.path, async (req, res) => {
    const workflow = await storage.getWorkflow(Number(req.params.id));
    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }
    res.json(workflow);
  });

  app.post(api.workflows.create.path, async (req, res) => {
    try {
      const input = api.workflows.create.input.parse(req.body);
      const workflow = await storage.createWorkflow(input);
      res.status(201).json(workflow);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.put(api.workflows.update.path, async (req, res) => {
    try {
      const input = api.workflows.update.input.parse(req.body);
      const workflow = await storage.updateWorkflow(Number(req.params.id), input);
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      res.json(workflow);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.delete(api.workflows.delete.path, async (req, res) => {
    const exists = await storage.getWorkflow(Number(req.params.id));
    if (!exists) {
      return res.status(404).json({ message: "Workflow not found" });
    }
    await storage.deleteWorkflow(Number(req.params.id));
    res.status(204).send();
  });

  // === WORKFLOW RUNS API ===

  app.get("/api/workflows/:id/runs", async (req, res) => {
    const runs = await storage.getWorkflowRuns(Number(req.params.id));
    res.json(runs);
  });

  app.get("/api/runs/:id", async (req, res) => {
    const run = await storage.getWorkflowRun(Number(req.params.id));
    if (!run) {
      return res.status(404).json({ message: "Run not found" });
    }
    res.json(run);
  });

  app.post("/api/workflows/:id/runs", async (req, res) => {
    const run = await storage.createWorkflowRun({
      workflowId: Number(req.params.id),
      status: "running",
      nodeResults: {},
    });
    res.status(201).json(run);
  });

  app.put("/api/runs/:id", async (req, res) => {
    try {
      const updates = { ...req.body };

      if (updates.completedAt && typeof updates.completedAt === "string") {
        updates.completedAt = new Date(updates.completedAt);
      }

      if (updates.status && updates.status !== "running" && !updates.completedAt) {
        updates.completedAt = new Date();
      }

      const run = await storage.updateWorkflowRun(Number(req.params.id), updates);
      if (!run) {
        return res.status(404).json({ message: "Run not found" });
      }
      res.json(run);
    } catch (error: any) {
      console.error("Error updating run:", error);
      res.status(500).json({ message: error.message || "Failed to update run" });
    }
  });

  // === EXECUTION API ===
  // Individual node execution endpoints.
  // The server-side orchestrator (/api/workflows/:id/execute) is the preferred
  // entry point for full workflow runs — see below.

  app.post("/api/execute/llm", async (req, res) => {
    try {
      const { model, systemPrompt, userMessage, images } = req.body;

      if (!userMessage) {
        return res.status(400).json({ success: false, error: "userMessage is required" });
      }

      const result = await invokeLLM({ model, systemPrompt, userMessage, images });
      res.json({ success: true, result });
    } catch (error: any) {
      console.error("LLM execution error:", error);
      res.status(500).json({ success: false, error: error.message || "LLM execution failed" });
    }
  });

  app.post("/api/execute/crop-image", async (req, res) => {
    try {
      const { imageUrl, x, y, width, height } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ success: false, error: "imageUrl is required" });
      }

      const output = await invokeCropImage({
        imageUrl,
        x: Number(x ?? 0),
        y: Number(y ?? 0),
        width: Number(width ?? 100),
        height: Number(height ?? 100),
      });

      res.json({ success: true, ...output });
    } catch (error: any) {
      console.error("Crop-image error:", error);
      res.status(500).json({ success: false, error: error.message || "Image crop failed" });
    }
  });

  app.post("/api/execute/extract-frame", async (req, res) => {
    try {
      const { videoUrl, timestamp, isPercentage } = req.body;

      if (!videoUrl) {
        return res.status(400).json({ success: false, error: "videoUrl is required" });
      }

      const output = await invokeExtractFrame({
        videoUrl,
        timestamp: Number(timestamp ?? 0),
        isPercentage: Boolean(isPercentage),
      });

      res.json({ success: true, ...output });
    } catch (error: any) {
      console.error("Extract-frame error:", error);
      res.status(500).json({ success: false, error: error.message || "Frame extraction failed" });
    }
  });

  // Execute an arbitrary subgraph (selected nodes) without a saved workflow ID
  app.post("/api/execute/subgraph", async (req, res) => {
    try {
      const { nodes, edges } = req.body;

      if (!Array.isArray(nodes) || !Array.isArray(edges)) {
        return res.status(400).json({ success: false, error: "nodes and edges arrays are required" });
      }

      const result = await runWorkflow(nodes, edges);
      res.json({ success: true, result });
    } catch (error: any) {
      console.error("Subgraph execution error:", error);
      res.status(500).json({ success: false, error: error.message ?? "Execution failed" });
    }
  });

  // === SERVER-SIDE WORKFLOW ORCHESTRATOR ===
  // Preferred entry point for running an entire workflow.
  // The client sends one POST; the server does the full DAG execution.

  app.post("/api/workflows/:id/execute", async (req, res) => {
    const workflowId = Number(req.params.id);

    const workflow = await storage.getWorkflow(workflowId);
    if (!workflow) {
      return res.status(404).json({ success: false, error: "Workflow not found" });
    }

    // Create a run record immediately so the client can track progress
    let run = await storage.createWorkflowRun({
      workflowId,
      status: "running",
      nodeResults: {},
    });

    try {
      const result = await runWorkflow(
        workflow.nodes as any[],
        workflow.edges as any[]
      );

      run = await storage.updateWorkflowRun(run.id, {
        status: result.status,
        nodeResults: result.nodeResults,
        completedAt: new Date(),
        duration: result.duration,
      });

      res.json({ success: true, run, result });
    } catch (error: any) {
      console.error("Workflow execution error:", error);

      await storage.updateWorkflowRun(run.id, {
        status: "failed",
        nodeResults: {},
        completedAt: new Date(),
      });

      res.status(500).json({
        success: false,
        error: error.message ?? "Workflow execution failed",
        runId: run.id,
      });
    }
  });

  return httpServer;
}

// Seed function — creates an example workflow if the database is empty
async function seedDatabase() {
  const workflows = await storage.getWorkflows();
  if (workflows.length === 0) {
    const initialNodes = [
      {
        id: "1",
        type: "prompt",
        position: { x: 100, y: 100 },
        data: { label: "Prompt", prompt: "A cinematic scene of a futuristic city..." },
      },
      {
        id: "2",
        type: "luma",
        position: { x: 400, y: 200 },
        data: { label: "Luma Ray 2 Flash", cost: 36, duration: 5, aspectRatio: "16:9", loop: false },
      },
      {
        id: "3",
        type: "flux",
        position: { x: 400, y: 500 },
        data: { label: "Flux Fast", cost: 12 },
      },
    ];

    const initialEdges = [
      { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#C084FC" } },
      { id: "e1-3", source: "1", target: "3", animated: true, style: { stroke: "#C084FC" } },
    ];

    await storage.createWorkflow({
      title: "My First Weavy",
      nodes: initialNodes,
      edges: initialEdges,
      credits: 149,
    });
  }
}

seedDatabase().catch(console.error);
