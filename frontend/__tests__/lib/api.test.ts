import { getApiUrl, createAuthHeaders, fetchApi, fetchFormApi } from "@/lib/api"
import { API_URL } from "@/lib/api"

// Mock fetch
global.fetch = jest.fn()

describe("API Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe("getApiUrl", () => {
    it("should construct API URLs correctly", () => {
      expect(getApiUrl("test")).toBe(`${API_URL}/test`)
      expect(getApiUrl("/test")).toBe(`${API_URL}/test`) // Should handle leading slash
    })
  })

  describe("createAuthHeaders", () => {
    it("should create headers with auth token when available", () => {
      localStorage.setItem("token", "test-token")
      const headers = createAuthHeaders()
      expect(headers).toEqual({
        "Content-Type": "application/json",
        Authorization: "Bearer test-token",
      })
    })

    it("should create headers without auth token when not available", () => {
      const headers = createAuthHeaders()
      expect(headers).toEqual({
        "Content-Type": "application/json",
      })
    })

    it("should merge additional headers", () => {
      const headers = createAuthHeaders({ "X-Custom": "value" })
      expect(headers).toEqual({
        "Content-Type": "application/json",
        "X-Custom": "value",
      })
    })
  })

  describe("fetchApi", () => {
    it("should make API requests with correct parameters", async () => {
      const mockResponse = { json: jest.fn().mockResolvedValue({ data: "test" }) }
      mockResponse.ok = true
      mockResponse.status = 200
      ;(fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await fetchApi("test-endpoint")

      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/test-endpoint`,
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        }),
      )
      expect(result).toEqual({ data: "test" })
    })

    it("should handle API errors", async () => {
      const errorResponse = {
        json: jest.fn().mockResolvedValue({
          message: "Error message",
          code: "ERROR_CODE",
        }),
        ok: false,
        status: 400,
      }
      ;(fetch as jest.Mock).mockResolvedValue(errorResponse)

      await expect(fetchApi("test-endpoint")).rejects.toEqual(
        expect.objectContaining({
          message: "Error message",
          code: "ERROR_CODE",
          status: 400,
        }),
      )
    })

    it("should handle unauthorized errors and redirect", async () => {
      const unauthorizedResponse = {
        json: jest.fn().mockResolvedValue({ message: "Unauthorized" }),
        ok: false,
        status: 401,
      }
      ;(fetch as jest.Mock).mockResolvedValue(unauthorizedResponse)

      localStorage.setItem("token", "test-token")

      await expect(fetchApi("test-endpoint")).rejects.toThrow("Unauthorized access")
      expect(localStorage.getItem("token")).toBeNull()
    })
  })

  describe("fetchFormApi", () => {
    it("should make form API requests with correct parameters", async () => {
      const mockResponse = { json: jest.fn().mockResolvedValue({ data: "test" }) }
      mockResponse.ok = true
      mockResponse.status = 200
      ;(fetch as jest.Mock).mockResolvedValue(mockResponse)

      const formData = { key1: "value1", key2: "value2" }
      const result = await fetchFormApi("test-endpoint", formData)

      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/test-endpoint`,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/x-www-form-urlencoded",
          }),
          body: "key1=value1&key2=value2",
        }),
      )
      expect(result).toEqual({ data: "test" })
    })
  })
})
