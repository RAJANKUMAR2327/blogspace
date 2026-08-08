import { useMemo, useState, useEffect } from 'react'
import { FiList, FiChevronDown } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

// IMPORTANT: this must assign IDs using the exact same scheme as
// components/blog/ContentRenderer.jsx (`heading-${counter}-${slug}`, counter
// running across the whole document, code blocks excluded) or the jump
// links here won't match the actual heading elements on the page.
export function extractHeadings(content) {
  if (!content) return []

  // Strip code blocks first so headings inside ```...``` aren't counted —
  // ContentRenderer does the same before it walks the remaining text.
  const withoutCode = content.replace(/```[\s\S]*?```/g, '')

  const headings = []
  let counter = 0
  withoutCode.split('\n').forEach((line) => {
    const h1 = line.match(/^# (.+)/)
    const h2 = line.match(/^## (.+)/)
    const h3 = line.match(/^### (.+)/)
    if (h1 || h2 || h3) {
      const text = (h1 || h2 || h3)[1]
      const level = h1 ? 1 : h2 ? 2 : 3
      const id = `heading-${counter}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
      headings.push({ id, text, level })
      counter++
    }
  })
  return headings
}

export default function TableOfContents({ content }) {
  const headings = useMemo(() => extractHeadings(content), [content])
  const [activeId, setActiveId] = useState(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (headings.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find(e => e.isIntersecting)
        if (visible) setActiveId(visible.target.id)
      },
      { rootMargin: '-100px 0px -70% 0px' }
    )
    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) return null // not worth a TOC for a couple headings

  return (
    <div style={{ fontFamily: 'var(--font-ui)', marginBottom: 8 }}>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'none', border: '1px solid var(--border-soft)', borderRadius: 20,
          padding: '7px 14px', cursor: 'pointer', color: 'var(--text-secondary)',
          fontSize: 'var(--text-sm)', fontWeight: 500
        }}
      >
        <FiList size={13} />
        Contents
        <FiChevronDown size={13} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 2,
              marginTop: 10, paddingLeft: 4, borderLeft: '2px solid var(--border-soft)'
            }}
          >
            {headings.map(({ id, text, level }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  setExpanded(false)
                }}
                style={{
                  display: 'block', padding: '5px 0 5px 14px',
                  fontSize: 'var(--text-sm)', textDecoration: 'none',
                  color: activeId === id ? 'var(--accent)' : 'var(--text-tertiary)',
                  fontWeight: activeId === id ? 600 : 400,
                  paddingLeft: (level - 1) * 12 + 14,
                  transition: 'color 0.2s'
                }}
              >
                {text}
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  )
}
