"use client"

import { Button } from "@/components/ui/button"
import { PrinterIcon } from "lucide-react"
import moment from "moment"

interface PrintCalendarButtonProps {
  date: Date
}

export function PrintCalendarButton({ date }: PrintCalendarButtonProps) {
  const handlePrint = () => {
    // Set up the page for printing
    const originalTitle = document.title
    document.title = `Spallina Schedule - ${moment(date).format("MMMM YYYY")}`

    // Add print-specific classes
    document.body.classList.add("printing-calendar")
    document.documentElement.setAttribute("data-print-month", moment(date).format("MMMM YYYY"))

    // Set a timeout to ensure styles are applied
    setTimeout(() => {
      window.print()

      // Reset after printing
      setTimeout(() => {
        document.title = originalTitle
        document.body.classList.remove("printing-calendar")
      }, 1000)
    }, 100)
  }

  return (
    <Button onClick={handlePrint} className="flex items-center gap-2">
      <PrinterIcon className="h-4 w-4 mr-1" />
      Print Calendar
    </Button>
  )
}
