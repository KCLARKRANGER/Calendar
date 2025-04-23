"use client"

import { useMemo } from "react"
import moment from "moment"
import type { TaskData } from "@/types/task"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { parseDate, formatDate } from "@/lib/date-utils"

interface JobDetailsPageProps {
  tasks: TaskData[]
  selectedDate: Date
}

export function JobDetailsPage({ tasks, selectedDate }: JobDetailsPageProps) {
  // Filter tasks for the selected month
  const filteredTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) return []

    const monthStart = moment(selectedDate).startOf("month")
    const monthEnd = moment(selectedDate).endOf("month")

    return tasks
      .filter((task) => {
        const taskStart = moment(parseDate(task.startDate))
        const taskDue = moment(parseDate(task.dueDate))

        if (!taskStart.isValid() || !taskDue.isValid()) return false

        // Check if any part of the task falls within the month
        return taskStart.isSameOrBefore(monthEnd) && taskDue.isSameOrAfter(monthStart)
      })
      .sort((a, b) => {
        const dateA = moment(parseDate(a.startDate))
        const dateB = moment(parseDate(b.startDate))
        return dateA.valueOf() - dateB.valueOf()
      })
  }, [tasks, selectedDate])

  // Group tasks by work type
  const tasksByWorkType = useMemo(() => {
    const grouped: Record<string, TaskData[]> = {}

    filteredTasks.forEach((task) => {
      const workType = task.typeOfWork || "Uncategorized"
      if (!grouped[workType]) {
        grouped[workType] = []
      }
      grouped[workType].push(task)
    })

    return grouped
  }, [filteredTasks])

  return (
    <div className="job-details-page">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Job Details</h1>
        <h2 className="text-xl">{moment(selectedDate).format("MMMM YYYY")}</h2>
      </div>

      {Object.keys(tasksByWorkType).length === 0 ? (
        <div className="text-center py-4">
          <p>No jobs scheduled for this month.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(tasksByWorkType).map(([workType, tasks]) => (
            <Card key={workType} className="overflow-hidden">
              <CardHeader className="bg-gray-100">
                <CardTitle>{workType}</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Task Name</th>
                      <th className="text-left py-2">Location</th>
                      <th className="text-left py-2">Start Date</th>
                      <th className="text-left py-2">Due Date</th>
                      <th className="text-left py-2">Material</th>
                      <th className="text-left py-2">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.taskId} className="border-b">
                        <td className="py-2">{task.taskName}</td>
                        <td className="py-2">{task.location}</td>
                        <td className="py-2">{formatDate(task.startDate)}</td>
                        <td className="py-2">{formatDate(task.dueDate)}</td>
                        <td className="py-2">{task.materialType}</td>
                        <td className="py-2">{task.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
