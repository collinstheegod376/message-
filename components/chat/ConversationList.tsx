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
    <section className="w-full md:w-80 flex flex-col border-r border-surface-200 dark:border-white/5 bg-white dark:bg-surface-900/50 flex-shrink-0 transition-colors duration-300">
      {/* Search */}
      <div className="p-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 group-focus-within:text-brand-500 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full bg-surface-100 dark:bg-white/5 border border-surface-200 dark:border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-white/25 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/50 transition-all shadow-inner"
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
        'w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left group mx-1',
        isActive
          ? 'bg-brand-50 dark:bg-brand-500/10 shadow-sm border border-brand-500/20 scale-[1.02]'
          : 'hover:bg-surface-50 dark:hover:bg-white/5 border border-transparent'
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
        <div className="flex justify-between items-center mb-1">
          <h3 className={cn('text-sm font-bold truncate transition-colors', isActive ? 'text-brand-600 dark:text-brand-400' : 'text-surface-900 dark:text-white/80')}>
            {name}
          </h3>
          {conversation.last_message && (
            <span className={cn('text-[10px] flex-shrink-0 font-medium', isActive ? 'text-brand-500/60 dark:text-brand-400/60' : 'text-surface-400 dark:text-white/25')}>
              {formatConversationTime(conversation.last_message.created_at)}
            </span>
          )}
        </div>
        {conversation.last_message && (
          <p className={cn('text-[11px] truncate transition-colors', isActive ? 'text-brand-600/60 dark:text-brand-400/60 font-medium' : 'text-surface-500 dark:text-white/30')}>
            {conversation.last_message.sender_id === currentUserId && (
              <span className="opacity-50 font-bold mr-1">You:</span>
            )}
            {truncate(conversation.last_message.content, 35)}
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
