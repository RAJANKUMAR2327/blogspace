import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { aiAPI } from '../../services/api'
import { FiZap, FiCheck, FiX, FiLoader } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function AISuggestionsPanel({ content, category, onSelectTitle, onSelectTags }) {
  const [suggestions, setSuggestions] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])

  const mutation = useMutation({
    mutationFn: () => aiAPI.suggestTitlesAndTags(content, category),
    onSuccess: (res) => {
      setSuggestions(res.data)
      setSelectedTags([])
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to get AI suggestions')
  })

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const applyTags = () => {
    if (selectedTags.length === 0) return toast.error('Select at least one tag first')
    onSelectTags(selectedTags)
    toast.success('Tags applied')
  }

  return (
    <div className="sidebar-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div className="sidebar-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiZap size={12} style={{ color: '#fbbf24' }} /> AI Suggestions
        </div>
      </div>

      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !content || content.trim().length < 50}
        style={{
          width: '100%', padding: '10px 16px', borderRadius: 10,
          border: 'none', cursor: (mutation.isPending || content.trim().length < 50) ? 'not-allowed' : 'pointer',
          background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,146,60,0.2))',
          color: '#fbbf24', fontSize: 13, fontWeight: 500, fontFamily: "'Inter',sans-serif",
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          opacity: (mutation.isPending || content.trim().length < 50) ? 0.5 : 1,
          transition: 'all 0.2s'
        }}>
        {mutation.isPending ? (
          <><FiLoader size={13} className="spin" /> Thinking...</>
        ) : (
          <><FiZap size={13} /> Suggest Title & Tags</>
        )}
      </button>

      {content.trim().length < 50 && (
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>
          Write a bit more content first (at least a few sentences)
        </p>
      )}

      <style>{`
        @keyframes spin-icon { to { transform: rotate(360deg) } }
        .spin { animation: spin-icon 1s linear infinite; }
      `}</style>

      {suggestions && (
        <div style={{ marginTop: 16 }}>
          {/* Title suggestions */}
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 8 }}>
            Title Ideas
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {suggestions.titles.map((title, i) => (
              <button
                key={i}
                onClick={() => { onSelectTitle(title); toast.success('Title applied') }}
                style={{
                  textAlign: 'left', padding: '8px 10px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.7)', fontSize: 12, cursor: 'pointer',
                  fontFamily: "'Inter',sans-serif", transition: 'all 0.2s', lineHeight: 1.4
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.3)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}>
                {title}
              </button>
            ))}
          </div>

          {/* Tag suggestions */}
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 8 }}>
            Tag Ideas <span style={{ fontWeight: 400 }}>(click to select)</span>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {suggestions.tags.map(tag => {
              const isSelected = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: '5px 12px', borderRadius: 100, fontSize: 11, cursor: 'pointer',
                    fontFamily: "'Inter',sans-serif", transition: 'all 0.2s',
                    border: `1px solid ${isSelected ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    background: isSelected ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
                    color: isSelected ? '#fbbf24' : 'rgba(255,255,255,0.5)',
                    display: 'flex', alignItems: 'center', gap: 4
                  }}>
                  {isSelected && <FiCheck size={10} />} {tag}
                </button>
              )
            })}
          </div>

          {selectedTags.length > 0 && (
            <button
              onClick={applyTags}
              style={{
                width: '100%', padding: '8px', borderRadius: 8, border: 'none',
                background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: '#fff',
                fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter',sans-serif"
              }}>
              Apply {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}
    </div>
  )
}