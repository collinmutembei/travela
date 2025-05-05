import { render, screen, fireEvent } from "../test-utils"
import { ChatSidebar } from "@/components/chat-sidebar"
import { mockConversations } from "../test-utils"
import { SidebarProvider } from "@/components/ui/sidebar"

// Mock the useSidebar hook
jest.mock("@/components/ui/sidebar", () => {
  const actual = jest.requireActual("@/components/ui/sidebar")
  return {
    ...actual,
    useSidebar: () => ({
      isMobile: false,
      state: "expanded",
      open: true,
      setOpen: jest.fn(),
      openMobile: false,
      setOpenMobile: jest.fn(),
      toggleSidebar: jest.fn(),
    }),
  }
})

describe("ChatSidebar Component", () => {
  const mockSelectChat = jest.fn()
  const mockNewChat = jest.fn()
  const mockLogout = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders the sidebar with conversations", () => {
    render(
      <SidebarProvider>
        <ChatSidebar
          chats={mockConversations}
          selectedChat="1"
          onSelectChat={mockSelectChat}
          onNewChat={mockNewChat}
          onLogout={mockLogout}
        />
      </SidebarProvider>,
    )

    // Check if the "New Chat" button is rendered
    expect(screen.getByText("New Chat")).toBeInTheDocument()

    // Check if conversations are rendered
    expect(screen.getByText("Chat 1")).toBeInTheDocument()
    expect(screen.getByText("Chat 2")).toBeInTheDocument() // Default title format

    // Check if last messages are rendered
    expect(screen.getByText("This is the last message")).toBeInTheDocument()
    expect(screen.getByText("Another last message")).toBeInTheDocument()
  })

  it("shows loading state when isLoading is true", () => {
    render(
      <SidebarProvider>
        <ChatSidebar
          chats={[]}
          selectedChat={null}
          onSelectChat={mockSelectChat}
          onNewChat={mockNewChat}
          onLogout={mockLogout}
          isLoading={true}
        />
      </SidebarProvider>,
    )

    expect(screen.getByText("Loading chats...")).toBeInTheDocument()
  })

  it("shows empty state when no conversations are available", () => {
    render(
      <SidebarProvider>
        <ChatSidebar
          chats={[]}
          selectedChat={null}
          onSelectChat={mockSelectChat}
          onNewChat={mockNewChat}
          onLogout={mockLogout}
        />
      </SidebarProvider>,
    )

    expect(screen.getByText("No conversations yet")).toBeInTheDocument()
  })

  it("calls onSelectChat when a conversation is clicked", () => {
    render(
      <SidebarProvider>
        <ChatSidebar
          chats={mockConversations}
          selectedChat={null}
          onSelectChat={mockSelectChat}
          onNewChat={mockNewChat}
          onLogout={mockLogout}
        />
      </SidebarProvider>,
    )

    fireEvent.click(screen.getByText("Chat 1"))
    expect(mockSelectChat).toHaveBeenCalledWith("1")
  })

  it("calls onNewChat when the New Chat button is clicked", () => {
    render(
      <SidebarProvider>
        <ChatSidebar
          chats={mockConversations}
          selectedChat={null}
          onSelectChat={mockSelectChat}
          onNewChat={mockNewChat}
          onLogout={mockLogout}
        />
      </SidebarProvider>,
    )

    fireEvent.click(screen.getByText("New Chat"))
    expect(mockNewChat).toHaveBeenCalled()
  })

  it("calls onLogout when the Logout button is clicked", () => {
    render(
      <SidebarProvider>
        <ChatSidebar
          chats={mockConversations}
          selectedChat={null}
          onSelectChat={mockSelectChat}
          onNewChat={mockNewChat}
          onLogout={mockLogout}
        />
      </SidebarProvider>,
    )

    fireEvent.click(screen.getByText("Logout"))
    expect(mockLogout).toHaveBeenCalled()
  })
})
