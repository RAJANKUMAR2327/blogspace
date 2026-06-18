import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiBell, FiHeart, FiMessageSquare, FiUserPlus, FiCornerUpRight } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { notificationAPI } from '../../services/api'

const ICONS = {
  like:    { icon: FiHeart,         color: '#f472b6' },
  comment: { icon: FiMessageSquare, color: '#60a5fa' },
  follow:  { icon: FiUserPlus,      color: '#34d399' },
  reply:   { icon: FiCornerUpRight, color: '#a78bfa' },
  clap:    { icon: FiHeart,         color: '#fbbf24' },
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const queryClient = useQueryClient()

  const { data: unreadData } = useQuery({
    queryKey: ['notifUnread'],
    queryFn: async () => (await notificationAPI.getUnreadCount()).data,
    refetchInterval: 30000,
  })

  const { data: listData } = useQuery({
    queryKey: ['notifList'],
    queryFn: async () => (await notificationAPI.getAll()).data,
    enabled: open,
  })

  const markReadMutation = useMutation({
    mutationFn: () => notificationAPI.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifUnread'])
      queryClient.invalidateQueries(['notifList'])
    },
  })

  const unreadCount = unreadData?.count || 0
  const notifications = listData?.notifications || []

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    if (next && unreadCount > 0) markReadMutation.mutate()
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        onClick={handleToggle}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: open ? '#a78bfa' : 'rgba(255,255,255,0.5)', fontSize: 18,
          display: 'flex', alignItems: 'center', padding: 4, position: 'relative',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.color = '#a78bfa' }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
      >
        <FiBell />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -2,
            minWidth: 16, height: 16, padding: '0 4px',
            borderRadius: 8, background: '#f87171',
            color: '#fff', fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter',sans-serif", border: '2px solid #080810',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 14px)', right: 0,
          width: 340, maxHeight: 420, overflowY: 'auto',
          background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          zIndex: 1100, fontFamily: "'Inter',sans-serif",
        }}>
          <div style={{
            padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: '0.2px',
          }}>
            Notifications
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <FiBell style={{ fontSize: 24, color: 'rgba(255,255,255,0.15)', marginBottom: 10 }} />
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => {
              const { icon: Icon, color } = ICONS[n.type] || { icon: FiBell, color: '#a78bfa' }
              const content = (
                <div
                  key={n._id}
                  style={{
                    display: 'flex', gap: 12, padding: '14px 18px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    opacity: n.read ? 0.55 : 1, transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: `${color}1a`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color,
                  }}>
                    <Icon size={14} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4, marginBottom: 4 }}>
                      {n.message}
                    </p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
              return n.blog?.slug ? (
                <Link key={n._id} to={`/blog/${n.blog.slug}`} onClick={() => setOpen(false)}
                  style={{ textDecoration: 'none', display: 'block' }}>
                  {content}
                </Link>
              ) : content
            })
          )}
        </div>
      )}
    </div>
  )
}
