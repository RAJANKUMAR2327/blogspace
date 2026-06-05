import { useContext, useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blogAPI, commentAPI, userAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  FiHeart,
  FiEye,
  FiClock,
  FiShare2,
  FiTrash2
} from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import SEO from '../components/common/SEO'

export default function SingleBlog() {
  const { slug } = useParams()
  const { user } = useContext(AuthContext)
  const queryClient = useQueryClient()
  const [comment, setComment] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      const res = await blogAPI.getBySlug(slug)
      return res.data.blog
    }
  })

  const { data: comments } = useQuery({
    queryKey: ['comments', data?._id],
    queryFn: async () => {
      const res = await commentAPI.getAll(data._id)
      return res.data.comments
    },
    enabled: !!data?._id
  })

  useEffect(() => {
    if (data?._id && user && userAPI?.addToHistory) {
      userAPI.addToHistory(data._id).catch(() => {})
    }
  }, [data?._id, user])

  const likeMutation = useMutation({
    mutationFn: () => blogAPI.toggleLike(data._id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['blog', slug]
      })
    }
  })

  const commentMutation = useMutation({
    mutationFn: (content) =>
      commentAPI.add(data._id, { content }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comments', data._id]
      })

      setComment('')
      toast.success('Comment added!')
    }
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (id) => commentAPI.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comments', data._id]
      })
    }
  })

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        Loading...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">
          Blog not found
        </h2>

        <Link
          to="/blogs"
          className="text-purple-600 hover:underline mt-4 block"
        >
          ← Back to blogs
        </Link>
      </div>
    )
  }

  const isLiked =
    user && data.likes?.includes(user._id)

  return (
    <>
      <SEO
        title={data.title}
        description={
          data.excerpt ||
          data.content
            ?.replace(/<[^>]*>/g, '')
            .slice(0, 160)
        }
        image={data.image}
        url={window.location.href}
      />

      {/* KEEP ALL YOUR EXISTING JSX BELOW THIS LINE */}
    </>
  )
}