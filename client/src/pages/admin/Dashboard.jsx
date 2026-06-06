import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { blogAPI, userAPI } from '../../services/api'
import {
  FiUsers,
  FiFileText,
  FiEye,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiTrendingUp,
  FiMessageSquare
} from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const queryClient = useQueryClient()

  const { data: statsData } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => userAPI.getStats().then(r => r.data)
  })

  const { data: blogsData } = useQuery({
    queryKey: ['adminBlogs'],
    queryFn: () => blogAPI.getAll({ limit: 100 }).then(r => r.data)
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => blogAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminBlogs'])
      queryClient.invalidateQueries(['adminStats'])
      toast.success('Blog deleted')
    }
  })

  const stats = [
    {
      label: 'Total Blogs',
      value: statsData?.stats?.totalBlogs || 0,
      sub: `${statsData?.stats?.publishedBlogs || 0} published · ${statsData?.stats?.draftBlogs || 0} drafts`,
      icon: FiFileText,
      color: 'purple'
    },
    {
      label: 'Total Users',
      value: statsData?.stats?.totalUsers || 0,
      icon: FiUsers,
      color: 'blue'
    },
    {
      label: 'Total Views',
      value: blogsData?.blogs?.reduce((s, b) => s + (b.views || 0), 0) || 0,
      icon: FiEye,
      color: 'green'
    },
    {
      label: 'Total Comments',
      value: statsData?.stats?.totalComments || 0,
      icon: FiMessageSquare,
      color: 'pink'
    },
  ]

  const colorMap = {
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    blue:   'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green:  'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    pink:   'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
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
        {stats.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <div className={`inline-flex p-3 rounded-xl mb-3 ${colorMap[color]}`}>
              <Icon size={22} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Blogs */}
        {statsData?.topBlogs?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-purple-600" /> Top Articles
            </h2>
            <div className="space-y-3">
              {statsData.topBlogs.map((blog, i) => (
                <div key={blog._id} className="flex items-center gap-3">
                  <span className="text-xl font-bold text-purple-100 dark:text-purple-900 w-6">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <Link to={`/blog/${blog.slug}`}
                      className="text-sm font-medium text-gray-900 dark:text-white hover:text-purple-600 line-clamp-1">
                      {blog.title}
                    </Link>
                    <p className="text-xs text-gray-400">{blog.views} views · {blog.likes?.length || 0} likes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Users */}
        {statsData?.recentUsers?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiUsers className="text-blue-600" /> Recent Users
            </h2>
            <div className="space-y-3">
              {statsData.recentUsers.map(u => (
                <div key={u._id} className="flex items-center gap-3">
                  <img
                    src={u.profileImage || `https://placehold.co/32x32/9333ea/ffffff?text=${u.name?.[0]}`}
                    alt={u.name} className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                    u.role === 'admin'
                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { to: '/admin/create',   label: '✍️ Write New Blog' },
              { to: '/admin/users',    label: '👥 Manage Users' },
              { to: '/admin/comments', label: '💬 Moderate Comments' },
              { to: '/blogs',          label: '📖 View All Blogs' },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                className="block px-4 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Management Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Blogs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {['Title', 'Category', 'Status', 'Views', 'Likes', 'Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {blogsData?.blogs?.map(blog => (
                <tr key={blog._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 max-w-xs">
                      {blog.title}
                    </p>
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
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {blog.views?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {blog.likes?.length || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link to={`/admin/edit/${blog._id}`}
                        className="text-blue-500 hover:text-blue-700 transition-colors">
                        <FiEdit2 size={16} />
                      </Link>
                      <button
                        onClick={() => window.confirm('Delete this blog?') && deleteMutation.mutate(blog._id)}
                        className="text-red-400 hover:text-red-600 transition-colors">
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
              No blogs yet.{' '}
              <Link to="/admin/create" className="text-purple-600 hover:underline">Create your first blog</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}