"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatArea } from "@/components/chat-area"
import { SidebarProvider } from "@/components/ui/sidebar"

interface Chat {
  id: string
  title: string
  lastMessage: string
  timestamp: string
}

export default function ChatPage() {
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth")
      return
    }

    // Mock data for chats
    const mockChats: Chat[] = [
      {
        id: "1",
        title: "Project Discussion",
        lastMessage: "Let's schedule a meeting tomorrow",
        timestamp: "2025-05-02T14:30:00Z",
      },
      {
        id: "2",
        title: "Team Updates",
        lastMessage: "The new feature is ready for testing",
        timestamp: "2025-05-02T10:15:00Z",
      },
      {
        id: "3",
        title: "Support Chat",
        lastMessage: "Thank you for your help!",
        timestamp: "2025-05-01T18:45:00Z",
      },
    ]

    setChats(mockChats)
    setSelectedChat(mockChats[0].id)
    setIsLoading(false)
  }, [router])

  const handleNewChat = () => {
    const newChat: Chat = {
      id: `new-${Date.now()}`,
      title: "New Conversation",
      lastMessage: "Start typing to begin the conversation",
      timestamp: new Date().toISOString(),
    }

    setChats([newChat, ...chats])
    setSelectedChat(newChat.id)
  }

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/auth")
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <ChatSidebar
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onLogout={handleLogout}
        />
        <div className="flex-1 h-full overflow-hidden">
          <ChatArea chatId={selectedChat} />
        </div>
      </div>
    </SidebarProvider>
  )
}
