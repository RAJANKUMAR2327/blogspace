import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { blogAPI, userAPI } from '../../services/api'
import { FiUsers, FiFileText, FiEye, FiHeart, FiPlus, FiEdit2, FiTrash2, FiTrendingUp } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const queryClient = useQueryClient()

  const { data: blogsData } = useQuery({
    queryKey: ['adminBlogs'],
    queryFn: async () => {
      const res = await blogAPI.getAll({ limit: 100 })
      return res.data
    }
  })

  const { data: usersData } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await userAPI.getAllUsers()
      return res.data
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => blogAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminBlogs'])
      toast.success('Blog deleted')
    }
  })

  const totalViews = blogsData?.blogs?.reduce((s, b) => s + (b.views || 0), 0) || 0
  const totalLikes = blogsData?.blogs?.reduce((s, b) => s + (b.likes?.length || 0), 0) || 0

  const STATS = [
    { label: 'Total Stories', value: blogsData?.pagination?.total || 0, icon: FiFileText, colorVar: '--cat-technology' },
    { label: 'Total Users',   value: usersData?.users?.length || 0,     icon: FiUsers,    colorVar: '--cat-programming' },
    { label: 'Total Views',   value: totalViews,                         icon: FiEye,      colorVar: '--success' },
    { label: 'Total Likes',   value: totalLikes,                         icon: FiHeart,    colorVar: '--like' },
  ]

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingTop: 64, fontFamily: 'var(--font-ui)' }}>
      <style>{`
        .dash-table-row { transition: background 0.2s; }
        .dash-table-row:hover { background: var(--bg-surface-2); }
        .dash-action-btn {
          padding:6px; border-radius:6px; border:none; cursor:pointer;
          display:flex; align-items:center; transition:all 0.2s;
          background:var(--bg-surface-2);
        }
        .dash-action-btn.edit { color: var(--accent); }
        .dash-action-btn.edit:hover { background: var(--accent-soft); }
        .dash-action-btn.del { color: var(--danger); opacity: 0.6; }
        .dash-action-btn.del:hover { opacity: 1; background: color-mix(in srgb, var(--danger) 12%, transparent); }
      `}</style>

      <div style={{ padding: '48px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 16, height: 1, background: 'var(--accent)', display: 'inline-block' }} />
              Admin Panel
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              Dashboard
            </h1>
          </div>
          <Link to="/admin/create" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 24px', background: 'var(--accent)', color: 'var(--text-on-accent)', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: 14, fontWeight: 500, boxShadow: 'var(--shadow-pop)', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-strong)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
            <FiPlus /> New Story
          </Link>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 40 }}>
          {STATS.map(({ label, value, icon: Icon, colorVar }) => (
            <div key={label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-lg)', padding: 24, transition: 'border-color 0.2s', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ display: 'inline-flex', padding: 12, borderRadius: 12, background: `color-mix(in srgb, var(${colorVar}) 15%, transparent)`, marginBottom: 16 }}>
                <Icon size={22} style={{ color: `var(${colorVar})` }} />
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {value.toLocaleString()}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 40 }}>
          {[
            { to: '/admin/users',    label: 'Manage Users',    icon: FiUsers,      colorVar: '--cat-programming' },
            { to: '/admin/comments', label: 'Manage Comments', icon: FiTrendingUp, colorVar: '--success' },
            { to: '/admin/create',   label: 'Write New Story', icon: FiPlus,       colorVar: '--accent' },
          ].map(({ to, label, icon: Icon, colorVar }) => (
            <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `var(${colorVar})`; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-soft)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
              <Icon size={18} style={{ color: `var(${colorVar})` }} /> {label}
            </Link>
          ))}
        </div>

        {/* Blog Table */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>All Stories</h2>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{blogsData?.blogs?.length || 0} total</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  {['Title', 'Category', 'Status', 'Views', 'Likes', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '1px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blogsData?.blogs?.map(blog => (
                  <tr key={blog._id} className="dash-table-row" style={{ borderBottom: '1px solid var(--border-soft)' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{blog.title}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{blog.author?.name}</p>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 6, background: 'var(--accent-soft)', color: 'var(--accent-strong)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' }}>
                        {blog.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 6, background: blog.status === 'published' ? 'color-mix(in srgb, var(--success) 15%, transparent)' : 'color-mix(in srgb, var(--cat-travel) 15%, transparent)', color: blog.status === 'published' ? 'var(--success)' : 'var(--cat-travel)', border: `1px solid ${blog.status === 'published' ? 'color-mix(in srgb, var(--success) 30%, transparent)' : 'color-mix(in srgb, var(--cat-travel) 30%, transparent)'}` }}>
                        {blog.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: 'var(--text-tertiary)' }}>{blog.views || 0}</td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: 'var(--text-tertiary)' }}>{blog.likes?.length || 0}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/admin/edit/${blog._id}`} className="dash-action-btn edit" style={{ textDecoration: 'none' }}>
                          <FiEdit2 size={15} />
                        </Link>
                        <button className="dash-action-btn del"
                          onClick={() => window.confirm('Delete this story?') && deleteMutation.mutate(blog._id)}>
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(!blogsData?.blogs?.length) && (
              <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
                <p style={{ color: 'var(--text-tertiary)', marginBottom: 16 }}>No stories yet</p>
                <Link to="/admin/create" style={{ display: 'inline-block', padding: '10px 24px', background: 'var(--accent)', color: 'var(--text-on-accent)', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                  Write your first story
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
