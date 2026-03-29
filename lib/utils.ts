import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMessageTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'h:mm a')
}

export function formatConversationTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isToday(d)) return format(d, 'h:mm a')
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function getExpiryTime(): string {
  const expires = new Date()
  expires.setHours(expires.getHours() + 24)
  return expires.toISOString()
}

export function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date()
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function generateRoomName(id1: string, id2: string): string {
  return [id1, id2].sort().join('_')
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '…' : str
}

export function getAvatarColor(name: string): string {
  const colors = [
    'from-brand-500 to-brand-700',
    'from-purple-500 to-purple-700',
    'from-emerald-500 to-emerald-700',
    'from-rose-500 to-rose-700',
    'from-amber-500 to-amber-700',
    'from-teal-500 to-teal-700',
    'from-indigo-500 to-indigo-700',
  ]
  const index =
    name.charCodeAt(0) % colors.length
  return colors[index]
}
