"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatArea } from "@/components/chat-area"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/components/ui/use-toast"
import { getConversations } from "@/lib/chat-service"
import type { Conversation } from "@/types"

export default function ChatPage() {
  const router = useRouter()
  const [chats, setChats] = useState<Conversation[]>([])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth")
      return
    }

    // Fetch conversations
    fetchConversations()
  }, [router])

  const fetchConversations = async () => {
    setIsLoading(true)
    try {
      const conversations = await getConversations()
      setChats(conversations)

      // Select the first conversation if available
      if (conversations.length > 0 && !selectedChat) {
        setSelectedChat(conversations[0].id)
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error)
      toast({
        title: "Error",
        description: "Failed to load conversations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    const newChatId = `New Chat`
    setSelectedChat(newChatId)
  }

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/auth")
  }

  return (
    <SidebarProvider>
      <Toaster />
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <ChatSidebar
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onLogout={handleLogout}
          isLoading={isLoading}
        />
        <div className="flex-1 h-full overflow-hidden">
          <ChatArea chatId={selectedChat} />
        </div>
      </div>
    </SidebarProvider>
  )
}
