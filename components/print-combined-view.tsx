"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { DoorClosedIcon as CloseIcon, PrinterIcon } from "lucide-react"
import moment from "moment"
import { getWorkTypeColor } from "@/lib/work-type-colors"
import type { TaskData } from "@/types/task"
import { parseDate, formatDate } from "@/lib/date-utils"

interface PrintCombinedViewProps {
  date: Date
  tasks: TaskData[]
  onClose: () => void
}

export function PrintCombinedView({ date, tasks, onClose }: PrintCombinedViewProps) {
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
        @page {
          size: landscape;
          margin: 0.25in;
        }
        
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
        
        .page-break {
          page-break-before: always;
        }
        
        .calendar-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        
        .calendar-table th, 
        .calendar-table td {
          border: 1px solid black;
          padding: 4px;
          vertical-align: top;
        }
        
        .calendar-table th {
          background-color: #f0f0f0 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .task-item {
          margin-bottom: 4px;
          padding-bottom: 4px;
          border-bottom: 1px dotted #ccc;
          display: flex;
          align-items: flex-start;
        }
        
        .task-color {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 4px;
          margin-top: 3px;
          flex-shrink: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .task-text {
          font-size: 8pt;
          line-height: 1.2;
        }
        
        .legend-item {
          display: inline-flex;
          align-items: center;
          margin-right: 12px;
          margin-bottom: 4px;
        }
        
        .legend-color {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 4px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .legend-text {
          font-size: 8pt;
        }
        
        .date-number {
          font-weight: bold;
          text-align: right;
          margin-bottom: 4px;
        }
        
        .other-month {
          background-color: #f9f9f9 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .weekend {
          background-color: #f5f5f5 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .section-header {
          background-color: #333 !important;
          color: white !important;
          padding: 6px 8px;
          font-weight: bold;
          margin-bottom: 8px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
        }
        
        .details-table th {
          background-color: #f0f0f0 !important;
          border: 1px solid #000;
          padding: 6px;
          text-align: left;
          font-weight: bold;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .details-table td {
          border: 1px solid #000;
          padding: 6px;
        }
        
        .details-table tr:nth-child(even) {
          background-color: #f9f9f9 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `
    document.head.appendChild(style)

    // Clean up
    return () => {
      const existingStyle = document.getElementById("print-styles")
      if (existingStyle) {
        document.head.removeChild(existingStyle)
      }
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
        <h2 className="text-xl font-bold">Combined Print Preview</h2>
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
        {/* Calendar Page */}
        <div className="calendar-page">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold">May 2025</h1>
            <p className="text-sm text-gray-500">Created: {moment().format("MMMM D, YYYY [at] h:mm A")}</p>
          </div>

          <table className="calendar-table w-full border-collapse table-fixed">
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
                <tr key={weekIndex} style={{ height: "100px" }}>
                  {week.map((day, dayIndex) => {
                    const isCurrentMonth = moment(day).isSame(date, "month")
                    const isWeekend = dayIndex === 0 || dayIndex === 6
                    const dayTasks = getTasksForDay(day)

                    let cellClass = "border border-black p-1 "
                    if (!isCurrentMonth) cellClass += "other-month "
                    if (isWeekend) cellClass += "weekend "

                    return (
                      <td key={dayIndex} className={cellClass}>
                        <div className="date-number">{moment(day).format("D")}</div>
                        <div>
                          {dayTasks.map((task) => {
                            const color = getWorkTypeColor(task.typeOfWork)
                            return (
                              <div key={task.taskId} className="task-item">
                                <div className="task-color" style={{ backgroundColor: color }}></div>
                                <div className="task-text">{task.taskName}</div>
                              </div>
                            )
                          })}
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
            <div className="flex flex-wrap">
              {workTypes.map((type) => {
                const color = getWorkTypeColor(type)
                return (
                  <div key={type} className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: color }}></div>
                    <span className="legend-text">{type}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Job Details Page - with page break */}
        <div className="job-details-page page-break">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold">Job Details - {moment(date).format("MMMM YYYY")}</h1>
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
                  <div className="section-header" style={{ backgroundColor: getWorkTypeColor(workType) }}>
                    {workType}
                  </div>
                  <table className="details-table">
                    <thead>
                      <tr>
                        <th>Task Name</th>
                        <th>Location</th>
                        <th>Start Date</th>
                        <th>Due Date</th>
                        <th>Material</th>
                        <th>Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task.taskId}>
                          <td>{task.taskName}</td>
                          <td>{task.location}</td>
                          <td>{formatDate(task.startDate)}</td>
                          <td>{formatDate(task.dueDate)}</td>
                          <td>{task.materialType}</td>
                          <td>{task.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
