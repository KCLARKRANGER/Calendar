"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { CSVUploader } from "@/components/csv-uploader"
import { Calendar } from "@/components/calendar"
import { SimpleMonthlyCalendar } from "@/components/simple-monthly-calendar"
import { ProjectDetails } from "@/components/project-details"
import { WorkTypeLegend } from "@/components/work-type-legend"
import { DebugPanel } from "@/components/debug-panel"
import type { TaskData } from "@/types/task"
import { parseCSV } from "@/lib/parse-csv"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { InfoIcon, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExampleDataButton } from "@/components/example-data-button"
import { PrintCalendarButton } from "@/components/print-calendar-button"

export default function Home() {
  const [tasks, setTasks] = useState<TaskData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [view, setView] = useState<"month" | "week" | "day">("month") // Start with month view
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [error, setError] = useState<string | null>(null)
  const [useSimpleCalendar, setUseSimpleCalendar] = useState(true) // Default to simple calendar
  const [refreshKey, setRefreshKey] = useState(0)
  const lastDateChangeRef = useRef<number>(0)

  // Load tasks from localStorage on initial render
  useEffect(() => {
    const savedTasks = localStorage.getItem("spallina-calendar-tasks")
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks)
        setTasks(parsedTasks)
        console.log("Loaded tasks from localStorage:", parsedTasks.length)
      } catch (error) {
        console.error("Failed to parse saved tasks:", error)
        setError("Failed to load saved tasks. Please upload your CSV file again.")
      }
    }

    // Always set the selected date to today to ensure the calendar is focused on the current month
    setSelectedDate(new Date())
  }, [])

  const handleFileUpload = async (file: File) => {
    setIsLoading(true)
    setError(null)

    try {
      const parsedData = await parseCSV(file)
      console.log("Parsed CSV data:", parsedData.length)

      // Validate that we have some data
      if (!parsedData || parsedData.length === 0) {
        throw new Error("No data found in the CSV file")
      }

      // Additional validation - check if we have actual date values
      const hasValidDates = parsedData.some(
        (task) => task.startDate && task.startDate.trim() !== "" && task.dueDate && task.dueDate.trim() !== "",
      )

      if (!hasValidDates) {
        throw new Error("No valid date values found in the CSV. Please check your file format.")
      }

      setTasks(parsedData)
      // Save to localStorage
      localStorage.setItem("spallina-calendar-tasks", JSON.stringify(parsedData))

      // Force a refresh of the calendar
      handleRefresh()
    } catch (error) {
      console.error("Error processing CSV:", error)
      setError(
        `Error processing CSV file: ${error instanceof Error ? error.message : "Unknown error"}. Please ensure your CSV has columns for start dates and due dates.`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = () => {
    // Print the page - the SimpleMonthlyCalendar component will handle the printing logic
    window.print()
  }

  // Debounced date change handler to prevent infinite loops
  const handleDateChange = useCallback((date: Date) => {
    const now = Date.now()
    if (now - lastDateChangeRef.current > 300) {
      lastDateChangeRef.current = now
      setSelectedDate(date)
    }
  }, [])

  const handleViewChange = (newView: string) => {
    setView(newView as "month" | "week" | "day")
  }

  const toggleCalendarType = () => {
    setUseSimpleCalendar(!useSimpleCalendar)
  }

  const handleRefresh = () => {
    // Force a re-render of the calendar
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <main className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6 text-center print:hidden">Spallina Calendar</h1>

      {error && (
        <Alert variant="destructive" className="mb-4 print:hidden">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center mb-4 print:hidden">
        <h2 className="text-xl font-semibold">Calendar View</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => document.getElementById("csv-upload-section")?.classList.toggle("hidden")}
            className="flex items-center gap-2"
          >
            Upload CSV
          </Button>
          <ExampleDataButton
            onDataLoad={(exampleData) => {
              setTasks(exampleData)
              localStorage.setItem("spallina-calendar-tasks", JSON.stringify(exampleData))
              handleRefresh()
            }}
          />
          <Button variant="outline" onClick={toggleCalendarType} className="flex items-center gap-2">
            {useSimpleCalendar ? "Use Standard Calendar" : "Use Simple Calendar"}
          </Button>
          <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <PrintCalendarButton date={selectedDate} />
        </div>
      </div>

      <div id="csv-upload-section" className="mb-6 print:hidden">
        <CSVUploader onFileUpload={handleFileUpload} isLoading={isLoading} />
      </div>

      {useSimpleCalendar ? (
        <SimpleMonthlyCalendar tasks={tasks} onDateChange={handleDateChange} initialDate={selectedDate} />
      ) : (
        <Tabs defaultValue="month" onValueChange={handleViewChange} className="print:hidden">
          <TabsList className="mb-4">
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
          <TabsContent value="day" className="block">
            <Calendar
              key={`day-${refreshKey}`}
              tasks={tasks}
              view="day"
              onDateChange={handleDateChange}
              onRefresh={handleRefresh}
            />
          </TabsContent>
          <TabsContent value="week" className="block">
            <Calendar
              key={`week-${refreshKey}`}
              tasks={tasks}
              view="week"
              onDateChange={handleDateChange}
              onRefresh={handleRefresh}
            />
          </TabsContent>
          <TabsContent value="month" className="block">
            <Calendar
              key={`month-${refreshKey}`}
              tasks={tasks}
              view="month"
              onDateChange={handleDateChange}
              onRefresh={handleRefresh}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Work Type Legend - hidden in print */}
      <div className="mt-4 print:hidden">
        <WorkTypeLegend tasks={tasks} />
      </div>

      {/* Project Details Section - hidden in print */}
      <div className="mt-8 print:hidden">
        <ProjectDetails tasks={tasks} selectedDate={selectedDate} view={view} />
      </div>

      {/* Debug Panel - hidden in print */}
      <DebugPanel tasks={tasks} />
    </main>
  )
}
