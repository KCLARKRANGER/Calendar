"use client"

import { useState, useEffect } from "react"
import type { TaskData } from "@/types/task"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getWorkTypeColor } from "@/lib/work-type-colors"
import { parseDate } from "@/lib/date-utils"
import moment from "moment"

interface SimpleCalendarProps {
  tasks: TaskData[]
  onDateChange?: (date: Date) => void
}

export function SimpleCalendar({ tasks, onDateChange }: SimpleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<Date[][]>([])

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
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
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
        </div>

        <div className="border rounded-md overflow-hidden">
          {/* Calendar header */}
          <div className="grid grid-cols-7 bg-gray-100">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-2 text-center font-medium border-b">
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
                  const dayTasks = getTasksForDay(day)

                  return (
                    <div
                      key={dayIndex}
                      className={`min-h-[100px] p-1 border-b border-r relative ${isToday ? "bg-blue-50" : ""} ${
                        isCurrentMonth ? "text-gray-900" : "text-gray-400 bg-gray-50"
                      }`}
                    >
                      <div className="text-right p-1">{moment(day).format("D")}</div>

                      <div className="mt-1 space-y-1">
                        {dayTasks.slice(0, 3).map((task) => {
                          const startDate = parseDate(task.startDate)
                          const dueDate = parseDate(task.dueDate)
                          const isStartDay = startDate && moment(day).isSame(startDate, "day")
                          const isEndDay = dueDate && moment(day).isSame(dueDate, "day")

                          return (
                            <div
                              key={task.taskId}
                              className="text-xs p-1 rounded truncate"
                              style={{
                                backgroundColor: getWorkTypeColor(task.typeOfWork),
                                borderLeft: `3px solid ${getWorkTypeColor(task.typeOfWork)}`,
                                borderTopLeftRadius: isStartDay ? "2px" : "0",
                                borderBottomLeftRadius: isStartDay ? "2px" : "0",
                                borderTopRightRadius: isEndDay ? "2px" : "0",
                                borderBottomRightRadius: isEndDay ? "2px" : "0",
                              }}
                            >
                              {task.taskName}
                            </div>
                          )
                        })}

                        {dayTasks.length > 3 && (
                          <div className="text-xs text-gray-500 pl-1">+{dayTasks.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
