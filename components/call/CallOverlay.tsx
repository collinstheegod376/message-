'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Monitor, Minimize2,
  Maximize2, Volume2, Users
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { cn, formatDuration, getInitials, getAvatarColor } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'

interface CalleeProfile {
  id: string
  name: string
  avatar_url: string | null
}

export function CallOverlay() {
  const { activeCall, setActiveCall, currentUser, conversations } = useAppStore()
  const [callee, setCallee] = useState<CalleeProfile | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isScreenShare, setIsScreenShare] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [duration, setDuration] = useState(0)
  const [callStatus, setCallStatus] = useState<'ringing' | 'connecting' | 'active'>('ringing')
  const [showControls, setShowControls] = useState(true)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isVideoCall = activeCall?.type === 'video'

  useEffect(() => {
    const fetchCallee = async () => {
      if (!activeCall) return
      const { data } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .eq('id', activeCall.callee_id)
        .single()
      
      if (data) setCallee(data)
    }
    fetchCallee()

    if (!activeCall) return

    // Create session in DB if we are the caller and it's a new call
    const syncCall = async () => {
      if (activeCall.id.startsWith('call_')) { // Local temp ID
         const { data, error } = await supabase
           .from('call_sessions')
           .insert({
             room_name: activeCall.room_name,
             caller_id: activeCall.caller_id,
             callee_id: activeCall.callee_id,
             type: activeCall.type,
             status: 'ringing'
           })
           .select()
           .single()
         
         if (data) {
           // Update local state with DB ID
           setActiveCall({ ...activeCall, id: data.id })
         }
      }
    }

    syncCall()

    // Listen for status changes
    const channel = supabase
      .channel(`call-${activeCall.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'call_sessions',
        filter: `id=eq.${activeCall.id}`
      }, (payload) => {
        const newStatus = payload.new.status
        setCallStatus(newStatus)
        if (newStatus === 'ended' || newStatus === 'missed') {
          setActiveCall(null)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeCall])

  // Auto-hide controls
  useEffect(() => {
    if (showControls) {
      controlsTimeout.current = setTimeout(() => setShowControls(false), 5000)
    }
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current)
      }
    }
  }, [showControls])

  // Get local camera
  useEffect(() => {
    if (!isVideoCall || !isCameraOn) return
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
      })
      .catch(() => {})

    return () => {
      if (localVideoRef.current?.srcObject) {
        const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((t) => t.stop())
      }
    }
  }, [isVideoCall, isCameraOn])

  const endCall = () => {
    if (localVideoRef.current?.srcObject) {
      const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((t) => t.stop())
    }
    setActiveCall(null)
  }

  if (isMinimized) {
    return (
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-20 right-6 z-[100] shadow-2xl"
      >
        <div className="glass-strong rounded-3xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setIsMinimized(false)}>
          <div className={cn('w-12 h-12 rounded-full border-2 border-brand-500/20 flex items-center justify-center text-white text-sm font-bold', getAvatarColor(callee?.name || 'U'))}>
            {getInitials(callee?.name || 'U')}
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">{callee?.name}</p>
            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-tighter">{formatDuration(duration)}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); endCall() }} className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-500 transition-all hover:scale-110 active:scale-90 ml-2">
            <PhoneOff className="w-4 h-4 text-white" />
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="call-overlay" onClick={() => setShowControls(true)} onMouseMove={() => setShowControls(true)}>
      {/* Background */}
      <div className="absolute inset-0 bg-mesh" />

      {/* Remote video / avatar */}
      <div className="flex-1 flex items-center justify-center relative">
        {isVideoCall && callStatus === 'active' ? (
          <div className="absolute inset-0 bg-surface-800 flex items-center justify-center">
            {/* Placeholder for remote video - would use LiveKit */}
            <div className="text-center space-y-4">
              <div className={cn('w-32 h-32 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-4xl font-bold mx-auto shadow-2xl', getAvatarColor(callee?.name || 'U'))}>
                {getInitials(callee?.name || 'U')}
              </div>
              <p className="text-lg font-semibold text-white/60">{callee?.name}</p>
              <p className="text-sm text-white/30">Camera preview unavailable in demo</p>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6 relative z-10">
            {/* Ripple effect */}
            {callStatus === 'ringing' && (
              <div className="relative mx-auto w-32 h-32">
                <div className="absolute inset-0 rounded-full bg-brand-500/20 animate-ping" />
                <div className="absolute inset-2 rounded-full bg-brand-500/10 animate-ping" style={{ animationDelay: '0.5s' }} />
              </div>
            )}
            <div className={cn('w-28 h-28 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-4xl font-bold mx-auto shadow-2xl relative z-10', callStatus === 'ringing' ? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : '', getAvatarColor(callee?.name || 'U'))}>
              {getInitials(callee?.name || 'U')}
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-white">{callee?.name}</h2>
              <p className={cn('text-sm font-medium', callStatus === 'active' ? 'text-emerald-400' : 'text-white/40')}>
                {callStatus === 'ringing' && 'Ringing...'}
                {callStatus === 'connecting' && 'Connecting...'}
                {callStatus === 'active' && formatDuration(duration)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Self video PIP */}
      {isVideoCall && isCameraOn && (
        <div className="absolute top-6 right-6 w-40 h-56 rounded-2xl overflow-hidden bg-surface-800 border border-white/10 shadow-2xl z-20">
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
        </div>
      )}

      {/* Controls */}
      <div className={cn('absolute bottom-0 left-0 right-0 transition-all duration-300 z-20', showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')}>
        <div className="p-8 bg-gradient-to-t from-black/80 to-transparent">
          <div className="max-w-lg mx-auto flex items-center justify-center gap-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={cn('w-14 h-14 rounded-full flex items-center justify-center transition-all', isMuted ? 'bg-red-600/20 text-red-400' : 'bg-white/10 text-white hover:bg-white/20')}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {isVideoCall && (
              <button
                onClick={() => setIsCameraOn(!isCameraOn)}
                className={cn('w-14 h-14 rounded-full flex items-center justify-center transition-all', !isCameraOn ? 'bg-red-600/20 text-red-400' : 'bg-white/10 text-white hover:bg-white/20')}
              >
                {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </button>
            )}

            <button
              onClick={() => setIsScreenShare(!isScreenShare)}
              className={cn('w-14 h-14 rounded-full flex items-center justify-center transition-all', isScreenShare ? 'bg-brand-600 text-white' : 'bg-white/10 text-white hover:bg-white/20')}
            >
              <Monitor className="w-6 h-6" />
            </button>

            <button
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30 hover:bg-red-500 active:scale-95 transition-all"
            >
              <PhoneOff className="w-7 h-7" />
            </button>

            <button className="w-14 h-14 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-all">
              <Volume2 className="w-6 h-6" />
            </button>

            <button
              onClick={() => setIsMinimized(true)}
              className="w-14 h-14 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <Minimize2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
