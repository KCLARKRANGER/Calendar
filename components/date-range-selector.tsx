"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateRangeSelectorProps {
  onRangeChange: (range: DateRange | undefined) => void
  onMonthChange: (month: Date) => void
}

export function DateRangeSelector({ onRangeChange, onMonthChange }: DateRangeSelectorProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  })
  const [isOpen, setIsOpen] = useState(false)

  // Get current year and month
  const currentYear = new Date().getFullYear()
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Handle month selection
  const handleMonthSelect = (monthIndex: number) => {
    const selectedMonth = new Date(currentYear, monthIndex, 1)
    onMonthChange(selectedMonth)

    // Also update the date range to cover the entire month
    const from = new Date(currentYear, monthIndex, 1)
    const to = new Date(currentYear, monthIndex + 1, 0) // Last day of month

    setDate({ from, to })
    onRangeChange({ from, to })
  }

  // Handle date range selection
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDate(range)
    onRangeChange(range)
  }

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
      <div className="flex-1">
        <Select onValueChange={(value) => handleMonthSelect(Number.parseInt(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month, index) => (
              <SelectItem key={month} value={index.toString()}>
                {month} {currentYear}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={(range) => {
                handleDateRangeChange(range)
                setIsOpen(false)
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
