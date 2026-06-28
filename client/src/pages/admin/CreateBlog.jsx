import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { blogAPI, uploadAPI } from '../../services/api'
import { compressImage } from '../../utils/compressImage' 
import toast from 'react-hot-toast'
import SEO from '../common/SEO'
import { FiSave, FiSend, FiImage, FiX, FiUpload, FiArrowLeft, FiEye } from 'react-icons/fi'
import MarkdownEditor from '../../components/admin/MarkdownEditor'
import { useAutoSave, getRecoverableDraft } from '../../hooks/useAutoSave'
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning'
// 1. Added the AISuggestionsPanel import
import AISuggestionsPanel from '../../components/admin/AISuggestionsPanel'

const CATEGORIES = ['Technology','Programming','Design','Business','Science','Health','Travel','Food','Lifestyle','Other']

export default function CreateBlog() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [preview, setPreview] = useState(false)
  const [formData, setFormData] = useState({
    title: '', content: '', category: '', tags: '', image: '', status: 'draft', featured: false, gallery: []
  })

  const DRAFT_ID = 'new-article'
  const { lastSaved, clearDraft } = useAutoSave(DRAFT_ID, formData)
  
  // Warn user on navigation if there are unsaved inputs in title or content
  useUnsavedChangesWarning(!!(formData.title.trim() || formData.content.trim()))

  const [showRecovery, setShowRecovery] = useState(false)
  const [recoveredDraft, setRecoveredDraft] = useState(null)

  useEffect(() => {
    const recovered = getRecoverableDraft(DRAFT_ID)
    if (recovered?.data?.title || recovered?.data?.content) {
      setRecoveredDraft(recovered)
      setShowRecovery(true)
    }
  }, [])

  const restoreDraft = () => {
    setFormData(recoveredDraft.data)
    setShowRecovery(false)
    toast.success('Draft restored')
  }

  const dismissRecovery = () => {
    clearDraft()
    setShowRecovery(false)
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })
  
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) return toast.error('Image must be under 10MB')

    setUploading(true)
    try {
      const compressed = await compressImage(file)
      const fd = new FormData()
      fd.append('image', compressed, file.name)
      
      const res = await uploadAPI.blogImage(fd)
      setFormData(prev => ({ ...prev, image: res.data.url }))
      toast.success('Image uploaded!')
    } catch {
      toast.error('Upload failed — try a URL instead')
    } finally {
      setUploading(false)
    }
  }

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    if (formData.gallery.length + files.length > 8) return toast.error('Max 8 gallery images')

    setGalleryUploading(true)
    try {
      const uploadPromises = files.map(async (file) => {
        const compressed = await compressImage(file)
        const fd = new FormData()
        fd.append('image', compressed, file.name)
        const res = await uploadAPI.blogImage(fd)
        return res.data.url
      })
      const urls = await Promise.all(uploadPromises)
      setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...urls] }))
      toast.success(`${urls.length} image(s) added to gallery`)
    } catch {
      toast.error('Some gallery images failed to upload')
    } finally {
      setGalleryUploading(false)
    }
  }

  const removeGalleryImage = (index) => {
    setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async (status) => {
    if (!formData.title.trim()) return toast.error('Title is required')
    if (!formData.content.trim()) return toast.error('Content is required')
    if (!formData.category) return toast.error('Category is required')
    setLoading(true)
    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      await blogAPI.create({ ...formData, tags: tagsArray, status })
      clearDraft()
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
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingTop: 64, fontFamily: 'var(--font-ui)' }}>
      <SEO title="Write a New Story" description="Draft or publish a new article on the platform." />
      
      <style>{`
        .cb-input {
          width:100%; padding:12px 16px;
          background: var(--bg-surface-2);
          border:1px solid var(--border-soft);
          border-radius:10px; font-size:15px; color:var(--text-primary); outline:none;
          font-family:var(--font-ui); transition:all 0.2s; box-sizing:border-box;
        }
        .cb-input:focus { border-color: var(--accent); }
        .cb-input::placeholder { color: var(--text-tertiary); }
        .cb-textarea {
          width:100%; padding:16px;
          background: var(--bg-surface-2);
          border:1px solid var(--border-soft);
          border-radius:12px; font-size:15px; color:var(--text-secondary); outline:none;
          font-family:var(--font-ui); transition:all 0.2s; box-sizing:border-box;
          resize:vertical; line-height:1.8; min-height:480px;
        }
        .cb-textarea:focus { border-color: var(--accent); }
        .cb-textarea::placeholder { color: var(--text-tertiary); }
        .cb-select {
          width:100%; padding:12px 16px;
          background: var(--bg-surface-2);
          border:1px solid var(--border-soft);
          border-radius:10px; font-size:14px; color:var(--text-primary); outline:none;
          font-family:var(--font-ui); transition:all 0.2s;
          cursor:pointer; appearance:none;
        }
        .cb-select:focus { border-color: var(--accent); }
        .cb-select option { background: var(--bg-surface); color: var(--text-primary); }
        .cb-upload-zone {
          border:2px dashed var(--border-strong); border-radius:10px;
          padding:20px; text-align:center; cursor:pointer;
          transition:all 0.2s; position:relative; overflow:hidden;
          display: block;
        }
        .cb-upload-zone:hover { border-color: var(--accent); background: var(--accent-soft); }
        .btn-draft {
          display:inline-flex; align-items:center; gap:8px;
          padding:11px 22px; border-radius:10px; font-size:14px; font-weight:500;
          cursor:pointer; transition:all 0.2s; font-family:var(--font-ui);
          border:1px solid var(--border-strong); background:var(--bg-surface-2); color:var(--text-secondary);
        }
        .btn-draft:hover { border-color: var(--text-tertiary); color: var(--text-primary); }
        .btn-draft:disabled { opacity:0.5; cursor:not-allowed; }
        .btn-publish {
          display:inline-flex; align-items:center; gap:8px;
          padding:11px 22px; border-radius:10px; font-size:14px; font-weight:500;
          cursor:pointer; transition:all 0.2s; font-family:var(--font-ui);
          border:none; background: var(--accent); color:var(--text-on-accent);
          box-shadow: var(--shadow-pop);
        }
        .btn-publish:hover:not(:disabled) { background: var(--accent-strong); }
        .btn-publish:disabled { opacity:0.5; cursor:not-allowed; }
        .status-pill {
          flex:1; padding:10px 16px; border-radius:10px; font-size:13px;
          font-weight:500; cursor:pointer; transition:all 0.2s; text-align:center;
          border:1px solid var(--border-soft); background:var(--bg-surface-2);
          color:var(--text-tertiary); font-family:var(--font-ui);
        }
        .status-pill.active {
          background: var(--accent-soft);
          border-color: var(--accent); color: var(--accent-strong);
        }
        .sidebar-card {
          background: var(--bg-surface); border:1px solid var(--border-soft);
          border-radius:14px; padding:20px;
        }
        .sidebar-title {
          font-family:var(--font-display); font-size:13px; font-weight:700;
          color:var(--text-tertiary); text-transform:uppercase;
          letter-spacing:1px; margin-bottom:14px;
        }
        .preview-content h1,.preview-content h2,.preview-content h3{font-family:var(--font-display);font-weight:700;color:var(--text-primary);margin:1rem 0 0.5rem}
        .preview-content h1{font-size:1.8rem;letter-spacing:-0.5px}
        .preview-content h2{font-size:1.4rem}
        .preview-content h3{font-size:1.2rem}
        .preview-content p{color:var(--text-secondary);line-height:1.8;margin:0.75rem 0}
        .preview-content ul,.preview-content ol{color:var(--text-secondary);line-height:1.8;padding-left:1.5rem;margin:0.75rem 0}
        .preview-content code{background:var(--accent-soft);color:var(--accent-strong);padding:2px 6px;border-radius:4px;font-size:0.875rem}
        .preview-content blockquote{border-left:3px solid var(--accent);padding-left:1rem;color:var(--text-tertiary);font-style:italic;margin:1rem 0}

        .cb-page-pad { padding: 40px 48px; }
        .cb-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 36px; flex-wrap: wrap; gap: 16px; }
        .cb-header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

        @media (max-width: 900px) {
          .cb-grid { grid-template-columns: 1fr !important; }
          .cb-page-pad { padding: 28px 24px; }
        }
        @media (max-width: 480px) {
          .cb-page-pad { padding: 20px 16px; }
          .cb-header-actions { width: 100%; }
          .cb-header-actions button { flex: 1; justify-content: center; padding: 11px 12px !important; }
          .cb-textarea { min-height: 320px !important; }
        }
      `}</style>

      <div className="cb-page-pad" style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Recovery Banner */}
        {showRecovery && (
          <div style={{
            background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)',
            borderRadius: 12, padding: '14px 20px', marginBottom: 24,
            display: 'flex', alignItems: 'center', justifycontent: 'space-between', gap: 16, flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>📝</span>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                Found an unsaved draft from {new Date(recoveredDraft?.savedAt).toLocaleString()}. Restore it?
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={dismissRecovery}
                style={{ padding: '7px 14px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
                Discard
              </button>
              <button onClick={restoreDraft}
                style={{ padding: '7px 14px', background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 8, color: '#fbbf24', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
                Restore Draft
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="cb-header-row">
          <div>
            <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'none', marginBottom: 8, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}>
              <FiArrowLeft size={12} /> Back to dashboard
            </Link>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,4vw,28px)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              Write a Story
            </h1>
          </div>
          <div className="cb-header-actions">
            {lastSaved && (
              <span style={{ fontSize: 11, color: 'rgba(52,211,153,0.7)', display: 'inline-flex', alignItems: 'center', gap: 5, marginRight: 8 }}>
                <FiSave size={11} /> Saved locally {new Date(lastSaved).toLocaleTimeString()}
              </span>
            )}
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

        <div className="cb-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
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
              style={{ fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 700, padding: '16px 20px', borderRadius: 12 }}
            />

            {/* Word count bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 4px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{wordCount} words</span>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>~{readTime} min read</span>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{formData.content.length} characters</span>
            </div>

            {/* Content Component Replacement */}
            <MarkdownEditor
              value={formData.content}
              onChange={(val) => setFormData(p => ({ ...p, content: val || '' }))}
              height={520}
            />
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Status */}
            <div className="sidebar-card">
              <div className="sidebar-title">Publish Status</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['draft', 'published', 'archived'].map(s => (
                  <button key={s} onClick={() => setFormData(p => ({ ...p, status: s }))}
                    className={`status-pill ${formData.status === s ? 'active' : ''}`}>
                    {s === 'draft' ? '📝 Draft' : s === 'published' ? '🚀 Publish' : '📦 Archive'}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Toggle */}
            <div className="sidebar-card">
              <div className="sidebar-title">Featured Article</div>
              <button 
                onClick={() => setFormData(p => ({ ...p, featured: !p.featured }))}
                style={{
                  width: '100%', padding: '10px 16px', borderRadius: 10,
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  transition: 'all 0.2s', fontFamily: "'Inter',sans-serif",
                  border: formData.featured ? '1px solid rgba(251,191,36,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  background: formData.featured ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
                  color: formData.featured ? '#fbbf24' : 'rgba(255,255,255,0.4)',
                }}>
                {formData.featured ? '⭐ Featured' : '☆ Mark as Featured'}
              </button>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>
                Featured articles appear in the homepage hero section
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
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none', fontSize: 12 }}>▼</span>
              </div>
            </div>

            {/* 2. Added AISuggestionsPanel placement here */}
            <AISuggestionsPanel
              content={formData.content}
              category={formData.category}
              onSelectTitle={(title) => setFormData(p => ({ ...p, title }))}
              onSelectTags={(tags) => {
                setFormData(p => {
                  const existingTags = p.tags ? p.tags.split(',').map(t => t.trim()).filter(Boolean) : []
                  const merged = [...new Set([...existingTags, ...tags])]
                  return { ...p, tags: merged.join(', ') }
                })
              }}
            />

            {/* Tags */}
            <div className="sidebar-card">
              <div className="sidebar-title">Tags</div>
              <input className="cb-input" type="text" name="tags" value={formData.tags}
                onChange={handleChange} placeholder="react, javascript, ai" />
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>Separate with commas</p>
              {formData.tags && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {formData.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                    <span key={tag} style={{ fontSize: 11, padding: '3px 8px', background: 'var(--accent-soft)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)', borderRadius: 6, color: 'var(--accent-strong)' }}>##{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Cover Image */}
            <div className="sidebar-card">
              <div className="sidebar-title"><FiImage size={12} style={{ display: 'inline', marginRight: 4 }} />Cover Image</div>

              {/* Upload */}
              <label className="cb-upload-zone">
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                <FiUpload size={20} style={{ color: 'var(--text-tertiary)', marginBottom: 6 }} />
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: 0 }}>
                  {uploading ? 'Uploading...' : 'Click to upload image'}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: '4px 0 0' }}>PNG, JPG up to 10MB</p>
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>or URL</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
              </div>

              <input className="cb-input" type="url" placeholder="https://images.unsplash.com/..."
                value={formData.image}
                onChange={(e) => setFormData(p => ({ ...p, image: e.target.value }))}
                style={{ fontSize: 12 }}
              />

              {formData.image && (
                <div style={{ position: 'relative', marginTop: 10 }}>
                  <img src={formData.image} alt="Preview" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, display: 'block' }}
                    onError={(e) => { e.target.style.display = 'none' }} />
                  <button onClick={() => setFormData(p => ({ ...p, image: '' }))}
                    style={{ position: 'absolute', top: 6, right: 6, background: 'color-mix(in srgb, var(--bg-page) 80%, transparent)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 12 }}>
                    <FiX size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Gallery Images */}
            <div className="sidebar-card">
              <div className="sidebar-title">
                Gallery <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>({formData.gallery.length}/8)</span>
              </div>

              <label className="cb-upload-zone">
                <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} style={{ display: 'none' }} disabled={formData.gallery.length >= 8 || galleryUploading} />
                <FiUpload size={18} style={{ color: 'var(--text-tertiary)', marginBottom: 6 }} />
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: 0 }}>
                  {galleryUploading ? 'Uploading...' : 'Add gallery images'}
                </p>
              </label>

              {formData.gallery.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 12 }}>
                  {formData.gallery.map((img, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={img} alt={`Gallery ${i + 1}`} style={{ width: '100%', height: 50, objectFit: 'cover', borderRadius: 6 }} />
                      <button onClick={() => removeGalleryImage(i)}
                        style={{ position: 'absolute', top: -4, right: -4, background: '#f87171', border: 'none', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <FiX size={9} style={{ color: '#fff' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>Shown as a gallery at the end of your article</p>
            </div>

            {/* Markdown Tips */}
            <div style={{ background: 'var(--accent-soft)', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)', borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-strong)', marginBottom: 10, letterSpacing: '0.5px' }}>✦ MARKDOWN TIPS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  '# Heading 1', '## Heading 2', '**bold**', '*italic*',
                  '- bullet list', '> blockquote', '`inline code`', '[link](url)',
                  '```js\ncode here\n```', 'youtube.com/watch?v=... (own line)',
                ].map(tip => (
                  <code key={tip} style={{ fontSize: 11, background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent-strong)', padding: '2px 6px', borderRadius: 4, whiteSpace: 'pre-wrap' }}>{tip}</code>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}