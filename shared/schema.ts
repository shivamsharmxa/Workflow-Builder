import { pgTable, text, serial, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  nodes: jsonb("nodes").notNull().default([]), // ReactFlow nodes
  edges: jsonb("edges").notNull().default([]), // ReactFlow edges
  credits: integer("credits").notNull().default(149),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertWorkflowSchema = createInsertSchema(workflows).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// === EXPLICIT API CONTRACT TYPES ===
export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;

// Node Data Types (for strict typing in frontend)
export interface BaseNodeData extends Record<string, unknown> {
  label: string;
  cost?: number;
}

export interface PromptNodeData extends BaseNodeData {
  prompt: string;
}

export interface LumaNodeData extends BaseNodeData {
  duration: number;
  aspectRatio: string;
  loop: boolean;
  concepts?: string;
  previewUrl?: string;
  status?: 'idle' | 'running' | 'success' | 'error';
}

export interface FluxNodeData extends BaseNodeData {
  previewUrl?: string;
  status?: 'idle' | 'running' | 'success' | 'error';
}

// Request types
export type CreateWorkflowRequest = InsertWorkflow;
export type UpdateWorkflowRequest = Partial<InsertWorkflow>;

// Response types
export type WorkflowResponse = Workflow;
