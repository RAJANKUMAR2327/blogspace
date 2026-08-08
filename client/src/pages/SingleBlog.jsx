import { useState, useContext, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { FiHeart, FiEye, FiClock, FiShare2, FiArrowLeft, FiMessageSquare } from 'react-icons/fi'
import { motion } from 'framer-motion'
import SEO from '../components/common/SEO'
import ContentRenderer from '../components/blog/ContentRenderer'
import ImageGallery from '../components/blog/ImageGallery'

// Services & Context
import { blogAPI, commentAPI, userAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'

// Components
import ReadingProgressBar from '../components/blog/ReadingProgressBar'
import Breadcrumbs from '../components/common/Breadcrumbs'
import Reveal from '../components/common/Reveal'
import TableOfContents from '../components/blog/TableOfContents'
import ReadingControls from '../components/blog/ReadingControls'
import NestedComments from '../components/blog/NestedComments'
import FollowButton from '../components/common/FollowButton'
import RelatedArticles from '../components/blog/RelatedArticles'
import AskAIWidget from '../components/blog/AskAIWidget'
import ArticleActionRail from '../components/blog/ArticleActionRail'
import LikeBurst from '../components/blog/LikeBurst'
import { useSavedBlogIds } from '../hooks/useSavedBlogIds'
import AnimatedCounter from '../components/common/AnimatedCounter'

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
      return { ...res.data.blog, isFollowing: res.data.isFollowing }
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

  const saveMutation = useMutation({
    mutationFn: () => userAPI.toggleSave(blog._id),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['savedBlogs'])
      toast.success(res.data.isSaved ? 'Saved!' : 'Removed from saved')
    }
  })
  const savedIds = useSavedBlogIds()

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied!')
  }
  
  const isLiked = user && blog?.likes?.includes(user._id)
  const isFollowing = blog?.isFollowing || false
  const isSaved = blog ? savedIds.has(blog._id) : false

  const [likeBurst, setLikeBurst] = useState(0)
  const handleLike = () => {
    if (!user) return toast.error('Sign in to like')
    if (!isLiked) setLikeBurst(k => k + 1) // only burst when going from unliked -> liked
    likeMutation.mutate()
  }

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
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>Story not found</h2>
      <Link to="/blogs" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 'var(--text-base)' }}>← Back to all stories</Link>
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

        <div style={{ maxWidth: 1040, marginLeft: 'auto', marginRight: 'auto', marginBottom: 8 }}>
          <Breadcrumbs items={[
            { label: 'Stories', to: '/blogs' },
            { label: blog.category, to: `/blogs?category=${blog.category}` },
            { label: blog.title }
          ]} />

          {/* Back Button */}
          <Link to="/blogs" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', textDecoration: 'none', marginBottom: 32, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}>
            <FiArrowLeft /> Back to stories
          </Link>
        </div>

        {/* Symmetric 3-column grid keeps the center reading column perfectly
            centered on the page whether or not the left action rail is
            visible (it hides below 1100px — see ArticleActionRail.jsx) */}
        <div className="sb-medium-grid" style={{ display: 'grid', gridTemplateColumns: '1fr min(700px, 100%) 1fr', gap: 32 }}>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ArticleActionRail
              isLiked={isLiked}
              likeCount={blog.likes?.length || 0}
              onLike={handleLike}
              likeBurst={likeBurst}
              commentCount={comments?.length || 0}
              onCommentClick={() => document.getElementById('sb-comments')?.scrollIntoView({ behavior: 'smooth' })}
              isSaved={isSaved}
              onSave={() => user ? saveMutation.mutate() : toast.error('Sign in to save')}
              onShare={handleShare}
            />
          </div>

          {/* Main Column */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          >
            {/* Category */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4 }}
              style={{ marginBottom: 16 }}
            >
              <span style={{ fontSize: 'var(--text-xs)', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 1, background: 'var(--accent)', display: 'inline-block' }} />
                {blog.category}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.45 }}
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,6vw,48px)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.15, letterSpacing: '-1px', marginBottom: 24 }}
            >
              {blog.title}
            </motion.h1>

            {/* Author & Meta */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4 }}
              className="sb-author-row"
            >
              <div className="sb-author-left">
                <Link to={`/author/${blog.author?._id}`} style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-md)', color: 'var(--text-on-accent)', flexShrink: 0, textDecoration: 'none' }}>
                  {blog.author?.name?.[0] || 'A'}
                </Link>
                <div>
                  <p style={{ fontSize: 'var(--text-base)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{blog.author?.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })} · {blog.readTime || 5} min read
                  </p>
                </div>
                {blog.author?._id && (
                  <FollowButton userId={blog.author._id} isFollowing={isFollowing} />
                )}
              </div>
              <div className="sb-meta-right">
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FiEye size={13} /> <AnimatedCounter value={blog.views || 0} /></span>
              </div>
            </motion.div>

            {/* Reading controls row — compact, inline, not a sidebar card */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', margin: '20px 0 8px' }}>
              <TableOfContents content={blog.content} />
              <ReadingControls fontSize={fontSize} setFontSize={setFontSize} />
            </div>

            {/* Content Display */}
            {blog.gallery?.length > 0 && <ImageGallery images={blog.gallery} />}
            <ContentRenderer content={blog.content} fontSize={fontSize} />

            {/* Tags */}
            {blog.tags?.length > 0 && (
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
                style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 40 }}
              >
                {blog.tags.map(tag => (
                  <motion.span
                    key={tag}
                    variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }}
                    className="tag-chip"
                  >
                    #{tag}
                  </motion.span>
                ))}
              </motion.div>
            )}

            {/* Action Buttons (also shown here for mobile, where the rail is hidden) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '24px 0', borderTop: '1px solid var(--border-soft)', borderBottom: '1px solid var(--border-soft)', marginBottom: 48, flexWrap: 'wrap' }}>
              <LikeBurst burst={likeBurst}>
                <motion.button
                  onClick={handleLike}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.94 }}
                  className={`action-btn ${isLiked ? 'liked' : ''}`}>
                  <FiHeart style={{ fill: isLiked ? 'currentColor' : 'none' }} />
                  <AnimatedCounter value={blog.likes?.length || 0} /> {blog.likes?.length === 1 ? 'Like' : 'Likes'}
                </motion.button>
              </LikeBurst>
              <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                className="action-btn">
                <FiShare2 /> Share
              </motion.button>
              {user?.role === 'admin' && (
                <Link to={`/admin/edit/${blog._id}`} style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 500, background: 'var(--accent-soft)', border: '1px solid var(--accent)', color: 'var(--accent-strong)', textDecoration: 'none', transition: 'all 0.2s' }}>
                  Edit Story
                </Link>
              )}
            </div>

            {/* Comments Section */}
            <div id="sb-comments">
              <NestedComments comments={comments} blogId={blog._id} user={user} />
            </div>

            {/* Related Articles */}
            <Reveal style={{ marginTop: 56, paddingTop: 40, borderTop: '1px solid var(--border-soft)' }}>
              <RelatedArticles blogId={blog._id} />
            </Reveal>

          </motion.div> {/* /Main Column */}

          <div /> {/* right spacer — keeps the center column mathematically centered */}

        </div> {/* /sb-medium-grid */}

        <style>{`
          @media (max-width: 1100px) {
            .sb-medium-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>

      {/* Floating UI Widget Element */}
      <AskAIWidget blogId={blog?._id} />
    </div>
  )
}