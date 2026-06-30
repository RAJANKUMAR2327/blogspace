import { useState, useContext } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthContext } from '../../context/AuthContext'
import { commentAPI } from '../../services/api'
import { Link } from 'react-router-dom'
import { FiTrash2, FiCornerDownRight, FiEdit2, FiHeart, FiFlag, FiX, FiCheck } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
// Import EmptyState assuming it is in the same directory or adjust path accordingly
import EmptyState from './EmptyState' 

function CommentItem({ comment, blogId, depth = 0 }) {
  const { user } = useContext(AuthContext)
  const queryClient = useQueryClient()
  const [replyText, setReplyText] = useState('')
  const [showReply, setShowReply] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content)

  const isLiked = user && comment.likes?.includes(user._id)
  const isOwn   = user?._id === comment.user?._id

  const deleteMutation = useMutation({
    mutationFn: (id) => commentAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['comments', blogId])
  })

  const editMutation = useMutation({
    mutationFn: (content) => commentAPI.edit(comment._id, content),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', blogId])
      setIsEditing(false)
      toast.success('Comment updated')
    }
  })

  const likeMutation = useMutation({
    mutationFn: () => commentAPI.toggleLike(comment._id),
    onSuccess: () => queryClient.invalidateQueries(['comments', blogId])
  })

  const flagMutation = useMutation({
    mutationFn: () => commentAPI.flag(comment._id, 'Reported as inappropriate'),
    onSuccess: () => toast.success('Comment reported — our team will review it')
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
        background: depth === 0 ? '#0d0d1a' : 'rgba(124,58,237,0.05)',
        border: `1px solid ${depth === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(124,58,237,0.12)'}`,
        borderRadius: 12, padding: '16px 18px', marginBottom: 8,
        transition: 'border-color 0.2s'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {comment.user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 1 }}>{comment.user?.name}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                {comment.isEdited && <span style={{ marginLeft: 6, fontStyle: 'italic' }}>· edited</span>}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {user && depth === 0 && !isEditing && (
              <button onClick={() => setShowReply(!showReply)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: showReply ? '#a78bfa' : 'rgba(255,255,255,0.2)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Inter',sans-serif", padding: '4px 8px', borderRadius: 6 }}
                onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
                onMouseLeave={e => !showReply && (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}>
                <FiCornerDownRight size={11} /> Reply
              </button>
            )}
            {isOwn && !isEditing && (
              <button onClick={() => { setIsEditing(true); setEditText(comment.content) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', fontSize: 13, display: 'flex', padding: 4, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}>
                <FiEdit2 size={13} />
              </button>
            )}
            {!isOwn && user && (
              <button onClick={() => { if (window.confirm('Report this comment as inappropriate?')) flagMutation.mutate() }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', fontSize: 13, display: 'flex', padding: 4, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fb923c'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
                title="Report comment">
                <FiFlag size={12} />
              </button>
            )}
            {(isOwn || user?.role === 'admin') && (
              <button onClick={() => deleteMutation.mutate(comment._id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', fontSize: 14, display: 'flex', padding: 4, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}>
                <FiTrash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Content or Edit Mode */}
        {isEditing ? (
          <div>
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 8, fontSize: 14, color: '#fff', outline: 'none', fontFamily: "'Inter',sans-serif", resize: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setIsEditing(false)}
                style={{ padding: '6px 12px', background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Inter',sans-serif" }}>
                <FiX size={12} /> Cancel
              </button>
              <button
                onClick={() => editText.trim() && editMutation.mutate(editText)}
                disabled={!editText.trim() || editMutation.isPending}
                style={{ padding: '6px 12px', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                <FiCheck size={12} /> Save
              </button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, fontWeight: 300 }}>
            {comment.content}
          </p>
        )}

        {/* Like row */}
        {!isEditing && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => user ? likeMutation.mutate() : toast.error('Sign in to react')}
              style={{
                display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 12, fontFamily: "'Inter',sans-serif",
                color: isLiked ? '#f472b6' : 'rgba(255,255,255,0.25)', padding: '2px 4px'
              }}>
              <FiHeart size={12} style={{ fill: isLiked ? 'currentColor' : 'none' }} />
              {comment.likes?.length > 0 && comment.likes.length}
            </button>
          </div>
        )}

        {/* Reply Form */}
        {showReply && user && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder={`Replying to ${comment.user?.name}...`}
              rows={2}
              style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 13, color: '#fff', outline: 'none', fontFamily: "'Inter',sans-serif", resize: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowReply(false); setReplyText('') }}
                style={{ padding: '7px 14px', background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
                Cancel
              </button>
              <button
                onClick={() => replyText.trim() && replyMutation.mutate(replyText)}
                disabled={!replyText.trim() || replyMutation.isPending}
                style={{ padding: '7px 14px', background: replyText.trim() ? 'linear-gradient(135deg,#7c3aed,#2563eb)' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, color: replyText.trim() ? '#fff' : 'rgba(255,255,255,0.25)', fontSize: 12, cursor: replyText.trim() ? 'pointer' : 'not-allowed', fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                {replyMutation.isPending ? 'Posting...' : 'Post reply'}
              </button>
            </div>
          </div>
        )}
      </div>

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
    <div style={{ fontFamily: "'Inter',sans-serif" }}>
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 24, letterSpacing: '-0.3px' }}>
        Discussion{' '}
        <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>
          ({comments?.length || 0})
        </span>
      </h2>

      {user ? (
        <div style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 18, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{user.name}</span>
          </div>
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 14, color: '#fff', outline: 'none', fontFamily: "'Inter',sans-serif", resize: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button
              onClick={() => newComment.trim() && addMutation.mutate(newComment)}
              disabled={!newComment.trim() || addMutation.isPending}
              style={{ padding: '10px 22px', background: newComment.trim() ? 'linear-gradient(135deg,#7c3aed,#2563eb)' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, color: newComment.trim() ? '#fff' : 'rgba(255,255,255,0.25)', fontSize: 14, fontWeight: 500, cursor: newComment.trim() ? 'pointer' : 'not-allowed', fontFamily: "'Inter',sans-serif" }}>
              {addMutation.isPending ? 'Posting...' : 'Post comment'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20, marginBottom: 24, textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 12, fontSize: 14 }}>Sign in to join the discussion</p>
          <Link to="/login" style={{ display: 'inline-block', padding: '10px 24px', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: '#fff', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
            Sign in
          </Link>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {comments?.length === 0 ? (
          <EmptyState 
            illustration="noComments" 
            title="No comments yet" 
            description="Be the first to share your thoughts!" 
          />
        ) : (
          comments?.map(comment => (
            <CommentItem key={comment._id} comment={comment} blogId={blogId} depth={0} />
          ))
        )}
      </div>
    </div>
  )
}