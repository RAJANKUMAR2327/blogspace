import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { blogAPI, uploadAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { FiSave, FiEye, FiImage, FiX, FiUpload } from 'react-icons/fi'

const CATEGORIES = [
  'Technology', 'Programming', 'Design',
  'Business', 'Science', 'Health',
  'Travel', 'Food', 'Lifestyle', 'Other'
]

export default function CreateBlog() {
  const navigate = useNavigate()
  const [loading, setLoading]           = useState(false)
  const [uploading, setUploading]       = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [formData, setFormData] = useState({
    title: '', content: '', category: '',
    tags: '', image: '', status: 'draft'
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Upload image file to Cloudinary
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB')

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await uploadAPI.blogImage(fd)
      setFormData(prev => ({ ...prev, image: res.data.url }))
      setImagePreview(res.data.url)
      toast.success('Image uploaded!')
    } catch {
      toast.error('Upload failed. Try a URL instead.')
    } finally {
      setUploading(false)
    }
  }

  // Use image URL directly
  const handleImageURL = (e) => {
    const url = e.target.value
    setFormData(prev => ({ ...prev, image: url }))
    setImagePreview(url)
  }

  const handleSubmit = async (status) => {
    if (!formData.title.trim())   return toast.error('Title is required')
    if (!formData.content.trim()) return toast.error('Content is required')
    if (!formData.category)       return toast.error('Category is required')

    setLoading(true)
    try {
      const tagsArray = formData.tags
        .split(',').map(t => t.trim()).filter(Boolean)
      await blogAPI.create({ ...formData, tags: tagsArray, status })
      toast.success(status === 'published' ? '🎉 Blog published!' : 'Draft saved!')
      navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create blog')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Blog</h1>
        <div className="flex gap-3">
          <button onClick={() => handleSubmit('draft')} disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
            <FiSave /> Save Draft
          </button>
          <button onClick={() => handleSubmit('published')} disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50">
            <FiEye /> {loading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Blog Title *
            </label>
            <input type="text" name="title" value={formData.title}
              onChange={handleChange} placeholder="Enter an engaging title..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content *
              <span className="text-xs text-gray-400 ml-2">(Markdown: **bold**, # heading, - list)</span>
            </label>
            <textarea name="content" value={formData.content} onChange={handleChange}
              placeholder={`# Your Blog Title\n\nWrite your content here...\n\n## Section\n\nParagraph text.\n\n- List item 1\n- List item 2`}
              rows={22}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm resize-y"
            />
            <p className="text-xs text-gray-400 mt-1">
              {formData.content.length} chars · ~{Math.ceil(formData.content.split(' ').filter(Boolean).length / 200) || 1} min read
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Category */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Category *</h3>
            <select name="category" value={formData.category} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">Select category</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
            <input type="text" name="tags" value={formData.tags} onChange={handleChange}
              placeholder="react, javascript, webdev"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-400 mt-1">Separate with commas</p>
          </div>

          {/* Cover Image */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FiImage /> Cover Image
            </h3>

            {/* File Upload */}
            <label className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors mb-3 ${
              uploading
                ? 'border-purple-300 bg-purple-50 dark:bg-purple-900/10'
                : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/10'
            }`}>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              <FiUpload className="text-purple-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {uploading ? 'Uploading...' : 'Upload image'}
              </span>
            </label>

            {/* OR divider */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              <span className="text-xs text-gray-400">or paste URL</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            </div>

            {/* URL Input */}
            <input type="url" placeholder="https://images.unsplash.com/..."
              onChange={handleImageURL} value={formData.image}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />

            {/* Preview */}
            {imagePreview && (
              <div className="relative mt-3">
                <img src={imagePreview} alt="Preview"
                  className="w-full h-32 object-cover rounded-xl"
                  onError={() => setImagePreview('')}
                />
                <button
                  onClick={() => { setImagePreview(''); setFormData(p => ({ ...p, image: '' })) }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                  <FiX size={12} />
                </button>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Free images:{' '}
              <a href="https://unsplash.com" target="_blank" rel="noreferrer"
                className="text-purple-500 hover:underline">Unsplash</a>
            </p>
          </div>

          {/* Status */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Status</h3>
            <div className="flex gap-3">
              {['draft', 'published'].map(s => (
                <button key={s}
                  onClick={() => setFormData(p => ({ ...p, status: s }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                    formData.status === s
                      ? 'bg-purple-600 text-white'
                      : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Markdown Tips */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-5">
            <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2 text-sm">✍️ Markdown Tips</h3>
            <ul className="text-xs text-purple-700 dark:text-purple-400 space-y-1.5">
              {[
                ['# Heading 1', '## Heading 2'],
                ['**bold**', '*italic*'],
                ['- list item', '[link](url)'],
                ['> blockquote', '`code`']
              ].flat().map(tip => (
                <li key={tip}>
                  <code className="bg-purple-100 dark:bg-purple-900/40 px-1.5 py-0.5 rounded text-xs">{tip}</code>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}