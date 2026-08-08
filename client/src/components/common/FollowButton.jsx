import { useContext } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthContext } from '../../context/AuthContext'
import { userAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function FollowButton({ userId, isFollowing }) {
  const { user } = useContext(AuthContext)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: () => userAPI.follow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['publicProfile', userId])
      queryClient.invalidateQueries({ queryKey: ['blog'] }) // FollowButton also appears on article pages
      toast.success(isFollowing ? 'Unfollowed' : 'Following!')
    },
    onError: () => toast.error('Failed to follow')
  })

  if (user?._id === userId) return null

  return (
    <button
      onClick={() => user ? mutation.mutate() : navigate('/login')}
      disabled={mutation.isPending}
      style={{
        padding: '8px 20px',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--text-sm)',
        fontWeight: 500,
        cursor: mutation.isPending ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        fontFamily: 'var(--font-ui)',
        border: isFollowing ? '1px solid var(--border-strong)' : 'none',
        background: isFollowing ? 'var(--bg-surface-2)' : 'var(--accent)',
        color: isFollowing ? 'var(--text-secondary)' : 'var(--text-on-accent)',
        opacity: mutation.isPending ? 0.6 : 1,
      }}
      onMouseEnter={e => {
        if (!isFollowing) e.currentTarget.style.background = 'var(--accent-strong)'
      }}
      onMouseLeave={e => {
        if (!isFollowing) e.currentTarget.style.background = 'var(--accent)'
      }}
    >
      {mutation.isPending ? '...' : isFollowing ? '✓ Following' : '+ Follow'}
    </button>
  )
}
