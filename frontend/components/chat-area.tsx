"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Edit2, Check } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getChat, askQuestion, updateChatTitle } from "@/lib/chat-service"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import type { ChatAreaProps, Chat } from "@/types"

export function ChatArea({ chatId }: ChatAreaProps) {
  const [chat, setChat] = useState<Chat | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Fetch messages for the selected chat
  useEffect(() => {
    if (chatId && !chatId.startsWith("New Chat")) {
      setIsLoading(true)

      getChat(chatId)
        .then((data) => {
          setChat(data)
          setNewTitle(data.title)
        })
        .catch((error) => {
          console.error("Failed to fetch chat:", error)
          toast({
            title: "Error",
            description: "Failed to load chat messages. Please try again.",
            variant: "destructive",
          })
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else if (chatId && chatId.startsWith("New Chat")) {
      // Initialize an empty chat for new conversations
      setChat({
        title: "New Conversation",
        updated_at: new Date().toISOString(),
        messages: [],
      })
      setNewTitle("New Conversation")
    }
  }, [chatId])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [chat?.messages])

  // Focus on title input when editing
  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [editingTitle])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !chatId) return

    setIsSending(true)

    try {
      const response = await askQuestion(newMessage.trim(), chatId)

      // Update the chat with the new message
      setChat((prevChat) => {
        if (!prevChat) {
          return {
            title: response.question.substring(0, 30) + (response.question.length > 30 ? "..." : ""),
            updated_at: response.timestamp,
            messages: [response],
          }
        }

        return {
          ...prevChat,
          updated_at: response.timestamp,
          messages: [...prevChat.messages, response],
        }
      })

      setNewMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleEditTitle = async () => {
    if (!chatId || chatId.startsWith("New Chat") || !chat) return

    if (editingTitle) {
      if (newTitle.trim() === "") {
        setNewTitle(chat.title)
        setEditingTitle(false)
        return
      }

      if (newTitle !== chat.title) {
        try {
          const updatedChat = await updateChatTitle(chatId, newTitle)
          setChat((prevChat) => (prevChat ? { ...prevChat, title: updatedChat.title } : null))
          toast({
            title: "Success",
            description: "Chat title updated successfully",
          })
        } catch (error) {
          console.error("Failed to update chat title:", error)
          toast({
            title: "Error",
            description: "Failed to update chat title. Please try again.",
            variant: "destructive",
          })
          setNewTitle(chat.title)
        }
      }
    }

    setEditingTitle(!editingTitle)
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      return timestamp
    }
  }

  if (!chatId) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">Select a chat to start messaging</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-4 border-b flex items-center justify-between">
        {editingTitle ? (
          <div className="flex-1 flex items-center gap-2">
            <Input
              ref={titleInputRef}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-8"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEditTitle()
                } else if (e.key === "Escape") {
                  setNewTitle(chat?.title || "")
                  setEditingTitle(false)
                }
              }}
            />
            <Button size="sm" variant="ghost" onClick={handleEditTitle}>
              <Check size={16} />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">
              {chat?.title || (chatId.startsWith("New Chat") ? "New Conversation" : "Chat")}
            </h2>
            <Button size="sm" variant="ghost" onClick={handleEditTitle} className="h-8 w-8 p-0">
              <Edit2 size={16} />
              <span className="sr-only">Edit title</span>
            </Button>
          </div>
        )}
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading messages...</div>
          </div>
        ) : (
          <div className="space-y-8">
            {!chat || chat.messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No messages yet. Start the conversation!</div>
            ) : (
              chat.messages.map((message, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-lg p-3 bg-primary text-primary-foreground">
                      <MarkdownRenderer content={message.question} />
                      <p className="text-xs opacity-70 mt-1">{formatTimestamp(message.timestamp)}</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-secondary text-secondary-foreground">
                      <MarkdownRenderer content={message.answer} />
                      <p className="text-xs opacity-70 mt-1">{formatTimestamp(message.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
          disabled={isLoading || isSending}
        />
        <Button type="submit" size="icon" disabled={isLoading || isSending || !newMessage.trim()}>
          <Send size={18} />
        </Button>
      </form>
    </div>
  )
}
