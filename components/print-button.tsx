"use client"

import { Button } from "@/components/ui/button"
import { PrinterIcon } from "lucide-react"
import moment from "moment"

interface PrintButtonProps {
  date: Date
}

export function PrintButton({ date }: PrintButtonProps) {
  const handlePrint = () => {
    // Set data-month attribute for the print title
    const calendarRoot = document.getElementById("calendar-root")
    if (calendarRoot) {
      calendarRoot.setAttribute("data-month", moment(date).format("MMMM YYYY"))
    }

    // Print the page
    window.print()
  }

  return (
    <Button onClick={handlePrint} className="absolute top-2 right-2 z-10 print:hidden" size="sm">
      <PrinterIcon className="h-4 w-4 mr-1" />
      Print
    </Button>
  )
}
