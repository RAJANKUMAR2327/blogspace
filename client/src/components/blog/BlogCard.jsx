import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthContext } from '../../context/AuthContext'
import { userAPI } from '../../services/api'
import { FiBookmark, FiEye, FiHeart, FiClock } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import LazyImage from '../common/LazyImage' // Imported LazyImage component
import { useSavedBlogIds } from '../../hooks/useSavedBlogIds'
import AnimatedCounter from '../common/AnimatedCounter'

const CAT_VAR = {
  Technology:  '--cat-technology',
  Programming: '--cat-programming',
  Design:      '--cat-design',
  Business:    '--cat-business',
  Science:     '--cat-science',
  Health:      '--cat-health',
  Travel:      '--cat-travel',
  Food:        '--cat-food',
  Lifestyle:   '--cat-lifestyle',
  Other:       '--cat-other',
}

const FALLBACK = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop'

export default function BlogCard({ blog }) {
  const { user } = useContext(AuthContext)
  const queryClient = useQueryClient()
  const catVar = CAT_VAR[blog.category] || '--accent'
  const readTime = blog.readTime || Math.ceil((blog.content?.replace(/<[^>]*>/g, '').split(' ').length || 0) / 200) || 1

  const saveMutation = useMutation({
    mutationFn: () => userAPI.toggleSave(blog._id),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['savedBlogs'])
      toast.success(res.data.isSaved ? 'Saved!' : 'Removed from saved')
    }
  })

  const savedIds = useSavedBlogIds()
  const isSaved = savedIds.has(blog._id)

  return (
    <>
      <style>{`
        .blog-card {
          background: var(--bg-surface); border: 1px solid var(--border-soft);
          border-radius: var(--radius-lg); overflow: hidden; transition: all 0.3s;
          display: flex; flex-direction: column; font-family: var(--font-ui);
          box-shadow: var(--shadow-card);
        }
        .blog-card:hover {
          border-color: var(--accent);
          box-shadow: var(--shadow-pop);
        }
        /* Target both the old class and the new inner wrapper class for the hover zoom effect */
        .blog-card:hover .bc-img, 
        .blog-card:hover .bc-img-wrap-inner { 
          transform: scale(1.07); 
          opacity: 0.9; 
        }
        .bc-img-wrap { height: 190px; overflow: hidden; background: var(--bg-surface-2); position: relative; }
        
        /* Retained styles for smooth transitioning on the inner lazy image element */
        .bc-img, .bc-img-wrap-inner { 
          width:100%; height:100%; object-fit:cover; transition:transform 0.5s ease, opacity 0.3s; opacity:0.85; 
        }
        .bc-cat-badge {
          position:absolute;top:12px;left:12px;
          font-size:10px;letter-spacing:1.5px;text-transform:uppercase;
          padding:4px 10px;border-radius:100px;font-weight:500;
          backdrop-filter:blur(8px);z-index: 2;
        }
        .bc-save-btn {
          position:absolute;top:10px;right:10px;
          background: color-mix(in srgb, var(--bg-page) 70%, transparent);
          border:1px solid var(--border-soft);
          border-radius:var(--radius-sm);padding:6px;cursor:pointer;
          display:flex;align-items:center;color:var(--text-tertiary);
          transition:all 0.2s;backdrop-filter:blur(8px);z-index: 2;
        }
        .bc-save-btn:hover { color: var(--accent); border-color: var(--accent); }
        .bc-body { padding: 18px; flex: 1; display: flex; flex-direction: column; }
        .bc-title {
          font-family:var(--font-display);font-size:16px;font-weight:700;
          line-height:1.35;letter-spacing:-0.2px;color:var(--text-primary);margin-bottom:8px;
          text-decoration:none;display:block;transition:color 0.2s;
        }
        .bc-title:hover { color: var(--accent); }
        .bc-excerpt {
          font-size:13px;color:var(--text-tertiary);line-height:1.6;
          margin-bottom:16px;font-family: var(--font-body);flex:1;
          display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
        }
        .bc-tags { display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px; }
        .bc-tag {
          font-size:10px;letter-spacing:1px;text-transform:uppercase;
          padding:3px 8px;border-radius:4px;
          background:var(--bg-surface-2);color:var(--text-tertiary);
        }
        .bc-footer {
          display:flex;align-items:center;justify-content:space-between;
          padding-top:12px;border-top:1px solid var(--border-soft);
        }
        .bc-author { display:flex;align-items:center;gap:7px; }
        .bc-avatar {
          width:24px;height:24px;border-radius:50%;
          background: var(--accent);
          display:flex;align-items:center;justify-content:center;
          font-size:10px;font-weight:700;color:var(--text-on-accent);flex-shrink:0;
        }
        .bc-author-name { font-size:12px;color:var(--text-tertiary); }
        .bc-author-name:hover { color: var(--accent); }
        .bc-stats { display:flex;align-items:center;gap:10px; }
        .bc-stat { display:flex;align-items:center;gap:3px;font-size:11px;color:var(--text-tertiary); }
      `}</style>

      <motion.article
        className="blog-card"
        whileHover={{ y: -6, scale: 1.015 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      >
        <div className="bc-img-wrap">
          <Link to={`/blog/${blog.slug}`}>
            {/* Replaced standard <img> with LazyImage */}
            <LazyImage
              src={blog.image || FALLBACK}
              alt={blog.title}
              className="bc-img-wrap-inner"
              style={{ height: '100%' }}
            />
          </Link>
          <span
            className="bc-cat-badge"
            style={{
              background: `color-mix(in srgb, var(${catVar}) 18%, transparent)`,
              color: `var(${catVar})`,
              border: `1px solid color-mix(in srgb, var(${catVar}) 35%, transparent)`,
            }}
          >
            {blog.category}
          </span>
          {user && (
            <button
              className="bc-save-btn"
              onClick={(e) => { e.preventDefault(); saveMutation.mutate() }}
              title={isSaved ? 'Remove from saved' : 'Save article'}
              style={{ color: isSaved ? 'var(--accent)' : undefined }}
            >
              <FiBookmark size={14} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        <div className="bc-body">
          <Link to={`/blog/${blog.slug}`} className="bc-title">
            {blog.title}
          </Link>

          <p className="bc-excerpt">
            {blog.excerpt || blog.content?.replace(/<[^>]*>/g, '').substring(0, 120) + '...'}
          </p>

          {blog.tags?.length > 0 && (
            <div className="bc-tags">
              {blog.tags.slice(0, 3).map(tag => (
                <span key={tag} className="bc-tag">#{tag}</span>
              ))}
            </div>
          )}

          <div className="bc-footer">
            <div className="bc-author">
              <div className="bc-avatar">
                {blog.author?.name?.[0] || 'A'}
              </div>
              <Link to={`/author/${blog.author?._id}`} style={{ textDecoration: 'none' }}>
                <span className="bc-author-name">{blog.author?.name}</span>
              </Link>
            </div>
            <div className="bc-stats">
              <span className="bc-stat"><FiEye size={11} /> <AnimatedCounter value={blog.views || 0} /></span>
              <span className="bc-stat"><FiHeart size={11} /> <AnimatedCounter value={blog.likes?.length || 0} /></span>
              <span className="bc-stat"><FiClock size={11} /> {readTime}m</span>
            </div>
          </div>
        </div>
      </motion.article>
    </>
  )
}