import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FiBell, FiHeart, FiMessageSquare, FiUserPlus, FiCornerDownRight, FiCheck, FiX } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import axios from '../../services/api'
// Import EmptyState assuming it is in the same directory or adjust path accordingly
import EmptyState from './EmptyState'

const notificationAPI = {
  getAll:      ()   => axios.get('/notifications'),
  markRead:    (id) => axios.put(`/notifications/${id}/read`),
  markAllRead: ()   => axios.put('/notifications/read-all'),
  remove:      (id) => axios.delete(`/notifications/${id}`),
}

const ICON_MAP = {
  like:    { icon: FiHeart,         color: '#f472b6' },
  comment: { icon: FiMessageSquare, color: '#60a5fa' },
  follow:  { icon: FiUserPlus,      color: '#34d399' },
  reply:   { icon: FiCornerDownRight, color: '#a78bfa' },
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await notificationAPI.getAll()
      return res.data
    },
    refetchInterval: 30000 // poll every 30s
  })

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationAPI.markRead(id),
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationAPI.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  })

  const removeMutation = useMutation({
    mutationFn: (id) => notificationAPI.remove(id),
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  })

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const notifications = data?.notifications || []
  const unreadCount = data?.unreadCount || 0

  return (
    <div ref={ref} style={{ position: 'relative', fontFamily: "'Inter',sans-serif" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', display: 'flex', alignItems: 'center', padding: 4
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
        onMouseLeave={e => e.currentTarget.style.color = unreadCount > 0 ? '#a78bfa' : 'var(--text-secondary)'}>
        <FiBell style={{ color: unreadCount > 0 ? '#a78bfa' : 'inherit' }} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -2, minWidth: 16, height: 16,
            background: '#f472b6', borderRadius: 8, fontSize: 10, fontWeight: 700,
            color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 10,
          width: 360, maxHeight: 480, overflowY: 'auto',
          background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
          borderRadius: 14, boxShadow: '0 20px 48px rgba(0,0,0,0.6)', zIndex: 200
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border-soft)' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={() => markAllReadMutation.mutate()}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a78bfa', fontSize: 12, fontFamily: "'Inter',sans-serif" }}>
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: '24px 0' }}>
              <EmptyState 
                illustration="noNotifications" 
                title="All caught up" 
                description="No new notifications" 
              />
            </div>
          ) : (
            notifications.map(n => {
              const { icon: Icon, color } = ICON_MAP[n.type] || ICON_MAP.like
              return (
                <div key={n._id}
                  style={{
                    display: 'flex', gap: 12, padding: '14px 18px',
                    borderBottom: '1px solid var(--bg-surface-2)',
                    background: n.isRead ? 'transparent' : 'rgba(167,139,250,0.04)',
                    transition: 'background 0.2s'
                  }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      to={n.blog ? `/blog/${n.blog.slug}` : '#'}
                      onClick={() => { if (!n.isRead) markReadMutation.mutate(n._id); setOpen(false) }}
                      style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textDecoration: 'none', lineHeight: 1.4, display: 'block' }}>
                      {n.message}
                    </Link>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                    {!n.isRead && (
                      <button onClick={() => markReadMutation.mutate(n._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex' }}
                        title="Mark as read">
                        <FiCheck size={13} />
                      </button>
                    )}
                    <button onClick={() => removeMutation.mutate(n._id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex' }}
                      title="Remove">
                      <FiX size={13} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}