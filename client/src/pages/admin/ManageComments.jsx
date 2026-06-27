import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { commentAPI, blogAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { FiTrash2, FiSearch, FiMessageSquare, FiFilter, FiCheck, FiX, FiFlag } from 'react-icons/fi'

export default function ManageComments() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all | flagged | pending

  // Fetch blogs for dashboard stats context
  const { data: blogsData } = useQuery({
    queryKey: ['adminBlogsList'],
    queryFn: async () => {
      const res = await blogAPI.getAll({ limit: 100 })
      return res.data.blogs
    }
  })

  // Unified comments query matching active pill layout view
  const { data: comments, isLoading } = useQuery({
    queryKey: ['adminComments', filter],
    queryFn: async () => {
      const res = await commentAPI.getAllAdmin(filter === 'all' ? undefined : filter)
      return res.data.comments || []
    }
  })

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id) => commentAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminComments'])
      toast.success('Comment deleted')
    }
  })

  const approveMutation = useMutation({
    mutationFn: (id) => commentAPI.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminComments'])
      toast.success('Comment approved')
    }
  })

  const rejectMutation = useMutation({
    mutationFn: (id) => commentAPI.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminComments'])
      toast.success('Comment rejected')
    }
  })

  // Client-side text filter matching
  const filteredComments = comments?.filter(c =>
    c.content?.toLowerCase().includes(search.toLowerCase()) ||
    c.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.blogTitle?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingTop: 64, fontFamily: 'var(--font-ui)' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.5}50%{opacity:1} }
        .mc-search { padding:10px 14px 10px 38px;background:var(--bg-surface-2);border:1px solid var(--border-soft);border-radius:10px;font-size:14px;color:var(--text-primary);outline:none;font-family:var(--font-ui);transition:border-color 0.2s;width:260px; }
        .mc-search:focus { border-color: var(--accent); }
        .mc-search::placeholder { color: var(--text-tertiary); }
        .del-btn { padding:7px;border-radius:8px;border:none;cursor:pointer;display:flex;align-items:center;background:var(--bg-surface-2);color:var(--danger);opacity:0.6;transition:all 0.2s; }
        .del-btn:hover { opacity:1;background:color-mix(in srgb, var(--danger) 12%, transparent); }
        .comment-row { border-bottom:1px solid var(--border-soft);transition:background 0.2s;padding:18px 24px; }
        .comment-row:hover { background: var(--bg-surface-2); }
        .skeleton { background:var(--bg-surface-2);border-radius:10px;animation:pulse 1.5s ease-in-out infinite; }
        @media (max-width: 800px) {
          .mc-row-grid { grid-template-columns: 1fr !important; gap: 8px !important; }
        }
      `}</style>

      <div style={{ padding: '48px' }}>
        {/* Header Dashboard section */}
        <div style={{ marginBottom: 32 }}>
          <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'none', marginBottom: 8, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}>
            ← Back to dashboard
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Manage Comments
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginTop: 4 }}>
            {comments?.length || 0} total comments in view
          </p>
        </div>

        {/* Aggregate Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Active Queue', value: comments?.length || 0, colorVar: '--accent', icon: FiMessageSquare },
            { label: 'On Stories', value: blogsData?.length || 0, colorVar: '--cat-programming', icon: FiFilter },
            { label: 'This Week', value: comments?.filter(c => new Date(c.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0, colorVar: '--success', icon: FiMessageSquare },
          ].map(({ label, value, colorVar, icon: Icon }) => (
            <div key={label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `color-mix(in srgb, var(${colorVar}) 15%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} style={{ color: `var(${colorVar})` }} />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{value}</p>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls Container */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: 8 }}>
            {['all', 'flagged', 'pending'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  border: '1px solid', fontFamily: "'Inter',sans-serif", transition: 'all 0.2s',
                  borderColor: filter === f ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.08)',
                  background: filter === f ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)',
                  color: filter === f ? '#a78bfa' : 'rgba(255,255,255,0.4)'
                }}>
                {f === 'all' ? 'All Comments' : f === 'flagged' ? '🚩 Flagged' : '⏳ Pending'}
              </button>
            ))}
          </div>

          {/* Search Wrap */}
          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: 14 }} />
            <input className="mc-search" type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search comments..." />
          </div>
        </div>

        {/* Content Sheet */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 16, overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 80 }} />
              ))}
            </div>
          ) : filteredComments?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                No comments found
              </p>
              <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>
                {search ? 'Try different search terms' : `No comments found matching layout filter "${filter}".`}
              </p>
            </div>
          ) : (
            <div>
              {/* Header Titles */}
              <div className="mc-row-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 180px 140px 110px', gap: 16, padding: '12px 24px', borderBottom: '1px solid var(--border-soft)' }}>
                {['Comment', 'Story', 'Date', 'Actions'].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '1px', textTransform: 'uppercase' }}>{h}</div>
                ))}
              </div>

              {/* Rows List */}
              {filteredComments?.map(comment => (
                <div key={comment._id} className="comment-row">
                  <div className="mc-row-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 180px 140px 110px', gap: 16, alignItems: 'start' }}>
                    
                    {/* Comment Area */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifycontent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-on-accent)', flexShrink: 0, justifyContent: 'center' }}>
                          {comment.user?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                          {comment.user?.name || 'Unknown'}
                        </span>

                        {/* Inline flag reason badge component */}
                        {comment.isFlagged && (
                          <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: 'rgba(251,146,60,0.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.25)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <FiFlag size={9} /> {comment.flagReason || 'Flagged'}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--text-tertiary)', lineHeight: 1.6, fontWeight: 400, paddingLeft: 40 }}>
                        {comment.content}
                      </p>
                    </div>

                    {/* Blog Column Link */}
                    <div>
                      <Link to={`/blog/${comment.blogSlug}`}
                        style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5, transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-strong)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}>
                        {comment.blogTitle}
                      </Link>
                    </div>

                    {/* Date Column */}
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                      {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : '—'}
                    </div>

                    {/* Functional Moderation Actions Alignment Wrap */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {/* Contextual verification button states */}
                      {!comment.isApproved && (
                        <button onClick={() => approveMutation.mutate(comment._id)} className="del-btn" style={{ color: 'rgba(52,211,153,0.6)' }} title="Approve">
                          <FiCheck size={14} />
                        </button>
                      )}
                      {comment.isApproved && (
                        <button onClick={() => rejectMutation.mutate(comment._id)} className="del-btn" style={{ color: 'rgba(251,146,60,0.6)' }} title="Hide/Reject">
                          <FiX size={14} />
                        </button>
                      )}
                      
                      {/* Trash Delete Action */}
                      <button
                        onClick={() => window.confirm('Delete this comment permanently?')}
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