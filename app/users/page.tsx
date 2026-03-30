'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/chat/Sidebar'
import { Users, Search, MessageCircle, Phone, Video, Shield, Ghost, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAppStore } from '@/store/appStore'
import { cn, getAvatarColor, getInitials } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  name: string
  username: string
  avatar_url: string | null
  is_online: boolean
  bio: string | null
}

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAppStore()
  const router = useRouter()

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url, is_online, bio')
        .neq('id', currentUser?.id || '')
        .order('name', { ascending: true })

      if (data) setUsers(data as Profile[])
      setLoading(false)
    }

    if (currentUser) fetchUsers()
  }, [currentUser])

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.username.toLowerCase().includes(search.toLowerCase())
  )

  const handleStartChat = async (userId: string) => {
    // Logic to create or get conversation
    router.push(`/chat?u=${userId}`)
  }

  return (
    <div className="h-screen flex overflow-hidden bg-surface-50 dark:bg-surface-900 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 max-md:pb-[68px] md:ml-[240px] flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 glass-strong border-b border-surface-200/50 dark:border-white/5 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-surface-900 dark:text-white">Discover Users</h1>
                <p className="text-[11px] text-surface-500 dark:text-white/30">{users.length} people on Shredder</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto p-4 md:p-6 pb-20 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 group-focus-within:text-brand-500 transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or username..."
              className="input-base pl-11 py-3.5"
            />
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-surface-400">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-brand-500" />
                <p className="text-sm">Finding users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-20 bg-white/50 dark:bg-white/[0.02] rounded-3xl border border-dashed border-surface-200 dark:border-white/10">
                <Ghost className="w-12 h-12 mx-auto mb-3 text-surface-300 dark:text-white/10" />
                <p className="text-sm text-surface-500 dark:text-white/30 font-medium">No users found matching "{search}"</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredUsers.map((user, idx) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass p-4 rounded-2xl flex items-center justify-between hover:scale-[1.01] transition-transform duration-200 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name} className="w-12 h-12 rounded-full object-cover border border-surface-200 dark:border-white/10" />
                        ) : (
                          <div className={cn('w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold', getAvatarColor(user.name))}>
                            {getInitials(user.name)}
                          </div>
                        )}
                        {user.is_online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-surface-900 rounded-full" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-surface-900 dark:text-white truncate">{user.name}</h3>
                        <p className="text-xs text-surface-500 dark:text-white/40 truncate">@{user.username}</p>
                        {user.bio && <p className="text-[11px] text-surface-400 dark:text-white/20 mt-1 line-clamp-1">{user.bio}</p>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity max-md:opacity-100">
                      <button 
                        onClick={() => handleStartChat(user.id)}
                        className="p-2.5 bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white rounded-xl transition-all duration-200"
                        title="Send Message"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                      <button className="p-2.5 bg-surface-100 dark:bg-white/5 text-surface-500 dark:text-white/40 hover:bg-surface-200 dark:hover:bg-white/10 rounded-xl transition-all">
                        <Phone className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
