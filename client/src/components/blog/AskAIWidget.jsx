import { useState, useEffect, useRef, useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthContext } from '../../context/AuthContext'
import { aiAPI } from '../../services/api'
import { getOrCreateSessionId } from '../../utils/sessionId'
import { FiMessageCircle, FiX, FiSend, FiZap } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function AskAIWidget({ blogId }) {
  const { user } = useContext(AuthContext)
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const messagesEndRef = useRef(null)
  const queryClient = useQueryClient()
  const sessionId = !user ? getOrCreateSessionId() : null

  const { data } = useQuery({
    queryKey: ['articleChat', blogId, user?._id || sessionId],
    queryFn: async () => {
      const res = await aiAPI.getArticleChat(blogId, sessionId)
      return res.data.messages
    },
    enabled: open
  })

  const askMutation = useMutation({
    mutationFn: (q) => aiAPI.askAboutArticle(blogId, q, sessionId),
    onSuccess: () => {
      setQuestion('')
      queryClient.invalidateQueries(['articleChat', blogId, user?._id || sessionId])
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to get an answer')
  })

  const messages = data || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, askMutation.isPending])

  const handleAsk = () => {
    if (!question.trim() || askMutation.isPending) return
    askMutation.mutate(question.trim())
  }

  const SUGGESTED_QUESTIONS = [
    'Summarize this in one sentence',
    'What\'s the main takeaway?',
    'Explain this more simply',
  ]

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: 90, right: 20, zIndex: 90,
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
          border: 'none', cursor: 'pointer', display: open ? 'none' : 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(124,58,237,0.4)', color: 'var(--text-primary)'
        }}
        title="Ask AI about this article">
        <FiZap size={22} />
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 200,
          width: 360, maxWidth: 'calc(100vw - 40px)', height: 480, maxHeight: 'calc(100vh - 100px)',
          background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 16,
          display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          fontFamily: "'Inter',sans-serif", overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border-soft)', background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(37,99,235,0.06))' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              <FiZap size={14} style={{ color: '#a78bfa' }} /> Ask AI about this article
            </span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
              <FiX size={18} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', paddingTop: 30 }}>
                <FiMessageCircle size={28} style={{ color: 'var(--border-strong)', marginBottom: 12 }} />
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 16 }}>
                  Ask anything about this article
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {SUGGESTED_QUESTIONS.map(q => (
                    <button key={q} onClick={() => askMutation.mutate(q)}
                      style={{ padding: '8px 12px', background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', fontFamily: "'Inter',sans-serif", textAlign: 'left' }}>
                      "{q}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: m.role === 'user' ? 'linear-gradient(135deg,#7c3aed,#2563eb)' : 'var(--bg-surface-2)',
                color: m.role === 'user' ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '10px 14px', borderRadius: 12, fontSize: 'var(--text-sm)', lineHeight: 1.5
              }}>
                {m.content}
              </div>
            ))}

            {askMutation.isPending && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 4, padding: '10px 14px', background: 'var(--bg-surface-2)', borderRadius: 12 }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-tertiary)', animation: `bounce 1.2s ${i * 0.15}s infinite` }} />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: 14, borderTop: '1px solid var(--border-soft)', display: 'flex', gap: 8 }}>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="Ask a question..."
              aria-label="Ask a question about this article"
              style={{
                flex: 1, padding: '10px 14px', background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-soft)', borderRadius: 10,
                fontSize: 'var(--text-sm)', color: 'var(--text-primary)', outline: 'none', fontFamily: "'Inter',sans-serif"
              }}
            />
            <button onClick={handleAsk} disabled={askMutation.isPending || !question.trim()} aria-label="Send question"
              style={{
                width: 38, height: 38, borderRadius: 10, border: 'none',
                background: question.trim() ? 'linear-gradient(135deg,#7c3aed,#2563eb)' : 'var(--bg-surface-2)',
                color: question.trim() ? 'var(--text-primary)' : 'var(--text-tertiary)',
                cursor: question.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
              <FiSend size={15} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0) } 30% { transform: translateY(-6px) } }
      `}</style>
    </>
  )
}