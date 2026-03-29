'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Mail, Lock, Eye, EyeOff, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAppStore } from '@/store/appStore'
import { CURRENT_USER } from '@/lib/mockData'

type AuthMode = 'login' | 'signup' | 'forgot'

export default function AuthPage() {
  const router = useRouter()
  const setCurrentUser = useAppStore((s) => s.setCurrentUser)
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'forgot') {
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        })
        if (resetErr) throw resetErr
        setSuccess('Password reset link sent to your email!')
        setLoading(false)
        return
      }

      if (mode === 'signup') {
        if (password.length < 8) {
          setError('Password must be at least 8 characters')
          setLoading(false)
          return
        }
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name, avatar_url: null },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (signUpErr) throw signUpErr
        if (data.user && !data.session) {
          setSuccess('Check your email for a confirmation link!')
          setLoading(false)
          return
        }
      }

      if (mode === 'login') {
        const { data, error: loginErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (loginErr) throw loginErr
      }

      // Mock fallback for development
      if (process.env.NODE_ENV === 'development') {
        setCurrentUser(CURRENT_USER)
      }
      router.push('/')
    } catch (err: any) {
      // Dev fallback: allow mock login
      if (process.env.NODE_ENV === 'development') {
        setCurrentUser(CURRENT_USER)
        router.push('/')
        return
      }
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
    } catch (err: any) {
      // Dev fallback
      if (process.env.NODE_ENV === 'development') {
        setCurrentUser(CURRENT_USER)
        router.push('/')
        return
      }
      setError(err.message || 'Google login failed')
    }
  }

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-6 relative">
      {/* Ambient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent shadow-glow-brand mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">
            <span className="text-gradient">Shredder</span>
          </h1>
          <p className="text-white/40 text-sm">
            {mode === 'forgot'
              ? 'Reset your password'
              : 'Encrypted messaging. Self-destructs in 24h.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
          {/* Accent blobs */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />

          {/* Toggle */}
          {mode !== 'forgot' && (
            <div className="flex p-1 bg-white/5 rounded-xl mb-8 relative z-10">
              <button
                onClick={() => { setMode('login'); setError(''); setSuccess('') }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  mode === 'login'
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  mode === 'signup'
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Error / Success */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-slide-up">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm animate-slide-up">
              <Shield className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {/* Name field (signup only) */}
            {mode === 'signup' && (
              <div className="space-y-1.5 animate-slide-up">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-white/40 ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="input-base pl-11"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/40 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="input-base pl-11"
                  required
                />
              </div>
            </div>

            {/* Password */}
            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/40">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(''); setSuccess('') }}
                      className="text-[11px] font-bold text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-base pl-11 pr-11"
                    required
                    minLength={mode === 'signup' ? 8 : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="text-[11px] text-white/25 ml-1">Minimum 8 characters</p>
                )}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'login' && 'Sign In to Shredder'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Link'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccess('') }}
                className="w-full text-center text-sm text-white/40 hover:text-white/60 transition-colors"
              >
                ← Back to login
              </button>
            )}
          </form>

          {/* Divider */}
          {mode !== 'forgot' && (
            <>
              <div className="relative flex items-center gap-4 py-6 relative z-10">
                <div className="flex-grow h-px bg-white/10" />
                <span className="text-[11px] font-bold text-white/20 uppercase tracking-widest">or</span>
                <div className="flex-grow h-px bg-white/10" />
              </div>

              {/* Google */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all relative z-10"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-sm font-semibold text-white/80">Continue with Google</span>
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-center gap-6 text-[12px] text-white/20">
          <a href="#" className="hover:text-white/40 transition-colors">Privacy</a>
          <a href="#" className="hover:text-white/40 transition-colors">Terms</a>
          <a href="#" className="hover:text-white/40 transition-colors">Help</a>
        </div>

        {/* E2E badge */}
        <div className="mt-4 flex items-center justify-center gap-2 text-white/15 text-[11px]">
          <Lock className="w-3 h-3" />
          <span>End-to-end encrypted</span>
        </div>
      </div>
    </div>
  )
}
