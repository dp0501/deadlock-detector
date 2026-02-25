"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface Process {
  id: string
  resources: string[]
  waiting: string | null
}

interface DeadlockDetectorProps {
  deadlocks: string[][]
  processes: Process[]
  onResolve: (cycle: string[]) => void
}

export function DeadlockDetector({ deadlocks, processes, onResolve }: DeadlockDetectorProps) {
  if (deadlocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">No deadlocks detected in the system.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Deadlock Detected</AlertTitle>
        <AlertDescription>
          {deadlocks.length} deadlock(s) found in the system. You need to resolve them to continue.
        </AlertDescription>
      </Alert>

      {deadlocks.map((cycle, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>Deadlock #{index + 1}</CardTitle>
            <CardDescription>
              Circular wait detected: {cycle.join(" → ")} → {cycle[0]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="font-medium mb-2">Recovery Options:</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Process Termination</h4>
                <p className="text-sm text-muted-foreground">
                  Terminate one of the processes in the cycle to break the deadlock.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {cycle.map((processId) => {
                    const process = processes.find((p) => p.id === processId)
                    return (
                      <Button key={processId} variant="outline" size="sm" onClick={() => onResolve(cycle)}>
                        Terminate {processId}
                        {process?.resources.length
                          ? ` (Holds ${process.resources.length} resource${process.resources.length > 1 ? "s" : ""})`
                          : ""}
                      </Button>
                    )
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Resource Preemption</h4>
                <p className="text-sm text-muted-foreground">
                  Temporarily take a resource away from its current owner and give it to another process.
                </p>
                <Button variant="outline" size="sm" className="mt-2" disabled>
                  Not implemented in this demo
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" size="sm">
              Ignore (Not Recommended)
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onResolve(cycle)}>
              Terminate {cycle[0]}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

