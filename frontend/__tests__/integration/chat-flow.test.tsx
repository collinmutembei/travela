import { render, screen, fireEvent, waitFor } from "../test-utils"
import ChatPage from "@/app/chat/page"
import { useRouter } from "next/navigation"
import * as chatService from "@/lib/chat-service"
import { mockConversations, mockChat } from "../test-utils"

// Mock the router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

// Mock the chat service
jest.mock("@/lib/chat-service", () => ({
  getConversations: jest.fn(),
  getChat: jest.fn(),
  askQuestion: jest.fn(),
  updateChatTitle: jest.fn(),
}))

// Mock the toast component
jest.mock("@/components/ui/use-toast", () => ({
  toast: jest.fn(),
}))

describe("Chat Flow Integration", () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(chatService.getConversations as jest.Mock).mockResolvedValue(mockConversations)
    ;(chatService.getChat as jest.Mock).mockResolvedValue(mockChat)
    ;(chatService.askQuestion as jest.Mock).mockImplementation((question, conversationId) =>
      Promise.resolve({
        question,
        answer: `Mock answer to: ${question}`,
        timestamp: new Date().toISOString(),
        conversation_id: conversationId || "new-conversation",
      }),
    )
    ;(chatService.updateChatTitle as jest.Mock).mockImplementation((id, title) =>
      Promise.resolve({
        ...mockChat,
        title,
      }),
    )

    // Set up localStorage for authentication
    localStorage.setItem("token", "test-token")
  })

  it("redirects to auth if not authenticated", async () => {
    localStorage.removeItem("token")

    render(<ChatPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth")
    })
  })

  it("loads conversations and selects the first one", async () => {
    render(<ChatPage />)

    await waitFor(() => {
      expect(chatService.getConversations).toHaveBeenCalled()
      expect(chatService.getChat).toHaveBeenCalledWith("1")
    })

    expect(screen.getByText("Chat 1")).toBeInTheDocument()
    expect(screen.getByText("This is the last message")).toBeInTheDocument()

    // First chat should be selected and its messages loaded
    expect(screen.getByText("Test Chat")).toBeInTheDocument()
    expect(screen.getByText("Hello, how are you?")).toBeInTheDocument()
    expect(screen.getByText("I am doing well, thank you for asking!")).toBeInTheDocument()
  })

  it("allows switching between conversations", async () => {
    render(<ChatPage />)

    await waitFor(() => {
      expect(screen.getByText("Chat 1")).toBeInTheDocument()
    })

    // Click on the second conversation
    fireEvent.click(screen.getByText("Chat 2"))

    await waitFor(() => {
      expect(chatService.getChat).toHaveBeenCalledWith("2")
    })
  })

  it("allows creating a new chat", async () => {
    render(<ChatPage />)

    await waitFor(() => {
      expect(screen.getByText("Chat 1")).toBeInTheDocument()
    })

    // Click on New Chat button
    fireEvent.click(screen.getByText("New Chat"))

    await waitFor(() => {
      expect(screen.getByText("New Conversation")).toBeInTheDocument()
      expect(screen.getByText("No messages yet. Start the conversation!")).toBeInTheDocument()
    })
  })

  it("allows sending messages in a chat", async () => {
    render(<ChatPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Chat")).toBeInTheDocument()
    })

    // Type and send a message
    const input = screen.getByPlaceholderText("Type your message...")
    fireEvent.change(input, { target: { value: "Hello there!" } })

    const sendButton = screen.getByRole("button", { name: "" }) // Send button has no text, just an icon
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(chatService.askQuestion).toHaveBeenCalledWith("Hello there!", "1")
      expect(screen.getByText("Hello there!")).toBeInTheDocument()
      expect(screen.getByText("Mock answer to: Hello there!")).toBeInTheDocument()
    })
  })

  it("allows editing the chat title", async () => {
    render(<ChatPage />)

    await waitFor(() => {
      expect(screen.getByText("Test Chat")).toBeInTheDocument()
    })

    // Click the edit button
    const editButton = screen.getByRole("button", { name: "Edit title" })
    fireEvent.click(editButton)

    // Edit the title
    const titleInput = screen.getByRole("textbox")
    fireEvent.change(titleInput, { target: { value: "Updated Chat Title" } })

    // Save the title
    const saveButton = screen.getByRole("button", { name: "" }) // Check icon button
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(chatService.updateChatTitle).toHaveBeenCalledWith("1", "Updated Chat Title")
      expect(screen.getByText("Updated Chat Title")).toBeInTheDocument()
    })
  })

  it("allows logging out", async () => {
    render(<ChatPage />)

    await waitFor(() => {
      expect(screen.getByText("Chat 1")).toBeInTheDocument()
    })

    // Click the logout button
    fireEvent.click(screen.getByText("Logout"))

    expect(localStorage.getItem("token")).toBeNull()
    expect(mockPush).toHaveBeenCalledWith("/auth")
  })
})
