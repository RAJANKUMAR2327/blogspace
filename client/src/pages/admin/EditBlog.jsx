import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { blogAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { FiSave, FiEye } from 'react-icons/fi'

const CATEGORIES = [
  'Technology', 'Programming', 'Design',
  'Business', 'Science', 'Health',
  'Travel', 'Food', 'Lifestyle', 'Other'
]

export default function EditBlog() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '', content: '', category: '',
    tags: '', image: '', status: 'draft'
  })

  const { data: blog, isLoading } = useQuery({
    queryKey: ['editBlog', id],
    queryFn: async () => {
      const res = await blogAPI.getAll({ limit: 100 })
      return res.data.blogs.find(b => b._id === id)
    }
  })

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        category: blog.category || '',
        tags: blog.tags?.join(', ') || '',
        image: blog.image || '',
        status: blog.status || 'draft'
      })
    }
  }, [blog])

  const updateMutation = useMutation({
    mutationFn: (data) => blogAPI.update(id, data),
    onSuccess: () => {
      toast.success('Blog updated!')
      navigate('/admin')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed')
  })

  const handleSubmit = (status) => {
    if (!formData.title.trim()) return toast.error('Title is required')
    if (!formData.content.trim()) return toast.error('Content is required')
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    updateMutation.mutate({ ...formData, tags: tagsArray, status })
  }

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Blog</h1>
        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit('draft')}
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <FiSave /> Save Draft
          </button>
          <button
            onClick={() => handleSubmit('published')}
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <FiEye /> {updateMutation.isPending ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content *
              <span className="text-xs text-gray-400 ml-2">(Markdown supported)</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={20}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm resize-y"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Category</h3>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="react, javascript, webdev"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Cover Image URL</h3>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
            {formData.image && (
              <img src={formData.image} alt="Preview"
                className="w-full h-32 object-cover rounded-xl mt-3"
                onError={(e) => e.target.style.display='none'}
              />
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Status</h3>
            <div className="flex gap-3">
              {['draft', 'published'].map(s => (
                <button key={s}
                  onClick={() => setFormData({ ...formData, status: s })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                    formData.status === s
                      ? 'bg-purple-600 text-white'
                      : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}