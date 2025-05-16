// Define a large palette of distinct colors for work types
// Using a wide range of hues to ensure visual distinction
const workTypeColors: Record<string, string> = {
  // Blues
  Asphalt: "#1e40af",
  "Asphalt Repair": "#3b82f6",
  "Asphalt Patching": "#60a5fa",
  "Asphalt Overlay": "#93c5fd",
  "Asphalt Sealing": "#2563eb",

  // Greens
  "Grading / Site Work": "#15803d",
  Landscaping: "#22c55e",
  "PLANT ONLY": "#4ade80",
  Prep: "#86efac",

  // Purples
  Milling: "#7e22ce",
  "Asphalt Milling": "#a855f7",
  "MILL BLATHER SOLAR FIELD": "#c084fc",
  "MILL-TOWN of Avon": "#d8b4fe",

  // Oranges/Reds
  Paving: "#c2410c",
  "Asphalt Paving": "#ea580c",
  "Pave-Livingston County": "#f97316",
  "Pave-LIV CTY": "#fb923c",
  Demolition: "#b91c1c",

  // Grays
  Concrete: "#4b5563",
  "Concrete Repair": "#64748b",
  "Concrete Paving": "#94a3b8",
  "Concrete Patching": "#cbd5e1",
  "Concrete Milling": "#475569",
  "Concrete Overlay": "#9ca3af",
  "Concrete Sealing": "#6b7280",

  // Yellows/Ambers
  Excavation: "#b45309",
  "Mill/Pave Town of Avon": "#d97706",
  "Mill and Pave": "#f59e0b",
  Mining: "#fbbf24",

  // Teals/Cyans
  Drainage: "#0e7490",
  "Catch Basin": "#06b6d4",
  Utilities: "#22d3ee",
  Signage: "#67e8f9",

  // Pinks/Roses
  Striping: "#be185d",
  "Remove Existing & Pave": "#ec4899",
  "Intersections & Driveways": "#f472b6",

  // Additional colors for any other types
  "American Rock Salt Lot B": "#84cc16",
  "Pave-Greg Stahl 185 Ton": "#ca8a04",
  "Bob Johnson -Leroy Calc": "#0369a1",
  "Mill & Pave Park Avenue": "#0891b2",
  "Pave-Village of Avon 400": "#4338ca",
  "Pave-Town of Avon 950T": "#6d28d9",
  "Pave-Town of Avon 100T": "#a21caf",
  "Catch Basin - Glue Asphalt": "#0f766e",
  "Park Ave Appts- Patches": "#166534",
  "Memorial Day - Closed": "#881337",
  "Grading / Site Work": "#365314",
  "Livingston County - Lima": "#854d0e",
}

// Additional colors to use for any work types not explicitly defined
const additionalColors = [
  "#134e4a",
  "#042f2e",
  "#065f46",
  "#064e3b",
  "#3f6212",
  "#365314",
  "#713f12",
  "#422006",
  "#7f1d1d",
  "#450a0a",
  "#831843",
  "#500724",
  "#581c87",
  "#3b0764",
  "#1e3a8a",
  "#172554",
  "#0c4a6e",
  "#082f49",
  "#1e293b",
  "#0f172a",
]

let colorIndex = 0

// Default color for unknown work types
const defaultColor = "#6b7280" // gray

export function getWorkTypeColor(workType: string): string {
  if (!workType) return defaultColor

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

  // If we still don't have a match, assign a color from our additional colors
  // and store it for future use to ensure consistency
  const newColor = additionalColors[colorIndex % additionalColors.length]
  colorIndex++
  workTypeColors[workType] = newColor

  return newColor
}
