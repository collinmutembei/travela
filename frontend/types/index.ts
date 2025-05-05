/**
 * Core application types
 */

// User related types
export interface User {
  id: string
  name: string
  avatar?: string
  email?: string
  phone: string
  status?: UserStatus
  createdAt: string
  updatedAt: string
}

export type UserStatus = "online" | "offline" | "away" | "busy"

// Authentication related types
export interface AuthResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: User
}

export interface OtpRequest {
  phone: string
}

export interface OtpVerification {
  grant_type: string
  username: string
  password: string // OTP code
}

// Chat related types
export interface ChatMessage {
  question: string
  answer: string
  timestamp: string
  conversation_id: string
}

export interface Chat {
  title: string
  updated_at: string
  messages: ChatMessage[]
}

export interface Conversation {
  id: string
  title: string
  lastMessage: string
  lastMessageTimestamp: string
  unreadCount: number
  isGroup: boolean
  createdAt: string
  updatedAt: string
}

// Ask endpoint types
export interface AskRequest {
  question: string
  conversation_id?: string
}

export interface AskResponse {
  question: string
  answer: string
  timestamp: string
  conversation_id: string
}

// Update chat title request
export interface UpdateChatTitleRequest {
  title: string
}

// API response types
export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

export interface ApiError {
  message: string
  code: string
  status: number
  details?: Record<string, any>
}

// Component prop types
export interface ChatSidebarProps {
  chats: Conversation[]
  selectedChat: string | null
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  onLogout: () => void
  isLoading?: boolean
}

export interface ChatAreaProps {
  chatId: string | null
}

export interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  numInputs: number
}

export interface AskFormProps {
  onAskComplete?: (response: AskResponse) => void
  conversationId?: string
}

// Theme related types
export type Theme = "light" | "dark" | "system"
