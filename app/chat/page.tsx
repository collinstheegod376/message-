'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAppStore } from '@/store/appStore'
import { Sidebar } from '@/components/chat/Sidebar'
import { ConversationList } from '@/components/chat/ConversationList'
import { ChatArea } from '@/components/chat/ChatArea'
import { ContactInfo } from '@/components/chat/ContactInfo'
import { CallOverlay } from '@/components/call/CallOverlay'
import { supabase } from '@/lib/supabase/client'
import { getConversations, createConversation } from '@/lib/supabase/chat'

function ChatPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const targetUser = searchParams.get('u')
  
  const {
    isAuthenticated,
    currentUser,
    activeCall,
    activeConversationId,
    setActiveConversation,
    setConversations,
    addConversation,
    addMessage,
    updateConversationLastMessage,
    setActiveCall,
  } = useAppStore()
  
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync session and fetch conversations
  useEffect(() => {
    if (!mounted || !isAuthenticated || !currentUser) return

    const fetchInitialData = async () => {
      const convs = await getConversations(currentUser.id)
      setConversations(convs)

      // Handle targeted user from discover page
      if (targetUser) {
        const conv = await createConversation([currentUser.id, targetUser])
        if (conv) {
          addConversation(conv)
          setActiveConversation(conv.id)
        }
      }
    }

    fetchInitialData()

    // Real-time channel for and messages
    const channel = supabase
      .channel('chat-global')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        const newMsg = payload.new as any
        
        // Only care about messages for our conversations
        // (In a real app, you'd probably subscribe to more specific channels)
        addMessage(newMsg.conversation_id, newMsg)
        updateConversationLastMessage(newMsg.conversation_id, newMsg)
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversations' }, async (payload) => {
        // Handle new conversation creation (e.g. from the other side)
        const conversations = await getConversations(currentUser.id)
        setConversations(conversations)
      })
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'call_sessions',
        filter: `callee_id=eq.${currentUser.id}`
      }, (payload) => {
        const newCall = payload.new as any
        if (newCall.status === 'ringing') {
          setActiveCall(newCall)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mounted, isAuthenticated, currentUser, targetUser, setConversations, setActiveConversation, addConversation, addMessage, updateConversationLastMessage, setActiveCall])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth')
    }
  }, [mounted, isAuthenticated, router])

  if (!mounted) return null

  return (
    <div className="h-screen flex overflow-hidden bg-surface-50 dark:bg-surface-900 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 flex max-md:pb-[68px] md:ml-[240px] h-full overflow-hidden">
        <ConversationList />
        <ChatArea onToggleInfo={() => setShowContactInfo(!showContactInfo)} />
        {showContactInfo && activeConversationId && (
          <ContactInfo onClose={() => setShowContactInfo(false)} />
        )}
      </main>
      {activeCall && <CallOverlay />}
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageContent />
    </Suspense>
  )
}
