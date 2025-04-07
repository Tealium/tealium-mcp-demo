/**
 * Debug Logger Utility
 * 
 * Use this to add consistent, structured logging throughout the application
 */

// Control whether debug logs are displayed
let debugEnabled = true;

// Toggle debug logging
export function setDebugLogging(enabled: boolean) {
  debugEnabled = enabled;
  logDebug('Debug logging set to:', enabled);
}

// Log debug messages
export function logDebug(message: string, ...data: any[]) {
  if (!debugEnabled) return;
  
  console.log(
    `%c[DEBUG] ${new Date().toISOString().split('T')[1].slice(0, 8)} - ${message}`,
    'color: #2563eb; font-weight: bold;',
    ...data
  );
}

// Log errors with consistent formatting
export function logError(message: string, error: any) {
  console.error(
    `%c[ERROR] ${new Date().toISOString().split('T')[1].slice(0, 8)} - ${message}`,
    'color: #ef4444; font-weight: bold;',
    error
  );
}

// Log warnings with consistent formatting
export function logWarning(message: string, ...data: any[]) {
  console.warn(
    `%c[WARNING] ${new Date().toISOString().split('T')[1].slice(0, 8)} - ${message}`,
    'color: #f59e0b; font-weight: bold;',
    ...data
  );
}

// Log API requests
export function logApiRequest(endpoint: string, method: string, payload: any) {
  if (!debugEnabled) return;
  
  console.log(
    `%c[API REQUEST] ${new Date().toISOString().split('T')[1].slice(0, 8)} - ${method} ${endpoint}`,
    'color: #10b981; font-weight: bold;',
    payload
  );
}

// Log API responses
export function logApiResponse(endpoint: string, status: number, data: any) {
  if (!debugEnabled) return;
  
  const color = status >= 200 && status < 300 ? '#10b981' : '#ef4444';
  
  console.log(
    `%c[API RESPONSE] ${new Date().toISOString().split('T')[1].slice(0, 8)} - ${status} ${endpoint}`,
    `color: ${color}; font-weight: bold;`,
    data
  );
}

// Format API error information
export function formatApiError(error: any): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  } else if (typeof error === 'string') {
    return error;
  } else if (error && typeof error === 'object') {
    return JSON.stringify(error);
  } else {
    return 'Unknown error';
  }
}

// Export default object for convenient importing
export default {
  debug: logDebug,
  error: logError,
  warning: logWarning,
  api: {
    request: logApiRequest,
    response: logApiResponse
  },
  format: {
    error: formatApiError
  },
  setEnabled: setDebugLogging
};
