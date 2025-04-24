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

    // Force a layout recalculation with exact dimensions for 8.5x11 landscape
    document.body.style.width = "11in"
    document.body.style.height = "8.5in"

    // Add a style tag to ensure consistent row heights
    const styleTag = document.createElement("style")
    styleTag.id = "print-styles"
    styleTag.innerHTML = `
      @media print {
        .simple-monthly-calendar .grid-cols-7 > div {
          height: 1.1in !important;
          min-height: 1.1in !important;
          max-height: 1.1in !important;
          overflow: hidden !important;
        }
        .simple-monthly-calendar .grid-cols-7 {
          grid-template-rows: auto repeat(6, 1fr) !important;
        }
        .simple-monthly-calendar .flex-grow.text-[9px] {
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
          max-width: calc(100% - 20px) !important;
        }
        .simple-monthly-calendar .flex.items-start.gap-1 {
          max-width: 100% !important;
          overflow: hidden !important;
        }
      }
    `
    document.head.appendChild(styleTag)

    // Set a timeout to ensure styles are applied
    setTimeout(() => {
      window.print()

      // Reset after printing
      setTimeout(() => {
        document.title = originalTitle
        document.body.classList.remove("printing-calendar")
        document.body.style.width = ""
        document.body.style.height = ""
        if (document.getElementById("print-styles")) {
          document.getElementById("print-styles")?.remove()
        }
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
