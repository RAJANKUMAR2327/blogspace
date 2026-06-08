import { useContext } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthContext } from '../../context/AuthContext'
import { userAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function FollowButton({ userId, isFollowing, followersCount }) {
  const { user } = useContext(AuthContext)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: () => userAPI.follow(userId),
    onSuccess: () => queryClient.invalidateQueries(['publicProfile', userId]),
    onError: () => toast.error('Failed to follow')
  })

  if (user?._id === userId) return null

  return (
    <button
      onClick={() => user ? mutation.mutate() : navigate('/login')}
      disabled={mutation.isPending}
      style={{
        padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500,
        cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Inter',sans-serif",
        border: isFollowing ? '1px solid rgba(255,255,255,0.12)' : 'none',
        background: isFollowing ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#7c3aed,#2563eb)',
        color: isFollowing ? 'rgba(255,255,255,0.6)' : '#fff',
      }}>
      {mutation.isPending ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}