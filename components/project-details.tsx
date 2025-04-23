"use client"

import { useState, useEffect } from "react"
import moment from "moment"
import type { TaskData } from "@/types/task"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getWorkTypeColor } from "@/lib/work-type-colors"
import { parseDate, formatDate } from "@/lib/date-utils"

interface ProjectDetailsProps {
  tasks: TaskData[]
  selectedDate: Date
  view: "month" | "week" | "day"
  isPrintMode?: boolean
}

export function ProjectDetails({ tasks, selectedDate, view, isPrintMode = false }: ProjectDetailsProps) {
  const [filteredTasks, setFilteredTasks] = useState<TaskData[]>([])

  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      setFilteredTasks([])
      return
    }

    let filtered: TaskData[] = []

    try {
      if (view === "day") {
        // Filter tasks for the selected day
        const dayStart = moment(selectedDate).startOf("day")
        const dayEnd = moment(selectedDate).endOf("day")

        filtered = tasks.filter((task) => {
          try {
            const taskStart = moment(parseDate(task.startDate))
            const taskDue = moment(parseDate(task.dueDate))

            if (!taskStart.isValid() || !taskDue.isValid()) {
              console.warn(`Invalid date format for task: ${task.taskName}`)
              return false
            }

            // Check if the selected day falls between start and due dates (inclusive)
            return (
              dayStart.isBetween(taskStart, taskDue, "day", "[]") ||
              dayEnd.isBetween(taskStart, taskDue, "day", "[]") ||
              taskStart.isBetween(dayStart, dayEnd, "day", "[]") ||
              taskDue.isBetween(dayStart, dayEnd, "day", "[]")
            )
          } catch (error) {
            console.error("Error filtering task by day:", error)
            return false
          }
        })
      } else if (view === "week") {
        // Filter tasks for the selected week
        const weekStart = moment(selectedDate).startOf("week")
        const weekEnd = moment(selectedDate).endOf("week")

        filtered = tasks.filter((task) => {
          try {
            const taskStart = moment(parseDate(task.startDate))
            const taskDue = moment(parseDate(task.dueDate))

            if (!taskStart.isValid() || !taskDue.isValid()) {
              console.warn(`Invalid date format for task: ${task.taskName}`)
              return false
            }

            // Check if any part of the task falls within the week
            return taskStart.isSameOrBefore(weekEnd) && taskDue.isSameOrAfter(weekStart)
          } catch (error) {
            console.error("Error filtering task by week:", error)
            return false
          }
        })
      } else {
        // Filter tasks for the selected month
        const monthStart = moment(selectedDate).startOf("month")
        const monthEnd = moment(selectedDate).endOf("month")

        filtered = tasks.filter((task) => {
          try {
            const taskStart = moment(parseDate(task.startDate))
            const taskDue = moment(parseDate(task.dueDate))

            if (!taskStart.isValid() || !taskDue.isValid()) {
              console.warn(`Invalid date format for task: ${task.taskName}`)
              return false
            }

            // Check if any part of the task falls within the month
            return taskStart.isSameOrBefore(monthEnd) && taskDue.isSameOrAfter(monthStart)
          } catch (error) {
            console.error("Error filtering task by month:", error)
            return false
          }
        })
      }

      // Sort by start date
      filtered.sort((a, b) => {
        try {
          const dateA = moment(parseDate(a.startDate))
          const dateB = moment(parseDate(b.startDate))

          if (!dateA.isValid() || !dateB.isValid()) {
            return 0
          }

          return dateA.valueOf() - dateB.valueOf()
        } catch (error) {
          console.error("Error sorting tasks:", error)
          return 0
        }
      })
    } catch (error) {
      console.error("Error processing tasks:", error)
      filtered = []
    }

    setFilteredTasks(filtered)
  }, [tasks, selectedDate, view])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tasks && tasks.length > 0 ? "Project Details" : "No Projects Loaded"}</CardTitle>
      </CardHeader>
      <CardContent>
        {filteredTasks.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              {tasks && tasks.length > 0
                ? `No projects scheduled for this ${view}.`
                : "Click 'Upload CSV' to load your project data."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Group tasks by date and display them */}
            {(() => {
              // Group tasks by date
              const tasksByDate: Record<string, TaskData[]> = {}

              filteredTasks.forEach((task) => {
                try {
                  const startDate = parseDate(task.startDate)
                  if (!startDate) return

                  const dateKey = moment(startDate).format("YYYY-MM-DD")

                  if (!tasksByDate[dateKey]) {
                    tasksByDate[dateKey] = []
                  }
                  tasksByDate[dateKey].push(task)
                } catch (error) {
                  console.error("Error grouping task by date:", error)
                }
              })

              return Object.entries(tasksByDate).map(([dateKey, dateTasks]) => (
                <div key={dateKey} className="border-b pb-4 last:border-0">
                  <h3 className="text-lg font-medium mb-2">{moment(dateKey).format("dddd, MMMM D, YYYY")}</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {dateTasks.map((task) => (
                      <Card key={task.taskId} className="overflow-hidden">
                        <div className="h-2" style={{ backgroundColor: getWorkTypeColor(task.typeOfWork) }} />
                        <CardContent className="p-4">
                          <h4 className="font-bold text-base mb-2">{task.taskName}</h4>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div className="font-medium">Location:</div>
                            <div>{task.location}</div>

                            <div className="font-medium">Type of Work:</div>
                            <div>
                              <Badge
                                style={{
                                  backgroundColor: getWorkTypeColor(task.typeOfWork),
                                  color: "#fff",
                                }}
                              >
                                {task.typeOfWork}
                              </Badge>
                            </div>

                            <div className="font-medium">Quantity:</div>
                            <div>{task.quantity}</div>

                            <div className="font-medium">Material:</div>
                            <div>{task.materialType}</div>

                            <div className="font-medium">Start Date:</div>
                            <div>{formatDate(task.startDate)}</div>

                            <div className="font-medium">Due Date:</div>
                            <div>{formatDate(task.dueDate)}</div>

                            <div className="font-medium">Duration:</div>
                            <div>
                              {(() => {
                                const start = parseDate(task.startDate)
                                const end = parseDate(task.dueDate)
                                if (!start || !end) return "N/A"

                                const startMoment = moment(start)
                                const endMoment = moment(end)

                                if (startMoment.isSame(endMoment, "day")) {
                                  return "1 day"
                                }

                                const days = endMoment.diff(startMoment, "days") + 1
                                return `${days} days`
                              })()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
