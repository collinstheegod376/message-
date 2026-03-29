'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PWAInstallGate } from '@/components/PWAInstallGate'

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const isDarkMode = useAppStore((s) => s.isDarkMode)

  useEffect(() => {
    setMounted(true)
  }, [])

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
