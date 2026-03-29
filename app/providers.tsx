'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PWAInstallGate } from '@/components/PWAInstallGate'
import { supabase } from '@/lib/supabase/client'
import { CURRENT_USER } from '@/lib/mockData'

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const isDarkMode = useAppStore((s) => s.isDarkMode)
  const setCurrentUser = useAppStore((s) => s.setCurrentUser)

  useEffect(() => {
    // Initial fetch of session
    const initAuth = async () => {
      // In dev mode, if we already have mock user, keep it
      if (process.env.NODE_ENV === 'development') {
        setCurrentUser(CURRENT_USER)
      } else {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setCurrentUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user',
            email: session.user.email || '',
            avatar_url: session.user.user_metadata?.avatar_url,
            is_online: true,
            last_seen: new Date().toISOString(),
            bio: null,
            role: 'user',
            created_at: new Date().toISOString()
          })
        }
      }
      setMounted(true)
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (process.env.NODE_ENV !== 'development') {
        if (session?.user) {
          setCurrentUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user',
            email: session.user.email || '',
            avatar_url: session.user.user_metadata?.avatar_url,
            is_online: true,
            last_seen: new Date().toISOString(),
            bio: null,
            role: 'user',
            created_at: new Date().toISOString()
          })
        } else {
          setCurrentUser(null)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setCurrentUser])

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle('dark', isDarkMode)
      document.documentElement.classList.toggle('light', !isDarkMode)
    }
  }, [isDarkMode, mounted])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-white/40 text-sm">Loading Shredder...</span>
        </div>
      </div>
    )
  }

  return <PWAInstallGate>{children}</PWAInstallGate>
}
