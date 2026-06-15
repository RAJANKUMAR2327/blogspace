import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { commentAPI, blogAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { FiTrash2, FiSearch, FiMessageSquare, FiFilter } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'

export default function ManageComments() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedBlog, setSelectedBlog] = useState('all')

  const { data: blogsData } = useQuery({
    queryKey: ['adminBlogsList'],
    queryFn: async () => {
      const res = await blogAPI.getAll({ limit: 100 })
      return res.data.blogs
    }
  })

  const { data: comments, isLoading } = useQuery({
    queryKey: ['adminComments', selectedBlog],
    queryFn: async () => {
      if (!blogsData?.length) return []
      const allComments = []
      const blogsToFetch = selectedBlog === 'all' ? blogsData : blogsData.filter(b => b._id === selectedBlog)
      for (const blog of blogsToFetch) {
        try {
          const res = await commentAPI.getAll(blog._id)
          const enriched = (res.data.comments || []).map(c => ({
            ...c,
            blogTitle: blog.title,
            blogSlug: blog.slug,
            blogId: blog._id
          }))
          allComments.push(...enriched)
        } catch { /* skip */ }
      }
      return allComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    },
    enabled: !!blogsData
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => commentAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminComments'])
      toast.success('Comment deleted')
    }
  })

  const filtered = comments?.filter(c =>
    c.content?.toLowerCase().includes(search.toLowerCase()) ||
    c.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.blogTitle?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ background: '#080810', minHeight: '100vh', paddingTop: 64, fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500&display=swap');
        @keyframes pulse { 0%,100%{opacity:0.5}50%{opacity:1} }
        .mc-search { padding:10px 14px 10px 38px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:10px;font-size:14px;color:#fff;outline:none;font-family:'Inter',sans-serif;transition:border-color 0.2s;width:260px; }
        .mc-search:focus { border-color:rgba(167,139,250,0.4); }
        .mc-search::placeholder { color:rgba(255,255,255,0.2); }
        .mc-select { padding:10px 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:10px;font-size:13px;color:rgba(255,255,255,0.6);outline:none;font-family:'Inter',sans-serif;cursor:pointer;appearance:none;min-width:200px; }
        .mc-select option { background:#0d0d1a;color:#fff; }
        .del-btn { padding:7px;border-radius:8px;border:none;cursor:pointer;display:flex;align-items:center;background:rgba(255,255,255,0.04);color:rgba(248,113,113,0.5);transition:all 0.2s; }
        .del-btn:hover { color:#f87171;background:rgba(248,113,113,0.1); }
        .comment-row { border-bottom:1px solid rgba(255,255,255,0.03);transition:background 0.2s;padding:18px 24px; }
        .comment-row:hover { background:rgba(255,255,255,0.02); }
        .skeleton { background:rgba(255,255,255,0.05);border-radius:10px;animation:pulse 1.5s ease-in-out infinite; }
      `}</style>

      <div style={{ padding: '48px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', marginBottom: 8, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
            ← Back to dashboard
          </Link>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Manage Comments
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
            {comments?.length || 0} total comments
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Total Comments', value: comments?.length || 0, color: '#a78bfa', icon: FiMessageSquare },
            { label: 'On Stories', value: blogsData?.length || 0, color: '#60a5fa', icon: FiFilter },
            { label: 'This Week', value: comments?.filter(c => new Date(c.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0, color: '#34d399', icon: FiMessageSquare },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{value}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', fontSize: 14 }} />
            <input className="mc-search" type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search comments..." />
          </div>
          <div style={{ position: 'relative' }}>
            <select className="mc-select" value={selectedBlog} onChange={(e) => setSelectedBlog(e.target.value)}>
              <option value="all">All Stories</option>
              {blogsData?.map(blog => (
                <option key={blog._id} value={blog._id}>
                  {blog.title.substring(0, 45)}{blog.title.length > 45 ? '...' : ''}
                </option>
              ))}
            </select>
            <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none', fontSize: 11 }}>▼</span>
          </div>
        </div>

        {/* Comments List */}
        <div style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 80 }} />
              ))}
            </div>
          ) : filtered?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                No comments found
              </p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                {search ? 'Try different search terms' : 'No comments yet on any story'}
              </p>
            </div>
          ) : (
            <div>
              {/* Table Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 140px 60px', gap: 16, padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {['Comment', 'Story', 'Date', ''].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.25)', letterSpacing: '1px', textTransform: 'uppercase' }}>{h}</div>
                ))}
              </div>

              {filtered?.map(comment => (
                <div key={comment._id} className="comment-row">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 140px 60px', gap: 16, alignItems: 'start' }}>
                    {/* Comment Content */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {comment.user?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
                          {comment.user?.name || 'Unknown'}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontWeight: 300, paddingLeft: 40 }}>
                        {comment.content}
                      </p>
                    </div>

                    {/* Story */}
                    <div>
                      <Link to={`/blog/${comment.blogSlug}`}
                        style={{ fontSize: 12, color: '#a78bfa', textDecoration: 'none', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5, transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#c4b5fd'}
                        onMouseLeave={e => e.currentTarget.style.color = '#a78bfa'}>
                        {comment.blogTitle}
                      </Link>
                    </div>

                    {/* Date */}
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </div>

                    {/* Actions */}
                    <div>
                      <button
                        onClick={() => window.confirm('Delete this comment?') && deleteMutation.mutate(comment._id)}
                        className="del-btn" title="Delete comment">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
