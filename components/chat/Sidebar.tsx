'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useAppStore } from '@/store/appStore'
import {
  MessageCircle, Phone, Users, Settings, PlusCircle, Archive,
  HelpCircle, Shield, Flame, Eye, EyeOff, LogOut
} from 'lucide-react'
import { getInitials, getAvatarColor, cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const navItems = [
  { icon: MessageCircle, label: 'Chats', href: '/chat' },
  { icon: Phone, label: 'Calls', href: '/calls' },
  { icon: Users, label: 'Users', href: '/users' },
  { icon: Flame, label: 'Feed', href: '/feed' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { currentUser, isAnonymousMode, toggleAnonymousMode } = useAppStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isAdmin = currentUser?.role === 'admin'

  if (!mounted) return null

  return (
    <aside className="fixed max-md:bottom-0 max-md:left-0 max-md:w-full max-md:h-[68px] max-md:border-t md:left-0 md:top-0 md:h-full md:w-[240px] bg-white/90 dark:bg-surface-950/90 backdrop-blur-xl border-surface-200/50 dark:border-white/5 flex max-md:flex-row md:flex-col z-40 transition-colors duration-300">
      {/* Header - Hidden on Mobile */}
      <div className="hidden md:block p-5 border-b border-surface-200/50 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent flex items-center justify-center flex-shrink-0 shadow-glow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-gradient">Shredder</h1>
          </div>
        </div>

        {/* Profile */}
        {currentUser && (
          <div className="mt-6 flex items-center gap-3 bg-surface-100/50 dark:bg-white/5 p-2.5 rounded-xl border border-surface-200/50 dark:border-white/5">
            <div className="relative flex-shrink-0">
              {currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(currentUser.name)} flex items-center justify-center text-white text-sm font-bold`}>
                  {getInitials(currentUser.name)}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-surface-950 rounded-full" />
            </div>
            <div className="min-w-0 pr-2">
              <p className="font-semibold text-sm text-surface-900 dark:text-white truncate">
                {isAnonymousMode ? 'Anonymous' : currentUser.name}
              </p>
              <p className="text-[11px] text-surface-500 dark:text-white/40 truncate">
                {isAnonymousMode ? '👻 Ghost Mode' : 'Online'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 md:px-3 md:mt-4 flex max-md:flex-row max-md:items-center max-md:justify-between md:flex-col gap-1 md:gap-1.5 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "relative flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-3 md:py-2.5 rounded-xl transition-all duration-300 outline-none w-full md:w-auto",
                isActive ? "text-brand-600 dark:text-brand-400" : "text-surface-500 dark:text-white/50 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 bg-brand-50 dark:bg-brand-500/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={cn("w-5 h-5 relative z-10 transition-transform duration-300", isActive && "scale-110")} />
              <span className="text-[10px] md:text-sm font-medium relative z-10 md:flex-1 md:text-left">{item.label}</span>
            </button>
          )
        })}

        {isAdmin && (
          <button
            onClick={() => router.push('/admin')}
            className={cn(
              "relative flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-3 md:py-2.5 rounded-xl transition-all duration-300 outline-none w-full md:w-auto",
              pathname === '/admin' ? "text-brand-600 dark:text-brand-400" : "text-surface-500 dark:text-white/50 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-white/5"
            )}
          >
            {pathname === '/admin' && (
              <motion.div
                layoutId="active-nav"
                className="absolute inset-0 bg-brand-50 dark:bg-brand-500/10 rounded-xl"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <Shield className={cn("w-5 h-5 relative z-10 transition-transform duration-300", pathname === '/admin' && "scale-110")} />
            <span className="text-[10px] md:text-sm font-medium relative z-10 md:flex-1 md:text-left">Admin</span>
          </button>
        )}
      </nav>

      {/* Bottom Actions - Hidden on Mobile */}
      <div className="hidden md:block p-4 mt-auto border-t border-surface-200/50 dark:border-white/5 space-y-2">
        {/* Anonymous Mode Toggle */}
        <button
          onClick={toggleAnonymousMode}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 w-full rounded-xl transition-all duration-300 outline-none text-sm font-medium",
            isAnonymousMode 
              ? "text-accent bg-accent/10 hover:bg-accent/20" 
              : "text-surface-500 dark:text-white/50 hover:bg-surface-100 dark:hover:bg-white/5 hover:text-surface-900 dark:hover:text-white"
          )}
        >
          {isAnonymousMode ? (
            <EyeOff className="w-5 h-5 flex-shrink-0" />
          ) : (
            <Eye className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="flex-1 text-left">
            {isAnonymousMode ? 'Ghost Mode On' : 'Ghost Mode'}
          </span>
        </button>

        {/* New Message */}
        <button 
          onClick={() => router.push('/users')}
          className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>
    </aside>
  )
}
