import { useState, useContext } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthContext } from '../../context/AuthContext'
import { commentAPI } from '../../services/api'
import { Link } from 'react-router-dom'
import { FiTrash2, FiCornerDownRight } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

function CommentItem({ comment, blogId, depth = 0 }) {
  const { user } = useContext(AuthContext)
  const queryClient = useQueryClient()
  const [replyText, setReplyText] = useState('')
  const [showReply, setShowReply] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: (id) => commentAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['comments', blogId])
  })

  const replyMutation = useMutation({
    mutationFn: (content) => commentAPI.add(blogId, { content, parentComment: comment._id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', blogId])
      setReplyText('')
      setShowReply(false)
      toast.success('Reply posted!')
    }
  })

  return (
    <div style={{ marginLeft: depth > 0 ? 32 : 0 }}>
      <div style={{
        background: depth === 0 ? 'var(--bg-surface)' : 'var(--accent-soft)',
        border: `1px solid ${depth === 0 ? 'var(--border-soft)' : 'color-mix(in srgb, var(--accent) 25%, transparent)'}`,
        borderRadius: 'var(--radius-md)', padding: '16px 18px', marginBottom: 8,
        transition: 'border-color 0.2s'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-on-accent)', flexShrink: 0 }}>
              {comment.user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 1 }}>{comment.user?.name}</p>
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {user && depth === 0 && (
              <button onClick={() => setShowReply(!showReply)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: showReply ? 'var(--accent)' : 'var(--text-tertiary)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-ui)', transition: 'color 0.2s', padding: '4px 8px', borderRadius: 6 }}>
                <FiCornerDownRight size={11} /> Reply
              </button>
            )}
            {(user?._id === comment.user?._id || user?.role === 'admin') && (
              <button onClick={() => deleteMutation.mutate(comment._id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 13, padding: 4, display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}>
                <FiTrash2 size={13} />
              </button>
            )}
          </div>
        </div>

        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, fontFamily: 'var(--font-body)' }}>
          {comment.content}
        </p>

        {/* Reply input */}
        {showReply && (
          <div style={{ marginTop: 12 }}>
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder={`Reply to ${comment.user?.name}...`}
              rows={2}
              style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)', borderRadius: 8, fontSize: 13, color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-ui)', resize: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowReply(false); setReplyText('') }}
                style={{ padding: '7px 14px', background: 'none', border: '1px solid var(--border-soft)', borderRadius: 8, color: 'var(--text-tertiary)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
                Cancel
              </button>
              <button
                onClick={() => replyText.trim() && replyMutation.mutate(replyText)}
                disabled={!replyText.trim() || replyMutation.isPending}
                style={{ padding: '7px 14px', background: replyText.trim() ? 'var(--accent)' : 'var(--bg-surface-2)', border: 'none', borderRadius: 8, color: replyText.trim() ? 'var(--text-on-accent)' : 'var(--text-tertiary)', fontSize: 12, cursor: replyText.trim() ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-ui)', fontWeight: 500 }}>
                {replyMutation.isPending ? 'Posting...' : 'Post reply'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      {comment.replies?.map(reply => (
        <CommentItem key={reply._id} comment={reply} blogId={blogId} depth={depth + 1} />
      ))}
    </div>
  )
}

export default function NestedComments({ comments, blogId, user }) {
  const queryClient = useQueryClient()
  const [newComment, setNewComment] = useState('')

  const addMutation = useMutation({
    mutationFn: (content) => commentAPI.add(blogId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', blogId])
      setNewComment('')
      toast.success('Comment posted!')
    }
  })

  return (
    <div style={{ fontFamily: 'var(--font-ui)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24, letterSpacing: '-0.3px' }}>
        Discussion{' '}
        <span style={{ fontSize: 15, color: 'var(--text-tertiary)', fontWeight: 400 }}>
          ({comments?.length || 0})
        </span>
      </h2>

      {/* Add Comment */}
      {user ? (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-md)', padding: 18, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-on-accent)', flexShrink: 0 }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{user.name}</span>
          </div>
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-ui)', resize: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', lineHeight: 1.6 }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-soft)'}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button
              onClick={() => newComment.trim() && addMutation.mutate(newComment)}
              disabled={!newComment.trim() || addMutation.isPending}
              style={{ padding: '10px 22px', background: newComment.trim() ? 'var(--accent)' : 'var(--bg-surface-2)', border: 'none', borderRadius: 10, color: newComment.trim() ? 'var(--text-on-accent)' : 'var(--text-tertiary)', fontSize: 14, fontWeight: 500, cursor: newComment.trim() ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-ui)', transition: 'all 0.2s' }}>
              {addMutation.isPending ? 'Posting...' : 'Post comment'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 24, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: 12, fontSize: 14 }}>
            Sign in to join the discussion
          </p>
          <Link to="/login" style={{ display: 'inline-block', padding: '10px 24px', background: 'var(--accent)', color: 'var(--text-on-accent)', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
            Sign in
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {comments?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)', fontSize: 14 }}>
            No comments yet — be the first to share your thoughts!
          </div>
        ) : (
          comments?.map(comment => (
            <CommentItem key={comment._id} comment={comment} blogId={blogId} depth={0} />
          ))
        )}
      </div>
    </div>
  )
}
