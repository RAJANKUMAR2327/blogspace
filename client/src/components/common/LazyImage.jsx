import { useState, useRef, useEffect } from 'react'

// Simple lazy-loading, fade-in image. Only starts downloading once it's
// near the viewport (via IntersectionObserver), and fades in once loaded
// so the layout doesn't pop.
export default function LazyImage({ src, alt = '', className = '', style = {} }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded]   = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' } // start loading a bit before it scrolls into view
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--bg-surface-2)',
        overflow: 'hidden',
        ...style
      }}
    >
      {isVisible && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.4s ease, transform 0.5s ease'
          }}
        />
      )}
    </div>
  )
}
