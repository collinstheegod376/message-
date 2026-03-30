import { supabase } from './client'
import type { Conversation, Message, User } from '@/types'

export async function getConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      participants:conversation_participants(
        *,
        user:profiles(*)
      ),
      messages(
        *
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching conversations:', error)
    return []
  }

  // Filter conversations where the user is a participant
  // (In a real app, this would be done in the SQL query using join or RLS)
  const userConvs = data.filter((c: any) => 
    c.participants.some((p: any) => p.user_id === userId)
  )

  return userConvs.map((c: any) => {
    // Sort messages to get the last one correctly
    const sortedMsgs = (c.messages || []).sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    
    return {
      ...c,
      last_message: sortedMsgs[0] || null,
      unread_count: 0, // Simplified
    }
  }) as Conversation[]
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:profiles!sender_id(*)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return data as Message[]
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  options: { isAnonymous?: boolean; type?: Message['type'] } = {}
): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      is_anonymous: options.isAnonymous || false,
      type: options.type || 'text',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    })
    .select('*, sender:profiles!sender_id(*)')
    .single()

  if (error) {
    console.error('Error sending message:', error)
    return null
  }

  return data as Message
}

export async function createConversation(
  userIds: string[],
  type: 'direct' | 'group' = 'direct'
): Promise<Conversation | null> {
  // Check if a direct conversation already exists
  if (type === 'direct' && userIds.length === 2) {
    const convs = await getConversations(userIds[0])
    const existing = convs.find(c => 
      c.type === 'direct' && 
      c.participants.length === 2 && 
      c.participants.every(p => userIds.includes(p.user_id))
    )
    if (existing) return existing
  }

  // Create new conversation
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .insert({ type, created_by: userIds[0] })
    .select()
    .single()

  if (convError) {
    console.error('Error creating conversation:', convError)
    return null
  }

  // Add participants
  const participants = userIds.map(uid => ({
    conversation_id: conv.id,
    user_id: uid
  }))

  const { error: partError } = await supabase
    .from('conversation_participants')
    .insert(participants)

  if (partError) {
    console.error('Error adding participants:', partError)
    return null
  }

  // Fetch fully hydrated conversation
  const { data: fullConv } = await supabase
    .from('conversations')
    .select(`
      *,
      participants:conversation_participants(
        *,
        user:profiles(*)
      )
    `)
    .eq('id', conv.id)
    .single()

  return { ...fullConv, last_message: null, unread_count: 0 } as Conversation
}
