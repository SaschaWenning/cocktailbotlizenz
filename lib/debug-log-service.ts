"use client"

// Simple debug logging service for the cocktail app
let debugLogs: string[] = []
let debugLogListeners: ((logs: string[]) => void)[] = []

export const addDebugLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  const logEntry = `[${timestamp}] ${message}`

  // Add to logs array (keep last 20 entries)
  debugLogs = [logEntry, ...debugLogs.slice(0, 19)]

  // Console log for development
  console.log(`[DEBUG] ${logEntry}`)

  // Notify listeners
  debugLogListeners.forEach((listener) => listener([...debugLogs]))
}

export const getDebugLogs = (): string[] => {
  return [...debugLogs]
}

export const clearDebugLogs = () => {
  debugLogs = []
  debugLogListeners.forEach((listener) => listener([]))
}

export const onDebugLogsUpdated = (callback: (logs: string[]) => void) => {
  debugLogListeners.push(callback)

  // Return unsubscribe function
  return () => {
    debugLogListeners = debugLogListeners.filter((listener) => listener !== callback)
  }
}
