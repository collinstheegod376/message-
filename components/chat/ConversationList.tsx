'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { cn, formatConversationTime, getInitials, getAvatarColor, truncate } from '@/lib/utils'
import type { Conversation } from '@/types'

export function ConversationList() {
  const { conversations, activeConversationId, setActiveConversation, currentUser } = useAppStore()
  const [search, setSearch] = useState('')

  const filtered = conversations.filter((c) => {
    if (!search) return true
    const name = getConversationName(c, currentUser?.id || '')
    return name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <section className="w-80 flex flex-col border-r border-white/5 bg-surface-900/50 flex-shrink-0">
      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-white/5 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5 scrollbar-none">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/20">
            <Search className="w-8 h-8 mb-2" />
            <p className="text-sm">No conversations found</p>
          </div>
        ) : (
          filtered.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={activeConversationId === conv.id}
              currentUserId={currentUser?.id || ''}
              onClick={() => setActiveConversation(conv.id)}
            />
          ))
        )}
      </div>
    </section>
  )
}

function ConversationItem({
  conversation,
  isActive,
  currentUserId,
  onClick,
}: {
  conversation: Conversation
  isActive: boolean
  currentUserId: string
  onClick: () => void
}) {
  const name = getConversationName(conversation, currentUserId)
  const otherUser = conversation.participants.find((p) => p.user_id !== currentUserId)?.user
  const isOnline = otherUser?.is_online ?? false

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left group',
        isActive
          ? 'bg-brand-500/10 border-l-4 border-brand-500'
          : 'hover:bg-white/5 border-l-4 border-transparent'
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {otherUser?.avatar_url ? (
          <img src={otherUser.avatar_url} alt={name} className="w-11 h-11 rounded-full avatar" />
        ) : (
          <div
            className={cn(
              'w-11 h-11 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold',
              getAvatarColor(name)
            )}
          >
            {getInitials(name)}
          </div>
        )}
        {isOnline && <span className="online-dot" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <h3 className={cn('text-sm font-semibold truncate', isActive ? 'text-white' : 'text-white/80')}>
            {name}
          </h3>
          {conversation.last_message && (
            <span className={cn('text-[10px] flex-shrink-0', isActive ? 'text-brand-400' : 'text-white/25')}>
              {formatConversationTime(conversation.last_message.created_at)}
            </span>
          )}
        </div>
        {conversation.last_message && (
          <p className="text-xs text-white/30 truncate">
            {conversation.last_message.sender_id === currentUserId && (
              <span className="text-white/40">You: </span>
            )}
            {truncate(conversation.last_message.content, 40)}
          </p>
        )}
      </div>

      {/* Unread Badge */}
      {conversation.unread_count > 0 && (
        <span className="badge flex-shrink-0">{conversation.unread_count}</span>
      )}
    </button>
  )
}

function getConversationName(conv: Conversation, currentUserId: string): string {
  if (conv.name) return conv.name
  const other = conv.participants.find((p) => p.user_id !== currentUserId)
  return other?.user?.name || 'Unknown'
}
