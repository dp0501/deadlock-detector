/**
 * Deadlock detection algorithms
 */

// Resource Allocation Graph representation
export interface RAGraph {
  processes: string[]
  resources: string[]
  allocations: [string, string][] // [resource, process]
  requests: [string, string][] // [process, resource]
}

/**
 * Detects deadlocks using cycle detection in a resource allocation graph
 * @param graph The resource allocation graph
 * @returns Array of cycles (deadlocks) found in the graph
 */
export function detectDeadlocksByCycle(graph: RAGraph): string[][] {
  // Convert the RAG to an adjacency list for cycle detection
  const adjacencyList = new Map<string, string[]>()

  // Initialize all processes and resources with empty adjacency lists
  for (const process of graph.processes) {
    adjacencyList.set(process, [])
  }

  for (const resource of graph.resources) {
    adjacencyList.set(resource, [])
  }

  // Add edges from resources to processes (allocations)
  for (const [resource, process] of graph.allocations) {
    const adjacentNodes = adjacencyList.get(resource) || []
    adjacentNodes.push(process)
    adjacencyList.set(resource, adjacentNodes)
  }

  // Add edges from processes to resources (requests)
  for (const [process, resource] of graph.requests) {
    const adjacentNodes = adjacencyList.get(process) || []
    adjacentNodes.push(resource)
    adjacencyList.set(process, adjacentNodes)
  }

  // Find cycles in the graph
  const cycles: string[][] = []
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function dfs(node: string, path: string[] = []): void {
    visited.add(node)
    recursionStack.add(node)
    path.push(node)

    const neighbors = adjacencyList.get(node) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, [...path])
      } else if (recursionStack.has(neighbor)) {
        // Found a cycle
        const cycleStart = path.indexOf(neighbor)
        if (cycleStart !== -1) {
          const cycle = path.slice(cycleStart)
          // Only consider cycles that involve processes (not just resources)
          if (cycle.some((node) => graph.processes.includes(node))) {
            // Filter to only include processes in the cycle
            const processCycle = cycle.filter((node) => graph.processes.includes(node))
            if (processCycle.length > 1) {
              cycles.push(processCycle)
            }
          }
        }
      }
    }

    recursionStack.delete(node)
  }

  // Start DFS from each process
  for (const process of graph.processes) {
    if (!visited.has(process)) {
      dfs(process)
    }
  }

  return cycles
}

/**
 * Detects deadlocks using the Banker's Algorithm
 * @param available Available instances of each resource type
 * @param maximum Maximum demand of each process
 * @param allocation Current allocation to each process
 * @returns Array of processes that are in deadlock
 */
export function detectDeadlocksByBanker(available: number[], maximum: number[][], allocation: number[][]): number[] {
  const numProcesses = allocation.length
  const numResources = available.length

  // Calculate need matrix
  const need: number[][] = []
  for (let i = 0; i < numProcesses; i++) {
    need[i] = []
    for (let j = 0; j < numResources; j++) {
      need[i][j] = maximum[i][j] - allocation[i][j]
    }
  }

  // Make a copy of available resources
  const work = [...available]

  // Track which processes can complete
  const finish = new Array(numProcesses).fill(false)

  // Find an unfinished process whose needs can be satisfied
  let changed = true
  while (changed) {
    changed = false
    for (let i = 0; i < numProcesses; i++) {
      if (!finish[i]) {
        // Check if all resources for this process can be allocated
        let canAllocate = true
        for (let j = 0; j < numResources; j++) {
          if (need[i][j] > work[j]) {
            canAllocate = false
            break
          }
        }

        if (canAllocate) {
          // This process can complete, release its resources
          for (let j = 0; j < numResources; j++) {
            work[j] += allocation[i][j]
          }
          finish[i] = true
          changed = true
          break
        }
      }
    }
  }

  // Any process that couldn't finish is deadlocked
  const deadlockedProcesses: number[] = []
  for (let i = 0; i < numProcesses; i++) {
    if (!finish[i]) {
      deadlockedProcesses.push(i)
    }
  }

  return deadlockedProcesses
}

/**
 * Resolves a deadlock by preempting resources
 * @param cycle The cycle of processes forming the deadlock
 * @param allocations Current resource allocations
 * @returns The process ID and resource ID to preempt
 */
export function resolveDeadlockByPreemption(
  cycle: string[],
  allocations: Map<string, string[]>,
): { processId: string; resourceId: string } | null {
  // Find the process with the minimum cost of preemption
  // This is a simplified implementation - in a real system, we would
  // consider factors like process priority, resource usage, etc.

  if (cycle.length === 0) return null

  // For this demo, just select the first process in the cycle
  const processId = cycle[0]
  const resources = allocations.get(processId) || []

  if (resources.length === 0) return null

  // Select the first resource
  const resourceId = resources[0]

  return { processId, resourceId }
}

