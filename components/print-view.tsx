"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { DoorClosedIcon as CloseIcon, PrinterIcon } from "lucide-react"
import moment from "moment"
import { getWorkTypeColor } from "@/lib/work-type-colors"
import type { TaskData } from "@/types/task"
import { parseDate, formatDate } from "@/lib/date-utils"

interface PrintViewProps {
  date: Date
  tasks: TaskData[]
  onClose: () => void
  showCalendar: boolean
  showJobDetails: boolean
}

export function PrintView({ date, tasks, onClose, showCalendar, showJobDetails }: PrintViewProps) {
  const printContainerRef = useRef<HTMLDivElement>(null)

  // Handle print action
  const handlePrint = () => {
    window.print()
  }

  // Add print-specific styles when component mounts
  useEffect(() => {
    // Add print-specific styles
    const style = document.createElement("style")
    style.id = "print-styles"
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #print-container, #print-container * {
          visibility: visible;
        }
        #print-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        #print-controls {
          display: none !important;
        }
        @page {
          size: landscape;
          margin: 0.2in;
        }
        .page-break {
          page-break-before: always;
        }
      }
    `
    document.head.appendChild(style)

    // Clean up
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Generate calendar days
  const calendarDays: Date[][] = []
  const firstDay = moment(date).startOf("month").startOf("week")
  const lastDay = moment(date).endOf("month").endOf("week")

  let week: Date[] = []
  for (let day = moment(firstDay); day.isSameOrBefore(lastDay); day = day.clone().add(1, "day")) {
    week.push(day.toDate())

    if (week.length === 7) {
      calendarDays.push(week)
      week = []
    }
  }

  // Get tasks for a specific day
  const getTasksForDay = (day: Date) => {
    if (!tasks || tasks.length === 0) return []

    return tasks.filter((task) => {
      const startDate = parseDate(task.startDate)
      const dueDate = parseDate(task.dueDate)

      if (!startDate || !dueDate) return false

      // Check if the day is between start and due dates (inclusive)
      const dayMoment = moment(day).startOf("day")
      const startMoment = moment(startDate).startOf("day")
      const dueMoment = moment(dueDate).startOf("day")

      return dayMoment.isBetween(startMoment, dueMoment, "day", "[]")
    })
  }

  // Filter tasks for the selected month
  const monthStart = moment(date).startOf("month")
  const monthEnd = moment(date).endOf("month")

  const filteredTasks = tasks
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

  // Group tasks by work type
  const tasksByWorkType: Record<string, TaskData[]> = {}

  filteredTasks.forEach((task) => {
    const workType = task.typeOfWork || "Uncategorized"
    if (!tasksByWorkType[workType]) {
      tasksByWorkType[workType] = []
    }
    tasksByWorkType[workType].push(task)
  })

  // Get unique work types for the legend
  const workTypes = tasks
    .map((task) => task.typeOfWork)
    .filter((value, index, self) => value && self.indexOf(value) === index)
    .sort()

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div id="print-controls" className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold">Print Preview</h2>
        <div className="flex gap-2">
          <Button onClick={handlePrint}>
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={onClose}>
            <CloseIcon className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </div>

      <div id="print-container" ref={printContainerRef} className="p-4">
        {showCalendar && (
          <div className="calendar-page mb-8">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold">Spallina Schedule</h1>
              <h2 className="text-xl">{moment(date).format("MMMM YYYY")}</h2>
              <p className="text-sm text-gray-500">Created: {moment().format("MMMM D, YYYY [at] h:mm A")}</p>
            </div>

            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr>
                  <th className="border border-black bg-gray-100 p-2 text-center font-bold">Sun</th>
                  <th className="border border-black bg-gray-100 p-2 text-center font-bold">Mon</th>
                  <th className="border border-black bg-gray-100 p-2 text-center font-bold">Tue</th>
                  <th className="border border-black bg-gray-100 p-2 text-center font-bold">Wed</th>
                  <th className="border border-black bg-gray-100 p-2 text-center font-bold">Thu</th>
                  <th className="border border-black bg-gray-100 p-2 text-center font-bold">Fri</th>
                  <th className="border border-black bg-gray-100 p-2 text-center font-bold">Sat</th>
                </tr>
              </thead>
              <tbody>
                {calendarDays.map((week, weekIndex) => (
                  <tr key={weekIndex} className="h-24">
                    {week.map((day, dayIndex) => {
                      const isCurrentMonth = moment(day).isSame(date, "month")
                      const isWeekend = dayIndex === 0 || dayIndex === 6
                      const dayTasks = getTasksForDay(day)

                      return (
                        <td
                          key={dayIndex}
                          className={`border border-black align-top p-1 ${
                            !isCurrentMonth ? "text-gray-400 bg-gray-50" : ""
                          } ${isWeekend ? "bg-gray-100" : ""}`}
                          style={{ height: "100px", maxHeight: "100px", overflow: "hidden" }}
                        >
                          <div className="text-right font-bold mb-1">{moment(day).format("D")}</div>
                          <div className="space-y-1">
                            {dayTasks.slice(0, 4).map((task) => {
                              const color = getWorkTypeColor(task.typeOfWork)
                              return (
                                <div key={task.taskId} className="flex items-start gap-1 text-xs">
                                  <div
                                    className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                                    style={{ backgroundColor: color }}
                                  ></div>
                                  <div className="truncate">{task.taskName}</div>
                                </div>
                              )
                            })}
                            {dayTasks.length > 4 && (
                              <div className="text-xs text-gray-500">+{dayTasks.length - 4} more</div>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 border border-black p-2">
              <div className="font-bold mb-2">Work Types</div>
              <div className="flex flex-wrap gap-4">
                {workTypes.map((type) => {
                  const color = getWorkTypeColor(type)
                  return (
                    <div key={type} className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></div>
                      <span className="text-xs font-medium">{type}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {showJobDetails && (
          <div className={`job-details-page ${showCalendar ? "page-break" : ""}`}>
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold">Spallina Job Details</h1>
              <h2 className="text-xl">{moment(date).format("MMMM YYYY")}</h2>
              <p className="text-sm text-gray-500">Created: {moment().format("MMMM D, YYYY [at] h:mm A")}</p>
            </div>

            {Object.keys(tasksByWorkType).length === 0 ? (
              <div className="text-center py-4">
                <p>No jobs scheduled for this month.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(tasksByWorkType).map(([workType, tasks]) => (
                  <div key={workType} className="mb-6">
                    <div
                      className="py-2 px-4 font-bold text-white"
                      style={{ backgroundColor: getWorkTypeColor(workType) }}
                    >
                      {workType}
                    </div>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 p-2 text-left">Task Name</th>
                          <th className="border border-gray-300 p-2 text-left">Location</th>
                          <th className="border border-gray-300 p-2 text-left">Start Date</th>
                          <th className="border border-gray-300 p-2 text-left">Due Date</th>
                          <th className="border border-gray-300 p-2 text-left">Material</th>
                          <th className="border border-gray-300 p-2 text-left">Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((task) => (
                          <tr key={task.taskId}>
                            <td className="border border-gray-300 p-2">{task.taskName}</td>
                            <td className="border border-gray-300 p-2">{task.location}</td>
                            <td className="border border-gray-300 p-2">{formatDate(task.startDate)}</td>
                            <td className="border border-gray-300 p-2">{formatDate(task.dueDate)}</td>
                            <td className="border border-gray-300 p-2">{task.materialType}</td>
                            <td className="border border-gray-300 p-2">{task.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
