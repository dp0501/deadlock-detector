"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

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

interface ResourceTableProps {
  resources: Resource[]
  processes: Process[]
}

export function ResourceTable({ resources, processes }: ResourceTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Resource ID</TableHead>
          <TableHead>Held By</TableHead>
          <TableHead>Waited By</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {resources.map((resource) => (
          <TableRow key={resource.id}>
            <TableCell className="font-medium">{resource.id}</TableCell>
            <TableCell>
              {resource.heldBy ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {resource.heldBy}
                </Badge>
              ) : (
                <span className="text-muted-foreground">Available</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {resource.waitedBy.length > 0 ? (
                  resource.waitedBy.map((process) => (
                    <Badge key={process} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {process}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

