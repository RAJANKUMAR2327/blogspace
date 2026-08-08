const ILLUSTRATIONS = {
  noResults: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="56" fill="rgba(167,139,250,0.06)" />
      <circle cx="52" cy="52" r="22" stroke="rgba(167,139,250,0.4)" strokeWidth="3" fill="none" />
      <line x1="68" y1="68" x2="84" y2="84" stroke="rgba(167,139,250,0.4)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="46" cy="48" r="2.5" fill="rgba(167,139,250,0.5)" />
      <circle cx="58" cy="48" r="2.5" fill="rgba(167,139,250,0.5)" />
      <path d="M46 58 Q52 62 58 58" stroke="rgba(167,139,250,0.5)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  ),
  noArticles: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="56" fill="rgba(96,165,250,0.06)" />
      <rect x="38" y="32" width="44" height="56" rx="4" stroke="rgba(96,165,250,0.4)" strokeWidth="3" fill="none" />
      <line x1="46" y1="46" x2="74" y2="46" stroke="rgba(96,165,250,0.4)" strokeWidth="3" strokeLinecap="round" />
      <line x1="46" y1="56" x2="74" y2="56" stroke="rgba(96,165,250,0.3)" strokeWidth="3" strokeLinecap="round" />
      <line x1="46" y1="66" x2="62" y2="66" stroke="rgba(96,165,250,0.3)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="78" cy="78" r="14" fill="var(--bg-page)" stroke="rgba(52,211,153,0.5)" strokeWidth="3" />
      <line x1="78" y1="72" x2="78" y2="84" stroke="rgba(52,211,153,0.6)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="72" y1="78" x2="84" y2="78" stroke="rgba(52,211,153,0.6)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  noComments: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="56" fill="rgba(244,114,182,0.06)" />
      <path d="M36 42 Q36 36 42 36 H78 Q84 36 84 42 V64 Q84 70 78 70 H56 L44 80 V70 H42 Q36 70 36 64 Z" stroke="rgba(244,114,182,0.4)" strokeWidth="3" fill="none" strokeLinejoin="round" />
      <circle cx="50" cy="52" r="2.5" fill="rgba(244,114,182,0.5)" />
      <circle cx="60" cy="52" r="2.5" fill="rgba(244,114,182,0.5)" />
      <circle cx="70" cy="52" r="2.5" fill="rgba(244,114,182,0.5)" />
    </svg>
  ),
  noNotifications: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="56" fill="rgba(251,191,36,0.06)" />
      <path d="M60 34 C50 34 44 42 44 52 V64 L38 72 H82 L76 64 V52 C76 42 70 34 60 34 Z" stroke="rgba(251,191,36,0.4)" strokeWidth="3" fill="none" strokeLinejoin="round" />
      <path d="M52 76 Q56 82 60 82 Q64 82 68 76" stroke="rgba(251,191,36,0.4)" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  ),
  bookmark: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="56" fill="rgba(124,58,237,0.06)" />
      <path d="M44 32 H76 V88 L60 76 L44 88 Z" stroke="rgba(167,139,250,0.4)" strokeWidth="3" fill="none" strokeLinejoin="round" />
    </svg>
  ),
}

export default function EmptyState({
  illustration = 'noResults',
  title,
  description,
  action,
}) {
  return (
    <div style={{
      textAlign: 'center', padding: '60px 20px',
      fontFamily: "'Inter',sans-serif", animation: 'bs-fade-in 0.4s ease-out both'
    }}>
      <style>{`
        @keyframes es-illustration-in {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div style={{ marginBottom: 8, opacity: 0.9, animation: 'es-illustration-in 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
        {ILLUSTRATIONS[illustration] || ILLUSTRATIONS.noResults}
      </div>
      <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        {title}
      </h3>
      {description && (
        <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-md)', maxWidth: 360, margin: '0 auto', marginBottom: action ? 24 : 0 }}>
          {description}
        </p>
      )}
      {action}
    </div>
  )
}