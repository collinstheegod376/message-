'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/appStore'
import { CURRENT_USER, MOCK_CONVERSATIONS, MOCK_MESSAGES } from '@/lib/mockData'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, setCurrentUser, setConversations, setMessages, currentUser } = useAppStore()

  useEffect(() => {
    // Dev mode: auto-login with mock data
    if (!isAuthenticated && process.env.NODE_ENV === 'development') {
      setCurrentUser(CURRENT_USER)
      setConversations(MOCK_CONVERSATIONS)
      Object.entries(MOCK_MESSAGES).forEach(([convId, msgs]) => setMessages(convId, msgs))
      return
    }

    if (!isAuthenticated) {
      router.push('/auth')
      return
    }

    // If authenticated, go to chat
    router.push('/chat')
  }, [isAuthenticated, router, setCurrentUser, setConversations, setMessages])

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-white/40 text-sm">Loading Shredder...</span>
      </div>
    </div>
  )
}
