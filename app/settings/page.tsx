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
    <div className="h-screen flex overflow-hidden bg-surface-50 dark:bg-surface-900 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 max-md:pb-[68px] md:ml-[240px] overflow-y-auto h-full">
        <div className="max-w-xl mx-auto px-6 py-10 space-y-8 pb-24">
          <div className="space-y-1">
            <h1 className="font-display font-bold text-3xl text-surface-900 dark:text-white">Settings</h1>
            <p className="text-sm text-surface-500 dark:text-white/30">Customize your account and preferences</p>
          </div>

          {/* Profile Section */}
          <section className="glass rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider">Profile</h2>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center gap-4 py-4 bg-surface-100/30 dark:bg-white/[0.02] rounded-2xl border border-surface-200 dark:border-white/5 shadow-inner">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-surface-800 shadow-xl">
                  {currentUser?.avatar_url ? (
                    <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className={cn('w-full h-full flex items-center justify-center text-white text-3xl font-bold bg-gradient-to-br transition-all duration-300', getAvatarColor(currentUser?.name || 'U'))}>
                      {getInitials(currentUser?.name || 'U')}
                    </div>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white hover:bg-brand-500 hover:scale-110 active:scale-95 transition-all shadow-lg border-2 border-white dark:border-surface-800">
                  <Camera className="w-4 h-4" />
                </button>
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                   <p className="text-[10px] font-bold text-white uppercase tracking-tighter">Edit PFP</p>
                </div>
              </div>
              <div className="text-center">
                <p className="font-semibold text-surface-900 dark:text-white">@{currentUser?.username}</p>
                <p className="text-xs text-surface-500 dark:text-white/30">Member since {currentUser?.created_at ? new Date(currentUser.created_at).getFullYear() : '2024'}</p>
              </div>
            </div>

            {/* Name */}
            <div className="group space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-surface-500 dark:text-white/30 group-focus-within:text-brand-500 transition-colors">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What people see..."
                className="input-base text-base py-3.5"
              />
            </div>

            {/* Bio */}
            <div className="group space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-surface-500 dark:text-white/30 group-focus-within:text-brand-500 transition-colors">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input-base text-base resize-none h-24 py-3 placeholder-surface-400 dark:placeholder-white/20"
                placeholder="Tell people about yourself... keeps it shreddy."
              />
            </div>

            <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-4 text-base shadow-lg shadow-brand-500/20 active:scale-[0.98]">
              {saving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Applying Changes...</span>
                </div>
              ) : 'Save Changes'}
            </button>
          </section>

          {/* Appearance */}
          <section className="glass rounded-3xl p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Paintbrush className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider">Appearance</h2>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-100/50 dark:bg-white/[0.02] rounded-2xl border border-surface-200 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className={cn("p-2.5 rounded-xl transition-colors duration-500", !isDarkMode ? "bg-amber-100 text-amber-600" : "bg-brand-500/20 text-brand-400")}>
                  {isDarkMode ? <Moon className="w-5 h-5 transition-transform duration-500 group-hover:rotate-12" /> : <Sun className="w-5 h-5 transition-transform duration-500 group-hover:rotate-45" />}
                </div>
                <div>
                   <span className="text-sm font-semibold text-surface-900 dark:text-white block">Theme Mode</span>
                   <span className="text-[11px] text-surface-500 dark:text-white/30">{isDarkMode ? 'Currently in Dark Mode' : 'Currently in Light Mode'}</span>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={cn('w-14 h-8 rounded-full transition-all duration-300 relative group p-1 shadow-inner', isDarkMode ? 'bg-brand-600' : 'bg-surface-200')}
              >
                <div className={cn('w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-lg flex items-center justify-center', isDarkMode ? 'translate-x-[24px]' : 'translate-x-0')}>
                   {isDarkMode ? <Moon className="w-3 h-3 text-brand-600" /> : <Sun className="w-3 h-3 text-amber-600" />}
                </div>
              </button>
            </div>
          </section>

          {/* Privacy */}
          <section className="glass rounded-3xl p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <Shield className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider">Privacy & Security</h2>
            </div>

            {/* Anonymous Mode */}
            <div className="flex items-center justify-between p-4 bg-surface-100/50 dark:bg-white/[0.02] rounded-2xl border border-surface-200 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className={cn("p-2.5 rounded-xl transition-colors", isAnonymousMode ? "bg-accent/20 text-accent" : "bg-surface-200 dark:bg-white/10 text-surface-500 dark:text-white/30")}>
                  {isAnonymousMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-sm font-semibold text-surface-900 dark:text-white block">Ghost Mode</span>
                  <span className="text-[11px] text-surface-500 dark:text-white/25">Send messages & posts anonymously</span>
                </div>
              </div>
              <button
                onClick={toggleAnonymousMode}
                className={cn('w-14 h-8 rounded-full transition-all duration-300 relative group p-1 shadow-inner', isAnonymousMode ? 'bg-accent' : 'bg-surface-200 dark:bg-white/10')}
              >
                <div className={cn('w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-lg', isAnonymousMode ? 'translate-x-[24px]' : 'translate-x-0')} />
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-emerald-500/5 rounded-2xl text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Shield className="w-4 h-4 flex-shrink-0" />
              </div>
              <span className="text-xs font-medium leading-relaxed">All messages are end-to-end encrypted and auto-delete after 24 hours. Your privacy is our prime directive.</span>
            </div>
          </section>

          {/* Notifications */}
          <section className="glass rounded-3xl p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider">Notifications</h2>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-surface-100/50 dark:bg-white/[0.02] rounded-2xl border border-surface-200 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className={cn("p-2.5 rounded-xl transition-colors", notifications ? "bg-brand-500/20 text-brand-500" : "bg-surface-200 dark:bg-white/10 text-surface-500 dark:text-white/30")}>
                   <Bell className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-surface-900 dark:text-white">Push Notifications</span>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={cn('w-14 h-8 rounded-full transition-all duration-300 relative group p-1 shadow-inner', notifications ? 'bg-brand-500' : 'bg-surface-200 dark:bg-white/10')}
              >
                <div className={cn('w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-lg', notifications ? 'translate-x-[24px]' : 'translate-x-0')} />
              </button>
            </div>
          </section>

          {/* Sign Out */}
          <button 
            onClick={handleLogout} 
            className="w-full bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white font-bold py-4 rounded-3xl border border-red-500/20 transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>

          <div className="flex flex-col items-center gap-2 pt-6 pb-4">
            <div className="w-12 h-1 bg-surface-200 dark:bg-white/5 rounded-full" />
            <p className="text-center text-[11px] font-bold text-surface-400 dark:text-white/10 tracking-[0.2em] uppercase">
              Shredder v1.0.0 • E2E Secured
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

