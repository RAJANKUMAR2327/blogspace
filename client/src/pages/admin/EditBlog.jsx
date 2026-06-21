import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { blogAPI, uploadAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { FiSave, FiSend, FiArrowLeft, FiImage, FiX, FiUpload, FiEye } from 'react-icons/fi'

const CATEGORIES = ['Technology','Programming','Design','Business','Science','Health','Travel','Food','Lifestyle','Other']

export default function EditBlog() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(false)
  const [formData, setFormData] = useState({
    title: '', content: '', category: '', tags: '', image: '', status: 'draft'
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
      toast.success('Story updated!')
      navigate('/admin')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed')
  })

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await uploadAPI.blogImage(fd)
      setFormData(p => ({ ...p, image: res.data.url }))
      toast.success('Image uploaded!')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (status) => {
    if (!formData.title.trim()) return toast.error('Title is required')
    if (!formData.content.trim()) return toast.error('Content is required')
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    updateMutation.mutate({ ...formData, tags: tagsArray, status })
  }

  const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length
  const readTime = Math.ceil(wordCount / 200) || 1

  if (isLoading) return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingTop: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border-soft)', borderTop: '2px solid var(--accent)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingTop: 64, fontFamily: 'var(--font-ui)' }}>
      <style>{`
        .eb-input { width:100%;padding:12px 16px;background:var(--bg-surface-2);border:1px solid var(--border-soft);border-radius:10px;font-size:15px;color:var(--text-primary);outline:none;font-family:var(--font-ui);transition:all 0.2s;box-sizing:border-box; }
        .eb-input:focus { border-color: var(--accent); }
        .eb-input::placeholder { color: var(--text-tertiary); }
        .eb-textarea { width:100%;padding:16px;background:var(--bg-surface-2);border:1px solid var(--border-soft);border-radius:12px;font-size:15px;color:var(--text-secondary);outline:none;font-family:var(--font-ui);transition:all 0.2s;box-sizing:border-box;resize:vertical;line-height:1.8;min-height:480px; }
        .eb-textarea:focus { border-color: var(--accent); }
        .eb-select { width:100%;padding:12px 16px;background:var(--bg-surface-2);border:1px solid var(--border-soft);border-radius:10px;font-size:14px;color:var(--text-primary);outline:none;font-family:var(--font-ui);cursor:pointer;appearance:none; }
        .eb-select option { background: var(--bg-surface); }
        .eb-upload-zone { border:2px dashed var(--border-strong);border-radius:10px;padding:20px;text-align:center;cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden;display:block; }
        .eb-upload-zone:hover { border-color: var(--accent); background: var(--accent-soft); }
        .btn-draft { display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:10px;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.2s;font-family:var(--font-ui);border:1px solid var(--border-strong);background:var(--bg-surface-2);color:var(--text-secondary); }
        .btn-draft:hover { border-color: var(--text-tertiary); color: var(--text-primary); }
        .btn-draft:disabled { opacity:0.5;cursor:not-allowed; }
        .btn-publish { display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:10px;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.2s;font-family:var(--font-ui);border:none;background:var(--accent);color:var(--text-on-accent);box-shadow:var(--shadow-pop); }
        .btn-publish:hover:not(:disabled) { background: var(--accent-strong); }
        .btn-publish:disabled { opacity:0.5;cursor:not-allowed; }
        .status-pill { flex:1;padding:10px 16px;border-radius:10px;font-size:13px;font-weight:500;cursor:pointer;transition:all 0.2s;text-align:center;border:1px solid var(--border-soft);background:var(--bg-surface-2);color:var(--text-tertiary);font-family:var(--font-ui); }
        .status-pill.active { background: var(--accent-soft);border-color: var(--accent);color: var(--accent-strong); }
        .sidebar-card { background:var(--bg-surface);border:1px solid var(--border-soft);border-radius:14px;padding:20px; }
        .sidebar-title { font-family:var(--font-display);font-size:13px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:1px;margin-bottom:14px; }
        @media (max-width: 900px) {
          .eb-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 48px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'none', marginBottom: 8, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}>
              <FiArrowLeft size={12} /> Back to dashboard
            </Link>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              Edit Story
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setPreview(!preview)} className="btn-draft">
              <FiEye size={14} /> {preview ? 'Edit' : 'Preview'}
            </button>
            <button onClick={() => handleSubmit('draft')} disabled={updateMutation.isPending} className="btn-draft">
              <FiSave size={14} /> Save Draft
            </button>
            <button onClick={() => handleSubmit('published')} disabled={updateMutation.isPending} className="btn-publish">
              <FiSend size={14} /> {updateMutation.isPending ? 'Saving...' : 'Publish'}
            </button>
          </div>
        </div>

        <div className="eb-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
          {/* Main Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input className="eb-input" type="text" value={formData.title}
              onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
              placeholder="Story title..."
              style={{ fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 700, padding: '16px 20px', borderRadius: 12 }}
            />
            <div style={{ display: 'flex', gap: 16, padding: '4px' }}>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{wordCount} words</span>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>~{readTime} min read</span>
            </div>
            {preview ? (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: 32, minHeight: 480 }}>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.85 }}
                  dangerouslySetInnerHTML={{ __html: formData.content.replace(/\n/g, '<br/>') || '<p style="color:var(--text-tertiary)">Nothing to preview...</p>' }}
                />
              </div>
            ) : (
              <textarea className="eb-textarea" value={formData.content}
                onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))}
                placeholder="Write your story here..." />
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="sidebar-card">
              <div className="sidebar-title">Status</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['draft', 'published'].map(s => (
                  <button key={s} onClick={() => setFormData(p => ({ ...p, status: s }))}
                    className={`status-pill ${formData.status === s ? 'active' : ''}`}>
                    {s === 'draft' ? '📝 Draft' : '🚀 Live'}
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-card">
              <div className="sidebar-title">Category *</div>
              <div style={{ position: 'relative' }}>
                <select className="eb-select" value={formData.category}
                  onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}>
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none', fontSize: 12 }}>▼</span>
              </div>
            </div>

            <div className="sidebar-card">
              <div className="sidebar-title">Tags</div>
              <input className="eb-input" type="text" value={formData.tags}
                onChange={(e) => setFormData(p => ({ ...p, tags: e.target.value }))}
                placeholder="react, javascript, ai" />
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>Separate with commas</p>
            </div>

            <div className="sidebar-card">
              <div className="sidebar-title"><FiImage size={12} style={{ display: 'inline', marginRight: 4 }} />Cover Image</div>
              <label className="eb-upload-zone">
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                <FiUpload size={18} style={{ color: 'var(--text-tertiary)', marginBottom: 6 }} />
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: 0 }}>
                  {uploading ? 'Uploading...' : 'Upload new image'}
                </p>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>or URL</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
              </div>
              <input className="eb-input" type="url" placeholder="https://..."
                value={formData.image}
                onChange={(e) => setFormData(p => ({ ...p, image: e.target.value }))}
                style={{ fontSize: 12 }} />
              {formData.image && (
                <div style={{ position: 'relative', marginTop: 10 }}>
                  <img src={formData.image} alt="Preview"
                    style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 8, display: 'block' }}
                    onError={e => e.target.style.display = 'none'} />
                  <button onClick={() => setFormData(p => ({ ...p, image: '' }))}
                    style={{ position: 'absolute', top: 6, right: 6, background: 'color-mix(in srgb, var(--bg-page) 80%, transparent)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 12 }}>
                    <FiX size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
