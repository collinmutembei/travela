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
 * Basic fetch wrapper with error handling for JSON requests
 */
export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const url = getApiUrl(path)

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
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

  try {
    const response = await fetch(url, {
      ...options,
      method: options?.method || "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...options?.headers,
      },
      body: urlSearchParams.toString(),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}
