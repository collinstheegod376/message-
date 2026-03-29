'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/appStore'
import { CURRENT_USER, MOCK_CONVERSATIONS, MOCK_MESSAGES } from '@/lib/mockData'
import { Sidebar } from '@/components/chat/Sidebar'
import { ConversationList } from '@/components/chat/ConversationList'
import { ChatArea } from '@/components/chat/ChatArea'
import { ContactInfo } from '@/components/chat/ContactInfo'
import { CallOverlay } from '@/components/call/CallOverlay'

export default function ChatPage() {
  const router = useRouter()
  const {
    isAuthenticated,
    setCurrentUser,
    setConversations,
    setMessages,
    activeCall,
    activeConversationId,
  } = useAppStore()
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Dev mode: auto-load mock data
    if (process.env.NODE_ENV === 'development' && !isAuthenticated) {
      setCurrentUser(CURRENT_USER)
      setConversations(MOCK_CONVERSATIONS)
      Object.entries(MOCK_MESSAGES).forEach(([convId, msgs]) => setMessages(convId, msgs))
    }
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated && process.env.NODE_ENV !== 'development') {
      router.push('/auth')
    }
  }, [mounted, isAuthenticated, router])

  if (!mounted) return null

  return (
    <div className="h-screen flex overflow-hidden bg-surface-900">
      {/* Sidebar Nav */}
      <Sidebar />

      {/* Main Area */}
      <main className="flex-1 flex ml-[72px] md:ml-[240px] h-full">
        {/* Chat List */}
        <ConversationList />

        {/* Active Chat */}
        <ChatArea onToggleInfo={() => setShowContactInfo(!showContactInfo)} />

        {/* Contact Info Panel */}
        {showContactInfo && activeConversationId && (
          <ContactInfo onClose={() => setShowContactInfo(false)} />
        )}
      </main>

      {/* Call Overlay */}
      {activeCall && <CallOverlay />}
    </div>
  )
}
