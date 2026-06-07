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
    { label: 'Total Stories', value: blogsData?.pagination?.total || 0, icon: FiFileText, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
    { label: 'Total Users',   value: usersData?.users?.length || 0,     icon: FiUsers,    color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
    { label: 'Total Views',   value: totalViews,                         icon: FiEye,      color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    { label: 'Total Likes',   value: totalLikes,                         icon: FiHeart,    color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
  ]

  return (
    <div style={{ background: '#080810', minHeight: '100vh', paddingTop: 64, fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500&display=swap');
        .dash-table-row { transition: background 0.2s; }
        .dash-table-row:hover { background: rgba(255,255,255,0.02); }
        .dash-action-btn {
          padding:6px; border-radius:6px; border:none; cursor:pointer;
          display:flex; align-items:center; transition:all 0.2s;
          background:rgba(255,255,255,0.04);
        }
        .dash-action-btn.edit { color:rgba(96,165,250,0.7); }
        .dash-action-btn.edit:hover { color:#60a5fa; background:rgba(96,165,250,0.1); }
        .dash-action-btn.del { color:rgba(248,113,113,0.5); }
        .dash-action-btn.del:hover { color:#f87171; background:rgba(248,113,113,0.1); }
      `}</style>

      <div style={{ padding: '48px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(167,139,250,0.6)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 16, height: 1, background: 'rgba(167,139,250,0.4)', display: 'inline-block' }} />
              Admin Panel
            </div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
              Dashboard
            </h1>
          </div>
          <Link to="/admin/create" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 24px', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white', borderRadius: 12, textDecoration: 'none', fontSize: 14, fontWeight: 500, boxShadow: '0 8px 24px rgba(124,58,237,0.3)', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 32px rgba(124,58,237,0.5)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.3)'}>
            <FiPlus /> New Story
          </Link>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 40 }}>
          {STATS.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = color + '30'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
              <div style={{ display: 'inline-flex', padding: 12, borderRadius: 12, background: bg, marginBottom: 16 }}>
                <Icon size={22} style={{ color }} />
              </div>
              <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                {value.toLocaleString()}
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 40 }}>
          {[
            { to: '/admin/users',    label: 'Manage Users',    icon: FiUsers,      color: '#60a5fa' },
            { to: '/admin/comments', label: 'Manage Comments', icon: FiTrendingUp, color: '#34d399' },
            { to: '/admin/create',   label: 'Write New Story', icon: FiPlus,       color: '#a78bfa' },
          ].map(({ to, label, icon: Icon, color }) => (
            <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, textDecoration: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 500, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color + '40'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}>
              <Icon size={18} style={{ color }} /> {label}
            </Link>
          ))}
        </div>

        {/* Blog Table */}
        <div style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#fff' }}>All Stories</h2>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{blogsData?.blogs?.length || 0} total</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {['Title', 'Category', 'Status', 'Views', 'Likes', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.25)', letterSpacing: '1px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blogsData?.blogs?.map(blog => (
                  <tr key={blog._id} className="dash-table-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#fff', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{blog.title}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{blog.author?.name}</p>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 6, background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}>
                        {blog.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 6, background: blog.status === 'published' ? 'rgba(52,211,153,0.1)' : 'rgba(251,146,60,0.1)', color: blog.status === 'published' ? '#34d399' : '#fb923c', border: `1px solid ${blog.status === 'published' ? 'rgba(52,211,153,0.2)' : 'rgba(251,146,60,0.2)'}` }}>
                        {blog.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>{blog.views || 0}</td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>{blog.likes?.length || 0}</td>
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
                <p style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>No stories yet</p>
                <Link to="/admin/create" style={{ display: 'inline-block', padding: '10px 24px', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
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
