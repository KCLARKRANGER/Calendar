"use client"

import { Button } from "@/components/ui/button"
import { FileTextIcon } from "lucide-react"
import type { TaskData } from "@/types/task"

interface ExampleDataButtonProps {
  onDataLoad: (tasks: TaskData[]) => void
}

export function ExampleDataButton({ onDataLoad }: ExampleDataButtonProps) {
  const loadExampleData = () => {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const exampleData: TaskData[] = [
      {
        taskId: "task-1",
        taskName: "Asphalt Paving - Main Street",
        startDate: new Date(startOfMonth.getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        dueDate: new Date(startOfMonth.getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        typeOfWork: "Asphalt Paving",
        location: "Main Street",
        quantity: "1500 sq ft",
        materialType: "Asphalt",
      },
      {
        taskId: "task-2",
        taskName: "Concrete Sidewalk Installation",
        startDate: new Date(startOfMonth.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        dueDate: new Date(startOfMonth.getTime() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        typeOfWork: "Concrete",
        location: "Oak Avenue",
        quantity: "800 sq ft",
        materialType: "Concrete",
      },
      {
        taskId: "task-3",
        taskName: "Drainage System Installation",
        startDate: new Date(startOfMonth.getTime() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        dueDate: new Date(startOfMonth.getTime() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        typeOfWork: "Drainage",
        location: "Elm Street",
        quantity: "350 linear ft",
        materialType: "PVC Pipe",
      },
      {
        taskId: "task-4",
        taskName: "Site Grading",
        startDate: new Date(startOfMonth.getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        dueDate: new Date(startOfMonth.getTime() + 8 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        typeOfWork: "Grading / Site Work",
        location: "New Development",
        quantity: "2 acres",
        materialType: "Soil",
      },
      {
        taskId: "task-5",
        taskName: "Road Striping",
        startDate: new Date(startOfMonth.getTime() + 16 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        dueDate: new Date(startOfMonth.getTime() + 17 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        typeOfWork: "Striping",
        location: "Highway 101",
        quantity: "2 miles",
        materialType: "Paint",
      },
    ]

    onDataLoad(exampleData)
  }

  return (
    <Button variant="outline" onClick={loadExampleData} className="flex items-center gap-2">
      <FileTextIcon className="h-4 w-4" />
      Load Example Data
    </Button>
  )
}
