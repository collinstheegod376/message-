'use client'

import { X, User, Bell, BellOff, Ban, FileText, Image as ImageIcon, Lock, Shield } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { getInitials, getAvatarColor, cn, formatRelativeTime } from '@/lib/utils'

export function ContactInfo({ onClose }: { onClose: () => void }) {
  const { activeConversationId, conversations, currentUser } = useAppStore()
  const conversation = conversations.find((c) => c.id === activeConversationId)
  const otherUser = conversation?.participants.find((p) => p.user_id !== currentUser?.id)?.user

  if (!conversation || !otherUser) return null

  return (
    <section className="w-72 flex-shrink-0 flex flex-col bg-surface-900 border-l border-white/5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <h3 className="font-display font-bold text-sm">Contact Info</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/40">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Profile */}
      <div className="p-6 text-center space-y-3">
        <div className="relative inline-block">
          {otherUser.avatar_url ? (
            <img src={otherUser.avatar_url} alt={otherUser.name} className="w-20 h-20 rounded-full mx-auto avatar border-4 border-white/5" />
          ) : (
            <div className={cn('w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-2xl font-bold mx-auto', getAvatarColor(otherUser.name))}>
              {getInitials(otherUser.name)}
            </div>
          )}
          {otherUser.is_online && (
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-3 border-surface-900" />
          )}
        </div>
        <div>
          <h2 className="font-display font-bold text-lg">{otherUser.name}</h2>
          <p className="text-sm text-white/30">@{otherUser.username}</p>
          {otherUser.bio && <p className="text-xs text-white/40 mt-1">{otherUser.bio}</p>}
        </div>
        <div className="flex justify-center gap-2">
          <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-brand-400 hover:bg-white/10 transition-colors">
            <User className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-brand-400 hover:bg-white/10 transition-colors">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Shared Files */}
      <div className="px-5 space-y-4">
        <div>
          <h4 className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-3">Shared Files</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
              <div className="w-9 h-9 bg-brand-500/10 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white/70 truncate">design_system.pdf</p>
                <p className="text-[10px] text-white/20">2.4 MB • Today</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
              <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white/70 truncate">ux_flow_final.png</p>
                <p className="text-[10px] text-white/20">4.8 MB • Today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div>
          <h4 className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-3">Privacy & Settings</h4>
          <div className="space-y-1">
            <button className="w-full text-left px-3 py-2.5 text-xs font-medium rounded-xl hover:bg-white/5 transition-colors flex justify-between items-center text-white/50">
              <span className="flex items-center gap-2">
                <BellOff className="w-4 h-4" />
                Mute Notifications
              </span>
              <div className="w-8 h-4 bg-white/10 rounded-full relative">
                <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white/30 rounded-full" />
              </div>
            </button>
            <button className="w-full text-left px-3 py-2.5 text-xs font-medium rounded-xl hover:bg-red-500/5 transition-colors text-red-400 flex items-center gap-2">
              <Ban className="w-4 h-4" />
              Block Contact
            </button>
          </div>
        </div>

        {/* Encryption */}
        <div className="flex items-center gap-2 p-3 bg-emerald-500/5 rounded-xl text-emerald-400/60 text-[11px]">
          <Shield className="w-4 h-4 flex-shrink-0" />
          <span>Messages are encrypted and auto-delete after 24 hours</span>
        </div>
      </div>
    </section>
  )
}
