import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { userAPI } from '../../services/api'
import { formatDistanceToNow } from 'date-fns'
import { FiShield, FiTrash2, FiUserX, FiUserCheck, FiActivity } from 'react-icons/fi'

const ACTION_META = {
  ban_user:    { label: 'Banned user',   icon: FiUserX,    color: '#f87171' },
  unban_user:  { label: 'Unbanned user', icon: FiUserCheck, color: '#34d399' },
  delete_user: { label: 'Deleted user',  icon: FiTrash2,   color: '#fb923c' },
}

export default function AuditLogs() {
  const { data, isLoading } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      const res = await userAPI.getAuditLogs()
      return res.data.logs
    }
  })

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingTop: 64, fontFamily: 'var(--font-ui)' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        .al-row:hover { background: var(--bg-surface-2); }
      `}</style>

      <div style={{ padding: 48 }}>
        <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', textDecoration: 'none', marginBottom: 8 }}>
          ← Back to dashboard
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <FiShield size={22} style={{ color: '#a78bfa' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--text-primary)' }}>Audit Logs</h1>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 32 }}>
          Record of sensitive admin actions (bans, deletions) — most recent 100
        </p>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 16, overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ height: 48, background: 'var(--bg-surface-2)', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : !data?.length ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <FiActivity size={32} style={{ color: 'var(--text-tertiary)', marginBottom: 12, opacity: 0.5 }} />
              <p style={{ color: 'var(--text-tertiary)' }}>No admin actions recorded yet</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                    {['Action', 'Performed By', 'Details', 'IP', 'When'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map(log => {
                    const meta = ACTION_META[log.action] || { label: log.action, icon: FiActivity, color: 'var(--text-secondary)' }
                    const Icon = meta.icon
                    return (
                      <tr key={log._id} className="al-row" style={{ borderBottom: '1px solid var(--border-soft)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: meta.color }}>
                            <Icon size={13} /> {meta.label}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                          {log.actor?.name || 'Unknown'}
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{log.actor?.email}</div>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', maxWidth: 320 }}>
                          {log.details || '—'}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                          {log.ip || '—'}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 12, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
