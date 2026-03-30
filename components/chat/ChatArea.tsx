'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import {
  Video, Phone as PhoneIcon, MoreVertical, Send, Plus, Smile, Mic, Lock,
  CheckCheck, Check, Clock, Image as ImageIcon, Paperclip, MessageCircle
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { cn, formatMessageTime, getInitials, getAvatarColor, getExpiryTime } from '@/lib/utils'
import type { Message, CallSession } from '@/types'
import { getMessages, sendMessage } from '@/lib/supabase/chat'

export function ChatArea({ onToggleInfo }: { onToggleInfo: () => void }) {
  const {
    activeConversationId, conversations, messages, currentUser,
    addMessage, setMessages, updateConversationLastMessage, setActiveCall,
    typingIndicators, isAnonymousMode,
  } = useAppStore()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const conversation = conversations.find((c) => c.id === activeConversationId)
  const chatMessages = activeConversationId ? messages[activeConversationId] || [] : []
  const otherUser = conversation?.participants.find((p) => p.user_id !== currentUser?.id)?.user
  
  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) return

    const fetchMsgs = async () => {
      setLoading(true)
      const msgs = await getMessages(activeConversationId)
      setMessages(activeConversationId, msgs)
      setLoading(false)
    }

    fetchMsgs()
  }, [activeConversationId, setMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages.length])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px'
    }
  }, [text])

  const handleSend = async () => {
    if (!text.trim() || !activeConversationId || !currentUser) return

    const content = text.trim()
    setText('')

    // Optimistic update
    const tempId = `temp_${Date.now()}`
    const tempMsg: Message = {
      id: tempId,
      conversation_id: activeConversationId,
      sender_id: currentUser.id,
      content,
      type: 'text',
      status: 'sending',
      is_anonymous: isAnonymousMode,
      created_at: new Date().toISOString(),
      expires_at: getExpiryTime(),
    }
    addMessage(activeConversationId, tempMsg)

    // Real send
    const sentMsg = await sendMessage(activeConversationId, currentUser.id, content, {
      isAnonymous: isAnonymousMode
    })

    if (sentMsg) {
       // Replace temp message or just rely on real-time listener if it's fast enough
       // For now, let's just update the last message in store
       updateConversationLastMessage(activeConversationId, sentMsg)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const startCall = (type: 'audio' | 'video') => {
    if (!otherUser || !currentUser) return
    const call: CallSession = {
      id: `call_${Date.now()}`,
      room_name: `room_${Date.now()}`,
      caller_id: currentUser.id,
      callee_id: otherUser.id,
      type,
      status: 'ringing',
      started_at: new Date().toISOString(),
    }
    setActiveCall(call)
  }

  // Empty state
  if (!activeConversationId || !conversation) {
    return (
      <section className="flex-1 flex flex-col items-center justify-center bg-surface-50/50 dark:bg-surface-900/30 transition-colors duration-300">
        <div className="text-center space-y-6 animate-fade-in px-6">
          <div className="w-24 h-24 rounded-3xl bg-white dark:bg-white/5 flex items-center justify-center mx-auto shadow-xl border border-surface-200 dark:border-white/10">
            <MessageCircle className="w-12 h-12 text-brand-500/20" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl text-surface-900 dark:text-white mb-1">Your conversations</h2>
            <p className="text-sm text-surface-500 dark:text-white/30 max-w-[280px] mx-auto">Select a chat to start messaging securely with Shredder's end-to-end encryption.</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-surface-400 dark:text-white/10 text-[10px] font-bold uppercase tracking-widest bg-surface-100 dark:bg-white/5 py-2 px-4 rounded-full">
            <Lock className="w-3 h-3 text-brand-500/40" />
            <span>Secured • Self-Destructing</span>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="flex-1 flex flex-col bg-white dark:bg-surface-900/30 relative overflow-hidden transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 flex justify-between items-center px-6 py-4 glass-strong border-b border-surface-200 dark:border-white/5">
        <button onClick={onToggleInfo} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="relative">
            {otherUser?.avatar_url ? (
              <img src={otherUser.avatar_url} alt={otherUser.name} className="w-10 h-10 rounded-full avatar" />
            ) : (
              <div className={cn('w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold', getAvatarColor(otherUser?.name || conversation.name || 'U'))}>
                {getInitials(otherUser?.name || conversation.name || 'U')}
              </div>
            )}
            {otherUser?.is_online && <span className="online-dot" />}
          </div>
          <div>
            <h2 className="font-display font-bold text-base text-surface-900 dark:text-white">
              {conversation.name || otherUser?.name || 'Chat'}
            </h2>
            <p className={cn('text-[10px] font-bold tracking-widest uppercase mt-0.5', otherUser?.is_online ? 'text-emerald-500' : 'text-surface-400 dark:text-white/25')}>
              {otherUser?.is_online ? 'Active Now' : 'Offline'}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1.5">
          <button onClick={() => startCall('video')} className="p-2.5 rounded-xl text-surface-400 dark:text-white/40 hover:text-brand-500 dark:hover:text-white hover:bg-brand-50 dark:hover:bg-white/5 transition-all" title="Video call">
            <Video className="w-5 h-5" />
          </button>
          <button onClick={() => startCall('audio')} className="p-2.5 rounded-xl text-surface-400 dark:text-white/40 hover:text-brand-500 dark:hover:text-white hover:bg-brand-50 dark:hover:bg-white/5 transition-all" title="Audio call">
            <PhoneIcon className="w-5 h-5" />
          </button>
          <div className="h-5 w-px bg-surface-200 dark:bg-white/10 mx-1" />
          <button onClick={onToggleInfo} className="p-2.5 rounded-xl text-surface-400 dark:text-white/40 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-white/5 transition-all">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-none">
        {/* E2E encryption notice */}
        <div className="flex justify-center py-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-100 dark:bg-white/5 text-surface-500 dark:text-white/20 text-[10px] font-bold uppercase tracking-tighter shadow-sm">
            <Lock className="w-3 h-3 text-brand-500/40" />
            <span>End-to-end encrypted • Self-destructs 24h</span>
          </div>
        </div>

        {/* Date separator */}
        <div className="flex items-center justify-center py-2">
          <span className="px-4 py-1 rounded-full bg-surface-50 dark:bg-white/[0.02] text-[9px] font-bold text-surface-400 dark:text-white/10 uppercase tracking-[0.2em] border border-surface-200 dark:border-white/5">
            Today
          </span>
        </div>

        {chatMessages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMine={msg.sender_id === currentUser?.id}
            senderName={msg.sender_id === currentUser?.id ? currentUser.name : (otherUser?.name || 'User')}
          />
        ))}

        {/* Typing indicator */}
        {typingIndicators.some(t => t.conversation_id === activeConversationId && t.user_id !== currentUser?.id) && otherUser && (
          <div className="flex items-center gap-3 animate-fade-in group">
            <div className={cn('w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold shadow-md', getAvatarColor(otherUser.name))}>
              {getInitials(otherUser.name)}
            </div>
            <div className="bg-surface-100 dark:bg-white/5 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1.5 shadow-sm">
              <div className="typing-dot bg-brand-500" />
              <div className="typing-dot bg-brand-500" />
              <div className="typing-dot bg-brand-500" />
            </div>
            <span className="text-[10px] text-surface-400 dark:text-white/20 font-medium">{otherUser.name} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <footer className="p-4 bg-white dark:bg-transparent border-t border-surface-200 dark:border-white/5">
        <div className="max-w-4xl mx-auto flex items-end gap-2 bg-surface-100 dark:bg-white/5 p-2 rounded-2xl border border-surface-200 dark:border-white/10 shadow-inner">
          <div className="flex items-center gap-0.5 pb-1">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-200 dark:hover:bg-white/10 transition-colors text-surface-400 dark:text-white/30 hover:text-brand-500 dark:hover:text-white/50">
              <Plus className="w-5 h-5" />
            </button>
            <button className="hidden sm:flex w-10 h-10 items-center justify-center rounded-xl hover:bg-surface-200 dark:hover:bg-white/10 transition-colors text-surface-400 dark:text-white/30 hover:text-brand-500 dark:hover:text-white/50">
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Shred your message..."
            rows={1}
            className="flex-1 bg-transparent border-0 focus:ring-0 text-base py-2.5 px-3 resize-none max-h-40 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-white/20 outline-none"
          />

          <div className="flex items-center gap-1.5 pb-1 pr-1">
            <button className="hidden sm:flex w-10 h-10 items-center justify-center rounded-xl hover:bg-surface-200 dark:hover:bg-white/10 transition-colors text-surface-400 dark:text-white/30 hover:text-brand-500 dark:hover:text-white/50">
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className={cn(
                'w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-300',
                text.trim()
                  ? 'bg-brand-600 text-white shadow-xl shadow-brand-500/30 hover:bg-brand-500 active:scale-90'
                  : 'bg-surface-200 dark:bg-white/5 text-surface-400 dark:text-white/15 cursor-not-allowed'
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </footer>
    </section>
  )
}

function MessageBubble({
  message,
  isMine,
  senderName,
}: {
  message: Message
  isMine: boolean
  senderName: string
}) {
  const StatusIcon = () => {
    switch (message.status) {
      case 'sending': return <Clock className="w-3 h-3 text-white/20" />
      case 'sent': return <Check className="w-3 h-3 text-white/30" />
      case 'delivered': return <CheckCheck className="w-3 h-3 text-white/30" />
      case 'seen': return <CheckCheck className="w-3 h-3 text-brand-400" />
      default: return null
    }
  }

  if (isMine) {
    return (
      <div className="flex flex-col items-end gap-1 ml-auto max-w-[75%] animate-slide-up">
        <div className="bubble-sent px-4 py-3">
          <p className="text-sm leading-relaxed text-white">{message.content}</p>
        </div>
        <div className="flex items-center gap-1.5 mr-1">
          <span className="text-[10px] text-white/20">{formatMessageTime(message.created_at)}</span>
          <StatusIcon />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2.5 max-w-[75%] animate-slide-up">
      <div className={cn('w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mb-4', getAvatarColor(senderName))}>
        {message.is_anonymous ? '👻' : getInitials(senderName)}
      </div>
      <div className="space-y-1">
        <div className="bubble-received px-4 py-3">
          {message.is_anonymous && (
            <span className="text-[10px] text-accent font-medium mb-1 block">Anonymous</span>
          )}
          <p className="text-sm leading-relaxed text-white/90">{message.content}</p>
        </div>
        <span className="text-[10px] text-white/15 ml-1">{formatMessageTime(message.created_at)}</span>
      </div>
    </div>
  )
}
