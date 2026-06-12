import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { blogAPI, uploadAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { FiSave, FiSend, FiImage, FiX, FiUpload, FiArrowLeft, FiEye } from 'react-icons/fi'

const CATEGORIES = ['Technology','Programming','Design','Business','Science','Health','Travel','Food','Lifestyle','Other']

export default function CreateBlog() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(false)
  const [formData, setFormData] = useState({
    title: '', content: '', category: '', tags: '', image: '', status: 'draft'
  })

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

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
      toast.success('Image uploaded!')
    } catch {
      toast.error('Upload failed — try a URL instead')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (status) => {
    if (!formData.title.trim()) return toast.error('Title is required')
    if (!formData.content.trim()) return toast.error('Content is required')
    if (!formData.category) return toast.error('Category is required')
    setLoading(true)
    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      await blogAPI.create({ ...formData, tags: tagsArray, status })
      toast.success(status === 'published' ? '🎉 Story published!' : 'Draft saved!')
      navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length
  const readTime = Math.ceil(wordCount / 200) || 1

  return (
    <div style={{ background: '#080810', minHeight: '100vh', paddingTop: 64, fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500&display=swap');
        .cb-input { width:100%;padding:12px 16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:10px;font-size:15px;color:#fff;outline:none;font-family:'Inter',sans-serif;transition:all 0.2s;box-sizing:border-box; }
        .cb-input:focus { border-color:rgba(167,139,250,0.4);background:rgba(167,139,250,0.03); }
        .cb-input::placeholder { color:rgba(255,255,255,0.18); }
        .cb-textarea { width:100%;padding:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;font-size:15px;color:rgba(255,255,255,0.8);outline:none;font-family:'Inter',sans-serif;transition:all 0.2s;box-sizing:border-box;resize:vertical;line-height:1.8;min-height:480px; }
        .cb-textarea:focus { border-color:rgba(167,139,250,0.35);background:rgba(167,139,250,0.02); }
        .cb-textarea::placeholder { color:rgba(255,255,255,0.15); }
        .cb-select { width:100%;padding:12px 16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:10px;font-size:14px;color:#fff;outline:none;font-family:'Inter',sans-serif;transition:all 0.2s;cursor:pointer;appearance:none; }
        .cb-select:focus { border-color:rgba(167,139,250,0.4); }
        .cb-select option { background:#0d0d1a;color:#fff; }
        .cb-upload-zone { border:2px dashed rgba(255,255,255,0.08);border-radius:10px;padding:20px;text-align:center;cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden; }
        .cb-upload-zone:hover { border-color:rgba(167,139,250,0.3);background:rgba(167,139,250,0.04); }
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
        .preview-content h1,.preview-content h2,.preview-content h3{font-family:'Syne',sans-serif;font-weight:700;color:#fff;margin:1rem 0 0.5rem}
        .preview-content h1{font-size:1.8rem;letter-spacing:-0.5px}
        .preview-content h2{font-size:1.4rem}
        .preview-content h3{font-size:1.2rem}
        .preview-content p{color:rgba(255,255,255,0.65);line-height:1.8;margin:0.75rem 0}
        .preview-content ul,.preview-content ol{color:rgba(255,255,255,0.65);line-height:1.8;padding-left:1.5rem;margin:0.75rem 0}
        .preview-content code{background:rgba(124,58,237,0.15);color:#a78bfa;padding:2px 6px;border-radius:4px;font-size:0.875rem}
        .preview-content blockquote{border-left:3px solid #7c3aed;padding-left:1rem;color:rgba(255,255,255,0.45);font-style:italic;margin:1rem 0}
        @media(max-width:768px){
          .create-grid{grid-template-columns:1fr !important}
          .create-sidebar{order:-1}
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 48px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', marginBottom: 8, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
              <FiArrowLeft size={12} /> Back to dashboard
            </Link>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
              Write a Story
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setPreview(!preview)} className="btn-draft">
              <FiEye size={14} /> {preview ? 'Edit' : 'Preview'}
            </button>
            <button onClick={() => handleSubmit('draft')} disabled={loading} className="btn-draft">
              <FiSave size={14} /> Save Draft
            </button>
            <button onClick={() => handleSubmit('published')} disabled={loading} className="btn-publish">
              <FiSend size={14} /> {loading ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        <div className="create-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>

          {/* Main Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Title */}
            <input
              className="cb-input"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Your story title..."
              style={{ fontSize: 22, fontFamily: "'Syne',sans-serif", fontWeight: 700, padding: '16px 20px', borderRadius: 12 }}
            />

            {/* Stats bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '4px 4px' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>{wordCount} words</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>~{readTime} min read</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>{formData.content.length} chars</span>
              {formData.title && (
                <span style={{ fontSize: 12, color: formData.title.length > 60 ? '#fb923c' : 'rgba(255,255,255,0.2)' }}>
                  Title: {formData.title.length}/100
                </span>
              )}
            </div>

            {/* Content Editor or Preview */}
            {preview ? (
              <div style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 32, minHeight: 480 }}>
                {formData.title && (
                  <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 24, letterSpacing: '-0.5px' }}>
                    {formData.title}
                  </h1>
                )}
                <div className="preview-content"
                  dangerouslySetInnerHTML={{
                    __html: formData.content
                      .replace(/\n/g, '<br/>')
                      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff">$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/`(.*?)`/g, '<code>$1</code>')
                      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
                      .replace(/^- (.*$)/gm, '<li style="color:rgba(255,255,255,0.65)">$1</li>')
                      || '<p style="color:rgba(255,255,255,0.2);font-style:italic">Nothing to preview yet — start writing!</p>'
                  }}
                />
              </div>
            ) : (
              <textarea
                className="cb-textarea"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder={`Start writing your story here...\n\nMarkdown supported:\n# Heading 1\n## Heading 2\n**bold** *italic*\n- list item\n\`inline code\`\n> blockquote`}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="create-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Publish Status */}
            <div className="sidebar-card">
              <div className="sidebar-title">Publish Status</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['draft', 'published'].map(s => (
                  <button key={s} onClick={() => setFormData(p => ({ ...p, status: s }))}
                    className={`status-pill ${formData.status === s ? 'active' : ''}`}>
                    {s === 'draft' ? '📝 Draft' : '🚀 Publish'}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 10 }}>
                {formData.status === 'draft' ? 'Only you can see this story' : 'Visible to all readers'}
              </p>
            </div>

            {/* Category */}
            <div className="sidebar-card">
              <div className="sidebar-title">Category *</div>
              <div style={{ position: 'relative' }}>
                <select className="cb-select" name="category" value={formData.category} onChange={handleChange}>
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none', fontSize: 12 }}>▼</span>
              </div>
            </div>

            {/* Tags */}
            <div className="sidebar-card">
              <div className="sidebar-title">Tags</div>
              <input className="cb-input" type="text" name="tags" value={formData.tags}
                onChange={handleChange} placeholder="react, javascript, ai" />
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 6 }}>Separate with commas</p>
              {formData.tags && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {formData.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                    <span key={tag} style={{ fontSize: 11, padding: '3px 8px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 6, color: '#a78bfa' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Cover Image */}
            <div className="sidebar-card">
              <div className="sidebar-title">
                <FiImage size={12} style={{ display: 'inline', marginRight: 4 }} />
                Cover Image
              </div>

              <label className="cb-upload-zone">
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                <FiUpload size={20} style={{ color: uploading ? '#a78bfa' : 'rgba(255,255,255,0.25)', marginBottom: 6 }} />
                <p style={{ fontSize: 13, color: uploading ? '#a78bfa' : 'rgba(255,255,255,0.3)', margin: 0 }}>
                  {uploading ? 'Uploading...' : 'Click to upload image'}
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', margin: '4px 0 0' }}>PNG, JPG up to 5MB</p>
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>or paste URL</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              </div>

              <input className="cb-input" type="url" placeholder="https://images.unsplash.com/..."
                value={formData.image}
                onChange={(e) => setFormData(p => ({ ...p, image: e.target.value }))}
                style={{ fontSize: 12 }}
              />

              {formData.image && (
                <div style={{ position: 'relative', marginTop: 10 }}>
                  <img src={formData.image} alt="Preview"
                    style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, display: 'block', border: '1px solid rgba(255,255,255,0.06)' }}
                    onError={e => e.target.style.display = 'none'} />
                  <button onClick={() => setFormData(p => ({ ...p, image: '' }))}
                    style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(8,8,16,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}>
                    <FiX size={11} />
                  </button>
                </div>
              )}

              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', marginTop: 8 }}>
                Free images:{' '}
                <a href="https://unsplash.com" target="_blank" rel="noreferrer"
                  style={{ color: 'rgba(167,139,250,0.6)', textDecoration: 'none' }}>
                  Unsplash ↗
                </a>
              </p>
            </div>

            {/* Markdown Tips */}
            <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)', borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(167,139,250,0.7)', marginBottom: 12, letterSpacing: '1px', textTransform: 'uppercase' }}>
                ✦ Markdown Tips
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  '# Heading 1',
                  '## Heading 2',
                  '**bold text**',
                  '*italic text*',
                  '- bullet list',
                  '> blockquote',
                  '`inline code`',
                  '[link](url)',
                ].map(tip => (
                  <code key={tip} style={{ fontSize: 11, background: 'rgba(167,139,250,0.08)', color: 'rgba(167,139,250,0.6)', padding: '3px 8px', borderRadius: 5, display: 'inline-block', width: 'fit-content', fontFamily: 'monospace' }}>
                    {tip}
                  </code>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}