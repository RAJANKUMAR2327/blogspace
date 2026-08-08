import { useState, useEffect } from 'react'

// Thin fixed bar under the navbar that fills as the reader scrolls through
// the article. Purely cosmetic, no props needed.
export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{
      position: 'fixed', top: 64, left: 0, right: 0, height: 3, zIndex: 999,
      background: 'transparent', pointerEvents: 'none'
    }}>
      <div style={{
        height: '100%', width: `${progress}%`,
        background: 'var(--accent)', transition: 'width 0.1s linear'
      }} />
    </div>
  )
}
