import { z } from 'zod';
import { insertWorkflowSchema, workflows, insertWorkflowRunSchema, workflowRuns } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  workflows: {
    list: {
      method: 'GET' as const,
      path: '/api/workflows' as const,
      responses: {
        200: z.array(z.custom<typeof workflows.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/workflows/:id' as const,
      responses: {
        200: z.custom<typeof workflows.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/workflows' as const,
      input: insertWorkflowSchema,
      responses: {
        201: z.custom<typeof workflows.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/workflows/:id' as const,
      input: insertWorkflowSchema.partial(),
      responses: {
        200: z.custom<typeof workflows.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/workflows/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  workflowRuns: {
    list: {
      method: 'GET' as const,
      path: '/api/workflows/:workflowId/runs' as const,
      responses: {
        200: z.array(z.custom<typeof workflowRuns.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/workflow-runs/:id' as const,
      responses: {
        200: z.custom<typeof workflowRuns.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/workflows/:workflowId/runs' as const,
      input: insertWorkflowRunSchema,
      responses: {
        201: z.custom<typeof workflowRuns.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE HELPERS
// ============================================
export type WorkflowInput = z.infer<typeof api.workflows.create.input>;
export type WorkflowResponse = z.infer<typeof api.workflows.create.responses[201]>;
export type WorkflowRunInput = z.infer<typeof api.workflowRuns.create.input>;
export type WorkflowRunResponse = z.infer<typeof api.workflowRuns.create.responses[201]>;
