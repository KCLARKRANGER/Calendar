import Papa from "papaparse"
import type { TaskData } from "@/types/task"

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
            location: ["LOCATION (short text)", "Location", "location", "Place", "place"],
            quantity: ["⚖️ QUANTITY (number)", "Quantity", "quantity", "Amount", "amount"],
            materialType: [
              "Material Type (short text)",
              "Material Type",
              "MaterialType",
              "material_type",
              "material type",
              "Materials",
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

          // Validate required columns
          if (!actualColumns.startDate || !actualColumns.dueDate) {
            console.error("Missing required date columns. Found columns:", headers)
            throw new Error(
              `CSV is missing required date columns. We need columns for start date and due date. Found: ${headers.join(", ")}`,
            )
          }

          const parsedData = results.data.map((row: any, index) => {
            // Log sample rows for debugging
            if (index < 2) {
              console.log(`Row ${index} sample:`, row)
            }

            return {
              taskId: row[actualColumns.taskId] || `task-${index}`,
              taskName: row[actualColumns.taskName] || "Unnamed Task",
              startDate: row[actualColumns.startDate] || "",
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
