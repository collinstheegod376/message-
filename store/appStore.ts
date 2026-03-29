import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Conversation, Message, CallSession, TypingIndicator } from '@/types'

interface AppState {
  // Auth
  currentUser: User | null
  isAuthenticated: boolean
  setCurrentUser: (user: User | null) => void

  // Conversations
  conversations: Conversation[]
  activeConversationId: string | null
  setConversations: (convs: Conversation[]) => void
  addConversation: (conv: Conversation) => void
  setActiveConversation: (id: string | null) => void
  updateConversationLastMessage: (convId: string, msg: Message) => void

  // Messages
  messages: Record<string, Message[]>
  setMessages: (convId: string, msgs: Message[]) => void
  addMessage: (convId: string, msg: Message) => void
  updateMessageStatus: (convId: string, msgId: string, status: Message['status']) => void

  // Typing
  typingIndicators: TypingIndicator[]
  setTyping: (indicator: TypingIndicator) => void
  clearTyping: (convId: string, userId: string) => void

  // Calls
  activeCall: CallSession | null
  setActiveCall: (call: CallSession | null) => void

  // UI State
  isSidebarOpen: boolean
  isAnonymousMode: boolean
  isDarkMode: boolean
  toggleSidebar: () => void
  toggleAnonymousMode: () => void
  toggleDarkMode: () => void

  // Unread
  totalUnread: number
  setTotalUnread: (count: number) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      currentUser: null,
      isAuthenticated: false,
      setCurrentUser: (user) =>
        set({ currentUser: user, isAuthenticated: !!user }),

      // Conversations
      conversations: [],
      activeConversationId: null,
      setConversations: (convs) => set({ conversations: convs }),
      addConversation: (conv) =>
        set((s) => ({
          conversations: [conv, ...s.conversations.filter((c) => c.id !== conv.id)],
        })),
      setActiveConversation: (id) => set({ activeConversationId: id }),
      updateConversationLastMessage: (convId, msg) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convId ? { ...c, last_message: msg } : c
          ),
        })),

      // Messages
      messages: {},
      setMessages: (convId, msgs) =>
        set((s) => ({ messages: { ...s.messages, [convId]: msgs } })),
      addMessage: (convId, msg) =>
        set((s) => ({
          messages: {
            ...s.messages,
            [convId]: [...(s.messages[convId] || []), msg],
          },
        })),
      updateMessageStatus: (convId, msgId, status) =>
        set((s) => ({
          messages: {
            ...s.messages,
            [convId]: (s.messages[convId] || []).map((m) =>
              m.id === msgId ? { ...m, status } : m
            ),
          },
        })),

      // Typing
      typingIndicators: [],
      setTyping: (indicator) =>
        set((s) => ({
          typingIndicators: [
            ...s.typingIndicators.filter(
              (t) =>
                !(t.conversation_id === indicator.conversation_id &&
                  t.user_id === indicator.user_id)
            ),
            indicator,
          ],
        })),
      clearTyping: (convId, userId) =>
        set((s) => ({
          typingIndicators: s.typingIndicators.filter(
            (t) => !(t.conversation_id === convId && t.user_id === userId)
          ),
        })),

      // Calls
      activeCall: null,
      setActiveCall: (call) => set({ activeCall: call }),

      // UI State
      isSidebarOpen: true,
      isAnonymousMode: false,
      isDarkMode: true,
      toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
      toggleAnonymousMode: () =>
        set((s) => ({ isAnonymousMode: !s.isAnonymousMode })),
      toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),

      // Unread
      totalUnread: 0,
      setTotalUnread: (count) => set({ totalUnread: count }),
    }),
    {
      name: 'shredder-store',
      partialize: (s) => ({
        isDarkMode: s.isDarkMode,
        isAnonymousMode: s.isAnonymousMode,
      }),
    }
  )
)
