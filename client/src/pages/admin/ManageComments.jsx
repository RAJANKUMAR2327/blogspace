import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentAPI, blogAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { FiTrash2, FiMessageSquare } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'

export default function ManageComments() {
  const queryClient = useQueryClient()
  const [selectedBlog, setSelectedBlog] = useState('all')

  const { data: blogsData } = useQuery({
    queryKey: ['adminBlogsList'],
    queryFn: async () => {
      const res = await blogAPI.getAll({ limit: 100 })
      return res.data.blogs
    }
  })

  // Get comments for selected blog or all blogs
  const { data: comments, isLoading } = useQuery({
    queryKey: ['adminComments', selectedBlog],
    queryFn: async () => {
      if (selectedBlog === 'all') {
        // Fetch comments from all blogs
        const allComments = []
        for (const blog of (blogsData || [])) {
          try {
            const res = await commentAPI.getAll(blog._id)
            const enriched = (res.data.comments || []).map(c => ({
              ...c,
              blogTitle: blog.title,
              blogId: blog._id
            }))
            allComments.push(...enriched)
          } catch { /* skip */ }
        }
        return allComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      } else {
        const res = await commentAPI.getAll(selectedBlog)
        const blog = blogsData?.find(b => b._id === selectedBlog)
        return (res.data.comments || []).map(c => ({
          ...c,
          blogTitle: blog?.title || 'Unknown',
          blogId: selectedBlog
        }))
      }
    },
    enabled: !!blogsData
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => commentAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminComments'])
      toast.success('Comment deleted')
    },
    onError: () => toast.error('Failed to delete comment')
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Comments</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {comments?.length || 0} total comments
          </p>
        </div>

        {/* Filter by Blog */}
        <select
          value={selectedBlog}
          onChange={(e) => setSelectedBlog(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-48"
        >
          <option value="all">All Blogs</option>
          {blogsData?.map(blog => (
            <option key={blog._id} value={blog._id}>
              {blog.title.substring(0, 40)}...
            </option>
          ))}
        </select>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 p-3 rounded-xl">
            <FiMessageSquare size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{comments?.length || 0}</p>
            <p className="text-sm text-gray-500">Total Comments</p>
          </div>
        </div>
      </div>

      {/* Comments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : comments?.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-gray-500 dark:text-gray-400">No comments yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {comments?.map(comment => (
              <div
                key={comment._id}
                className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <img
                      src={comment.user?.profileImage ||
                        `https://placehold.co/36x36/9333ea/ffffff?text=${comment.user?.name?.[0] || 'U'}`}
                      alt={comment.user?.name}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      {/* User & Time */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {comment.user?.name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                        <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full truncate max-w-xs">
                          on: {comment.blogTitle}
                        </span>
                      </div>
                      {/* Comment Content */}
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this comment?')) {
                        deleteMutation.mutate(comment._id)
                      }
                    }}
                    className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Delete comment"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
