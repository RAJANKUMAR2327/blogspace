import NestedComments from '../components/blog/NestedComments'
import { useContext, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blogAPI, commentAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiHeart, FiEye, FiClock, FiShare2, FiBookmark, FiTrash2, FiArrowLeft, FiMessageSquare } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'


export default function SingleBlog() {
  const { slug } = useParams()
  const { user } = useContext(AuthContext)
  const queryClient = useQueryClient()
  const [comment, setComment] = useState('')

  const { data: blog, isLoading } = useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      const res = await blogAPI.getBySlug(slug)
      return res.data.blog
    }
  })

  const { data: comments } = useQuery({
    queryKey: ['comments', blog?._id],
    queryFn: async () => {
      const res = await commentAPI.getAll(blog._id)
      return res.data.comments
    },
    enabled: !!blog?._id
  })

  const likeMutation = useMutation({
    mutationFn: () => blogAPI.toggleLike(blog._id),
    onSuccess: () => queryClient.invalidateQueries(['blog', slug])
  })

  const commentMutation = useMutation({
    mutationFn: (content) => commentAPI.add(blog._id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', blog._id])
      setComment('')
      toast.success('Comment posted!')
    }
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (id) => commentAPI.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['comments', blog._id])
  })

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied!')
  }

  const isLiked = user && blog?.likes?.includes(user._id)

  if (isLoading) return (
    <div style={{ background: '#080810', minHeight: '100vh', paddingTop: 64 }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px' }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ height: i === 0 ? 48 : 16, background: 'rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 16, width: i === 0 ? '80%' : `${60 + Math.random() * 40}%`, animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
    </div>
  )

  if (!blog) return (
    <div style={{ background: '#080810', minHeight: '100vh', paddingTop: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 64 }}>📭</div>
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 700, color: '#fff' }}>Story not found</h2>
      <Link to="/blogs" style={{ color: '#a78bfa', textDecoration: 'none', fontSize: 15 }}>← Back to all stories</Link>
    </div>
  )

  return (
    <div style={{ background: '#080810', minHeight: '100vh', paddingTop: 64, fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500&display=swap');
        @keyframes pulse { 0%,100%{opacity:0.5}50%{opacity:1} }
        .comment-input {
          width:100%; padding:14px 16px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:12px; font-size:14px; color:#fff; outline:none;
          font-family:'Inter',sans-serif; transition:border-color 0.2s;
          resize:none; box-sizing:border-box;
        }
        .comment-input:focus { border-color:rgba(167,139,250,0.4); }
        .comment-input::placeholder { color:rgba(255,255,255,0.2); }
        .action-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:10px 20px; border-radius:10px; font-size:14px;
          font-weight:500; cursor:pointer; transition:all 0.2s;
          font-family:'Inter',sans-serif; border:1px solid rgba(255,255,255,0.08);
          background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.5);
        }
        .action-btn:hover { border-color:rgba(255,255,255,0.15); color:#fff; }
        .action-btn.liked { background:rgba(248,113,113,0.1); border-color:rgba(248,113,113,0.3); color:#f87171; }
        .tag-chip {
          font-size:11px; letter-spacing:1px; text-transform:uppercase;
          padding:4px 10px; border-radius:6px; font-weight:500;
          background:rgba(167,139,250,0.1); color:rgba(167,139,250,0.7);
          border:1px solid rgba(167,139,250,0.15);
        }
      `}</style>

      {/* Hero Image */}
      {blog.image && (
        <div style={{ width: '100%', height: '420px', position: 'relative', overflow: 'hidden' }}>
          <img src={blog.image} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, #080810 100%)' }} />
        </div>
      )}

      <div style={{ maxWidth: 760, margin: '0 auto', padding: blog.image ? '0 24px 80px' : '60px 24px 80px', marginTop: blog.image ? -120 : 0, position: 'relative' }}>

        {/* Back */}
        <Link to="/blogs" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', marginBottom: 32, transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
          <FiArrowLeft /> Back to stories
        </Link>

        {/* Category */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#a78bfa', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 1, background: '#a78bfa', display: 'inline-block' }} />
            {blog.category}
          </span>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(28px,5vw,48px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-1px', marginBottom: 24 }}>
          {blog.title}
        </h1>

        {/* Author & Meta */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: '#fff', flexShrink: 0 }}>
              {blog.author?.name?.[0] || 'A'}
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 500, color: '#fff', marginBottom: 2 }}>{blog.author?.name}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FiEye size={13} /> {blog.views || 0}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FiClock size={13} /> {blog.readTime || 5} min read</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FiMessageSquare size={13} /> {comments?.length || 0}</span>
          </div>
        </div>

        {/* Content */}
        <div className="prose" style={{ marginBottom: 48, lineHeight: 1.85, fontSize: 17, color: 'rgba(255,255,255,0.7)', fontWeight: 300 }}
          dangerouslySetInnerHTML={{ __html: blog.content?.replace(/\n/g, '<br/>') }} />

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 40 }}>
            {blog.tags.map(tag => <span key={tag} className="tag-chip">#{tag}</span>)}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 48, flexWrap: 'wrap' }}>
          <button onClick={() => user ? likeMutation.mutate() : toast.error('Sign in to like')}
            className={`action-btn ${isLiked ? 'liked' : ''}`}>
            <FiHeart style={{ fill: isLiked ? 'currentColor' : 'none' }} />
            {blog.likes?.length || 0} {blog.likes?.length === 1 ? 'Like' : 'Likes'}
          </button>
          <button onClick={handleShare} className="action-btn">
            <FiShare2 /> Share
          </button>
          {user?.role === 'admin' && (
            <Link to={`/admin/edit/${blog._id}`} style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa', textDecoration: 'none', transition: 'all 0.2s' }}>
              Edit Story
            </Link>
          )}
        </div>

        {/* Comments Section */}
          <NestedComments comments={comments} blogId={blog._id} user={user} />

          {/* Add Comment */}
          {user ? (
            <div style={{ marginBottom: 32, background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {user.name?.[0]}
                </div>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', paddingTop: 6 }}>{user.name}</span>
              </div>
              <textarea
                className="comment-input"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts on this story..."
                rows={3}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button
                  onClick={() => comment.trim() && commentMutation.mutate(comment)}
                  disabled={!comment.trim() || commentMutation.isPending}
                  style={{ padding: '10px 24px', background: comment.trim() ? 'linear-gradient(135deg,#7c3aed,#2563eb)' : 'rgba(255,255,255,0.06)', color: comment.trim() ? 'white' : 'rgba(255,255,255,0.25)', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: comment.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s', fontFamily: "'Inter',sans-serif" }}>
                  {commentMutation.isPending ? 'Posting...' : 'Post comment'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, marginBottom: 32, textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 12, fontSize: 14 }}>
                Sign in to join the discussion
              </p>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                Sign in to comment
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {comments?.map(c => (
              <div key={c._id} style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20, transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(167,139,250,0.15)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {c.user?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 2 }}>{c.user?.name}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {(user?._id === c.user?._id || user?.role === 'admin') && (
                    <button onClick={() => deleteCommentMutation.mutate(c._id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', fontSize: 14, padding: 4, transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}>
                      <FiTrash2 />
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, fontWeight: 300 }}>{c.content}</p>
              </div>
            ))}
            {comments?.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>
                No comments yet — be the first to share your thoughts!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
