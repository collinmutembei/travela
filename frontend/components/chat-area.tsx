"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "other"
  timestamp: Date
}

interface ChatAreaProps {
  chatId: string | null
}

export function ChatArea({ chatId }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Mock initial messages
  useEffect(() => {
    if (chatId) {
      // In a real app, you would fetch messages for the selected chat
      const mockMessages: Message[] = [
        {
          id: "1",
          content: "Hello there!",
          sender: "other",
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: "2",
          content: "Hi! How can I help you today?",
          sender: "user",
          timestamp: new Date(Date.now() - 3500000),
        },
        {
          id: "3",
          content: "I have a question about the new feature.",
          sender: "other",
          timestamp: new Date(Date.now() - 3400000),
        },
      ]

      setMessages(mockMessages)
    }
  }, [chatId])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !chatId) return

    const message: Message = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages([...messages, message])
    setNewMessage("")

    // Simulate a response after a short delay
    setTimeout(() => {
      const response: Message = {
        id: `msg-${Date.now() + 1}`,
        content: "Thanks for your message! This is a simulated response.",
        sender: "other",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, response])
    }, 1000)
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
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">{chatId.startsWith("new-") ? "New Conversation" : "Chat"}</h2>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send size={18} />
        </Button>
      </form>
    </div>
  )
}
