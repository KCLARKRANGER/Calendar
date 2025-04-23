import moment from "moment"

/**
 * Parse a date string in various formats
 * @param dateString The date string to parse
 * @returns A valid Date object or null if parsing fails
 */
export function parseDate(dateString: string): Date | null {
  if (!dateString) return null

  // First, try to clean up the date string
  // Remove ordinal suffixes (1st, 2nd, 3rd, 4th, etc.)
  const cleanedDateString = dateString.replace(/(\d+)(st|nd|rd|th)/g, "$1")

  // Try different formats
  const formats = [
    "dddd, MMMM D YYYY, h:mm:ss a Z", // Monday, May 12th 2025, 7:00:00 am -04:00
    "dddd, MMMM D YYYY, h:mm:ss a", // Monday, May 12th 2025, 7:00:00 am
    "dddd, MMMM D YYYY", // Monday, May 12th 2025
    "YYYY-MM-DD", // 2025-04-04
    "MM/DD/YYYY", // 04/04/2025
    "MMMM D YYYY", // April 4 2025
    "D MMMM YYYY", // 4 April 2025
  ]

  // Try parsing with each format
  for (const format of formats) {
    const date = moment(cleanedDateString, format, true) // strict parsing
    if (date.isValid()) {
      return date.toDate()
    }
  }

  // If all formats fail, try moment's automatic parsing
  const date = moment(cleanedDateString)
  if (date.isValid()) {
    return date.toDate()
  }

  // If all else fails, try native Date parsing
  const nativeDate = new Date(dateString)
  if (!isNaN(nativeDate.getTime())) {
    return nativeDate
  }

  console.warn(`Failed to parse date: ${dateString}`)
  return null
}

/**
 * Format a date for display
 * @param date The date to format
 * @param format The format string (optional)
 * @returns A formatted date string
 */
export function formatDate(date: Date | string | null, format = "MMMM D, YYYY"): string {
  if (!date) return "N/A"

  try {
    const momentDate = typeof date === "string" ? moment(parseDate(date)) : moment(date)
    if (!momentDate.isValid()) return "Invalid Date"
    return momentDate.format(format)
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Error"
  }
}

/**
 * Format a date with time for display
 * @param date The date to format
 * @returns A formatted date string with time
 */
export function formatDateWithTime(date: Date | string | null): string {
  if (!date) return "N/A"

  try {
    const momentDate = typeof date === "string" ? moment(parseDate(date)) : moment(date)
    if (!momentDate.isValid()) return "Invalid Date"
    return momentDate.format("MMMM D, YYYY h:mm A")
  } catch (error) {
    console.error("Error formatting date with time:", error)
    return "Error"
  }
}

/**
 * Check if a date is within a range
 * @param date The date to check
 * @param startDate The start of the range
 * @param endDate The end of the range
 * @returns True if the date is within the range
 */
export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  const momentDate = moment(date)
  const momentStart = moment(startDate).startOf("day")
  const momentEnd = moment(endDate).endOf("day")

  return momentDate.isBetween(momentStart, momentEnd, "day", "[]")
}
