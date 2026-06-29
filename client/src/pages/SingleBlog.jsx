import { useState, useContext, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { FiHeart, FiEye, FiClock, FiShare2, FiArrowLeft, FiMessageSquare } from 'react-icons/fi'
import SEO from '../components/common/SEO'
import ContentRenderer from '../components/blog/ContentRenderer'
import ImageGallery from '../components/blog/ImageGallery'

// Services & Context
import { blogAPI, commentAPI, userAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'

// Components
import ReadingProgressBar from '../components/blog/ReadingProgressBar'
import TableOfContents from '../components/blog/TableOfContents'
import ReadingControls from '../components/blog/ReadingControls'
import NestedComments from '../components/blog/NestedComments'
import FollowButton from '../components/common/FollowButton'
import RelatedArticles from '../components/blog/RelatedArticles'
import AskAIWidget from '../components/blog/AskAIWidget'

export default function SingleBlog() {
  const { slug } = useParams()
  const { user } = useContext(AuthContext)
  const queryClient = useQueryClient()

  const [fontSize, setFontSize] = useState(17)

  // Fetch Blog Data
  const { data: blog, isLoading } = useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      const res = await blogAPI.getBySlug(slug)
      return res.data.blog
    }
  })

  // Fetch Comments
  const { data: comments } = useQuery({
    queryKey: ['comments', blog?._id],
    queryFn: async () => {
      const res = await commentAPI.getAll(blog._id)
      return res.data.comments
    },
    enabled: !!blog?._id
  })

  // Track Reading History
  useEffect(() => {
    if (blog?._id && user) {
      userAPI.addToHistory(blog._id).catch(() => {}) // silent fail, non-critical
    }
  }, [blog?._id, user])

  // Track Blog Reading Completion (Triggered at 90% scroll)
  useEffect(() => {
    if (!blog?._id) return
    let hasTracked = false

    const handleScroll = () => {
      if (hasTracked) return
      const scrollTop  = window.scrollY
      const docHeight  = document.documentElement.scrollHeight - window.innerHeight
      const scrolled   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      
      if (scrolled >= 90) {
        hasTracked = true
        blogAPI.trackCompletion(blog._id).catch(() => {}) // silent fail, non-critical
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [blog?._id])

  // Like Mutation
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

  // Loading State
  if (isLoading) return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingTop: 64 }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px' }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ height: i === 0 ? 48 : 16, background: 'var(--bg-surface-2)', borderRadius: 8, marginBottom: 16, width: i === 0 ? '80%' : `${60 + (i * 7) % 35}%` }} />
        ))}
      </div>
    </div>
  )

  // Not Found State
  if (!blog) return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingTop: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 64 }}>📭</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>Story not found</h2>
      <Link to="/blogs" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 15 }}>← Back to all stories</Link>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingTop: 64, fontFamily: 'var(--font-ui)' }}>
      {/* Dynamic SEO Injector */}
      {blog && (
        <SEO
          title={blog.title}
          description={blog.excerpt || blog.content?.replace(/<[^>]*>/g, '').substring(0, 160)}
          image={blog.image}
          type="article"
          article={{
            author: blog.author?.name,
            publishedTime: blog.createdAt,
            modifiedTime: blog.updatedAt,
            category: blog.category,
            tags: blog.tags
          }}
        />
      )}

      <ReadingProgressBar />

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
        .sb-author-row {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px; margin-bottom: 32px; padding-bottom: 32px;
          border-bottom: 1px solid var(--border-soft);
        }
        .sb-author-left { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .sb-meta-right { display: flex; align-items: center; gap: 16px; font-size: 13px; color: var(--text-tertiary); }
        .sb-content-wrap { max-width: 1100px; margin: 0 auto; position: relative; }
        .sb-hero-img { width: 100%; height: 420px; position: relative; overflow: hidden; }
        
        @media (max-width: 900px) {
          .single-blog-grid { grid-template-columns: 1fr !important; }
        }

        @media (max-width: 600px) {
          .sb-hero-img { height: 240px; }
          .sb-author-row { flex-direction: column; align-items: flex-start; gap: 14px; }
          .sb-meta-right { font-size: 12px; gap: 12px; }
          .sb-content-wrap { padding-left: 16px !important; padding-right: 16px !important; }
        }
        @media (max-width: 900px) {
          .single-blog-grid { grid-template-columns: 1fr !important; }
          @media (max-width: 900px) {
            .single-blog-sidebar {
              position: static !important;
              order: -1;
              margin-bottom: 24px;
            }
          }
        }
      `}</style>

      {/* Hero Image */}
      {blog.image && (
        <div className="sb-hero-img">
          <img src={blog.image} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, var(--bg-page) 100%)' }} />
        </div>
      )}

      <div className="sb-content-wrap" style={{ padding: blog.image ? '0 24px 80px' : '60px 24px 80px', marginTop: blog.image ? -120 : 0 }}>

        {/* Back Button */}
        <Link to="/blogs" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'none', marginBottom: 32, transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}>
          <FiArrowLeft /> Back to stories
        </Link>

        {/* Grid Layout Wrapper */}
        <div className="single-blog-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 40, alignItems: 'start' }}>
          
          {/* Main Column */}
          <div>
            {/* Category */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 1, background: 'var(--accent)', display: 'inline-block' }} />
                {blog.category}
              </span>
            </div>

            {/* Title */}
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,6vw,48px)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.15, letterSpacing: '-1px', marginBottom: 24 }}>
              {blog.title}
            </h1>

            {/* Author & Meta */}
            <div className="sb-author-row">
              <div className="sb-author-left">
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
              <div className="sb-meta-right">
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FiEye size={13} /> {blog.views || 0}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FiClock size={13} /> {blog.readTime || 5} min read</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FiMessageSquare size={13} /> {comments?.length || 0}</span>
              </div>
            </div>

            {/* Content Display */}
            {blog.gallery?.length > 0 && <ImageGallery images={blog.gallery} />}
            <ContentRenderer content={blog.content} fontSize={fontSize} />

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

            {/* Related Articles */}
            <div style={{ marginTop: 56, paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.06)' }}>  
              <RelatedArticles blogId={blog._id} />
            </div>

          </div> {/* /Main Column */}

          {/* Sidebar Column */}
          <div style={{ position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: 16 }}>    
            <ReadingControls fontSize={fontSize} setFontSize={setFontSize} />    
            <TableOfContents content={blog.content} />  
          </div>

        </div> {/* /Grid layout wrapper */}
      </div>

      {/* Floating UI Widget Element */}
      <AskAIWidget blogId={blog?._id} />
    </div>
  )
}