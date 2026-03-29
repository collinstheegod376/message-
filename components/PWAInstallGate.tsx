'use client'

import { useEffect, useState, ReactNode } from 'react'
import { Shield, Download, Smartphone, Monitor, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallGate({ children }: { children: ReactNode }) {
  const [isInstalled, setIsInstalled] = useState(true) // assume installed until we check
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    // Check if already running as PWA
    const isPWA =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      (window.navigator as any).standalone === true

    // For development, allow access without PWA
    const isDev = process.env.NODE_ENV === 'development'

    if (isPWA || isDev) {
      setIsInstalled(true)
      return
    }

    setIsInstalled(false)

    // Check iOS
    const ua = navigator.userAgent
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstalled(true)
      }
      setDeferredPrompt(null)
    } else if (isIOS) {
      setShowInstructions(true)
    }
  }

  if (isInstalled) return <>{children}</>

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-6">
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="glass-strong rounded-3xl p-8 md:p-12 max-w-lg w-full relative z-10 animate-scale-in">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-accent flex items-center justify-center shadow-glow-brand">
            <Shield className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="font-display text-3xl font-bold text-center mb-3">
          Install <span className="text-gradient">Shredder</span>
        </h1>
        <p className="text-white/50 text-center mb-8 text-sm leading-relaxed">
          Shredder requires installation as a Progressive Web App for the best
          experience — offline access, push notifications, and enhanced security.
        </p>

        {/* Features */}
        <div className="space-y-4 mb-8">
          {[
            { icon: Shield, text: 'End-to-end encrypted messaging' },
            { icon: Smartphone, text: 'Works like a native app on your device' },
            { icon: Download, text: 'Offline access & push notifications' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                <f.icon className="w-5 h-5 text-brand-400" />
              </div>
              <span className="text-white/70 text-sm">{f.text}</span>
            </div>
          ))}
        </div>

        {/* Install Button */}
        <div className="flex flex-col gap-3">
          <button onClick={handleInstall} className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base">
            <Download className="w-5 h-5" />
            {isIOS ? 'How to Install' : 'Install App'}
          </button>
          
          <button 
            onClick={() => setIsInstalled(true)} 
            className="w-full py-4 text-base text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium"
          >
            Continue in Browser
          </button>
        </div>

        {/* iOS Instructions Modal */}
        {showInstructions && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-4" onClick={() => setShowInstructions(false)}>
            <div
              className="glass-strong rounded-t-3xl rounded-b-xl p-6 w-full max-w-md animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display font-bold text-lg">Install on iOS</h3>
                <button onClick={() => setShowInstructions(false)} className="p-1 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>
              <ol className="space-y-4 text-sm text-white/70">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">1</span>
                  <span>Tap the <strong className="text-white">Share</strong> button at the bottom of Safari</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">2</span>
                  <span>Scroll down and tap <strong className="text-white">Add to Home Screen</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">3</span>
                  <span>Tap <strong className="text-white">Add</strong> to confirm</span>
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Desktop hint */}
        <div className="mt-6 flex items-center justify-center gap-2 text-white/30 text-xs">
          <Monitor className="w-4 h-4" />
          <span>Also available on desktop browsers</span>
        </div>
      </div>
    </div>
  )
}
