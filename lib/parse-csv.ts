import Papa from "papaparse"
import type { TaskData } from "@/types/task"

// Update the parseCSV function to handle missing Start Date column
export async function parseCSV(file: File): Promise<TaskData[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          console.log("CSV parsing complete. Raw data:", results.data)
          console.log("Headers found:", results.meta.fields)

          // Check if we have any rows
          if (!results.data || results.data.length === 0) {
            throw new Error("No data found in CSV file")
          }

          // Map potential column names to our expected format
          const columnMappings = {
            startDate: ["Start Date", "StartDate", "start_date", "start date", "Date Start", "start"],
            dueDate: [
              "Due Date",
              "DueDate",
              "due_date",
              "due date",
              "Date Due",
              "end",
              "End Date",
              "EndDate",
              "end_date",
            ],
            taskId: ["Task ID", "TaskID", "task_id", "Id", "ID", "id"],
            taskName: ["Task Name", "TaskName", "task_name", "name", "Name", "Task", "task", "Description"],
            typeOfWork: [
              "💪 Type of work (drop down)",
              "Type of work",
              "Type of Work",
              "WorkType",
              "work_type",
              "work type",
              "Type",
            ],
            location: [
              "LOCATION (short text)",
              "Location",
              "location",
              "Place",
              "place",
              "📏 Area of Project (short text)",
            ],
            quantity: ["⚖️ QUANTITY (number)", "Quantity", "quantity", "Amount", "amount"],
            materialType: [
              "Material Type (short text)",
              "MaterialType",
              "material_type",
              "material type",
              "Materials",
              "🛣️ Product (labels)",
            ],
          }

          // Function to find the actual column name in the CSV
          const findColumnName = (possibleNames, headers) => {
            return headers.find((header) => possibleNames.some((name) => header.toLowerCase() === name.toLowerCase()))
          }

          // Get the actual column names from the CSV
          const headers = results.meta.fields || []
          const actualColumns = {
            startDate: findColumnName(columnMappings.startDate, headers),
            dueDate: findColumnName(columnMappings.dueDate, headers),
            taskId: findColumnName(columnMappings.taskId, headers),
            taskName: findColumnName(columnMappings.taskName, headers),
            typeOfWork: findColumnName(columnMappings.typeOfWork, headers),
            location: findColumnName(columnMappings.location, headers),
            quantity: findColumnName(columnMappings.quantity, headers),
            materialType: findColumnName(columnMappings.materialType, headers),
          }

          console.log("Mapped columns:", actualColumns)

          // Validate required columns - we need at least Due Date
          if (!actualColumns.dueDate) {
            console.error("Missing required date columns. Found columns:", headers)
            throw new Error(
              `CSV is missing required date columns. We need at least a Due Date column. Found: ${headers.join(", ")}`,
            )
          }

          // If Start Date is missing, we'll use Due Date for both
          const usesDueDateForStart = !actualColumns.startDate
          if (usesDueDateForStart) {
            console.log("No Start Date column found. Using Due Date for both start and end dates.")
          }

          const parsedData = results.data.map((row: any, index) => {
            // Log sample rows for debugging
            if (index < 2) {
              console.log(`Row ${index} sample:`, row)
            }

            // If no start date column, use the due date for both
            const startDate = usesDueDateForStart ? row[actualColumns.dueDate] : row[actualColumns.startDate] || ""

            return {
              taskId: row[actualColumns.taskId] || `task-${index}`,
              taskName: row[actualColumns.taskName] || "Unnamed Task",
              startDate: startDate,
              dueDate: row[actualColumns.dueDate] || "",
              typeOfWork: row[actualColumns.typeOfWork] || "",
              location: row[actualColumns.location] || "",
              quantity: row[actualColumns.quantity] || "",
              materialType: row[actualColumns.materialType] || "",
            }
          })

          console.log("Parsed data:", parsedData)
          resolve(parsedData as TaskData[])
        } catch (error) {
          console.error("Error parsing CSV:", error)
          reject(error)
        }
      },
      error: (error) => {
        console.error("CSV parsing error:", error)
        reject(error)
      },
    })
  })
}
