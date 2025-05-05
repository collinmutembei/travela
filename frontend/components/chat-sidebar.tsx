"use client"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { MessageSquarePlus, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import type { ChatSidebarProps } from "@/types"

export function ChatSidebar({
  chats,
  selectedChat,
  onSelectChat,
  onNewChat,
  onLogout,
  isLoading = false,
}: ChatSidebarProps) {
  // The useSidebar hook is now safely used within a SidebarProvider
  const { isMobile } = useSidebar()

  return (
    <>
      <SidebarTrigger className="fixed top-4 left-4 z-50 md:hidden" />

      <Sidebar className="border-r border-border z-20" collapsible="offcanvas">
        <SidebarHeader className="p-4 border-b">
          <Button onClick={onNewChat} className="w-full justify-start gap-2">
            <MessageSquarePlus size={18} />
            <span>New Chat</span>
          </Button>
        </SidebarHeader>

        <SidebarContent>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-pulse text-muted-foreground">Loading chats...</div>
              </div>
            ) : (
              <SidebarMenu>
                {chats.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No conversations yet</div>
                ) : (
                  chats.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton
                        isActive={chat.id === selectedChat}
                        onClick={() => onSelectChat(chat.id)}
                        className="flex flex-col items-start p-3 h-auto"
                      >
                        <div className="flex justify-between w-full">
                          <span className="font-medium">{chat.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground truncate w-full mt-1">{chat.lastMessage}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            )}
          </ScrollArea>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t flex flex-col gap-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          <Button variant="outline" onClick={onLogout} className="w-full justify-start gap-2">
            <LogOut size={18} />
            <span>Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
    </>
  )
}
