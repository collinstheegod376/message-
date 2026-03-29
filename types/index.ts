// Core Types for Shredder App

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar_url: string | null;
  is_online: boolean;
  last_seen: string;
  bio: string | null;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string; // encrypted
  type: 'text' | 'image' | 'file' | 'audio' | 'video';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  status: 'sending' | 'sent' | 'delivered' | 'seen';
  is_anonymous: boolean;
  created_at: string;
  expires_at: string; // 24h after created_at
  sender?: User;
  reactions?: Reaction[];
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  avatar_url?: string;
  created_by: string;
  created_at: string;
  last_message?: Message;
  unread_count: number;
  participants: ConversationParticipant[];
}

export interface ConversationParticipant {
  user_id: string;
  conversation_id: string;
  joined_at: string;
  is_muted: boolean;
  user?: User;
}

export interface CallSession {
  id: string;
  room_name: string;
  caller_id: string;
  callee_id: string;
  type: 'audio' | 'video';
  status: 'ringing' | 'active' | 'ended' | 'missed';
  started_at?: string;
  ended_at?: string;
  livekit_token?: string;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  image_url?: string;
  is_anonymous: boolean;
  created_at: string;
  expires_at: string; // 24h
  like_count: number;
  comment_count: number;
  author?: User;
  comments?: Comment[];
  liked_by_me?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  expires_at: string;
  author?: User;
}

export interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'call' | 'post_like' | 'comment' | 'mention';
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  data?: Record<string, unknown>;
}

export interface TypingIndicator {
  conversation_id: string;
  user_id: string;
  user_name: string;
}
