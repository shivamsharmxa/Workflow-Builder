import { pgTable, text, serial, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// Users table for Clerk authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  nodes: jsonb("nodes").notNull().default([]), // ReactFlow nodes
  edges: jsonb("edges").notNull().default([]), // ReactFlow edges
  credits: integer("credits").notNull().default(149),
  runs: integer("runs").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Assignment Requirement: Workflow execution history with node-level details
export const workflowRuns = pgTable("workflow_runs", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").notNull(),
  status: text("status").notNull().default("running"), // running, success, failed
  nodeResults: jsonb("node_results").notNull().default({}), // { nodeId: { status, result, error } }
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // milliseconds
});

// === BASE SCHEMAS ===
export const insertWorkflowSchema = createInsertSchema(workflows).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertWorkflowRunSchema = createInsertSchema(workflowRuns).omit({
  id: true,
  startedAt: true,
});

// === EXPLICIT API CONTRACT TYPES ===
export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;

export type WorkflowRun = typeof workflowRuns.$inferSelect;
export type InsertWorkflowRun = z.infer<typeof insertWorkflowRunSchema>;

// Node Data Types
export interface BaseNodeData extends Record<string, unknown> {
  label: string;
  cost?: number;
  status?: 'idle' | 'running' | 'success' | 'error';
  previewUrl?: string;
}

export interface PromptNodeData extends BaseNodeData {
  prompt: string;
}

export interface LumaNodeData extends BaseNodeData {
  duration: number;
  aspectRatio: string;
  loop: boolean;
  concepts?: string;
}

export interface FluxNodeData extends BaseNodeData {
}

export interface ImportNodeData extends BaseNodeData {
  fileType?: 'image' | 'video';
  fileName?: string;
}

// Request types
export type CreateWorkflowRequest = InsertWorkflow;
export type UpdateWorkflowRequest = Partial<InsertWorkflow>;

// Response types
export type WorkflowResponse = Workflow;
