'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/chat/Sidebar'
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Search, MoreVertical, Video } from 'lucide-react'
import { MOCK_USERS } from '@/lib/mockData'
import { cn, getAvatarColor, getInitials, formatRelativeTime } from '@/lib/utils'

export default function CallsPage() {
  const [search, setSearch] = useState('')

  const pastCalls = [
    { id: '1', user: MOCK_USERS[1], type: 'video', status: 'missed', time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), duration: 0 },
    { id: '2', user: MOCK_USERS[2], type: 'audio', status: 'outgoing', time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), duration: 154 },
    { id: '3', user: MOCK_USERS[3], type: 'video', status: 'incoming', time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), duration: 420 },
  ]

  return (
    <div className="h-screen flex overflow-hidden bg-surface-900">
      <Sidebar />
      <main className="flex-1 ml-[72px] md:ml-[240px] flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 glass-strong border-b border-white/5 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Phone className="w-6 h-6 text-brand-400" />
              <div>
                <h1 className="font-display font-bold text-lg">Calls</h1>
                <p className="text-[11px] text-white/30">End-to-end encrypted calls</p>
              </div>
            </div>
            <button className="btn-primary py-2 px-4 flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:block">New Call</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto p-4 md:p-6 pb-20 space-y-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search calls..."
              className="input-base pl-10"
            />
          </div>

          <div className="glass rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/5">
              <h2 className="font-display font-bold text-sm text-white/80">Recent Calls</h2>
            </div>
            <div className="divide-y divide-white/5">
              {pastCalls.map(call => (
                <div key={call.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {call.user.avatar_url ? (
                        <img src={call.user.avatar_url} alt={call.user.name} className="w-12 h-12 rounded-full avatar" />
                      ) : (
                        <div className={cn('w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold', getAvatarColor(call.user.name))}>
                          {getInitials(call.user.name)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className={cn("font-medium", call.status === 'missed' ? 'text-red-400' : 'text-white')}>{call.user.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-white/40">
                        {call.status === 'missed' && <PhoneMissed className="w-3 h-3 text-red-400" />}
                        {call.status === 'outgoing' && <PhoneOutgoing className="w-3 h-3" />}
                        {call.status === 'incoming' && <PhoneIncoming className="w-3 h-3" />}
                        <span>{formatRelativeTime(call.time)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/40">
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors hover:text-white">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors hover:text-white">
                      <Video className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
