'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import {
  Video, Phone as PhoneIcon, MoreVertical, Send, Plus, Smile, Mic, Lock,
  CheckCheck, Check, Clock, Image as ImageIcon, Paperclip, MessageCircle
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { cn, formatMessageTime, getInitials, getAvatarColor, getExpiryTime } from '@/lib/utils'
import type { Message, CallSession } from '@/types'

export function ChatArea({ onToggleInfo }: { onToggleInfo: () => void }) {
  const {
    activeConversationId, conversations, messages, currentUser,
    addMessage, updateConversationLastMessage, setActiveCall,
    typingIndicators, isAnonymousMode,
  } = useAppStore()
  const [text, setText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const conversation = conversations.find((c) => c.id === activeConversationId)
  const chatMessages = activeConversationId ? messages[activeConversationId] || [] : []
  const otherUser = conversation?.participants.find((p) => p.user_id !== currentUser?.id)?.user
  const typing = typingIndicators.filter((t) => t.conversation_id === activeConversationId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages.length])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px'
    }
  }, [text])

  // Simulate typing response
  useEffect(() => {
    if (isTyping && activeConversationId) {
      const timeout = setTimeout(() => setIsTyping(false), 3000)
      return () => clearTimeout(timeout)
    }
  }, [isTyping, activeConversationId])

  const handleSend = () => {
    if (!text.trim() || !activeConversationId || !currentUser) return

    const msg: Message = {
      id: `msg_${Date.now()}`,
      conversation_id: activeConversationId,
      sender_id: currentUser.id,
      content: text.trim(),
      type: 'text',
      status: 'sent',
      is_anonymous: isAnonymousMode,
      created_at: new Date().toISOString(),
      expires_at: getExpiryTime(),
    }

    addMessage(activeConversationId, msg)
    updateConversationLastMessage(activeConversationId, msg)
    setText('')
    setIsTyping(true)

    // Simulate reply after delay
    if (otherUser) {
      setTimeout(() => {
        const replies = [
          'Got it! Let me check on that.',
          'That sounds great! 🔥',
          'Interesting, tell me more...',
          'On it! Will get back to you soon.',
          'Nice work! The design looks premium.',
          "Let's discuss this more in our next call.",
        ]
        const reply: Message = {
          id: `msg_${Date.now() + 1}`,
          conversation_id: activeConversationId,
          sender_id: otherUser.id,
          content: replies[Math.floor(Math.random() * replies.length)],
          type: 'text',
          status: 'delivered',
          is_anonymous: false,
          created_at: new Date().toISOString(),
          expires_at: getExpiryTime(),
        }
        addMessage(activeConversationId, reply)
        updateConversationLastMessage(activeConversationId, reply)
        setIsTyping(false)
      }, 2000 + Math.random() * 2000)
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
      <section className="flex-1 flex flex-col items-center justify-center bg-surface-900/30">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto">
            <MessageCircle className="w-10 h-10 text-white/10" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white/20 mb-1">Select a conversation</h2>
            <p className="text-sm text-white/10">Choose a chat to start messaging</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-white/10 text-xs">
            <Lock className="w-3 h-3" />
            <span>End-to-end encrypted • Messages self-destruct in 24h</span>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="flex-1 flex flex-col bg-surface-900/30 relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 flex justify-between items-center px-6 py-3 glass-strong border-b border-white/5">
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
            <h2 className="font-display font-bold text-base text-white">
              {conversation.name || otherUser?.name || 'Chat'}
            </h2>
            <p className={cn('text-[11px] font-semibold tracking-wide uppercase', otherUser?.is_online ? 'text-emerald-400' : 'text-white/25')}>
              {otherUser?.is_online ? 'Active Now' : 'Offline'}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1">
          <button onClick={() => startCall('video')} className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all" title="Video call">
            <Video className="w-5 h-5" />
          </button>
          <button onClick={() => startCall('audio')} className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all" title="Audio call">
            <PhoneIcon className="w-5 h-5" />
          </button>
          <div className="h-5 w-px bg-white/10 mx-1" />
          <button onClick={onToggleInfo} className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-none">
        {/* E2E encryption notice */}
        <div className="flex justify-center py-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-white/20 text-[10px]">
            <Lock className="w-3 h-3" />
            <span>Messages are end-to-end encrypted and self-destruct in 24h</span>
          </div>
        </div>

        {/* Date separator */}
        <div className="flex items-center justify-center">
          <span className="px-4 py-1 rounded-full bg-white/5 text-[10px] font-bold text-white/20 uppercase tracking-widest">
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
        {isTyping && otherUser && (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className={cn('w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold', getAvatarColor(otherUser.name))}>
              {getInitials(otherUser.name)}
            </div>
            <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1.5">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
            <span className="text-[10px] text-white/20 italic">{otherUser.name} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <footer className="p-4 glass-light border-t border-white/5">
        <div className="max-w-4xl mx-auto flex items-end gap-2 bg-white/5 p-2 rounded-2xl">
          <div className="flex items-center gap-0.5 pb-1">
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/30 hover:text-white/50">
              <Plus className="w-5 h-5" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/30 hover:text-white/50">
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 bg-transparent border-0 focus:ring-0 text-sm py-2.5 px-2 resize-none max-h-32 text-white placeholder-white/20 outline-none"
          />

          <div className="flex items-center gap-0.5 pb-1">
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/30 hover:text-white/50">
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className={cn(
                'w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200',
                text.trim()
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-400 active:scale-95'
                  : 'bg-white/5 text-white/15 cursor-not-allowed'
              )}
            >
              <Send className="w-4 h-4" />
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
