"use client"

import { useMemo } from "react"
import type { TaskData } from "@/types/task"
import { getWorkTypeColor } from "@/lib/work-type-colors"

interface WorkTypeLegendProps {
  tasks: TaskData[]
}

export function WorkTypeLegend({ tasks }: WorkTypeLegendProps) {
  // Get unique work types from tasks
  const workTypes = useMemo(() => {
    if (!tasks || tasks.length === 0) return []

    const types = new Set<string>()
    tasks.forEach((task) => {
      if (task.typeOfWork) {
        types.add(task.typeOfWork)
      }
    })

    return Array.from(types).sort()
  }, [tasks])

  if (workTypes.length === 0) return null

  return (
    <div className="material-legend print:hidden">
      {workTypes.map((type) => (
        <div key={type} className="material-legend-item">
          <div className="material-legend-color" style={{ backgroundColor: getWorkTypeColor(type) }}></div>
          <span>{type}</span>
        </div>
      ))}
    </div>
  )
}
