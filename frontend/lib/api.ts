import type { ApiError } from "@/types"

/**
 * API utilities for making requests to the backend
 */

// Get the API URL from environment variables with a fallback
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

/**
 * Helper function to construct API endpoints
 * @param path - The API endpoint path
 * @returns The full API URL
 */
export function getApiUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path
  return `${API_URL}/${normalizedPath}`
}

/**
 * Get the authentication token from localStorage
 * @returns The authentication token or null if not found
 */
export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

/**
 * Create headers with authentication token
 * @param additionalHeaders - Additional headers to include
 * @returns Headers object with authentication token
 */
export function createAuthHeaders(additionalHeaders: Record<string, string> = {}): HeadersInit {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...additionalHeaders,
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return headers
}

/**
 * Basic fetch wrapper with error handling for JSON requests
 */
export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const url = getApiUrl(path)
  const headers = createAuthHeaders((options?.headers as Record<string, string>) || {})

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      // Handle unauthorized access - redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        window.location.href = "/auth"
      }
      throw new Error("Unauthorized access")
    }

    // Parse the response
    const data = await response.json()

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || "An error occurred",
        code: data.code || "UNKNOWN_ERROR",
        status: response.status,
        details: data.details,
      }
      throw error
    }

    return data as T
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

/**
 * Form data fetch wrapper with error handling
 */
export async function fetchFormApi<T>(
  path: string,
  formData: Record<string, string>,
  options?: RequestInit,
): Promise<T> {
  const url = getApiUrl(path)
  const urlSearchParams = new URLSearchParams()

  // Add all form data to URLSearchParams
  Object.entries(formData).forEach(([key, value]) => {
    urlSearchParams.append(key, value)
  })

  // Get authentication token
  const token = getAuthToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    ...((options?.headers as Record<string, string>) || {}),
  }

  // Add token to headers if available
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      method: options?.method || "POST",
      headers,
      body: urlSearchParams.toString(),
    })

    // Parse the response
    const data = await response.json()

    if (response.status === 401) {
      // Handle unauthorized access - redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        window.location.href = "/auth"
      }
      throw new Error("Unauthorized access")
    }

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || "An error occurred",
        code: data.code || "UNKNOWN_ERROR",
        status: response.status,
        details: data.details,
      }
      throw error
    }

    return data as T
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}
