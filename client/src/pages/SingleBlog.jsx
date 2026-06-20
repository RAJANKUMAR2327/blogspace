import { useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blogAPI, commentAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiHeart, FiEye, FiClock, FiShare2, FiArrowLeft, FiMessageSquare } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import NestedComments from '../components/blog/NestedComments'
import FollowButton from '../components/common/FollowButton'

export default function SingleBlog() {
  const { slug } = useParams()
  const { user } = useContext(AuthContext)
  const queryClient = useQueryClient()

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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied!')
  }

  const isLiked = user && blog?.likes?.includes(user._id)
  const isFollowing = user && blog?.author?.followers?.includes(user._id)

  if (isLoading) return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingTop: 64 }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px' }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ height: i === 0 ? 48 : 16, background: 'var(--bg-surface-2)', borderRadius: 8, marginBottom: 16, width: i === 0 ? '80%' : `${60 + (i * 7) % 35}%` }} />
        ))}
      </div>
    </div>
  )

  if (!blog) return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingTop: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 64 }}>📭</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>Story not found</h2>
      <Link to="/blogs" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 15 }}>← Back to all stories</Link>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingTop: 64, fontFamily: 'var(--font-ui)' }}>
      <style>{`
        .action-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:10px 20px; border-radius:var(--radius-md); font-size:14px;
          font-weight:500; cursor:pointer; transition:all 0.2s;
          font-family:var(--font-ui); border:1px solid var(--border-soft);
          background:var(--bg-surface-2); color:var(--text-tertiary);
        }
        .action-btn:hover { border-color:var(--border-strong); color:var(--text-primary); }
        .action-btn.liked { background:color-mix(in srgb, var(--like) 12%, transparent); border-color:color-mix(in srgb, var(--like) 35%, transparent); color:var(--like); }
        .tag-chip {
          font-size:11px; letter-spacing:1px; text-transform:uppercase;
          padding:4px 10px; border-radius:6px; font-weight:500;
          background:var(--accent-soft); color:var(--accent-strong);
          border:1px solid color-mix(in srgb, var(--accent) 25%, transparent);
        }
      `}</style>

      {/* Hero Image */}
      {blog.image && (
        <div style={{ width: '100%', height: '420px', position: 'relative', overflow: 'hidden' }}>
          <img src={blog.image} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, var(--bg-page) 100%)' }} />
        </div>
      )}

      <div style={{ maxWidth: 760, margin: '0 auto', padding: blog.image ? '0 24px 80px' : '60px 24px 80px', marginTop: blog.image ? -120 : 0, position: 'relative' }}>

        {/* Back */}
        <Link to="/blogs" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'none', marginBottom: 32, transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}>
          <FiArrowLeft /> Back to stories
        </Link>

        {/* Category */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 1, background: 'var(--accent)', display: 'inline-block' }} />
            {blog.category}
          </span>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,5vw,48px)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-1px', marginBottom: 24 }}>
          {blog.title}
        </h1>

        {/* Author & Meta */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid var(--border-soft)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to={`/profile/${blog.author?._id}`} style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-on-accent)', flexShrink: 0, textDecoration: 'none' }}>
              {blog.author?.name?.[0] || 'A'}
            </Link>
            <div>
              <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{blog.author?.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
              </p>
            </div>
            {blog.author?._id && (
              <FollowButton userId={blog.author._id} isFollowing={isFollowing} />
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--text-tertiary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FiEye size={13} /> {blog.views || 0}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FiClock size={13} /> {blog.readTime || 5} min read</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FiMessageSquare size={13} /> {comments?.length || 0}</span>
          </div>
        </div>

        {/* Content */}
        <div className="prose" style={{ marginBottom: 48, lineHeight: 1.85, fontSize: 17, color: 'var(--text-secondary)', fontWeight: 400 }}
          dangerouslySetInnerHTML={{ __html: blog.content?.replace(/\n/g, '<br/>') }} />

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 40 }}>
            {blog.tags.map(tag => <span key={tag} className="tag-chip">#{tag}</span>)}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '24px 0', borderTop: '1px solid var(--border-soft)', borderBottom: '1px solid var(--border-soft)', marginBottom: 48, flexWrap: 'wrap' }}>
          <button onClick={() => user ? likeMutation.mutate() : toast.error('Sign in to like')}
            className={`action-btn ${isLiked ? 'liked' : ''}`}>
            <FiHeart style={{ fill: isLiked ? 'currentColor' : 'none' }} />
            {blog.likes?.length || 0} {blog.likes?.length === 1 ? 'Like' : 'Likes'}
          </button>
          <button onClick={handleShare} className="action-btn">
            <FiShare2 /> Share
          </button>
          {user?.role === 'admin' && (
            <Link to={`/admin/edit/${blog._id}`} style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 500, background: 'var(--accent-soft)', border: '1px solid var(--accent)', color: 'var(--accent-strong)', textDecoration: 'none', transition: 'all 0.2s' }}>
              Edit Story
            </Link>
          )}
        </div>

        {/* Comments Section */}
        <NestedComments comments={comments} blogId={blog._id} user={user} />
      </div>
    </div>
  )
}
