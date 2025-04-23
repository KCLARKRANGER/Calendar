"use client"

import { useState } from "react"
import type { TaskData } from "@/types/task"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { parseDate, formatDateWithTime } from "@/lib/date-utils"
import moment from "moment"

interface DebugPanelProps {
  tasks: TaskData[]
}

export function DebugPanel({ tasks }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50 print:hidden">
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
          Debug
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 print:hidden">
      <Card>
        <CardHeader className="py-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm">Debug Panel</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2 max-h-96 overflow-auto">
          <div className="text-xs">
            <p>Tasks loaded: {tasks.length}</p>
            <div className="mt-2">
              <p className="font-bold">Date Parsing Test:</p>
              {tasks.slice(0, 5).map((task, index) => {
                const startDate = parseDate(task.startDate)
                const dueDate = parseDate(task.dueDate)
                const duration = startDate && dueDate ? moment(dueDate).diff(moment(startDate), "days") + 1 : "N/A"

                return (
                  <div key={index} className="mt-1 border-t pt-1">
                    <p>Task: {task.taskName}</p>
                    <p>Type of Work: {task.typeOfWork}</p>
                    <p>Start Date (raw): {task.startDate}</p>
                    <p>Start Date (parsed): {startDate ? formatDateWithTime(startDate) : "Failed to parse"}</p>
                    <p>Due Date (raw): {task.dueDate}</p>
                    <p>Due Date (parsed): {dueDate ? formatDateWithTime(dueDate) : "Failed to parse"}</p>
                    <p>Duration: {duration} days</p>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
