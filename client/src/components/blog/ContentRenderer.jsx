import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

// Matches ```language\ncode\n``` blocks
const CODE_BLOCK_REGEX = /```(\w*)\n([\s\S]*?)```/g
// Matches YouTube URLs (watch?v=, youtu.be/, embed/)
const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/g
// Matches Vimeo URLs
const VIMEO_REGEX = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/g

export default function ContentRenderer({ content, fontSize = 17 }) {
  if (!content) return null

  // Split content into segments: text, code blocks, and standalone video URLs
  const segments = []
  let lastIndex = 0
  let headingCounter = 0

  // First pass: extract code blocks, keep everything else as raw text for further processing
  let match
  const codeBlockRegex = new RegExp(CODE_BLOCK_REGEX)
  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: content.slice(lastIndex, match.index) })
    }
    segments.push({ type: 'code', language: match[1] || 'javascript', value: match[2].trim() })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < content.length) {
    segments.push({ type: 'text', value: content.slice(lastIndex) })
  }

  const renderTextSegment = (text, key) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      // Standalone video link on its own line
      const ytMatch = [...line.matchAll(YOUTUBE_REGEX)][0]
      const vimeoMatch = [...line.matchAll(VIMEO_REGEX)][0]

      if (ytMatch && line.trim() === ytMatch[0].trim()) {
        return (
          <div key={`${key}-${i}`} style={{ position: 'relative', paddingBottom: '56.25%', margin: '1.5rem 0', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
            <iframe
              src={`https://www.youtube.com/embed/${ytMatch[1]}`}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube video"
            />
          </div>
        )
      }

      if (vimeoMatch && line.trim() === vimeoMatch[0].trim()) {
        return (
          <div key={`${key}-${i}`} style={{ position: 'relative', paddingBottom: '56.25%', margin: '1.5rem 0', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
            <iframe
              src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="Vimeo video"
            />
          </div>
        )
      }

      // Headings
      const h1 = line.match(/^# (.+)/)
      const h2 = line.match(/^## (.+)/)
      const h3 = line.match(/^### (.+)/)
      if (h1 || h2 || h3) {
        const text = (h1 || h2 || h3)[1]
        const level = h1 ? 1 : h2 ? 2 : 3
        const id = `heading-${headingCounter}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
        headingCounter++
        const Tag = `h${level}`
        return <Tag key={`${key}-${i}`} id={id} style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: '#fff', margin: level === 1 ? '1.5rem 0 0.75rem' : '1.25rem 0 0.6rem', fontSize: level === 1 ? '1.8rem' : level === 2 ? '1.4rem' : '1.15rem' }}>{text}</Tag>
      }

      // Blockquote
      const bq = line.match(/^> (.+)/)
      if (bq) {
        return (
          <blockquote key={`${key}-${i}`} style={{ borderLeft: '3px solid #7c3aed', paddingLeft: '1rem', margin: '1rem 0', color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}>
            {bq[1]}
          </blockquote>
        )
      }

      // List items
      const li = line.match(/^- (.+)/)
      if (li) {
        return <li key={`${key}-${i}`} style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginLeft: 20 }}>{renderInline(li[1])}</li>
      }

      // Empty line
      if (line.trim() === '') return <div key={`${key}-${i}`} style={{ height: 8 }} />

      // Regular paragraph
      return <p key={`${key}-${i}`} style={{ margin: '0.75rem 0', lineHeight: 1.85, fontSize, color: 'rgba(255,255,255,0.7)', fontWeight: 300 }}>{renderInline(line)}</p>
    })
  }

  // Handles **bold**, *italic*, `inline code`, [text](url)
  const renderInline = (text) => {
    const parts = []
    let remaining = text
    let key = 0

    const inlineRegex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))/

    while (remaining) {
      const m = remaining.match(inlineRegex)
      if (!m) { parts.push(remaining); break }
      if (m.index > 0) parts.push(remaining.slice(0, m.index))

      if (m[1]) parts.push(<strong key={key++} style={{ color: '#fff', fontWeight: 600 }}>{m[2]}</strong>)
      else if (m[3]) parts.push(<em key={key++}>{m[4]}</em>)
      else if (m[5]) parts.push(<code key={key++} style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', padding: '2px 6px', borderRadius: 4, fontSize: '0.9em', fontFamily: 'monospace' }}>{m[6]}</code>)
      else if (m[7]) parts.push(<a key={key++} href={m[9]} target="_blank" rel="noreferrer" style={{ color: '#a78bfa', textDecoration: 'underline' }}>{m[8]}</a>)

      remaining = remaining.slice(m.index + m[0].length)
    }
    return parts
  }

  return (
    <div className="prose">
      {segments.map((seg, i) => {
        if (seg.type === 'code') {
          return (
            <div key={i} style={{ margin: '1.5rem 0', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ background: '#1e1e2e', padding: '8px 16px', fontSize: 12, color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace' }}>
                {seg.language}
              </div>
              <SyntaxHighlighter
                language={seg.language}
                style={vscDarkPlus}
                customStyle={{ margin: 0, borderRadius: 0, fontSize: 14, padding: 20, background: '#1e1e2e' }}
              >
                {seg.value}
              </SyntaxHighlighter>
            </div>
          )
        }
        return <div key={i}>{renderTextSegment(seg.value, i)}</div>
      })}
    </div>
  )
}