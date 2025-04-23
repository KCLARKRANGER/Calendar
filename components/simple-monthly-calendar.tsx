"use client"

import { useState, useEffect } from "react"
import moment from "moment"
import type { TaskData } from "@/types/task"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, PrinterIcon, Circle } from "lucide-react"
import { getWorkTypeColor } from "@/lib/work-type-colors"
import { parseDate } from "@/lib/date-utils"

interface SimpleMonthlyCalendarProps {
  tasks: TaskData[]
  onDateChange?: (date: Date) => void
  initialDate?: Date
}

export function SimpleMonthlyCalendar({ tasks, onDateChange, initialDate }: SimpleMonthlyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date())
  const [calendarDays, setCalendarDays] = useState<Date[][]>([])

  // Get unique work types for the legend
  const workTypes = tasks
    .map((task) => task.typeOfWork)
    .filter((value, index, self) => value && self.indexOf(value) === index)
    .sort()
    .slice(0, 10) // Limit to 10 types to avoid overcrowding

  // Generate calendar days for the current month
  useEffect(() => {
    const firstDay = moment(currentDate).startOf("month").startOf("week")
    const lastDay = moment(currentDate).endOf("month").endOf("week")

    const days: Date[][] = []
    let week: Date[] = []

    for (let day = moment(firstDay); day.isSameOrBefore(lastDay); day = day.clone().add(1, "day")) {
      week.push(day.toDate())

      if (week.length === 7) {
        days.push(week)
        week = []
      }
    }

    setCalendarDays(days)
  }, [currentDate])

  // Update parent component when date changes
  useEffect(() => {
    if (onDateChange) {
      onDateChange(currentDate)
    }
  }, [currentDate, onDateChange])

  const handlePrevMonth = () => {
    setCurrentDate(moment(currentDate).subtract(1, "month").toDate())
  }

  const handleNextMonth = () => {
    setCurrentDate(moment(currentDate).add(1, "month").toDate())
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handlePrint = () => {
    // Set the current month as a data attribute for printing
    document.documentElement.setAttribute("data-print-month", moment(currentDate).format("MMMM YYYY"))

    // Add a class to the body to help with print styling
    document.body.classList.add("printing-calendar")

    // Print the page
    window.print()

    // Remove the class after printing
    setTimeout(() => {
      document.body.classList.remove("printing-calendar")
    }, 1000)
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

  return (
    <Card className="simple-monthly-calendar page-container" data-month={moment(currentDate).format("MMMM YYYY")}>
      <CardContent className="p-4 print:p-1">
        <div className="flex justify-between items-center mb-4 print:hidden">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h3 className="text-lg font-medium">{moment(currentDate).format("MMMM YYYY")}</h3>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <PrinterIcon className="h-4 w-4 mr-1" />
            Print
          </Button>
        </div>

        <div className="print:block text-center mb-4 print:mb-2">
          <h2 className="text-2xl font-bold">Spallina Schedule</h2>
          <h3 className="text-xl">{moment(currentDate).format("MMMM YYYY")}</h3>
          <p className="text-sm text-gray-500 mt-1">Created: {moment().format("MMMM D, YYYY [at] h:mm A")}</p>
        </div>

        <div className="border rounded-md overflow-hidden print:border-0">
          {/* Calendar header */}
          <div className="grid grid-cols-7 bg-gray-100">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-2 text-center font-medium border-b print:p-1 print:text-xs">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="bg-white">
            {calendarDays.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7">
                {week.map((day, dayIndex) => {
                  const isToday = moment(day).isSame(new Date(), "day")
                  const isCurrentMonth = moment(day).isSame(currentDate, "month")
                  const isWeekend = dayIndex === 0 || dayIndex === 6
                  const dayTasks = getTasksForDay(day)
                  const filteredTasks = isWeekend ? [] : dayTasks

                  return (
                    <div
                      key={dayIndex}
                      className={`min-h-[100px] p-1 border-b border-r relative ${isToday ? "bg-blue-50" : ""} ${
                        isCurrentMonth ? "text-gray-900" : "text-gray-400 bg-gray-50"
                      } ${isWeekend ? "bg-gray-100" : ""} print:min-h-0`}
                    >
                      <div className="text-right p-1 font-bold">{moment(day).format("D")}</div>

                      <div className="mt-1 space-y-1">
                        {filteredTasks.slice(0, 5).map((task) => {
                          const color = getWorkTypeColor(task.typeOfWork)

                          return (
                            <div key={task.taskId} className="flex items-start gap-1 text-xs p-1 rounded">
                              <div className="flex-shrink-0 mt-0.5" style={{ color }}>
                                <Circle className="h-2 w-2 fill-current" />
                              </div>
                              <div className="flex-grow text-[9px] leading-tight line-clamp-2">{task.taskName}</div>
                            </div>
                          )
                        })}

                        {filteredTasks.length > 5 && (
                          <div className="text-xs text-gray-500 pl-1">+{filteredTasks.length - 5} more</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Work Type Legend in bottom corner */}
        <div className="work-type-legend mt-4 text-xs print:absolute print:bottom-2 print:right-2 print:max-w-[3in]">
          <div className="flex flex-wrap gap-2 justify-end">
            {workTypes.map((type) => {
              const color = getWorkTypeColor(type)
              return (
                <div key={type} className="flex items-center gap-1">
                  <Circle className="h-2 w-2 fill-current" style={{ color }} />
                  <span className="text-[8px]">{type}</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
