'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAppStore } from '@/store/appStore'

export default function AuthCallbackPage() {
  const router = useRouter()
  const setCurrentUser = useAppStore((s) => s.setCurrentUser)

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (session?.user) {
        const user = session.user
        setCurrentUser({
          id: user.id,
          email: user.email!,
          name: user.user_metadata.full_name || user.email!.split('@')[0],
          username: user.email!.split('@')[0],
          avatar_url: user.user_metadata.avatar_url || null,
          is_online: true,
          last_seen: new Date().toISOString(),
          bio: null,
          role: 'user',
          created_at: user.created_at,
        })
        router.push('/')
      } else {
        router.push('/auth')
      }
    }
    handleCallback()
  }, [router, setCurrentUser])

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-white/40 text-sm">Authenticating...</span>
      </div>
    </div>
  )
}
