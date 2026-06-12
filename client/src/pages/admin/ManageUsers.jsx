import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { FiTrash2, FiSlash, FiCheck, FiSearch, FiShield, FiUser } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ManageUsers() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const res = await userAPI.getAllUsers()
      return res.data.users
    }
  })

  const banMutation = useMutation({
    mutationFn: (id) => userAPI.toggleBan(id),
    onSuccess: () => { queryClient.invalidateQueries(['allUsers']); toast.success('User status updated') }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => userAPI.deleteUser(id),
    onSuccess: () => { queryClient.invalidateQueries(['allUsers']); toast.success('User deleted') }
  })

  const filtered = data?.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' ? true :
      filter === 'admin' ? u.role === 'admin' :
      filter === 'banned' ? u.isBanned : !u.isBanned
    return matchSearch && matchFilter
  })

  return (
    <div style={{ background: '#080810', minHeight: '100vh', paddingTop: 64, fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500&display=swap');
        .mu-search { padding:10px 14px 10px 38px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:10px;font-size:14px;color:#fff;outline:none;font-family:'Inter',sans-serif;transition:border-color 0.2s;width:260px; }
        .mu-search:focus { border-color:rgba(167,139,250,0.4); }
        .mu-search::placeholder { color:rgba(255,255,255,0.2); }
        .filter-pill { padding:7px 14px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;transition:all 0.2s;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.4);font-family:'Inter',sans-serif; }
        .filter-pill:hover { color:rgba(255,255,255,0.7); }
        .filter-pill.active { background:rgba(124,58,237,0.2);border-color:rgba(124,58,237,0.35);color:#a78bfa; }
        .action-btn { padding:6px;border-radius:6px;border:none;cursor:pointer;display:flex;align-items:center;transition:all 0.2s;background:rgba(255,255,255,0.04); }
        .action-btn.ban { color:rgba(251,146,60,0.6); }
        .action-btn.ban:hover { color:#fb923c;background:rgba(251,146,60,0.1); }
        .action-btn.unban { color:rgba(52,211,153,0.6); }
        .action-btn.unban:hover { color:#34d399;background:rgba(52,211,153,0.1); }
        .action-btn.del { color:rgba(248,113,113,0.5); }
        .action-btn.del:hover { color:#f87171;background:rgba(248,113,113,0.1); }
        .row-hover { transition:background 0.2s; }
        .row-hover:hover { background:rgba(255,255,255,0.02); }
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
            Manage Users
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
            {data?.length || 0} total users registered
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Total Users', value: data?.length || 0, color: '#a78bfa' },
            { label: 'Admins', value: data?.filter(u => u.role === 'admin').length || 0, color: '#60a5fa' },
            { label: 'Active', value: data?.filter(u => !u.isBanned).length || 0, color: '#34d399' },
            { label: 'Banned', value: data?.filter(u => u.isBanned).length || 0, color: '#f87171' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 20px' }}>
              <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color, marginBottom: 4 }}>{value}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', fontSize: 14 }} />
            <input className="mu-search" type="text" value={search}
              onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'admin', 'active', 'banned'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`filter-pill ${filter === f ? 'active' : ''}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ height: 52, background: 'rgba(255,255,255,0.04)', borderRadius: 8, animation: 'pulse 1.5s ease infinite' }} />
              ))}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {['User', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.25)', letterSpacing: '1px', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered?.map(user => (
                    <tr key={user._id} className="row-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      {/* User */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: user.profileImage ? 'transparent' : 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
                            {user.profileImage
                              ? <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : user.name?.[0]?.toUpperCase()
                            }
                          </div>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 2 }}>{user.name}</p>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Role */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '4px 10px', borderRadius: 6, background: user.role === 'admin' ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.06)', color: user.role === 'admin' ? '#a78bfa' : 'rgba(255,255,255,0.4)', border: `1px solid ${user.role === 'admin' ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.08)'}`, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                          {user.role === 'admin' ? <FiShield size={10} /> : <FiUser size={10} />}
                          {user.role}
                        </span>
                      </td>
                      {/* Joined */}
                      <td style={{ padding: '14px 20px', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                      </td>
                      {/* Status */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: user.isBanned ? 'rgba(248,113,113,0.1)' : 'rgba(52,211,153,0.1)', color: user.isBanned ? '#f87171' : '#34d399', border: `1px solid ${user.isBanned ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.2)'}`, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {user.isBanned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => banMutation.mutate(user._id)}
                            className={`action-btn ${user.isBanned ? 'unban' : 'ban'}`}
                            title={user.isBanned ? 'Unban user' : 'Ban user'}>
                            {user.isBanned ? <FiCheck size={14} /> : <FiSlash size={14} />}
                          </button>
                          <button
                            onClick={() => window.confirm(`Delete ${user.name}?`) && deleteMutation.mutate(user._id)}
                            className="action-btn del" title="Delete user">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered?.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                  <p style={{ color: 'rgba(255,255,255,0.3)' }}>No users found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}