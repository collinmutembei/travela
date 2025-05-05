import { getConversations, getChat, updateChatTitle, askQuestion } from "@/lib/chat-service"
import { fetchApi } from "@/lib/api"
import { jest } from "@jest/globals"

// Mock the fetchApi function
jest.mock("@/lib/api", () => ({
  fetchApi: jest.fn(),
  API_URL: "http://localhost:8000",
  getApiUrl: jest.fn((path) => `http://localhost:8000/${path}`),
  getAuthToken: jest.fn(),
  createAuthHeaders: jest.fn(),
}))

describe("Chat Service", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("getConversations", () => {
    it("should fetch conversations from the correct endpoint", async () => {
      const mockConversations = [{ id: "1", title: "Test Chat" }]
      ;(fetchApi as jest.Mock).mockResolvedValue(mockConversations)

      const result = await getConversations()

      expect(fetchApi).toHaveBeenCalledWith("chats")
      expect(result).toEqual(mockConversations)
    })
  })

  describe("getChat", () => {
    it("should fetch a specific chat by ID", async () => {
      const mockChat = { title: "Test Chat", messages: [] }
      ;(fetchApi as jest.Mock).mockResolvedValue(mockChat)

      const result = await getChat("123")

      expect(fetchApi).toHaveBeenCalledWith("chats/123")
      expect(result).toEqual(mockChat)
    })
  })

  describe("updateChatTitle", () => {
    it("should update a chat title", async () => {
      const mockUpdatedChat = { title: "New Title", messages: [] }
      ;(fetchApi as jest.Mock).mockResolvedValue(mockUpdatedChat)

      const result = await updateChatTitle("123", "New Title")

      expect(fetchApi).toHaveBeenCalledWith("chats/123", {
        method: "PUT",
        body: JSON.stringify({ title: "New Title" }),
      })
      expect(result).toEqual(mockUpdatedChat)
    })
  })

  describe("askQuestion", () => {
    it("should send a question without conversation ID for new chats", async () => {
      const mockResponse = { question: "Test?", answer: "Answer" }
      ;(fetchApi as jest.Mock).mockResolvedValue(mockResponse)

      const result = await askQuestion("Test?")

      expect(fetchApi).toHaveBeenCalledWith("ask", {
        method: "POST",
        body: JSON.stringify({ question: "Test?" }),
      })
      expect(result).toEqual(mockResponse)
    })

    it("should send a question with conversation ID for existing chats", async () => {
      const mockResponse = { question: "Test?", answer: "Answer" }
      ;(fetchApi as jest.Mock).mockResolvedValue(mockResponse)

      const result = await askQuestion("Test?", "123")

      expect(fetchApi).toHaveBeenCalledWith("ask", {
        method: "POST",
        body: JSON.stringify({ question: "Test?", conversation_id: "123" }),
      })
      expect(result).toEqual(mockResponse)
    })

    it("should not include conversation_id for new chat IDs", async () => {
      const mockResponse = { question: "Test?", answer: "Answer" }
      ;(fetchApi as jest.Mock).mockResolvedValue(mockResponse)

      const result = await askQuestion("Test?", "new-123")

      expect(fetchApi).toHaveBeenCalledWith("ask", {
        method: "POST",
        body: JSON.stringify({ question: "Test?" }),
      })
      expect(result).toEqual(mockResponse)
    })
  })
})
