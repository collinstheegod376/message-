'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/chat/Sidebar'
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Search, MoreVertical, Video, Flame } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { cn, getAvatarColor, getInitials, formatRelativeTime } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function CallsPage() {
  const [search, setSearch] = useState('')
  const { isDarkMode } = useAppStore()

  // For now, this is a placeholder UI since real calling requires LiveKit integration
  const pastCalls: any[] = []

  return (
    <div className="h-screen flex overflow-hidden bg-surface-50 dark:bg-surface-900 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 max-md:pb-[68px] md:ml-[240px] flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 glass-strong border-b border-surface-200/50 dark:border-white/5 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-surface-900 dark:text-white">Calls</h1>
                <p className="text-[11px] text-surface-500 dark:text-white/30 tracking-wide uppercase">End-to-end encrypted</p>
              </div>
            </div>
            <button className="btn-primary py-2 px-4 flex items-center gap-2 text-sm">
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:block">New Call</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto p-4 md:p-6 pb-20 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 group-focus-within:text-brand-500 transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search calls..."
              className="input-base pl-11 py-3.5"
            />
          </div>

          {pastCalls.length === 0 ? (
            <div className="text-center py-32 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-surface-100 dark:bg-white/[0.02] flex items-center justify-center mb-6">
                <Phone className="w-10 h-10 text-surface-300 dark:text-white/10" />
              </div>
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">No calls yet</h3>
              <p className="text-sm text-surface-500 dark:text-white/20 max-w-[240px]">Once you start calling your friends, your history will appear here.</p>
            </div>
          ) : (
             <div className="glass rounded-3xl overflow-hidden border border-surface-200 dark:border-white/5 bg-white dark:bg-white/[0.02]">
              <div className="p-4 border-b border-surface-200 dark:border-white/5 bg-surface-50 dark:bg-white/[0.02]">
                <h2 className="font-display font-bold text-xs text-surface-500 dark:text-white/40 uppercase tracking-widest">Recent Activity</h2>
              </div>
              <div className="divide-y divide-surface-200 dark:divide-white/5">
                {pastCalls.map(call => (
                  <div key={call.id} className="p-4 flex items-center justify-between hover:bg-surface-50 dark:hover:bg-white/[0.02] transition-colors">
                    {/* Call item details */}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

import { PlusCircle } from 'lucide-react'
