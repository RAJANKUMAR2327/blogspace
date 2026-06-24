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
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingTop: 64, fontFamily: 'var(--font-ui)' }}>
      <style>{`
        .mu-search { padding:10px 14px 10px 38px;background:var(--bg-surface-2);border:1px solid var(--border-soft);border-radius:10px;font-size:14px;color:var(--text-primary);outline:none;font-family:var(--font-ui);transition:border-color 0.2s;width:260px; }
        .mu-search:focus { border-color: var(--accent); }
        .mu-search::placeholder { color: var(--text-tertiary); }
        .filter-pill { padding:7px 14px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;transition:all 0.2s;border:1px solid var(--border-soft);background:var(--bg-surface-2);color:var(--text-tertiary);font-family:var(--font-ui); }
        .filter-pill:hover { color: var(--text-primary); }
        .filter-pill.active { background: var(--accent-soft);border-color: var(--accent);color: var(--accent-strong); }
        .action-btn { padding:6px;border-radius:6px;border:none;cursor:pointer;display:flex;align-items:center;transition:all 0.2s;background:var(--bg-surface-2); }
        .action-btn.ban { color: var(--cat-travel); opacity: 0.7; }
        .action-btn.ban:hover { opacity: 1; background: color-mix(in srgb, var(--cat-travel) 15%, transparent); }
        .action-btn.unban { color: var(--success); opacity: 0.7; }
        .action-btn.unban:hover { opacity: 1; background: color-mix(in srgb, var(--success) 15%, transparent); }
        .action-btn.del { color: var(--danger); opacity: 0.6; }
        .action-btn.del:hover { opacity: 1; background: color-mix(in srgb, var(--danger) 12%, transparent); }
        .row-hover { transition:background 0.2s; }
        .row-hover:hover { background: var(--bg-surface-2); }
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }

        .mu-page-pad { padding: 48px; }
        .mu-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
        @media (max-width: 900px) {
          .mu-page-pad { padding: 32px 24px; }
          .mu-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .mu-search { width: 100% !important; }
        }
        @media (max-width: 480px) {
          .mu-page-pad { padding: 24px 16px; }
        }
      `}</style>

      <div className="mu-page-pad">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'none', marginBottom: 8, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}>
            ← Back to dashboard
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,5vw,32px)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Manage Users
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginTop: 4 }}>
            {data?.length || 0} total users registered
          </p>
        </div>

        {/* Stats */}
        <div className="mu-stats-grid">
          {[
            { label: 'Total Users', value: data?.length || 0, colorVar: '--accent' },
            { label: 'Admins', value: data?.filter(u => u.role === 'admin').length || 0, colorVar: '--cat-programming' },
            { label: 'Active', value: data?.filter(u => !u.isBanned).length || 0, colorVar: '--success' },
            { label: 'Banned', value: data?.filter(u => u.isBanned).length || 0, colorVar: '--danger' },
          ].map(({ label, value, colorVar }) => (
            <div key={label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '16px 20px' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: `var(${colorVar})`, marginBottom: 4 }}>{value}</p>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 260 }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: 14 }} />
            <input className="mu-search" type="text" value={search}
              onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['all', 'admin', 'active', 'banned'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`filter-pill ${filter === f ? 'active' : ''}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 16, overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ height: 52, background: 'var(--bg-surface-2)', borderRadius: 8, animation: 'pulse 1.5s ease infinite' }} />
              ))}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                    {['User', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered?.map(user => (
                    <tr key={user._id} className="row-hover" style={{ borderBottom: '1px solid var(--border-soft)' }}>
                      {/* User */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: user.profileImage ? 'transparent' : 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--text-on-accent)', flexShrink: 0, overflow: 'hidden' }}>
                            {user.profileImage
                              ? <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : user.name?.[0]?.toUpperCase()
                            }
                          </div>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2, whiteSpace: 'nowrap' }}>{user.name}</p>
                            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Role */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '4px 10px', borderRadius: 6, background: user.role === 'admin' ? 'var(--accent-soft)' : 'var(--bg-surface-2)', color: user.role === 'admin' ? 'var(--accent-strong)' : 'var(--text-tertiary)', border: `1px solid ${user.role === 'admin' ? 'color-mix(in srgb, var(--accent) 25%, transparent)' : 'var(--border-soft)'}`, letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                          {user.role === 'admin' ? <FiShield size={10} /> : <FiUser size={10} />}
                          {user.role}
                        </span>
                      </td>
                      {/* Joined */}
                      <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                      </td>
                      {/* Status */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: user.isBanned ? 'color-mix(in srgb, var(--danger) 12%, transparent)' : 'color-mix(in srgb, var(--success) 12%, transparent)', color: user.isBanned ? 'var(--danger)' : 'var(--success)', border: `1px solid ${user.isBanned ? 'color-mix(in srgb, var(--danger) 25%, transparent)' : 'color-mix(in srgb, var(--success) 25%, transparent)'}`, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
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
                  <p style={{ color: 'var(--text-tertiary)' }}>No users found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}