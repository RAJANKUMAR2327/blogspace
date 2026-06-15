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
    <div style={{ background: '#080810', minHeight: '100vh', paddingTop: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.06)', borderTop: '2px solid #7c3aed', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ background: '#080810', minHeight: '100vh', paddingTop: 64, fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500&display=swap');
        .eb-input { width:100%;padding:12px 16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:10px;font-size:15px;color:#fff;outline:none;font-family:'Inter',sans-serif;transition:all 0.2s;box-sizing:border-box; }
        .eb-input:focus { border-color:rgba(167,139,250,0.4);background:rgba(167,139,250,0.03); }
        .eb-input::placeholder { color:rgba(255,255,255,0.18); }
        .eb-textarea { width:100%;padding:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;font-size:15px;color:rgba(255,255,255,0.8);outline:none;font-family:'Inter',sans-serif;transition:all 0.2s;box-sizing:border-box;resize:vertical;line-height:1.8;min-height:480px; }
        .eb-textarea:focus { border-color:rgba(167,139,250,0.35);background:rgba(167,139,250,0.02); }
        .eb-select { width:100%;padding:12px 16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:10px;font-size:14px;color:#fff;outline:none;font-family:'Inter',sans-serif;cursor:pointer;appearance:none; }
        .eb-select option { background:#0d0d1a; }
        .eb-upload-zone { border:2px dashed rgba(255,255,255,0.08);border-radius:10px;padding:20px;text-align:center;cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden; }
        .eb-upload-zone:hover { border-color:rgba(167,139,250,0.3);background:rgba(167,139,250,0.04); }
        .btn-draft { display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:10px;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.2s;font-family:'Inter',sans-serif;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.6); }
        .btn-draft:hover { border-color:rgba(255,255,255,0.2);color:#fff; }
        .btn-draft:disabled { opacity:0.5;cursor:not-allowed; }
        .btn-publish { display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:10px;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.2s;font-family:'Inter',sans-serif;border:none;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;box-shadow:0 6px 20px rgba(124,58,237,0.3); }
        .btn-publish:hover:not(:disabled) { transform:translateY(-1px);box-shadow:0 10px 28px rgba(124,58,237,0.5); }
        .btn-publish:disabled { opacity:0.5;cursor:not-allowed; }
        .status-pill { flex:1;padding:10px 16px;border-radius:10px;font-size:13px;font-weight:500;cursor:pointer;transition:all 0.2s;text-align:center;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.4);font-family:'Inter',sans-serif; }
        .status-pill.active { background:linear-gradient(135deg,rgba(124,58,237,0.25),rgba(37,99,235,0.25));border-color:rgba(124,58,237,0.4);color:#fff; }
        .sidebar-card { background:#0d0d1a;border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:20px; }
        .sidebar-title { font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;margin-bottom:14px; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 48px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
          <div>
            <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', marginBottom: 8, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
              <FiArrowLeft size={12} /> Back to dashboard
            </Link>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
          {/* Main Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input className="eb-input" type="text" value={formData.title}
              onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
              placeholder="Story title..."
              style={{ fontSize: 22, fontFamily: "'Syne',sans-serif", fontWeight: 700, padding: '16px 20px', borderRadius: 12 }}
            />
            <div style={{ display: 'flex', gap: 16, padding: '4px' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>{wordCount} words</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>~{readTime} min read</span>
            </div>
            {preview ? (
              <div style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 32, minHeight: 480 }}>
                <div style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.85 }}
                  dangerouslySetInnerHTML={{ __html: formData.content.replace(/\n/g, '<br/>') || '<p style="color:rgba(255,255,255,0.2)">Nothing to preview...</p>' }}
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
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none', fontSize: 12 }}>▼</span>
              </div>
            </div>

            <div className="sidebar-card">
              <div className="sidebar-title">Tags</div>
              <input className="eb-input" type="text" value={formData.tags}
                onChange={(e) => setFormData(p => ({ ...p, tags: e.target.value }))}
                placeholder="react, javascript, ai" />
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 6 }}>Separate with commas</p>
            </div>

            <div className="sidebar-card">
              <div className="sidebar-title"><FiImage size={12} style={{ display: 'inline', marginRight: 4 }} />Cover Image</div>
              <label className="eb-upload-zone">
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                <FiUpload size={18} style={{ color: 'rgba(255,255,255,0.25)', marginBottom: 6 }} />
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                  {uploading ? 'Uploading...' : 'Upload new image'}
                </p>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>or URL</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
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
                    style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(8,8,16,0.8)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
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
