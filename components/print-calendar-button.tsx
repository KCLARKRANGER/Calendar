"use client"

import { Button } from "@/components/ui/button"
import { PrinterIcon } from "lucide-react"
import { useState } from "react"
import { PrintExactCalendar } from "./print-exact-calendar"
import type { TaskData } from "@/types/task"

interface PrintCalendarButtonProps {
  date: Date
  tasks: TaskData[]
}

export function PrintCalendarButton({ date, tasks }: PrintCalendarButtonProps) {
  const [showPrintView, setShowPrintView] = useState(false)

  return (
    <>
      <Button onClick={() => setShowPrintView(true)} className="flex items-center gap-2">
        <PrinterIcon className="h-4 w-4 mr-1" />
        Print Calendar
      </Button>

      {showPrintView && <PrintExactCalendar onClose={() => setShowPrintView(false)} initialDate={date} />}
    </>
  )
}
