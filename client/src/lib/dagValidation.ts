/**
 * DAG (Directed Acyclic Graph) Validation
 * Assignment Requirement: Workflows must be DAGs - circular connections not allowed
 */

import { Node, Edge } from "reactflow";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  cycle?: string[];
}

/**
 * Check if adding a new edge would create a cycle
 */
export function wouldCreateCycle(
  nodes: Node[],
  edges: Edge[],
  newEdge: { source: string; target: string }
): ValidationResult {
  // Create adjacency list with the new edge
  const adjacencyList = new Map<string, string[]>();
  
  // Initialize with existing edges
  edges.forEach((edge) => {
    if (!adjacencyList.has(edge.source)) {
      adjacencyList.set(edge.source, []);
    }
    adjacencyList.get(edge.source)!.push(edge.target);
  });
  
  // Add the new edge
  if (!adjacencyList.has(newEdge.source)) {
    adjacencyList.set(newEdge.source, []);
  }
  adjacencyList.get(newEdge.source)!.push(newEdge.target);
  
  // Check for cycles using DFS
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];
  
  function hasCycleDFS(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);
    
    const neighbors = adjacencyList.get(nodeId) || [];
    
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycleDFS(neighbor)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        // Found a cycle
        path.push(neighbor);
        return true;
      }
    }
    
    recursionStack.delete(nodeId);
    path.pop();
    return false;
  }
  
  // Check from the new edge's source
  if (hasCycleDFS(newEdge.source)) {
    return {
      isValid: false,
      error: "Cannot create connection: would create a circular dependency",
      cycle: path,
    };
  }
  
  return { isValid: true };
}

/**
 * Validate entire workflow for cycles
 */
export function validateWorkflowDAG(nodes: Node[], edges: Edge[]): ValidationResult {
  const adjacencyList = new Map<string, string[]>();
  
  edges.forEach((edge) => {
    if (!adjacencyList.has(edge.source)) {
      adjacencyList.set(edge.source, []);
    }
    adjacencyList.get(edge.source)!.push(edge.target);
  });
  
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  function hasCycle(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    
    const neighbors = adjacencyList.get(nodeId) || [];
    
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }
    
    recursionStack.delete(nodeId);
    return false;
  }
  
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (hasCycle(node.id)) {
        return {
          isValid: false,
          error: "Workflow contains circular dependencies",
        };
      }
    }
  }
  
  return { isValid: true };
}

/**
 * Get topological sort order for execution
 * Returns nodes in execution order (dependencies first)
 */
export function getExecutionOrder(nodes: Node[], edges: Edge[]): string[] {
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  
  // Initialize
  nodes.forEach((node) => {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
  });
  
  // Build graph
  edges.forEach((edge) => {
    adjacencyList.get(edge.source)!.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });
  
  // Kahn's algorithm for topological sort
  const queue: string[] = [];
  const result: string[] = [];
  
  // Start with nodes that have no dependencies
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);
    
    const neighbors = adjacencyList.get(current) || [];
    neighbors.forEach((neighbor) => {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);
      
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    });
  }
  
  return result;
}
