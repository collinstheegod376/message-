'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/chat/Sidebar'
import { Users, Search, UserPlus, Phone, Video, MessageCircle } from 'lucide-react'
import { MOCK_USERS } from '@/lib/mockData'
import { cn, getAvatarColor, getInitials } from '@/lib/utils'

export default function ContactsPage() {
  const [search, setSearch] = useState('')

  const contacts = MOCK_USERS

  return (
    <div className="h-screen flex overflow-hidden bg-surface-900">
      <Sidebar />
      <main className="flex-1 ml-[72px] md:ml-[240px] flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 glass-strong border-b border-white/5 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-brand-400" />
              <div>
                <h1 className="font-display font-bold text-lg">Contacts</h1>
                <p className="text-[11px] text-white/30">{contacts.length} contacts</p>
              </div>
            </div>
            <button className="btn-primary py-2 px-4 flex items-center gap-2 text-sm">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:block">Add Contact</span>
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
              placeholder="Search contacts..."
              className="input-base pl-10"
            />
          </div>

          <div className="glass rounded-2xl overflow-hidden">
             <div className="divide-y divide-white/5">
              {contacts.map(contact => (
                <div key={contact.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {contact.avatar_url ? (
                        <img src={contact.avatar_url} alt={contact.name} className="w-12 h-12 rounded-full avatar" />
                      ) : (
                        <div className={cn('w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold', getAvatarColor(contact.name))}>
                          {getInitials(contact.name)}
                        </div>
                      )}
                      {contact.is_online && <span className="online-dot" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{contact.name}</h3>
                      <p className="text-xs text-white/50">{contact.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-white/40">
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors hover:text-white">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors hover:text-white">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors hover:text-white">
                      <Video className="w-4 h-4" />
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
