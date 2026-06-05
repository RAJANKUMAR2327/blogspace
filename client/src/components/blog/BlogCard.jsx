import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthContext } from '../../context/AuthContext'
import { userAPI } from '../../services/api'
import { FiHeart, FiEye, FiClock, FiBookmark } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function BlogCard({ blog }) {
  const { user } = useContext(AuthContext)
  const queryClient = useQueryClient()
  const readTime = blog.readTime || Math.ceil((blog.content?.replace(/<[^>]*>/g, '').split(' ').length || 0) / 200) || 1

  const saveMutation = useMutation({
    mutationFn: () => userAPI.toggleSave(blog._id),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['savedBlogs'])
      toast.success(res.data.isSaved ? 'Article saved!' : 'Removed from saved')
    },
    onError: () => toast.error('Failed to save')
  })

  const isSaved = user?.savedBlogs?.includes(blog._id)

  return (
    <article className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group flex flex-col">
      {/* Cover Image */}
      <Link to={`/blog/${blog.slug}`} className="block overflow-hidden h-48 flex-shrink-0">
        <img
          src={blog.image || `https://placehold.co/600x400/9333ea/ffffff?text=${encodeURIComponent(blog.category || 'Blog')}`}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </Link>

      <div className="p-5 flex flex-col flex-1">
        {/* Category + Save */}
        <div className="flex items-center justify-between mb-2">
          <Link
            to={`/blogs?category=${blog.category}`}
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide hover:underline"
          >
            {blog.category}
          </Link>
          {user && (
            <button
              onClick={(e) => { e.preventDefault(); saveMutation.mutate() }}
              className={`p-1.5 rounded-lg transition-colors ${
                isSaved
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save article'}
            >
              <FiBookmark size={15} className={isSaved ? 'fill-current' : ''} />
            </button>
          )}
        </div>

        {/* Title */}
        <Link to={`/blog/${blog.slug}`}>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors leading-snug">
            {blog.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed flex-1">
          {blog.excerpt || blog.content?.replace(/<[^>]*>/g, '').substring(0, 120) + '...'}
        </p>

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {blog.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <img
              src={blog.author?.profileImage ||
                `https://placehold.co/28x28/9333ea/ffffff?text=${blog.author?.name?.[0] || 'A'}`}
              alt={blog.author?.name}
              className="w-7 h-7 rounded-full object-cover"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate max-w-20">
              {blog.author?.name}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <FiEye size={12} /> {blog.views || 0}
            </span>
            <span className="flex items-center gap-1">
              <FiHeart size={12} /> {blog.likes?.length || 0}
            </span>
            <span className="flex items-center gap-1">
              <FiClock size={12} /> {readTime}m
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
