'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Shield, Users, MessageCircle, Flame, Activity, Ban, Trash2,
  Search, MoreVertical, ChevronDown, BarChart3, TrendingUp, Eye
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { Sidebar } from '@/components/chat/Sidebar'
import { MOCK_USERS, MOCK_POSTS } from '@/lib/mockData'
import { cn, getInitials, getAvatarColor, formatRelativeTime } from '@/lib/utils'
import type { User } from '@/types'

type Tab = 'overview' | 'users' | 'messages' | 'posts'

export default function AdminPage() {
  const router = useRouter()
  const { currentUser } = useAppStore()
  const [tab, setTab] = useState<Tab>('overview')
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [search, setSearch] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && currentUser?.role !== 'admin') {
      router.push('/chat')
    }
  }, [mounted, currentUser, router])

  if (!mounted || currentUser?.role !== 'admin') return null

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { label: 'Active Now', value: users.filter((u) => u.is_online).length, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Messages Today', value: 247, icon: MessageCircle, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Posts Active', value: MOCK_POSTS.length, icon: Flame, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ]

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: BarChart3 },
    { id: 'users' as Tab, label: 'Users', icon: Users },
    { id: 'messages' as Tab, label: 'Messages', icon: MessageCircle },
    { id: 'posts' as Tab, label: 'Posts', icon: Flame },
  ]

  const handleBanUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId))
  }

  return (
    <div className="h-screen flex overflow-hidden bg-surface-900">
      <Sidebar />
      <main className="flex-1 ml-[72px] md:ml-[240px] overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl">Admin Dashboard</h1>
              <p className="text-xs text-white/30">Manage users, messages, and content</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl w-fit">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  tab === t.id
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                    : 'text-white/40 hover:text-white/60'
                )}
              >
                <t.icon className="w-4 h-4" />
                <span className="hidden sm:block">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {tab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="glass rounded-2xl p-5">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', stat.bg)}>
                      <stat.icon className={cn('w-5 h-5', stat.color)} />
                    </div>
                    <p className="text-2xl font-display font-bold">{stat.value}</p>
                    <p className="text-xs text-white/30 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Activity Chart Placeholder */}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-brand-400" />
                  Activity Overview
                </h3>
                <div className="h-48 flex items-end justify-around gap-2 px-4">
                  {[40, 65, 30, 85, 55, 75, 45, 90, 60, 70, 50, 80].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400 transition-all duration-500"
                        style={{ height: `${h}%`, animationDelay: `${i * 50}ms` }}
                      />
                      <span className="text-[9px] text-white/20">{i + 1}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/20 text-center mt-2">Messages per hour (last 12h)</p>
              </div>

              {/* Recent Users */}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-bold mb-4">Recent Users</h3>
                <div className="space-y-3">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                      <div className={cn('w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold', getAvatarColor(user.name))}>
                        {getInitials(user.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-[11px] text-white/25">{user.email}</p>
                      </div>
                      <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', user.is_online ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/20')}>
                        {user.is_online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {tab === 'users' && (
            <div className="space-y-4 animate-fade-in">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="input-base pl-10"
                />
              </div>

              <div className="glass rounded-2xl overflow-hidden">
                <div className="hidden sm:grid grid-cols-[1fr_1fr_100px_100px_80px] gap-4 p-4 text-[10px] font-bold text-white/20 uppercase tracking-wider border-b border-white/5">
                  <span>User</span>
                  <span>Email</span>
                  <span>Status</span>
                  <span>Role</span>
                  <span>Action</span>
                </div>
                {filteredUsers.map((user) => (
                  <div key={user.id} className="grid sm:grid-cols-[1fr_1fr_100px_100px_80px] gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors items-center">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold', getAvatarColor(user.name))}>
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-[11px] text-white/20 sm:hidden">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-white/40 hidden sm:block truncate">{user.email}</span>
                    <span className={cn('text-[11px] font-medium', user.is_online ? 'text-emerald-400' : 'text-white/20')}>
                      {user.is_online ? '● Online' : '○ Offline'}
                    </span>
                    <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full w-fit', user.role === 'admin' ? 'bg-brand-500/10 text-brand-400' : 'bg-white/5 text-white/30')}>
                      {user.role}
                    </span>
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-white/5 text-white/20 hover:text-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      {user.role !== 'admin' && (
                        <button onClick={() => handleBanUser(user.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors">
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {tab === 'messages' && (
            <div className="glass rounded-2xl p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold">Message Management</h3>
                <button className="btn-danger text-sm flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Purge Expired
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-white/[0.02] rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">247 messages sent today</p>
                    <p className="text-xs text-white/25">All messages auto-delete after 24 hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/[0.02] rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">End-to-end encryption active</p>
                    <p className="text-xs text-white/25">Messages cannot be read by server</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/[0.02] rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">152 messages purged in last 24h</p>
                    <p className="text-xs text-white/25">Automatic cleanup is running</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Posts Tab */}
          {tab === 'posts' && (
            <div className="glass rounded-2xl p-6 animate-fade-in">
              <h3 className="font-display font-bold mb-4">Active Posts</h3>
              <div className="space-y-3">
                {MOCK_POSTS.map((post) => (
                  <div key={post.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                    <div className={cn('w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold flex-shrink-0', getAvatarColor(post.author?.name || 'A'))}>
                      {post.is_anonymous ? '👻' : getInitials(post.author?.name || 'A')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/70 line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-white/20">
                        <span>{post.is_anonymous ? 'Anonymous' : post.author?.name}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(post.created_at)}</span>
                        <span>•</span>
                        <span>❤ {post.like_count}</span>
                      </div>
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
