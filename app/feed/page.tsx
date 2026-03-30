'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Heart, MessageCircle, Send, Plus, Clock, Ghost, Trash2, MoreHorizontal,
  Shield, Flame, X, Loader2
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { Sidebar } from '@/components/chat/Sidebar'
import { cn, formatRelativeTime, getInitials, getAvatarColor, getExpiryTime } from '@/lib/utils'
import type { Post, Comment } from '@/types'
import { supabase } from '@/lib/supabase/client'
import { useEffect } from 'react'

export default function FeedPage() {
  const { currentUser, isAnonymousMode } = useAppStore()
  const [posts, setPosts] = useState<Post[]>([])
  const [newPostText, setNewPostText] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  const [activeComments, setActiveComments] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    if (!currentUser) return
    setLoading(true)

    // Fetch posts with author, comment count, and check if liked by current user
    const { data: postsData, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!author_id(*),
        comments (
          id,
          content,
          author_id,
          is_anonymous,
          created_at,
          author:profiles!author_id(*)
        ),
        post_likes (
          user_id
        )
      `)
      .order('created_at', { ascending: false })
      .gt('expires_at', new Date().toISOString())

    if (postsData) {
      const formattedPosts = postsData.map((post: any) => ({
        ...post,
        like_count: post.post_likes?.length || 0,
        comment_count: post.comments?.length || 0,
        liked_by_me: post.post_likes?.some((l: any) => l.user_id === currentUser.id) || false
      }))
      setPosts(formattedPosts as Post[])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (currentUser) {
      fetchPosts()

      // Real-time listener
      const channel = supabase
        .channel('public:feed')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
          fetchPosts()
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
          fetchPosts()
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, () => {
          fetchPosts()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [currentUser])

  const handlePost = async () => {
    if (!newPostText.trim() || !currentUser) return
    setPosting(true)
    
    const { error } = await supabase.from('posts').insert({
      author_id: currentUser.id,
      content: newPostText.trim(),
      is_anonymous: isAnonymousMode,
      expires_at: getExpiryTime()
    })

    if (!error) {
      setNewPostText('')
      setShowCompose(false)
      fetchPosts() // Refresh after post
    }
    setPosting(false)
  }

  const handleLike = async (postId: string) => {
    if (!currentUser) return
    const post = posts.find((p) => p.id === postId)
    if (!post) return

    if (post.liked_by_me) {
      // Unlike
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', currentUser.id)
    } else {
      // Like
      await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: currentUser.id
        })
    }
    // Realtime will handle the UI update via fetchPosts in the channel listener
  }

  const handleComment = async (postId: string) => {
    if (!commentText.trim() || !currentUser) return
    
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      author_id: currentUser.id,
      content: commentText.trim(),
      is_anonymous: isAnonymousMode,
      expires_at: getExpiryTime(),
    })

    if (!error) {
      setCommentText('')
      fetchPosts() // Refresh after comment
    }
  }

  const handleDelete = async (postId: string) => {
    await supabase.from('posts').delete().eq('id', postId)
    fetchPosts()
  }

  return (
    <div className="h-screen flex overflow-hidden bg-surface-50 dark:bg-surface-900 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 max-md:pb-[68px] md:ml-[240px] flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 glass-strong border-b border-surface-200/50 dark:border-white/5 px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-surface-900 dark:text-white">Feed</h1>
                <p className="text-[11px] text-surface-500 dark:text-white/30 tracking-wide uppercase">Posts shred in 24h</p>
              </div>
            </div>
            <button onClick={() => setShowCompose(true)} className="btn-primary py-2 px-4 flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:block">New Post</span>
            </button>
          </div>
        </header>

        {/* Compose Modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCompose(false)}>
            <div className="glass-strong rounded-3xl p-6 w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold">Create Post</h3>
                <button onClick={() => setShowCompose(false)} className="p-1 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>
              {isAnonymousMode && (
                <div className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg mb-3 text-accent text-xs">
                  <Ghost className="w-4 h-4" />
                  <span>Posting anonymously in Ghost Mode</span>
                </div>
              )}
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="What's on your mind? It'll disappear in 24h..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 resize-none h-32 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                autoFocus
              />
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-white/20 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>Expires in 24 hours</span>
                </div>
                <button onClick={handlePost} disabled={!newPostText.trim() || posting} className="btn-primary py-2 px-6 flex items-center gap-2 text-sm">
                  {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Post
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
            {loading ? (
              <div className="text-center py-32 flex flex-col items-center">
                <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
                <p className="mt-4 text-sm text-surface-500 dark:text-white/20">Syncing with the shredder...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-32 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-surface-100 dark:bg-white/[0.02] flex items-center justify-center mb-6">
                  <Flame className="w-10 h-10 text-surface-300 dark:text-white/10" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">The feed is empty</h3>
                <p className="text-sm text-surface-500 dark:text-white/20 max-w-[240px]">Anything posted here will self-destruct in 24 hours. Start the vibe!</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUser?.id || ''}
                  isAnonymousMode={isAnonymousMode}
                  showComments={activeComments === post.id}
                  commentText={activeComments === post.id ? commentText : ''}
                  onToggleComments={() => setActiveComments(activeComments === post.id ? null : post.id)}
                  onLike={() => handleLike(post.id)}
                  onComment={() => handleComment(post.id)}
                  onCommentChange={(t) => setCommentText(t)}
                  onDelete={() => handleDelete(post.id)}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function PostCard({
  post, currentUserId, isAnonymousMode, showComments, commentText,
  onToggleComments, onLike, onComment, onCommentChange, onDelete,
}: {
  post: Post
  currentUserId: string
  isAnonymousMode: boolean
  showComments: boolean
  commentText: string
  onToggleComments: () => void
  onLike: () => void
  onComment: () => void
  onCommentChange: (t: string) => void
  onDelete: () => void
}) {
  const isAuthor = post.author_id === currentUserId
  const authorName = post.is_anonymous ? 'Anonymous' : (post.author?.name || 'Unknown')

  return (
    <article className="glass rounded-2xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {post.is_anonymous ? (
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Ghost className="w-5 h-5 text-accent" />
            </div>
          ) : (
            <div className={cn('w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold', getAvatarColor(authorName))}>
              {getInitials(authorName)}
            </div>
          )}
          <div>
            <span className={cn('text-sm font-semibold', post.is_anonymous ? 'text-accent' : 'text-white')}>
              {authorName}
            </span>
            <div className="flex items-center gap-2 text-[10px] text-white/20">
              <span>{formatRelativeTime(post.created_at)}</span>
              <span>•</span>
              <Clock className="w-3 h-3 inline" />
              <span>Auto-deletes</span>
            </div>
          </div>
        </div>
        {isAuthor && (
          <button onClick={onDelete} className="p-2 rounded-lg hover:bg-white/5 text-white/20 hover:text-red-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Actions */}
      <div className="px-4 pb-3 flex items-center gap-4">
        <button onClick={onLike} className={cn('flex items-center gap-1.5 text-xs transition-all', post.liked_by_me ? 'text-red-400' : 'text-white/25 hover:text-red-400')}>
          <Heart className={cn('w-4 h-4', post.liked_by_me ? 'fill-current' : '')} />
          {post.like_count > 0 && post.like_count}
        </button>
        <button onClick={onToggleComments} className="flex items-center gap-1.5 text-xs text-white/25 hover:text-brand-400 transition-colors">
          <MessageCircle className="w-4 h-4" />
          {post.comment_count > 0 && post.comment_count}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-white/5 px-4 py-3 space-y-3 animate-slide-up">
          {post.comments?.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              {comment.is_anonymous ? (
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Ghost className="w-3 h-3 text-accent" />
                </div>
              ) : (
                <div className={cn('w-6 h-6 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0', getAvatarColor(comment.author?.name || 'U'))}>
                  {getInitials(comment.author?.name || 'U')}
                </div>
              )}
              <div>
                <span className="text-xs font-semibold text-white/50 mr-2">
                  {comment.is_anonymous ? 'Anonymous' : comment.author?.name}
                </span>
                <span className="text-xs text-white/60">{comment.content}</span>
              </div>
            </div>
          ))}

          {/* Comment input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => onCommentChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onComment()}
              placeholder={isAnonymousMode ? 'Comment anonymously...' : 'Write a comment...'}
              className="flex-1 bg-white/5 border-none rounded-lg py-2 px-3 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
            />
            <button onClick={onComment} disabled={!commentText.trim()} className="p-2 rounded-lg bg-brand-500/20 text-brand-400 disabled:opacity-30 hover:bg-brand-500/30 transition-colors">
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
