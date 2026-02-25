"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

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

interface DeadlockGraphProps {
  processes: Process[]
  resources: Resource[]
}

export function DeadlockGraph({ processes, resources }: DeadlockGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove()

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height)

    // Create nodes for processes and resources
    const nodes: any[] = [
      ...processes.map((p) => ({ id: p.id, type: "process" })),
      ...resources.map((r) => ({ id: r.id, type: "resource" })),
    ]

    // Create links between processes and resources
    const links: any[] = []

    // Add allocation edges (resource → process)
    resources.forEach((resource) => {
      if (resource.heldBy) {
        links.push({
          source: resource.id,
          target: resource.heldBy,
          type: "allocation",
        })
      }
    })

    // Add request edges (process → resource)
    processes.forEach((process) => {
      if (process.waiting) {
        links.push({
          source: process.id,
          target: process.waiting,
          type: "request",
        })
      }
    })

    // Create a force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(100),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))

    // Draw links
    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", (d) => (d.type === "allocation" ? "#4CAF50" : "#F44336"))
      .attr("stroke-width", 2)
      .attr("marker-end", (d) => (d.type === "allocation" ? "url(#allocation-arrow)" : "url(#request-arrow)"))

    // Define arrow markers
    svg
      .append("defs")
      .selectAll("marker")
      .data(["allocation-arrow", "request-arrow"])
      .enter()
      .append("marker")
      .attr("id", (d) => d)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", (d) => (d === "allocation-arrow" ? "#4CAF50" : "#F44336"))
      .attr("d", "M0,-5L10,0L0,5")

    // Draw nodes
    const node = svg
      .append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended))

    // Process nodes (circles)
    node
      .filter((d) => d.type === "process")
      .append("circle")
      .attr("r", 20)
      .attr("fill", "#2196F3")

    // Resource nodes (squares)
    node
      .filter((d) => d.type === "resource")
      .append("rect")
      .attr("width", 30)
      .attr("height", 30)
      .attr("x", -15)
      .attr("y", -15)
      .attr("fill", "#FF9800")

    // Add labels
    node
      .append("text")
      .text((d) => d.id)
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("fill", "white")
      .attr("font-weight", "bold")

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as any).x)
        .attr("y1", (d) => (d.source as any).y)
        .attr("x2", (d) => (d.target as any).x)
        .attr("y2", (d) => (d.target as any).y)

      node.attr("transform", (d) => `translate(${(d as any).x},${(d as any).y})`)
    })

    // Drag functions
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragged(event: any) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    // Cleanup
    return () => {
      simulation.stop()
    }
  }, [processes, resources])

  return (
    <div className="w-full h-full border rounded-md overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  )
}

