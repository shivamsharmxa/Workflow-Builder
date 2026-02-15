import { db } from "./db";
import {
  workflows,
  workflowRuns,
  type InsertWorkflow,
  type Workflow,
  type WorkflowRun,
  type InsertWorkflowRun
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getWorkflows(): Promise<Workflow[]>;
  getWorkflow(id: number): Promise<Workflow | undefined>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, workflow: Partial<InsertWorkflow>): Promise<Workflow>;
  deleteWorkflow(id: number): Promise<void>;
  
  // Assignment Requirement: Workflow execution history
  getWorkflowRuns(workflowId: number): Promise<WorkflowRun[]>;
  getWorkflowRun(id: number): Promise<WorkflowRun | undefined>;
  createWorkflowRun(run: InsertWorkflowRun): Promise<WorkflowRun>;
  updateWorkflowRun(id: number, updates: Partial<InsertWorkflowRun>): Promise<WorkflowRun>;
}

export class DatabaseStorage implements IStorage {
  async getWorkflows(): Promise<Workflow[]> {
    return await db.select().from(workflows);
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id));
    return workflow;
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const [workflow] = await db.insert(workflows).values(insertWorkflow).returning();
    return workflow;
  }

  async updateWorkflow(id: number, updates: Partial<InsertWorkflow>): Promise<Workflow> {
    const [updated] = await db
      .update(workflows)
      .set(updates)
      .where(eq(workflows.id, id))
      .returning();
    return updated;
  }

  async deleteWorkflow(id: number): Promise<void> {
    await db.delete(workflows).where(eq(workflows.id, id));
  }

  // Assignment Requirement: Workflow execution history methods
  async getWorkflowRuns(workflowId: number): Promise<WorkflowRun[]> {
    return await db.select().from(workflowRuns).where(eq(workflowRuns.workflowId, workflowId));
  }

  async getWorkflowRun(id: number): Promise<WorkflowRun | undefined> {
    const [run] = await db.select().from(workflowRuns).where(eq(workflowRuns.id, id));
    return run;
  }

  async createWorkflowRun(insertRun: InsertWorkflowRun): Promise<WorkflowRun> {
    const [run] = await db.insert(workflowRuns).values(insertRun).returning();
    return run;
  }

  async updateWorkflowRun(id: number, updates: Partial<InsertWorkflowRun>): Promise<WorkflowRun> {
    const [updated] = await db
      .update(workflowRuns)
      .set(updates)
      .where(eq(workflowRuns.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
