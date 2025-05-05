import { render, screen, fireEvent, waitFor } from "../test-utils"
import { ChatArea } from "@/components/chat-area"
import * as chatService from "@/lib/chat-service"
import { mockChat } from "../test-utils"

// Mock the chat service
jest.mock("@/lib/chat-service", () => ({
  getChat: jest.fn(),
  askQuestion: jest.fn(),
  updateChatTitle: jest.fn(),
}))

// Mock the toast component
jest.mock("@/components/ui/use-toast", () => ({
  toast: jest.fn(),
}))

describe("ChatArea Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
  })

  it("renders empty state when no chat is selected", () => {
    render(<ChatArea chatId={null} />)
    expect(screen.getByText("Select a chat to start messaging")).toBeInTheDocument()
  })

  it("renders loading state while fetching chat", async () => {
    render(<ChatArea chatId="1" />)
    expect(screen.getByText("Loading messages...")).toBeInTheDocument()
  })

  it("renders chat messages when loaded", async () => {
    render(<ChatArea chatId="1" />)

    await waitFor(() => {
      expect(screen.queryByText("Loading messages...")).not.toBeInTheDocument()
    })

    expect(screen.getByText("Hello, how are you?")).toBeInTheDocument()
    expect(screen.getByText("I am doing well, thank you for asking!")).toBeInTheDocument()
    expect(screen.getByText("What is the weather like today?")).toBeInTheDocument()
    expect(screen.getByText("It is sunny and warm.")).toBeInTheDocument()
  })

  it("renders empty chat for new conversations", async () => {
    render(<ChatArea chatId="new-123" />)

    await waitFor(() => {
      expect(screen.queryByText("Loading messages...")).not.toBeInTheDocument()
    })

    expect(screen.getByText("New Conversation")).toBeInTheDocument()
    expect(screen.getByText("No messages yet. Start the conversation!")).toBeInTheDocument()
  })

  it("sends a message when the form is submitted", async () => {
    render(<ChatArea chatId="1" />)

    await waitFor(() => {
      expect(screen.queryByText("Loading messages...")).not.toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText("Type your message...")
    const sendButton = screen.getByRole("button", { name: /send/i })

    fireEvent.change(input, { target: { value: "Test message" } })
    fireEvent.click(sendButton)

    expect(chatService.askQuestion).toHaveBeenCalledWith("Test message", "1")

    await waitFor(() => {
      expect(screen.getByText("Test message")).toBeInTheDocument()
      expect(screen.getByText("Mock answer to: Test message")).toBeInTheDocument()
    })
  })

  it("allows editing the chat title", async () => {
    render(<ChatArea chatId="1" />)

    await waitFor(() => {
      expect(screen.queryByText("Loading messages...")).not.toBeInTheDocument()
    })

    // Find and click the edit button (it has a screen reader text)
    const editButton = screen.getByRole("button", { name: /edit title/i })
    fireEvent.click(editButton)

    // Find the input and change its value
    const titleInput = screen.getByRole("textbox")
    fireEvent.change(titleInput, { target: { value: "Updated Title" } })

    // Find and click the save button
    const saveButton = screen.getByRole("button", { name: "" }) // The Check icon button
    fireEvent.click(saveButton)

    expect(chatService.updateChatTitle).toHaveBeenCalledWith("1", "Updated Title")

    await waitFor(() => {
      expect(screen.getByText("Updated Title")).toBeInTheDocument()
    })
  })

  it("handles API errors when fetching chat", async () => {
    ;(chatService.getChat as jest.Mock).mockRejectedValue(new Error("Failed to fetch chat"))

    render(<ChatArea chatId="1" />)

    await waitFor(() => {
      expect(screen.queryByText("Loading messages...")).not.toBeInTheDocument()
    })

    // Check that error handling is working
    expect(screen.getByText("No messages yet. Start the conversation!")).toBeInTheDocument()
  })

  it("handles API errors when sending messages", async () => {
    render(<ChatArea chatId="1" />)

    await waitFor(() => {
      expect(screen.queryByText("Loading messages...")).not.toBeInTheDocument()
    })
    ;(chatService.askQuestion as jest.Mock).mockRejectedValue(new Error("Failed to send message"))

    const input = screen.getByPlaceholderText("Type your message...")
    const sendButton = screen.getByRole("button", { name: /send/i })

    fireEvent.change(input, { target: { value: "Test message" } })
    fireEvent.click(sendButton)

    // The message should not be added to the chat
    await waitFor(() => {
      expect(screen.queryByText("Test message")).not.toBeInTheDocument()
    })
  })
})
