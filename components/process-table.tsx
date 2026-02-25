"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface Process {
  id: string
  resources: string[]
  waiting: string | null
}

interface Resource {
  id: string
  heldBy: string | null
  waitedBy: string[]
}

interface ProcessTableProps {
  processes: Process[]
  resources: Resource[]
  onAllocate: (processId: string, resourceId: string) => void
  onRequest: (processId: string, resourceId: string) => void
}

export function ProcessTable({ processes, resources, onAllocate, onRequest }: ProcessTableProps) {
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null)
  const [selectedResource, setSelectedResource] = useState<string | null>(null)

  const availableResources = resources.filter((r) => !r.heldBy)
  const allocatedResources = (process: Process) => resources.filter((r) => r.heldBy === process.id).map((r) => r.id)

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Process ID</TableHead>
            <TableHead>Allocated Resources</TableHead>
            <TableHead>Waiting For</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {processes.map((process) => (
            <TableRow key={process.id}>
              <TableCell className="font-medium">{process.id}</TableCell>
              <TableCell>
                {allocatedResources(process).length > 0 ? allocatedResources(process).join(", ") : "None"}
              </TableCell>
              <TableCell>{process.waiting || "None"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Allocate Resource</h3>
          <div className="flex space-x-2">
            <Select onValueChange={setSelectedProcess}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select Process" />
              </SelectTrigger>
              <SelectContent>
                {processes.map((process) => (
                  <SelectItem key={process.id} value={process.id}>
                    {process.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setSelectedResource}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select Resource" />
              </SelectTrigger>
              <SelectContent>
                {availableResources.map((resource) => (
                  <SelectItem key={resource.id} value={resource.id}>
                    {resource.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => {
                if (selectedProcess && selectedResource) {
                  onAllocate(selectedProcess, selectedResource)
                  setSelectedProcess(null)
                  setSelectedResource(null)
                }
              }}
              disabled={!selectedProcess || !selectedResource}
              size="sm"
            >
              Allocate
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Request Resource</h3>
          <div className="flex space-x-2">
            <Select onValueChange={setSelectedProcess}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select Process" />
              </SelectTrigger>
              <SelectContent>
                {processes.map((process) => (
                  <SelectItem key={process.id} value={process.id}>
                    {process.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setSelectedResource}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select Resource" />
              </SelectTrigger>
              <SelectContent>
                {resources.map((resource) => (
                  <SelectItem key={resource.id} value={resource.id}>
                    {resource.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => {
                if (selectedProcess && selectedResource) {
                  onRequest(selectedProcess, selectedResource)
                  setSelectedProcess(null)
                  setSelectedResource(null)
                }
              }}
              disabled={!selectedProcess || !selectedResource}
              size="sm"
            >
              Request
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

