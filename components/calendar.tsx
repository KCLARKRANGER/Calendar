"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Calendar as BigCalendar, momentLocalizer, Views } from "react-big-calendar"
import moment from "moment"
import type { TaskData } from "@/types/task"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { getWorkTypeColor } from "@/lib/work-type-colors"
import { parseDate } from "@/lib/date-utils"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { PrintButton } from "@/components/print-button"

// Set up the localizer for the calendar
const localizer = momentLocalizer(moment)

interface CalendarProps {
  tasks: TaskData[]
  view: "month" | "week" | "day"
  isPrintMode?: boolean
  onDateChange?: (date: Date) => void
  initialDate?: Date
  onRefresh?: () => void
}

export function Calendar({ tasks, view, isPrintMode = false, onDateChange, initialDate, onRefresh }: CalendarProps) {
  // Use initialDate if provided, otherwise use current date
  const [currentDate, setCurrentDate] = useState(() => initialDate || new Date())
  const [calendarEvents, setCalendarEvents] = useState<any[]>([])
  const calendarRef = useRef<any>(null)
  const isInitialMount = useRef(true)
  const lastDateChangeRef = useRef<number>(0)

  // Set up calendar events from tasks
  useEffect(() => {
    // Create a dummy event for today to ensure the calendar always renders
    const today = new Date()
    const dummyEvent = {
      id: "today-marker",
      title: "",
      start: today,
      end: new Date(today.getTime() + 8 * 60 * 60 * 1000), // 8 hours later
      allDay: false,
      resource: null,
    }

    let events = [dummyEvent]

    if (tasks && tasks.length > 0) {
      const taskEvents = tasks
        .map((task) => {
          // Parse dates using our utility function
          const startDateRaw = parseDate(task.startDate)
          const dueDateRaw = parseDate(task.dueDate)

          if (!startDateRaw || !dueDateRaw) {
            console.warn(`Invalid date for task: ${task.taskName}, Start: ${task.startDate}, Due: ${task.dueDate}`)
            return null
          }

          // Use the actual start and due dates for the event
          const startDate = new Date(startDateRaw)
          const endDate = new Date(dueDateRaw)

          // Check if this is a multi-day event or a single day event
          const isSameDay = moment(startDate).isSame(endDate, "day")

          // For single day events, use business hours (8am-4pm)
          if (isSameDay) {
            startDate.setHours(8, 0, 0, 0)
            endDate.setHours(16, 0, 0, 0)
          } else {
            // For multi-day events, use the exact times from the dates
            // If no time is specified, use end of day for the due date
            if (endDate.getHours() === 0 && endDate.getMinutes() === 0) {
              endDate.setHours(23, 59, 59, 999)
            }
          }

          return {
            id: task.taskId,
            title: task.taskName,
            start: startDate,
            end: endDate,
            allDay: !isSameDay, // Multi-day events are all-day events
            resource: task,
          }
        })
        .filter(Boolean) // Remove null events

      events = [...events, ...taskEvents]
    }

    setCalendarEvents(events)
  }, [tasks])

  // Handle initialDate changes
  useEffect(() => {
    if (initialDate && !isInitialMount.current) {
      // Only update if the date is significantly different (different day)
      const currentDay = moment(currentDate).startOf("day")
      const newDay = moment(initialDate).startOf("day")

      if (!currentDay.isSame(newDay)) {
        setCurrentDate(initialDate)
      }
    }

    isInitialMount.current = false
  }, [initialDate, currentDate])

  // Notify parent of date changes, but avoid infinite loops
  const handleDateChange = useCallback(
    (newDate: Date) => {
      setCurrentDate(newDate)

      // Prevent rapid successive calls (debounce)
      const now = Date.now()
      if (now - lastDateChangeRef.current > 300) {
        lastDateChangeRef.current = now

        if (onDateChange) {
          onDateChange(newDate)
        }
      }
    },
    [onDateChange],
  )

  // Force a re-render when the view changes
  useEffect(() => {
    // Force a re-render after a short delay
    const timer = setTimeout(() => {
      if (calendarRef.current) {
        calendarRef.current.forceUpdate?.()
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [view])

  const handleNavigate = useCallback(
    (action: "PREV" | "NEXT" | "TODAY") => {
      const newDate = new Date(currentDate)

      if (action === "PREV") {
        if (view === "month") {
          newDate.setMonth(currentDate.getMonth() - 1)
        } else if (view === "week") {
          newDate.setDate(currentDate.getDate() - 7)
        } else {
          newDate.setDate(currentDate.getDate() - 1)
        }
      } else if (action === "NEXT") {
        if (view === "month") {
          newDate.setMonth(currentDate.getMonth() + 1)
        } else if (view === "week") {
          newDate.setDate(currentDate.getDate() + 7)
        } else {
          newDate.setDate(currentDate.getDate() + 1)
        }
      } else {
        return setCurrentDate(new Date())
      }

      setCurrentDate(newDate)
    },
    [currentDate, view],
  )

  const handleRefresh = useCallback(() => {
    // Force a re-render of the calendar
    if (calendarRef.current) {
      calendarRef.current.forceUpdate?.()
    }

    // Call the parent's refresh handler if provided
    if (onRefresh) {
      onRefresh()
    }
  }, [onRefresh])

  // Custom event component to display task details
  const EventComponent = useCallback(({ event }: any) => {
    if (!event.resource) {
      return null // Hide the dummy event
    }

    const task = event.resource as TaskData

    return (
      <div className="p-1 overflow-hidden text-xs">
        <div className="font-semibold truncate">{task.taskName}</div>
        <div className="truncate">{task.location}</div>
      </div>
    )
  }, [])

  // Custom date cell component to ensure dates are visible in print
  const DateCellWrapper = useCallback(({ value, children }: any) => {
    const dateNum = moment(value).format("D")
    return (
      <div className="rbc-date-cell-wrapper">
        <span className="rbc-date-number print-visible">{dateNum}</span>
        {children}
      </div>
    )
  }, [])

  // Custom event styling based on work type
  const eventPropGetter = useCallback((event: any) => {
    if (!event.resource) {
      return {
        style: {
          display: "none", // Hide dummy events
        },
      }
    }

    const task = event.resource as TaskData
    const backgroundColor = getWorkTypeColor(task.typeOfWork)

    return {
      style: {
        backgroundColor: backgroundColor,
        borderLeft: `4px solid ${backgroundColor}`,
        borderTop: "1px solid #000",
        borderRight: "1px solid #000",
        borderBottom: "1px solid #000",
        color: "#000",
        fontWeight: "bold",
        zIndex: 5,
        display: "block",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        borderRadius: "2px",
        margin: "2px 0",
        padding: "2px 4px",
        minHeight: "24px",
      },
    }
  }, [])

  // Custom day prop getter to hide weekend events
  const dayPropGetter = useCallback((date: Date) => {
    const day = date.getDay()
    // 0 is Sunday, 6 is Saturday
    if (day === 0 || day === 6) {
      return {
        className: "weekend-day",
        style: {
          backgroundColor: "#f5f5f5",
        },
      }
    }
    return {}
  }, [])

  // Map view string to BigCalendar view
  const getCalendarView = useCallback(() => {
    switch (view) {
      case "month":
        return Views.MONTH
      case "week":
        return Views.WEEK
      case "day":
        return Views.DAY
      default:
        return Views.MONTH
    }
  }, [view])

  // Filter out weekend events
  const filteredEvents = useMemo(() => {
    return calendarEvents.filter((event) => {
      if (!event.resource) return true // Keep dummy event

      // For multi-day events, we need to split them into segments
      // and only show the weekday segments
      const start = moment(event.start)
      const end = moment(event.end)

      // If it's a single day event, check if it's on a weekend
      if (start.isSame(end, "day")) {
        const day = start.day()
        return day !== 0 && day !== 6 // Not Sunday or Saturday
      }

      // For multi-day events, we'll keep them but they'll be filtered
      // in the calendar's slotPropGetter
      return true
    })
  }, [calendarEvents])

  return (
    <Card className={`${isPrintMode ? "print:shadow-none" : ""}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4 print:hidden">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleNavigate("PREV")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleNavigate("TODAY")}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleNavigate("NEXT")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-2">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <h3 className="text-lg font-medium">
            {view === "month"
              ? moment(currentDate).format("MMMM YYYY")
              : view === "week"
                ? `Week of ${moment(currentDate).startOf("week").format("MMM D")} - ${moment(currentDate).endOf("week").format("MMM D, YYYY")}`
                : moment(currentDate).format("dddd, MMMM D, YYYY")}
          </h3>
        </div>

        <div className="print:hidden text-center mb-4">
          <h2 className="text-2xl font-bold">Spallina Schedule</h2>
          <h3 className="text-xl">{moment(currentDate).format("MMMM YYYY")}</h3>
        </div>

        <div
          className={`${isPrintMode ? "print-calendar" : "calendar-container"}`}
          id="calendar-root"
          data-month={moment(currentDate).format("MMMM YYYY")}
          style={{
            height: "600px",
            minHeight: "600px",
            border: "1px solid #ddd",
            marginBottom: "20px",
            position: "relative",
          }}
        >
          <PrintButton date={currentDate} />
          <BigCalendar
            ref={calendarRef}
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            view={getCalendarView()}
            date={currentDate}
            onNavigate={setCurrentDate}
            components={{
              event: EventComponent,
              dateCellWrapper: DateCellWrapper,
            }}
            eventPropGetter={eventPropGetter}
            dayPropGetter={dayPropGetter}
            popup
            toolbar={false}
            // Force events to be visible in month view
            formats={{
              monthDateFormat: (date) => moment(date).format("D"),
              dayFormat: (date) => moment(date).format("ddd D"),
              dayHeaderFormat: (date) => moment(date).format("dddd, MMMM D"),
            }}
            // Ensure month view shows all events
            length={30}
            showAllEvents={true}
            className="clean-calendar"
          />
        </div>
      </CardContent>
    </Card>
  )
}
