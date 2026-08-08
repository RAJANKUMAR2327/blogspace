import { useMutation } from '@tanstack/react-query'
import { aiAPI } from '../../services/api'
import { FiCheckCircle, FiAlertTriangle, FiTrendingUp, FiLoader } from 'react-icons/fi'
import toast from 'react-hot-toast'

const SCORE_COLORS = { Easy: '#34d399', Medium: '#fbbf24', Hard: '#f87171' }

export default function WritingCheckPanel({ content }) {
  const mutation = useMutation({
    mutationFn: () => aiAPI.checkWriting(content),
    onError: (err) => toast.error(err.response?.data?.message || 'Check failed')
  })

  const result = mutation.data?.data

  return (
    <div className="sidebar-card">
      <div className="sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <FiCheckCircle size={12} style={{ color: '#34d399' }} /> Writing Check
      </div>

      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !content || content.trim().length < 50}
        style={{
          width: '100%', padding: '10px 16px', borderRadius: 10, border: 'none',
          cursor: (mutation.isPending || content.trim().length < 50) ? 'not-allowed' : 'pointer',
          background: 'rgba(52,211,153,0.15)', color: '#34d399', fontSize: 'var(--text-sm)', fontWeight: 500,
          fontFamily: "'Inter',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          opacity: (mutation.isPending || content.trim().length < 50) ? 0.5 : 1
        }}>
        {mutation.isPending ? <><FiLoader size={13} className="spin" /> Analyzing...</> : 'Check Grammar & SEO'}
      </button>
      <style>{`@keyframes spin-icon { to { transform: rotate(360deg) } } .spin { animation: spin-icon 1s linear infinite; }`}</style>

      {result && (
        <div style={{ marginTop: 16 }}>
          {/* Readability + overall feedback */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '10px 12px', background: 'var(--bg-surface-2)', borderRadius: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Readability</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: SCORE_COLORS[result.readabilityScore] || '#a78bfa' }}>
              {result.readabilityScore}
            </span>
          </div>

          {result.overallFeedback && (
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 16, lineHeight: 1.5 }}>
              "{result.overallFeedback}"
            </p>
          )}

          {/* Grammar issues */}
          {result.grammarIssues?.length > 0 && (
            <>
              <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(248,113,113,0.7)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <FiAlertTriangle size={11} /> Grammar & Clarity
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {result.grammarIssues.map((issue, i) => (
                  <div key={i} style={{ padding: '8px 10px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 8 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{issue.issue}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: '#f87171' }}>→ {issue.suggestion}</p>
                  </div>
                ))}
              </div>
            </>
          )}
          {result.grammarIssues?.length === 0 && (
            <p style={{ fontSize: 12, color: 'rgba(52,211,153,0.7)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiCheckCircle size={12} /> No grammar issues found
            </p>
          )}

          {/* SEO suggestions */}
          {result.seoSuggestions?.length > 0 && (
            <>
              <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(167,139,250,0.7)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <FiTrendingUp size={11} /> SEO Suggestions
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {result.seoSuggestions.map((s, i) => (
                  <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, paddingLeft: 14, borderLeft: '2px solid rgba(167,139,250,0.3)' }}>
                    {s}
                  </p>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}