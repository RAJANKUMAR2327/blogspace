import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { blogAPI, userAPI, commentAPI } from '../../services/api'
import { FiUsers, FiFileText, FiEye, FiMessageSquare, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const queryClient = useQueryClient()

  const { data: blogsData } = useQuery({
    queryKey: ['adminBlogs'],
    queryFn: async () => {
      const res = await blogAPI.getAll({ limit: 100 })
      return res.data
    }
  })

  const { data: usersData } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await userAPI.getAllUsers()
      return res.data
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => blogAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminBlogs'])
      toast.success('Blog deleted')
    }
  })

  const totalViews = blogsData?.blogs?.reduce((sum, b) => sum + (b.views || 0), 0) || 0
  const totalLikes = blogsData?.blogs?.reduce((sum, b) => sum + (b.likes?.length || 0), 0) || 0

  const stats = [
    { label: 'Total Blogs', value: blogsData?.pagination?.total || 0, icon: FiFileText, color: 'purple' },
    { label: 'Total Users', value: usersData?.users?.length || 0, icon: FiUsers, color: 'blue' },
    { label: 'Total Views', value: totalViews, icon: FiEye, color: 'green' },
    { label: 'Total Likes', value: totalLikes, icon: FiMessageSquare, color: 'pink' },
  ]

  const colorMap = {
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <Link to="/admin/create"
          className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition-colors">
          <FiPlus /> New Blog
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <div className={`inline-flex p-3 rounded-xl mb-3 ${colorMap[color]}`}>
              <Icon size={22} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Blog Management Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Blogs</h2>
          <Link to="/admin/users" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
            Manage Users →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Views</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {blogsData?.blogs?.map(blog => (
                <tr key={blog._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 max-w-xs">{blog.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-full">
                      {blog.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      blog.status === 'published'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                        : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{blog.views}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link to={`/admin/edit/${blog._id}`}
                        className="text-blue-500 hover:text-blue-700 transition-colors">
                        <FiEdit2 size={16} />
                      </Link>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this blog?')) deleteMutation.mutate(blog._id)
                        }}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!blogsData?.blogs || blogsData.blogs.length === 0) && (
            <div className="text-center py-12 text-gray-500">
              No blogs yet. <Link to="/admin/create" className="text-purple-600 hover:underline">Create your first blog</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}