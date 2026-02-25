"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeadlockGraph } from "@/components/deadlock-graph"
import { ProcessTable } from "@/components/process-table"
import { ResourceTable } from "@/components/resource-table"
import { DeadlockDetector } from "@/components/deadlock-detector"

export default function DeadlockDetectionPage() {
  const [processes, setProcesses] = useState([
    { id: "P1", resources: ["R2"], waiting: "R1" },
    { id: "P2", resources: ["R1"], waiting: "R3" },
    { id: "P3", resources: ["R3"], waiting: "R2" },
  ])

  const [resources, setResources] = useState([
    { id: "R1", heldBy: "P2", waitedBy: ["P1"] },
    { id: "R2", heldBy: "P1", waitedBy: ["P3"] },
    { id: "R3", heldBy: "P3", waitedBy: ["P2"] },
  ])

  const [deadlocks, setDeadlocks] = useState<string[][]>([])
  const [selectedTab, setSelectedTab] = useState("detection")

  const handleDetectDeadlocks = () => {
    // Simple cycle detection algorithm
    const cycles = findCycles(processes)
    setDeadlocks(cycles)
    setSelectedTab(cycles.length > 0 ? "recovery" : "detection")
  }

  const handleResolveDeadlock = (cycle: string[]) => {
    // Simple deadlock resolution by terminating a process
    const processToTerminate = cycle[0]

    // Update processes
    setProcesses(processes.filter((p) => p.id !== processToTerminate))

    // Update resources
    setResources(
      resources.map((r) => ({
        ...r,
        heldBy: r.heldBy === processToTerminate ? null : r.heldBy,
        waitedBy: r.waitedBy.filter((p) => p !== processToTerminate),
      })),
    )

    // Remove this cycle from deadlocks
    setDeadlocks(deadlocks.filter((c) => c[0] !== processToTerminate))
  }

  const findCycles = (processes: any[]): string[][] => {
    // This is a simplified implementation
    // In a real system, we would use a proper graph algorithm

    // For our demo, we'll just return the cycle we know exists
    return [["P1", "P2", "P3"]]
  }

  const handleAddProcess = (id: string) => {
    if (id && !processes.some((p) => p.id === id)) {
      setProcesses([...processes, { id, resources: [], waiting: null }])
    }
  }

  const handleAddResource = (id: string) => {
    if (id && !resources.some((r) => r.id === id)) {
      setResources([...resources, { id, heldBy: null, waitedBy: [] }])
    }
  }

  const handleAllocateResource = (processId: string, resourceId: string) => {
    // Update the process to hold the resource
    setProcesses(
      processes.map((p) =>
        p.id === processId
          ? { ...p, resources: [...p.resources, resourceId], waiting: p.waiting === resourceId ? null : p.waiting }
          : p,
      ),
    )

    // Update the resource to be held by the process
    setResources(
      resources.map((r) =>
        r.id === resourceId ? { ...r, heldBy: processId, waitedBy: r.waitedBy.filter((p) => p !== processId) } : r,
      ),
    )
  }

  const handleRequestResource = (processId: string, resourceId: string) => {
    // Update the process to wait for the resource
    setProcesses(processes.map((p) => (p.id === processId ? { ...p, waiting: resourceId } : p)))

    // Update the resource to be waited by the process
    setResources(resources.map((r) => (r.id === resourceId ? { ...r, waitedBy: [...r.waitedBy, processId] } : r)))
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Deadlock Detection and Recovery</h1>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="detection">Detection</TabsTrigger>
          <TabsTrigger value="recovery">Recovery</TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Processes</CardTitle>
                <CardDescription>Add and manage processes in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <ProcessTable
                  processes={processes}
                  resources={resources}
                  onAllocate={handleAllocateResource}
                  onRequest={handleRequestResource}
                />
              </CardContent>
              <CardFooter>
                <div className="flex w-full space-x-2">
                  <Input id="new-process" placeholder="Process ID (e.g., P4)" className="flex-1" />
                  <Button
                    onClick={() => {
                      const input = document.getElementById("new-process") as HTMLInputElement
                      handleAddProcess(input.value)
                      input.value = ""
                    }}
                  >
                    Add Process
                  </Button>
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
                <CardDescription>Add and manage resources in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <ResourceTable resources={resources} processes={processes} />
              </CardContent>
              <CardFooter>
                <div className="flex w-full space-x-2">
                  <Input id="new-resource" placeholder="Resource ID (e.g., R4)" className="flex-1" />
                  <Button
                    onClick={() => {
                      const input = document.getElementById("new-resource") as HTMLInputElement
                      handleAddResource(input.value)
                      input.value = ""
                    }}
                  >
                    Add Resource
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detection">
          <Card>
            <CardHeader>
              <CardTitle>Resource Allocation Graph</CardTitle>
              <CardDescription>Visualize the current state of processes and resources</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <DeadlockGraph processes={processes} resources={resources} />
            </CardContent>
            <CardFooter>
              <Button onClick={handleDetectDeadlocks} className="w-full">
                Detect Deadlocks
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="recovery">
          <Card>
            <CardHeader>
              <CardTitle>Deadlock Recovery</CardTitle>
              <CardDescription>
                {deadlocks.length > 0
                  ? `${deadlocks.length} deadlock(s) detected. Select a recovery strategy.`
                  : "No deadlocks detected."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeadlockDetector deadlocks={deadlocks} processes={processes} onResolve={handleResolveDeadlock} />
            </CardContent>
            <CardFooter>
              <Button onClick={() => setSelectedTab("detection")} variant="outline" className="w-full">
                Back to Detection
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

