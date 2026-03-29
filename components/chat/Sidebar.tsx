'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useAppStore } from '@/store/appStore'
import {
  MessageCircle, Phone, Users, Settings, PlusCircle, Archive,
  HelpCircle, Shield, Flame, Eye, EyeOff, LogOut
} from 'lucide-react'
import { getInitials, getAvatarColor } from '@/lib/utils'

const navItems = [
  { icon: MessageCircle, label: 'Chats', href: '/chat' },
  { icon: Phone, label: 'Calls', href: '/chat/calls' },
  { icon: Users, label: 'Contacts', href: '/chat/contacts' },
  { icon: Flame, label: 'Feed', href: '/feed' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { currentUser, isAnonymousMode, toggleAnonymousMode } = useAppStore()

  const isAdmin = currentUser?.role === 'admin'

  return (
    <aside className="fixed left-0 top-0 h-full w-[72px] md:w-[240px] bg-surface-950 border-r border-white/5 flex flex-col z-40">
      {/* Header */}
      <div className="p-4 md:p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent flex items-center justify-center flex-shrink-0 shadow-glow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="hidden md:block">
            <h1 className="font-display text-lg font-bold text-gradient">Shredder</h1>
          </div>
        </div>

        {/* Profile */}
        {currentUser && (
          <div className="mt-5 flex items-center gap-3">
            <div className="relative flex-shrink-0">
              {currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full avatar"
                />
              ) : (
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(currentUser.name)} flex items-center justify-center text-white text-sm font-bold`}>
                  {getInitials(currentUser.name)}
                </div>
              )}
              <span className="online-dot" />
            </div>
            <div className="hidden md:block min-w-0">
              <p className="font-semibold text-sm text-white truncate">
                {isAnonymousMode ? 'Anonymous' : currentUser.name}
              </p>
              <p className="text-[11px] text-white/30 truncate">
                {isAnonymousMode ? '👻 Ghost Mode' : 'Online'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 mt-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`nav-item w-full ${isActive ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="hidden md:block text-sm font-medium">{item.label}</span>
            </button>
          )
        })}

        {isAdmin && (
          <button
            onClick={() => router.push('/admin')}
            className={`nav-item w-full ${pathname === '/admin' ? 'active' : ''}`}
          >
            <Shield className="w-5 h-5 flex-shrink-0" />
            <span className="hidden md:block text-sm font-medium">Admin</span>
          </button>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 mt-auto border-t border-white/5 space-y-1">
        {/* Anonymous Mode Toggle */}
        <button
          onClick={toggleAnonymousMode}
          className={`nav-item w-full ${isAnonymousMode ? 'text-accent bg-accent/10' : ''}`}
          title={isAnonymousMode ? 'Disable Ghost Mode' : 'Enable Ghost Mode'}
        >
          {isAnonymousMode ? (
            <EyeOff className="w-5 h-5 flex-shrink-0" />
          ) : (
            <Eye className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="hidden md:block text-sm font-medium">
            {isAnonymousMode ? 'Ghost Mode On' : 'Ghost Mode'}
          </span>
        </button>

        {/* New Message */}
        <button className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 text-sm">
          <PlusCircle className="w-4 h-4" />
          <span className="hidden md:block">New Chat</span>
        </button>

        <div className="hidden md:flex flex-col gap-0.5 pt-2">
          <button className="nav-item w-full text-xs">
            <Archive className="w-4 h-4" />
            <span className="hidden md:block">Archive</span>
          </button>
          <button className="nav-item w-full text-xs">
            <HelpCircle className="w-4 h-4" />
            <span className="hidden md:block">Help</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
