"use client"

import { Button } from "@/components/ui/button"
import { FileTextIcon } from "lucide-react"
import { useState } from "react"
import { PrintJobDetailsView } from "./print-job-details-view"
import type { TaskData } from "@/types/task"

interface PrintJobDetailsButtonProps {
  date: Date
  tasks: TaskData[]
}

export function PrintJobDetailsButton({ date, tasks }: PrintJobDetailsButtonProps) {
  const [showPrintView, setShowPrintView] = useState(false)

  return (
    <>
      <Button onClick={() => setShowPrintView(true)} className="flex items-center gap-2">
        <FileTextIcon className="h-4 w-4 mr-1" />
        Print Job Details
      </Button>

      {showPrintView && <PrintJobDetailsView date={date} tasks={tasks} onClose={() => setShowPrintView(false)} />}
    </>
  )
}
