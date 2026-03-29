'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User, Bell, Moon, Sun, Shield, LogOut, Camera, ChevronRight,
  Eye, EyeOff, Lock, Paintbrush, Globe
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { Sidebar } from '@/components/chat/Sidebar'
import { cn, getInitials, getAvatarColor } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

export default function SettingsPage() {
  const router = useRouter()
  const { currentUser, setCurrentUser, isDarkMode, toggleDarkMode, isAnonymousMode, toggleAnonymousMode } = useAppStore()
  const [name, setName] = useState(currentUser?.name || '')
  const [bio, setBio] = useState(currentUser?.bio || '')
  const [notifications, setNotifications] = useState(true)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!currentUser) return
    setSaving(true)
    try {
      // Update in Supabase
      await supabase.from('profiles').update({ name, bio }).eq('id', currentUser.id)
      setCurrentUser({ ...currentUser, name, bio })
    } catch {
      // Dev fallback
      setCurrentUser({ ...currentUser, name, bio })
    }
    setTimeout(() => setSaving(false), 500)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setCurrentUser(null)
    router.push('/auth')
  }

  return (
    <div className="h-screen flex overflow-hidden bg-surface-900">
      <Sidebar />
      <main className="flex-1 ml-[72px] md:ml-[240px] overflow-y-auto">
        <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
          <h1 className="font-display font-bold text-2xl">Settings</h1>

          {/* Profile Section */}
          <section className="glass rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider">Profile</h2>

            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {currentUser?.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="" className="w-16 h-16 rounded-full avatar" />
                ) : (
                  <div className={cn('w-16 h-16 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xl font-bold', getAvatarColor(currentUser?.name || 'U'))}>
                    {getInitials(currentUser?.name || 'U')}
                  </div>
                )}
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white hover:bg-brand-400 transition-colors shadow-lg">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <p className="font-semibold">{currentUser?.name}</p>
                <p className="text-xs text-white/30">@{currentUser?.username}</p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/30">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-base"
              />
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/30">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input-base resize-none h-20"
                placeholder="Tell people about yourself..."
              />
            </div>

            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2.5">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </section>

          {/* Appearance */}
          <section className="glass rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider">Appearance</h2>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                {isDarkMode ? <Moon className="w-5 h-5 text-brand-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
                <span className="text-sm font-medium">Dark Mode</span>
              </div>
              <button
                onClick={toggleDarkMode}
                className={cn('w-11 h-6 rounded-full transition-colors relative', isDarkMode ? 'bg-brand-500' : 'bg-white/20')}
              >
                <div className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm', isDarkMode ? 'left-[22px]' : 'left-0.5')} />
              </button>
            </div>
          </section>

          {/* Privacy */}
          <section className="glass rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider">Privacy & Security</h2>

            {/* Anonymous Mode */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                {isAnonymousMode ? <EyeOff className="w-5 h-5 text-accent" /> : <Eye className="w-5 h-5 text-white/40" />}
                <div>
                  <span className="text-sm font-medium block">Ghost Mode</span>
                  <span className="text-[11px] text-white/25">Send messages & posts anonymously</span>
                </div>
              </div>
              <button
                onClick={toggleAnonymousMode}
                className={cn('w-11 h-6 rounded-full transition-colors relative', isAnonymousMode ? 'bg-accent' : 'bg-white/20')}
              >
                <div className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm', isAnonymousMode ? 'left-[22px]' : 'left-0.5')} />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-emerald-500/5 rounded-xl text-emerald-400/60 text-xs">
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span>All messages are end-to-end encrypted and auto-delete after 24 hours</span>
            </div>
          </section>

          {/* Notifications */}
          <section className="glass rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider">Notifications</h2>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-white/40" />
                <span className="text-sm font-medium">Push Notifications</span>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={cn('w-11 h-6 rounded-full transition-colors relative', notifications ? 'bg-brand-500' : 'bg-white/20')}
              >
                <div className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm', notifications ? 'left-[22px]' : 'left-0.5')} />
              </button>
            </div>
          </section>

          {/* Sign Out */}
          <button onClick={handleLogout} className="btn-danger w-full flex items-center justify-center gap-2 py-3">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>

          <p className="text-center text-[11px] text-white/10 pb-6">
            Shredder v1.0.0 • End-to-end encrypted
          </p>
        </div>
      </main>
    </div>
  )
}
