import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { aiAPI } from '../../services/api'
import { FiX, FiZap, FiLoader } from 'react-icons/fi'
import toast from 'react-hot-toast'

const CATEGORIES = ['Technology','Programming','Design','Business','Science','Health','Travel','Food','Lifestyle','Other']
const TONES = ['Informative', 'Conversational', 'Professional', 'Enthusiastic', 'Witty']
const LENGTHS = [
  { value: 'short',  label: 'Short',  desc: '~400-600 words' },
  { value: 'medium', label: 'Medium', desc: '~800-1200 words' },
  { value: 'long',   label: 'Long',   desc: '~1500-2000 words' },
]

export default function GenerateArticleModal({ onClose, onGenerated }) {
  const [topic, setTopic] = useState('')
  const [category, setCategory] = useState('')
  const [tone, setTone] = useState('Informative')
  const [length, setLength] = useState('medium')

  const mutation = useMutation({
    mutationFn: () => aiAPI.generateArticle({ topic, category, tone, length }),
    onSuccess: (res) => {
      onGenerated(res.data.title, res.data.content)
      toast.success('Article draft generated! Review and edit before publishing.')
      onClose()
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Generation failed')
  })

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Inter',sans-serif" }}
      onClick={onClose}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 18, padding: 28, maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiZap style={{ color: '#fbbf24' }} /> Generate Article Draft
          </h3>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
            <FiX size={18} />
          </button>
        </div>

        <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: '#fbbf24', lineHeight: 1.5 }}>
            ⚠️ AI-generated drafts need review and fact-checking before publishing. Limited to 5 generations per hour.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Topic *</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. The benefits of intermittent fasting for beginners"
              rows={2}
              style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 'var(--text-sm)', outline: 'none', fontFamily: "'Inter',sans-serif", resize: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 'var(--text-sm)', outline: 'none', cursor: 'pointer' }}>
              <option value="">Select category...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Tone</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {TONES.map(t => (
                <button key={t} onClick={() => setTone(t)}
                  style={{
                    padding: '6px 12px', borderRadius: 100, fontSize: 12, cursor: 'pointer',
                    border: `1px solid ${tone === t ? 'rgba(167,139,250,0.4)' : 'var(--border-soft)'}`,
                    background: tone === t ? 'rgba(167,139,250,0.15)' : 'var(--bg-surface-2)',
                    color: tone === t ? '#a78bfa' : 'var(--text-secondary)', fontFamily: "'Inter',sans-serif"
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Length</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {LENGTHS.map(l => (
                <button key={l.value} onClick={() => setLength(l.value)}
                  style={{
                    flex: 1, padding: '10px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                    border: `1px solid ${length === l.value ? 'rgba(167,139,250,0.4)' : 'var(--border-soft)'}`,
                    background: length === l.value ? 'rgba(167,139,250,0.15)' : 'var(--bg-surface-2)',
                    fontFamily: "'Inter',sans-serif"
                  }}>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: length === l.value ? '#a78bfa' : 'var(--text-secondary)', marginBottom: 2 }}>{l.label}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{l.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => mutation.mutate()}
            disabled={!topic.trim() || mutation.isPending}
            style={{
              padding: '12px', borderRadius: 10, border: 'none', cursor: (!topic.trim() || mutation.isPending) ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: '#fff', fontSize: 14, fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: (!topic.trim() || mutation.isPending) ? 0.5 : 1, fontFamily: "'Inter',sans-serif"
            }}>
            {mutation.isPending ? (
              <><FiLoader className="spin" size={15} /> Generating... (this takes 15-30s)</>
            ) : (
              <><FiZap size={15} /> Generate Article</>
            )}
          </button>
        </div>
        <style>{`@keyframes spin-icon { to { transform: rotate(360deg) } } .spin { animation: spin-icon 1s linear infinite; }`}</style>
      </div>
    </div>
  )
}