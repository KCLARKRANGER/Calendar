"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { DoorClosedIcon as CloseIcon, PrinterIcon } from "lucide-react"
import moment from "moment"
import { getWorkTypeColor } from "@/lib/work-type-colors"
import type { TaskData } from "@/types/task"
import { parseDate } from "@/lib/date-utils"

interface PrintCalendarViewProps {
  date: Date
  tasks: TaskData[]
  onClose: () => void
}

export function PrintCalendarView({ date, tasks, onClose }: PrintCalendarViewProps) {
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

  // Get unique work types for the legend
  const workTypes = tasks
    .map((task) => task.typeOfWork)
    .filter((value, index, self) => value && self.indexOf(value) === index)
    .sort()

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div id="print-controls" className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold">Calendar Print Preview</h2>
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
      </div>
    </div>
  )
}
