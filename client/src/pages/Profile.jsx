import { useState, useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthContext } from '../context/AuthContext'
import { userAPI, uploadAPI } from '../services/api'
import BlogCard from '../components/blog/BlogCard'
import toast from 'react-hot-toast'
import { FiEdit2, FiSave, FiBookmark, FiClock, FiCamera } from 'react-icons/fi'

export default function Profile() {
  const { user, login } = useContext(AuthContext)
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({ name: user?.name || '', bio: user?.bio || '' })
  const [activeTab, setActiveTab] = useState('saved')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const { data: savedBlogs } = useQuery({
    queryKey: ['savedBlogs'],
    queryFn: () => userAPI.getSaved().then(r => r.data.blogs)
  })

  const { data: historyData } = useQuery({
    queryKey: ['readHistory'],
    queryFn: () => userAPI.getHistory().then(r => r.data.history),
    enabled: activeTab === 'history'
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

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB')
    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await uploadAPI.profileImage(fd)
      await updateMutation.mutateAsync({ profileImage: res.data.url })
      toast.success('Avatar updated!')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const tabs = [
    { id: 'saved',   label: 'Saved',   icon: FiBookmark, count: savedBlogs?.length || 0 },
    { id: 'history', label: 'History', icon: FiClock,    count: historyData?.length || 0 },
  ]

  const currentList = activeTab === 'saved' ? savedBlogs : historyData

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">

          {/* Avatar */}
          <div className="relative">
            <img
              src={user?.profileImage || `https://placehold.co/96x96/9333ea/ffffff?text=${user?.name?.[0]}`}
              alt={user?.name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-100 dark:ring-purple-900"
            />
            <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-purple-700 transition-colors">
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              {uploadingAvatar ? (
                <span className="animate-spin block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <FiCamera size={14} />
              )}
            </label>
          </div>

          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <input
                  type="text" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={2} maxLength={200}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
                <p className="text-xs text-gray-400">{formData.bio.length}/200</p>
                <div className="flex gap-3">
                  <button onClick={() => updateMutation.mutate(formData)}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50">
                    <FiSave /> {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="px-5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">{user?.bio || 'No bio yet'}</p>
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-2 mt-3 text-sm text-purple-600 dark:text-purple-400 hover:underline">
                  <FiEdit2 /> Edit Profile
                </button>
              </>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              user?.role === 'admin'
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}>
              {user?.role === 'admin' ? '👑 Admin' : '👤 Member'}
            </span>
            <div className="text-center text-xs text-gray-400">
              <p className="font-semibold text-gray-900 dark:text-white text-base">
                {user?.followers?.length || 0}
              </p>
              followers
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            <Icon size={14} /> {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === id
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {!currentList?.length ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">{activeTab === 'saved' ? '🔖' : '📚'}</p>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {activeTab === 'saved' ? 'No saved articles yet' : 'No reading history yet'}
          </h3>
          <p className="text-gray-500 text-sm">
            {activeTab === 'saved' ? 'Save articles you want to read later' : 'Articles you read will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentList.map(blog => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  )
}