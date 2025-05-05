import { fetchApi } from "./api"
import type { AskRequest, AskResponse, Chat, Conversation, UpdateChatTitleRequest } from "@/types"

/**
 * Fetch all conversations for the authenticated user
 */
export async function getConversations(): Promise<Conversation[]> {
  return fetchApi<Conversation[]>("chats")
}

/**
 * Fetch a specific chat by ID
 */
export async function getChat(conversationId: string): Promise<Chat> {
  return fetchApi<Chat>(`chats/${conversationId}`)
}

/**
 * Update a chat title
 */
export async function updateChatTitle(conversationId: string, title: string): Promise<Chat> {
  const request: UpdateChatTitleRequest = { title }
  return fetchApi<Chat>(`chats/${conversationId}`, {
    method: "PUT",
    body: JSON.stringify(request),
  })
}

/**
 * Ask a question and get an answer
 * If conversationId is provided, the question will be added to that conversation
 * If not, a new conversation will be created
 */
export async function askQuestion(question: string, conversationId?: string): Promise<AskResponse> {
  const request: AskRequest = { question }

  if (conversationId && !conversationId.startsWith("New Chat")) {
    request.conversation_id = conversationId
  }

  return fetchApi<AskResponse>("ask", {
    method: "POST",
    body: JSON.stringify(request),
  })
}
