import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type WorkflowInput, type WorkflowRunInput } from "@shared/routes";

export function useWorkflows() {
  return useQuery({
    queryKey: [api.workflows.list.path],
    queryFn: async () => {
      const res = await fetch(api.workflows.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch workflows");
      return api.workflows.list.responses[200].parse(await res.json());
    },
  });
}

export function useWorkflow(id: number) {
  return useQuery({
    queryKey: [api.workflows.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.workflows.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch workflow");
      return api.workflows.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: WorkflowInput) => {
      const res = await fetch(api.workflows.create.path, {
        method: api.workflows.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.workflows.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create workflow");
      }
      return api.workflows.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.workflows.list.path] }),
  });
}

export function useUpdateWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<WorkflowInput>) => {
      const url = buildUrl(api.workflows.update.path, { id });
      const res = await fetch(url, {
        method: api.workflows.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update workflow");
      return api.workflows.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.workflows.list.path] }),
  });
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.workflows.delete.path, { id });
      const res = await fetch(url, { method: api.workflows.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete workflow");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.workflows.list.path] }),
  });
}

// Workflow Runs hooks
export function useWorkflowRuns(workflowId: number | null) {
  return useQuery({
    queryKey: [api.workflowRuns.list.path, workflowId],
    queryFn: async () => {
      if (!workflowId) return [];
      const url = buildUrl(api.workflowRuns.list.path, { workflowId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch workflow runs");
      return api.workflowRuns.list.responses[200].parse(await res.json());
    },
    enabled: !!workflowId,
  });
}

export function useCreateWorkflowRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workflowId, ...data }: { workflowId: number } & Partial<WorkflowRunInput>) => {
      const url = buildUrl(api.workflowRuns.create.path, { workflowId });
      const res = await fetch(url, {
        method: api.workflowRuns.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create workflow run");
      return api.workflowRuns.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.workflowRuns.list.path, variables.workflowId] });
    },
  });
}

export function useUpdateWorkflowRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, workflowId, ...updates }: { id: number; workflowId: number } & Partial<WorkflowRunInput>) => {
      const res = await fetch(`/api/runs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update workflow run");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.workflowRuns.list.path, variables.workflowId] });
    },
  });
}
