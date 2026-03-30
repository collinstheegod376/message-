'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/appStore'
import { Sidebar } from '@/components/chat/Sidebar'
import { ConversationList } from '@/components/chat/ConversationList'
import { ChatArea } from '@/components/chat/ChatArea'
import { ContactInfo } from '@/components/chat/ContactInfo'
import { CallOverlay } from '@/components/call/CallOverlay'

export default function ChatPage() {
  const router = useRouter()
  const {
    isAuthenticated,
    activeCall,
    activeConversationId,
  } = useAppStore()
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth')
    }
  }, [mounted, isAuthenticated, router])

  if (!mounted) return null

  return (
    <div className="h-screen flex overflow-hidden bg-surface-50 dark:bg-surface-900 transition-colors duration-300">
      {/* Sidebar Nav */}
      <Sidebar />

      {/* Main Area */}
      <main className="flex-1 flex max-md:pb-[68px] md:ml-[240px] h-full">
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
