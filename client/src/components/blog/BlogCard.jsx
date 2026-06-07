import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthContext } from '../../context/AuthContext'
import { userAPI } from '../../services/api'
import { FiBookmark, FiEye, FiHeart, FiClock } from 'react-icons/fi'
import toast from 'react-hot-toast'

const CAT_COLORS = {
  Technology:  '#a78bfa',
  Programming: '#60a5fa',
  Design:      '#34d399',
  Business:    '#f472b6',
  Science:     '#fb923c',
  Health:      '#4ade80',
  Travel:      '#facc15',
  Food:        '#f87171',
  Lifestyle:   '#c084fc',
  Other:       '#94a3b8',
}

const FALLBACK = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop'

export default function BlogCard({ blog }) {
  const { user } = useContext(AuthContext)
  const queryClient = useQueryClient()
  const catColor = CAT_COLORS[blog.category] || '#a78bfa'
  const readTime = blog.readTime || Math.ceil((blog.content?.replace(/<[^>]*>/g, '').split(' ').length || 0) / 200) || 1

  const saveMutation = useMutation({
    mutationFn: () => userAPI.toggleSave(blog._id),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['savedBlogs'])
      toast.success(res.data.isSaved ? 'Saved!' : 'Removed from saved')
    }
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500&display=swap');
        .blog-card {
          background: #0d0d1a; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px; overflow: hidden; transition: all 0.3s;
          display: flex; flex-direction: column; font-family: 'Inter', sans-serif;
        }
        .blog-card:hover {
          transform: translateY(-5px); border-color: rgba(167,139,250,0.2);
          box-shadow: 0 16px 40px rgba(124,58,237,0.15);
        }
        .blog-card:hover .bc-img { transform: scale(1.07); opacity: 0.7; }
        .bc-img-wrap { height: 190px; overflow: hidden; background: #111120; position: relative; }
        .bc-img { width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease,opacity 0.3s;opacity:0.6; }
        .bc-cat-badge {
          position:absolute;top:12px;left:12px;
          font-size:10px;letter-spacing:1.5px;text-transform:uppercase;
          padding:4px 10px;border-radius:100px;font-weight:500;
          backdrop-filter:blur(8px);
        }
        .bc-save-btn {
          position:absolute;top:10px;right:10px;
          background:rgba(8,8,16,0.7);border:1px solid rgba(255,255,255,0.1);
          border-radius:8px;padding:6px;cursor:pointer;
          display:flex;align-items:center;color:rgba(255,255,255,0.4);
          transition:all 0.2s;backdrop-filter:blur(8px);
        }
        .bc-save-btn:hover { color:#a78bfa;border-color:rgba(167,139,250,0.3); }
        .bc-body { padding: 18px; flex: 1; display: flex; flex-direction: column; }
        .bc-title {
          font-family:'Syne',sans-serif;font-size:16px;font-weight:700;
          line-height:1.35;letter-spacing:-0.2px;color:#fff;margin-bottom:8px;
          text-decoration:none;display:block;transition:color 0.2s;
        }
        .bc-title:hover { color: #a78bfa; }
        .bc-excerpt {
          font-size:13px;color:rgba(255,255,255,0.35);line-height:1.6;
          margin-bottom:16px;font-weight:300;flex:1;
          display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
        }
        .bc-tags { display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px; }
        .bc-tag {
          font-size:10px;letter-spacing:1px;text-transform:uppercase;
          padding:3px 8px;border-radius:4px;
          background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.3);
        }
        .bc-footer {
          display:flex;align-items:center;justify-content:space-between;
          padding-top:12px;border-top:1px solid rgba(255,255,255,0.05);
        }
        .bc-author { display:flex;align-items:center;gap:7px; }
        .bc-avatar {
          width:24px;height:24px;border-radius:50%;
          background:linear-gradient(135deg,#7c3aed,#2563eb);
          display:flex;align-items:center;justify-content:center;
          font-size:10px;font-weight:700;color:#fff;flex-shrink:0;
        }
        .bc-author-name { font-size:12px;color:rgba(255,255,255,0.35); }
        .bc-stats { display:flex;align-items:center;gap:10px; }
        .bc-stat { display:flex;align-items:center;gap:3px;font-size:11px;color:rgba(255,255,255,0.2); }
      `}</style>

      <article className="blog-card">
        <div className="bc-img-wrap">
          <Link to={`/blog/${blog.slug}`}>
            <img
              className="bc-img"
              src={blog.image || FALLBACK}
              alt={blog.title}
              loading="lazy"
            />
          </Link>
          <span
            className="bc-cat-badge"
            style={{ background: `${catColor}20`, color: catColor, border: `1px solid ${catColor}30` }}
          >
            {blog.category}
          </span>
          {user && (
            <button
              className="bc-save-btn"
              onClick={(e) => { e.preventDefault(); saveMutation.mutate() }}
              title="Save article"
            >
              <FiBookmark size={14} />
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
              <span className="bc-author-name">{blog.author?.name}</span>
            </div>
            <div className="bc-stats">
              <span className="bc-stat"><FiEye size={11} /> {blog.views || 0}</span>
              <span className="bc-stat"><FiHeart size={11} /> {blog.likes?.length || 0}</span>
              <span className="bc-stat"><FiClock size={11} /> {readTime}m</span>
            </div>
          </div>
        </div>
      </article>
    </>
  )
}