import { useContext, useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blogAPI, commentAPI, userAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  FiHeart,
  FiEye,
  FiClock,
  FiShare2,
  FiTrash2,
  FiMessageSquare,
  FiCornerDownRight
} from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import SEO from '../components/common/SEO'

export default function SingleBlog() {
  const { slug } = useParams()
  const { user } = useContext(AuthContext)
  const queryClient = useQueryClient()
  const [comment, setComment] = useState('')
  const [replyTo, setReplyTo] = useState(null) // { id, name }
  const [replyText, setReplyText] = useState('')
  const [localClaps, setLocalClaps] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => blogAPI.getBySlug(slug).then(r => r.data.blog)
  })

  const { data: comments } = useQuery({
    queryKey: ['comments', data?._id],
    queryFn: () => commentAPI.getAll(data._id).then(r => r.data.comments),
    enabled: !!data?._id
  })

  // Track reading history
  useEffect(() => {
    if (data?._id && user) {
      userAPI.addToHistory(data._id).catch(() => {})
    }
  }, [data?._id, user])

  // JSON-LD structured data
  useEffect(() => {
    if (!data) return
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: data.title,
      image: data.image,
      author: { '@type': 'Person', name: data.author?.name },
      datePublished: data.createdAt,
      dateModified: data.updatedAt,
      description: data.excerpt
    })
    document.head.appendChild(script)
    return () => document.head.contains(script) && document.head.removeChild(script)
  }, [data])

  const likeMutation = useMutation({
    mutationFn: () => blogAPI.toggleLike(data._id),
    onSuccess: () => queryClient.invalidateQueries(['blog', slug])
  })

  const clapMutation = useMutation({
    mutationFn: () => blogAPI.clapBlog(data._id),
    onSuccess: () => setLocalClaps(c => c + 1)
  })

  const commentMutation = useMutation({
    mutationFn: (content) => commentAPI.add(data._id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', data._id])
      setComment('')
      toast.success('Comment posted!')
    }
  })

  const replyMutation = useMutation({
    mutationFn: ({ content, parentComment }) =>
      commentAPI.add(data._id, { content, parentComment }),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', data._id])
      setReplyTo(null)
      setReplyText('')
      toast.success('Reply posted!')
    }
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (id) => commentAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['comments', data._id])
  })

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied!')
  }

  if (isLoading) return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4" />
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-8" />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
      ))}
    </div>
  )

  if (!data) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Blog not found</h2>
      <Link to="/blogs" className="text-purple-600 hover:underline mt-4 block">← Back to blogs</Link>
    </div>
  )

  const isLiked = user && data.likes?.includes(user._id)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <SEO title={data.title} description={data.excerpt} image={data.image} />

      {/* Category */}
      <div className="mb-4">
        <Link to={`/blogs?category=${data.category}`}
          className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide hover:underline">
          {data.category}
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
        {data.title}
      </h1>

      {/* Author & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <img
            src={data.author?.profileImage || `https://placehold.co/48x48/9333ea/ffffff?text=${data.author?.name?.[0]}`}
            alt={data.author?.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{data.author?.name}</p>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(data.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1"><FiEye /> {data.views}</span>
          <span className="flex items-center gap-1"><FiClock /> {data.readTime} min read</span>
        </div>
      </div>

      {/* Cover Image */}
      {data.image && (
        <img src={data.image} alt={data.title}
          className="w-full h-80 object-cover rounded-2xl mb-10" />
      )}

      {/* Content */}
      <div
        className="prose prose-lg dark:prose-invert max-w-none mb-12 prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-purple-600"
        dangerouslySetInnerHTML={{ __html: data.content }}
      />

      {/* Tags */}
      {data.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {data.tags.map(tag => (
            <Link key={tag} to={`/blogs?tag=${tag}`}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-sm hover:bg-purple-50 hover:text-purple-600 transition-colors">
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 py-6 border-t border-b border-gray-100 dark:border-gray-800 mb-10">
        {/* Like */}
        <button
          onClick={() => user ? likeMutation.mutate() : toast.error('Login to like')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-colors ${
            isLiked
              ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-900/20 dark:border-red-800'
              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-red-200 hover:text-red-500'
          }`}>
          <FiHeart className={isLiked ? 'fill-current' : ''} />
          {data.likes?.length || 0}
        </button>

        {/* Clap (NEW) */}
        <button
          onClick={() => user ? clapMutation.mutate() : toast.error('Login to clap')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-yellow-300 hover:text-yellow-500 transition-colors">
          👏 {(data.claps || 0) + localClaps}
        </button>

        {/* Share */}
        <button onClick={handleShare}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-purple-300 hover:text-purple-600 transition-colors">
          <FiShare2 /> Share
        </button>
      </div>

      {/* Comments */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <FiMessageSquare /> Comments ({comments?.length || 0})
        </h2>

        {/* Add Comment */}
        {user ? (
          <div className="mb-8">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            <button
              onClick={() => comment.trim() && commentMutation.mutate(comment)}
              disabled={!comment.trim() || commentMutation.isPending}
              className="mt-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50">
              {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              <Link to="/login" className="text-purple-600 hover:underline font-medium">Login</Link> to join the conversation
            </p>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments?.map(c => (
            <div key={c._id} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={c.user?.profileImage || `https://placehold.co/36x36/9333ea/ffffff?text=${c.user?.name?.[0]}`}
                    alt={c.user?.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{c.user?.name}</p>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user && (
                    <button onClick={() => setReplyTo({ id: c._id, name: c.user?.name })}
                      className="text-xs text-gray-400 hover:text-purple-600 flex items-center gap-1">
                      <FiCornerDownRight size={12} /> Reply
                    </button>
                  )}
                  {(user?._id === c.user?._id || user?.role === 'admin') && (
                    <button onClick={() => deleteCommentMutation.mutate(c._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors">
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{c.content}</p>

              {/* Replies */}
              {c.replies?.length > 0 && (
                <div className="mt-4 ml-6 space-y-3 border-l-2 border-purple-100 dark:border-purple-900/30 pl-4">
                  {c.replies.map(reply => (
                    <div key={reply._id} className="flex items-start gap-3">
                      <img
                        src={reply.user?.profileImage || `https://placehold.co/28x28/9333ea/ffffff?text=${reply.user?.name?.[0]}`}
                        alt={reply.user?.name}
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-gray-900 dark:text-white">{reply.user?.name}</p>
                          {(user?._id === reply.user?._id || user?.role === 'admin') && (
                            <button onClick={() => deleteCommentMutation.mutate(reply._id)}
                              className="text-gray-300 hover:text-red-400 transition-colors">
                              <FiTrash2 size={12} />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{reply.content}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Box */}
              {replyTo?.id === c._id && (
                <div className="mt-4 ml-6">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${replyTo.name}...`}
                    rows={2}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => replyText.trim() && replyMutation.mutate({ content: replyText, parentComment: c._id })}
                      disabled={!replyText.trim() || replyMutation.isPending}
                      className="text-sm bg-purple-600 text-white px-4 py-1.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors">
                      {replyMutation.isPending ? 'Posting...' : 'Post Reply'}
                    </button>
                    <button onClick={() => { setReplyTo(null); setReplyText('') }}
                      className="text-sm text-gray-400 hover:text-gray-600 px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}