import { FiMinus, FiPlus, FiType } from 'react-icons/fi'

const MIN_SIZE = 14
const MAX_SIZE = 22

// Compact inline pill for adjusting reading font size — sits in the byline
// row next to the Contents toggle, rather than taking up an entire sidebar
// card (matching how Medium/Substack keep reading controls unobtrusive).
export default function ReadingControls({ fontSize, setFontSize }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      border: '1px solid var(--border-soft)', borderRadius: 20,
      padding: '4px 6px', fontFamily: 'var(--font-ui)'
    }}>
      <FiType size={13} style={{ color: 'var(--text-tertiary)', marginRight: 4, marginLeft: 4 }} />
      <button
        onClick={() => setFontSize(Math.max(MIN_SIZE, fontSize - 1))}
        disabled={fontSize <= MIN_SIZE}
        aria-label="Decrease text size"
        style={{
          width: 24, height: 24, borderRadius: '50%', border: 'none',
          background: 'transparent', color: 'var(--text-secondary)',
          cursor: fontSize <= MIN_SIZE ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: fontSize <= MIN_SIZE ? 0.35 : 1
        }}
      >
        <FiMinus size={12} />
      </button>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', minWidth: 26, textAlign: 'center' }}>{fontSize}px</span>
      <button
        onClick={() => setFontSize(Math.min(MAX_SIZE, fontSize + 1))}
        disabled={fontSize >= MAX_SIZE}
        aria-label="Increase text size"
        style={{
          width: 24, height: 24, borderRadius: '50%', border: 'none',
          background: 'transparent', color: 'var(--text-secondary)',
          cursor: fontSize >= MAX_SIZE ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: fontSize >= MAX_SIZE ? 0.35 : 1
        }}
      >
        <FiPlus size={12} />
      </button>
    </div>
  )
}
