import type { User, Conversation, Message, Post, Comment } from '@/types'

const now = new Date()
const h = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString()
const expiry = (hours: number) => new Date(now.getTime() + (24 - hours) * 60 * 60 * 1000).toISOString()

export const MOCK_USERS: User[] = []


export const MOCK_CONVERSATIONS: Conversation[] = []


export const MOCK_MESSAGES: Record<string, Message[]> = {}


export const MOCK_POSTS: Post[] = []


export const CURRENT_USER = null
