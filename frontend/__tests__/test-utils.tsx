import type React from "react"
import type { ReactElement } from "react"
import { render, type RenderOptions } from "@testing-library/react"
import { ThemeProvider } from "@/components/theme-provider"
import { jest } from "@jest/globals"

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="chat-theme">
      {children}
    </ThemeProvider>
  )
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options })

// Mock API response data
export const mockConversations = [
  {
    id: "1",
    title: "Chat 1",
    lastMessage: "This is the last message",
    lastMessageTimestamp: "2023-05-01T12:00:00Z",
    unreadCount: 0,
    isGroup: false,
    createdAt: "2023-05-01T10:00:00Z",
    updatedAt: "2023-05-01T12:00:00Z",
  },
  {
    id: "2",
    title: "", // Testing default title format
    lastMessage: "Another last message",
    lastMessageTimestamp: "2023-05-02T14:30:00Z",
    unreadCount: 2,
    isGroup: false,
    createdAt: "2023-05-02T10:00:00Z",
    updatedAt: "2023-05-02T14:30:00Z",
  },
]

// Update mockChat to have consistent conversation_id
export const mockChat = {
  title: "Test Chat",
  updated_at: "2023-05-01T12:00:00Z",
  messages: [
    {
      question: "Hello, how are you?",
      answer: "I am doing well, thank you for asking!",
      timestamp: "2023-05-01T11:55:00Z",
      conversation_id: "1",
    },
    {
      question: "What is the weather like today?",
      answer: "It is sunny and warm.",
      timestamp: "2023-05-01T12:00:00Z",
      conversation_id: "1",
    },
  ],
}

// Update mockApi to ensure consistent conversation_id
export const mockApi = {
  getConversations: jest.fn().mockResolvedValue(mockConversations),
  getChat: jest.fn().mockResolvedValue(mockChat),
  askQuestion: jest.fn().mockImplementation((question, conversationId) =>
    Promise.resolve({
      question,
      answer: `Mock answer to: ${question}`,
      timestamp: new Date().toISOString(),
      conversation_id: conversationId || "new-conversation",
    }),
  ),
  updateChatTitle: jest.fn().mockImplementation((conversationId, title) =>
    Promise.resolve({
      ...mockChat,
      title,
    }),
  ),
}

// Re-export everything from RTL
export * from "@testing-library/react"
export { customRender as render }
