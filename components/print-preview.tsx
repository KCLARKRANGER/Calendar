"use client"

import { useState } from "react"
import { SimpleMonthlyCalendar } from "@/components/simple-monthly-calendar"
import { JobDetailsPage } from "@/components/job-details-page"
import { Button } from "@/components/ui/button"
import { PrinterIcon, XIcon } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { TaskData } from "@/types/task"

interface PrintPreviewProps {
  tasks: TaskData[]
  onClose: () => void
}

export function PrintPreview({ tasks, onClose }: PrintPreviewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [includeJobDetails, setIncludeJobDetails] = useState(true)
  const [creationTimestamp] = useState(new Date())

  const handlePrint = () => {
    window.print()
  }

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h2 className="text-2xl font-bold">Print Preview</h2>
          <div className="flex gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-job-details"
                checked={includeJobDetails}
                onCheckedChange={(checked) => setIncludeJobDetails(checked as boolean)}
              />
              <Label htmlFor="include-job-details">Include Job Details Page</Label>
            </div>
            <Button variant="outline" onClick={onClose}>
              <XIcon className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button onClick={handlePrint}>
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* This is what will be printed */}
        <div className="print-container">
          <div className="calendar-page">
            <SimpleMonthlyCalendar tasks={tasks} onDateChange={handleDateChange} initialDate={selectedDate} />
          </div>

          {includeJobDetails && (
            <div className="job-details-page page-break-before">
              <JobDetailsPage tasks={tasks} selectedDate={selectedDate} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
