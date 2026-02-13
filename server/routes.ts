import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

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
      return res.status(404).json({ message: 'Workflow not found' });
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
          field: err.errors[0].path.join('.'),
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
        return res.status(404).json({ message: 'Workflow not found' });
      }
      res.json(workflow);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.workflows.delete.path, async (req, res) => {
    const exists = await storage.getWorkflow(Number(req.params.id));
    if (!exists) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    await storage.deleteWorkflow(Number(req.params.id));
    res.status(204).send();
  });

  return httpServer;
}

// Seed function to create initial data if empty
async function seedDatabase() {
  const workflows = await storage.getWorkflows();
  if (workflows.length === 0) {
    const initialNodes = [
      {
        id: '1',
        type: 'prompt',
        position: { x: 100, y: 100 },
        data: { label: 'Prompt', prompt: 'A cinematic scene of a futuristic city...' }
      },
      {
        id: '2',
        type: 'luma',
        position: { x: 400, y: 200 },
        data: { label: 'Luma Ray 2 Flash', cost: 36, duration: 5, aspectRatio: '16:9', loop: false }
      },
      {
        id: '3',
        type: 'flux',
        position: { x: 400, y: 500 },
        data: { label: 'Flux Fast', cost: 12 }
      }
    ];

    const initialEdges = [
      { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#C084FC' } },
      { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#C084FC' } }
    ];

    await storage.createWorkflow({
      title: 'My First Weavy',
      nodes: initialNodes,
      edges: initialEdges,
      credits: 149
    });
  }
}

// Call seed on startup (in a real app, maybe conditional)
seedDatabase().catch(console.error);
