// Define colors for different material types
const materialColors: Record<string, string> = {
  Asphalt: "#3b82f6", // blue
  Concrete: "#6b7280", // gray
  "Grading and Site Work": "#10b981", // green
  Excavation: "#f59e0b", // amber
  Drainage: "#3b82f6", // blue
  Utilities: "#8b5cf6", // purple
  Demolition: "#ef4444", // red
  Paving: "#f97316", // orange
  Landscaping: "#84cc16", // lime
  Striping: "#f43f5e", // rose
  Signage: "#06b6d4", // cyan
}

// Default color for unknown material types
const defaultColor = "#6b7280" // gray

export function getMaterialColor(materialType: string): string {
  // Check if we have a predefined color for this material type
  if (materialType in materialColors) {
    return materialColors[materialType]
  }

  // If not, check if it partially matches any of our keys
  for (const [key, color] of Object.entries(materialColors)) {
    if (materialType.toLowerCase().includes(key.toLowerCase())) {
      return color
    }
  }

  // Return default color if no match found
  return defaultColor
}
