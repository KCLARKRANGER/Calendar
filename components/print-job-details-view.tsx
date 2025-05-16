"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { DoorClosedIcon as CloseIcon, PrinterIcon } from "lucide-react"
import moment from "moment"
import { getWorkTypeColor } from "@/lib/work-type-colors"
import type { TaskData } from "@/types/task"
import { parseDate, formatDate } from "@/lib/date-utils"

interface PrintJobDetailsViewProps {
  date: Date
  tasks: TaskData[]
  onClose: () => void
}

export function PrintJobDetailsView({ date, tasks, onClose }: PrintJobDetailsViewProps) {
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

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div id="print-controls" className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold">Job Details Print Preview</h2>
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
        <div className="job-details-page">
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
