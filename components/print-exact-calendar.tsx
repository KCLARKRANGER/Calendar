"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { PrinterIcon, XIcon, ChevronLeft, ChevronRight } from "lucide-react"
import moment from "moment"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PrintExactCalendarProps {
  onClose: () => void
  initialDate?: Date
}

export function PrintExactCalendar({ onClose, initialDate }: PrintExactCalendarProps) {
  const printFrameRef = useRef<HTMLIFrameElement>(null)
  const [currentDate, setCurrentDate] = useState(initialDate || new Date())
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: moment(initialDate || new Date())
      .startOf("month")
      .toDate(),
    end: moment(initialDate || new Date())
      .endOf("month")
      .toDate(),
  })
  const [showFullText, setShowFullText] = useState(true)
  const [monthsToShow, setMonthsToShow] = useState(1)

  // Update the iframe content when settings change
  useEffect(() => {
    updatePreview()
  }, [currentDate, showFullText, monthsToShow])

  const updatePreview = () => {
    // Find the calendar element
    const calendarElement = document.querySelector(".simple-monthly-calendar")

    if (!calendarElement || !printFrameRef.current) {
      console.error("Calendar element or print frame not found")
      return
    }

    // Calculate date range
    const startDate = moment(currentDate).startOf("month")
    const endDate = moment(startDate)
      .add(monthsToShow - 1, "months")
      .endOf("month")

    setDateRange({
      start: startDate.toDate(),
      end: endDate.toDate(),
    })

    // Get the iframe document
    const frameDoc = printFrameRef.current.contentDocument
    if (!frameDoc) return

    // Write the HTML to the iframe
    frameDoc.open()
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Calendar</title>
        <style>
          @page {
            size: landscape;
            margin: 0.25in;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }
          .print-container {
            width: 100%;
            padding: 0.25in;
          }
          .month-container {
            margin-bottom: 0.5in;
            page-break-after: always;
          }
          .month-container:last-child {
            page-break-after: avoid;
          }
          .month-title {
            text-align: center;
            margin-bottom: 0.25in;
          }
          .month-title h2 {
            font-size: 18pt;
            margin: 0;
          }
          .month-title h3 {
            font-size: 16pt;
            margin: 0;
          }
          .month-title p {
            font-size: 8pt;
            margin: 0;
            color: #666;
          }
          
          /* Calendar table styles */
          .calendar-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          .calendar-table th {
            background-color: #f5f5f5;
            border: 1px solid #000;
            padding: 5px;
            text-align: center;
            font-weight: bold;
          }
          .calendar-table td {
            border: 1px solid #000;
            vertical-align: top;
            height: 1in;
            padding: 5px;
            position: relative;
          }
          .date-number {
            text-align: right;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .other-month {
            color: #999;
            background-color: #f9f9f9;
          }
          .weekend {
            background-color: #f5f5f5;
          }
          
          /* Task styles */
          .task-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 4px;
            ${
              showFullText
                ? `
              white-space: normal;
              overflow: visible;
            `
                : `
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            `
            }
          }
          .task-color {
            flex-shrink: 0;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 4px;
            margin-top: 3px;
          }
          .task-text {
            font-size: 7pt;
            line-height: 1.2;
            ${
              showFullText
                ? `
              white-space: normal;
              overflow: visible;
              word-wrap: break-word;
            `
                : `
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            `
            }
          }
          
          /* Legend styles */
          .legend {
            margin-top: 0.25in;
            border: 1px solid #000;
            padding: 5px;
          }
          .legend-title {
            font-weight: bold;
            margin-bottom: 5px;
          }
          .legend-items {
            display: flex;
            flex-wrap: wrap;
          }
          .legend-item {
            display: flex;
            align-items: center;
            margin-right: 12px;
            margin-bottom: 4px;
          }
          .legend-color {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 4px;
          }
          .legend-text {
            font-size: 7pt;
          }
          
          /* Make sure all colors print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        </style>
      </head>
      <body>
        <div class="print-container"></div>
      </body>
      </html>
    `)
    frameDoc.close()

    // Get the container in the iframe
    const container = frameDoc.querySelector(".print-container")
    if (!container) return

    // Generate calendars for each month in the range
    const startMonth = moment(dateRange.start)
    const endMonth = moment(dateRange.end)

    for (let m = moment(startMonth); m.isSameOrBefore(endMonth, "month"); m.add(1, "month")) {
      // Create a container for this month
      const monthContainer = document.createElement("div")
      monthContainer.className = "month-container"

      // Add month title
      const titleDiv = document.createElement("div")
      titleDiv.className = "month-title"
      titleDiv.innerHTML = `
        <h2>Spallina Schedule</h2>
        <h3>${m.format("MMMM YYYY")}</h3>
        <p>Created: ${moment().format("MMMM D, YYYY [at] h:mm A")}</p>
      `
      monthContainer.appendChild(titleDiv)

      // Clone the calendar for this month
      const calendarClone = calendarElement.cloneNode(true) as HTMLElement

      // Extract just the calendar grid
      const calendarGrid = calendarClone.querySelector(".border.rounded-md.overflow-hidden")

      // Create a table for this month's calendar
      const table = document.createElement("table")
      table.className = "calendar-table"

      // Create the header row
      const thead = document.createElement("thead")
      const headerRow = document.createElement("tr")

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      days.forEach((day) => {
        const th = document.createElement("th")
        th.textContent = day
        headerRow.appendChild(th)
      })

      thead.appendChild(headerRow)
      table.appendChild(thead)

      // Create the calendar body
      const tbody = document.createElement("tbody")

      // Generate calendar days for this month
      const firstDay = moment(m).startOf("month").startOf("week")
      const lastDay = moment(m).endOf("month").endOf("week")

      let currentWeek: HTMLTableRowElement | null = null

      for (let day = moment(firstDay); day.isSameOrBefore(lastDay); day.add(1, "day")) {
        // Start a new week row if needed
        if (day.day() === 0 || !currentWeek) {
          currentWeek = document.createElement("tr")
          tbody.appendChild(currentWeek)
        }

        // Create the day cell
        const td = document.createElement("td")

        // Add classes for styling
        if (!day.isSame(m, "month")) {
          td.classList.add("other-month")
        }

        if (day.day() === 0 || day.day() === 6) {
          td.classList.add("weekend")
        }

        // Add the date number
        const dateDiv = document.createElement("div")
        dateDiv.className = "date-number"
        dateDiv.textContent = day.format("D")
        td.appendChild(dateDiv)

        // Find tasks for this day from the original calendar
        // This is a simplified approach - in a real implementation, you'd query your task data
        const taskItems = Array.from(calendarClone.querySelectorAll(".task-item")).filter((item) => {
          // This is a simplified way to match tasks to days
          // In a real implementation, you'd use your task data and date logic
          const itemParent = item.closest("[key]")
          if (!itemParent) return false

          // Try to extract the date from the parent element's key attribute
          const keyAttr = itemParent.getAttribute("key")
          if (!keyAttr) return false

          // This is a very simplified approach - you'd need to adapt this to your actual data structure
          return keyAttr.includes(day.format("YYYY-MM-DD"))
        })

        // Add tasks to the cell
        taskItems.forEach((taskItem) => {
          const taskDiv = document.createElement("div")
          taskDiv.className = "task-item"

          // Extract color and text from the original task item
          const colorElement = taskItem.querySelector(".task-color")
          const textElement = taskItem.querySelector(".task-text")

          if (colorElement && textElement) {
            const colorDiv = document.createElement("div")
            colorDiv.className = "task-color"

            // Try to get the color style
            const computedStyle = window.getComputedStyle(colorElement)
            colorDiv.style.backgroundColor = computedStyle.color || "#000"

            const textDiv = document.createElement("div")
            textDiv.className = "task-text"
            textDiv.textContent = textElement.textContent

            taskDiv.appendChild(colorDiv)
            taskDiv.appendChild(textDiv)
            td.appendChild(taskDiv)
          }
        })

        if (currentWeek) {
          currentWeek.appendChild(td)
        }
      }

      table.appendChild(tbody)
      monthContainer.appendChild(table)

      // Add the legend
      const legendDiv = document.createElement("div")
      legendDiv.className = "legend"

      const legendTitle = document.createElement("div")
      legendTitle.className = "legend-title"
      legendTitle.textContent = "Work Types"
      legendDiv.appendChild(legendTitle)

      const legendItems = document.createElement("div")
      legendItems.className = "legend-items"

      // Extract legend items from the original calendar
      const originalLegend = calendarClone.querySelector(".work-type-legend")
      if (originalLegend) {
        const originalItems = originalLegend.querySelectorAll(".legend-item")
        originalItems.forEach((item) => {
          const colorElement = item.querySelector(".legend-color")
          const textElement = item.querySelector(".legend-text")

          if (colorElement && textElement) {
            const legendItem = document.createElement("div")
            legendItem.className = "legend-item"

            const colorDiv = document.createElement("div")
            colorDiv.className = "legend-color"

            // Try to get the color style
            const computedStyle = window.getComputedStyle(colorElement)
            colorDiv.style.backgroundColor = computedStyle.color || "#000"

            const textDiv = document.createElement("div")
            textDiv.className = "legend-text"
            textDiv.textContent = textElement.textContent

            legendItem.appendChild(colorDiv)
            legendItem.appendChild(textDiv)
            legendItems.appendChild(legendItem)
          }
        })
      }

      legendDiv.appendChild(legendItems)
      monthContainer.appendChild(legendDiv)

      // Add this month's calendar to the container
      container.appendChild(monthContainer)
    }
  }

  const handlePrint = () => {
    if (printFrameRef.current) {
      printFrameRef.current.contentWindow?.focus()
      printFrameRef.current.contentWindow?.print()
    }
  }

  const handlePrevMonth = () => {
    setCurrentDate(moment(currentDate).subtract(1, "month").toDate())
  }

  const handleNextMonth = () => {
    setCurrentDate(moment(currentDate).add(1, "month").toDate())
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold">Print Preview</h2>
        <div className="flex gap-2">
          <Button onClick={handlePrint}>
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={onClose}>
            <XIcon className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </div>

      <div className="p-4 border-b">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium">{moment(currentDate).format("MMMM YYYY")}</span>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="months-to-show">Months to print:</Label>
            <Select value={monthsToShow.toString()} onValueChange={(value) => setMonthsToShow(Number.parseInt(value))}>
              <SelectTrigger className="w-24" id="months-to-show">
                <SelectValue placeholder="1" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="12">12</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="show-full-text"
              checked={showFullText}
              onCheckedChange={(checked) => setShowFullText(!!checked)}
            />
            <Label htmlFor="show-full-text">Show full text (may wrap to multiple lines)</Label>
          </div>

          <div className="text-sm text-gray-500">
            Printing: {moment(dateRange.start).format("MMM YYYY")}
            {monthsToShow > 1 ? ` - ${moment(dateRange.end).format("MMM YYYY")}` : ""}
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <iframe ref={printFrameRef} className="w-full h-full border-none" title="Print Preview" />
      </div>
    </div>
  )
}
