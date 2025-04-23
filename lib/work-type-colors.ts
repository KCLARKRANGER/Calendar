// Define colors for different work types
const workTypeColors: Record<string, string> = {
  Asphalt: "#3b82f6", // blue
  Concrete: "#6b7280", // gray
  "Grading / Site Work": "#10b981", // green
  Excavation: "#f59e0b", // amber
  Drainage: "#3b82f6", // blue
  Utilities: "#8b5cf6", // purple
  Demolition: "#ef4444", // red
  Paving: "#f97316", // orange
  Landscaping: "#84cc16", // lime
  Striping: "#f43f5e", // rose
  Signage: "#06b6d4", // cyan
  Milling: "#8b5cf6", // purple
  Prep: "#84cc16", // lime
  "Asphalt Paving": "#f97316", // orange
  "Concrete Paving": "#6b7280", // gray
  "Asphalt Repair": "#3b82f6", // blue  "#f97316", // orange
  "Concrete Paving": "#6b7280", // gray
  "Asphalt Repair": "#3b82f6", // blue
  "Concrete Repair": "#6b7280", // gray
  "Asphalt Milling": "#8b5cf6", // purple
  "Concrete Milling": "#6b7280", // gray
  "Asphalt Patching": "#3b82f6", // blue
  "Concrete Patching": "#6b7280", // gray
  "Asphalt Overlay": "#f97316", // orange
  "Concrete Overlay": "#6b7280", // gray
  "Asphalt Sealing": "#3b82f6", // blue
  "Concrete Sealing": "#6b7280", // gray
}

// Default color for unknown work types
const defaultColor = "#6b7280" // gray

export function getWorkTypeColor(workType: string): string {
  // Check if we have a predefined color for this work type
  if (workType in workTypeColors) {
    return workTypeColors[workType]
  }

  // If not, check if it partially matches any of our keys
  for (const [key, color] of Object.entries(workTypeColors)) {
    if (workType.toLowerCase().includes(key.toLowerCase())) {
      return color
    }
  }

  // Return default color if no match found
  return defaultColor
}
