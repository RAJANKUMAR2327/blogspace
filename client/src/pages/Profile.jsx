import { useState, useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthContext } from '../context/AuthContext'
import { userAPI } from '../services/api'
import BlogCard from '../components/blog/BlogCard'
import toast from 'react-hot-toast'
import { FiEdit2, FiSave, FiBookmark } from 'react-icons/fi'

export default function Profile() {
  const { user, login } = useContext(AuthContext)
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({ name: user?.name || '', bio: user?.bio || '' })
  const [activeTab, setActiveTab] = useState('saved')

  const { data: savedBlogs } = useQuery({
    queryKey: ['savedBlogs'],
    queryFn: async () => {
      const res = await userAPI.getSaved()
      return res.data.blogs
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data) => userAPI.updateProfile(data),
    onSuccess: (res) => {
      const token = localStorage.getItem('token')
      login(res.data.user, token)
      queryClient.invalidateQueries(['profile'])
      setEditing(false)
      toast.success('Profile updated!')
    },
    onError: () => toast.error('Update failed')
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <img
            src={user?.profileImage || `https://placehold.co/96x96/9333ea/ffffff?text=${user?.name?.[0]}`}
            alt={user?.name}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-100 dark:ring-purple-900"
          />
          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => updateMutation.mutate(formData)}
                    className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    <FiSave /> Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
                <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{user?.bio || 'No bio yet'}</p>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 mt-3 text-sm text-purple-600 dark:text-purple-400 hover:underline"
                >
                  <FiEdit2 /> Edit Profile
                </button>
              </>
            )}
          </div>
          <div className="text-center">
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              user?.role === 'admin'
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}>
              {user?.role === 'admin' ? '👑 Admin' : '👤 Member'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'saved'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <FiBookmark /> Saved Articles ({savedBlogs?.length || 0})
        </button>
      </div>

      {/* Saved Blogs */}
      {savedBlogs?.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🔖</p>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">No saved articles yet</h3>
          <p className="text-gray-500">Save articles you want to read later</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedBlogs?.map(blog => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  )
}