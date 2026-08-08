import { useState } from 'react'
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function ImageGallery({ images }) {
  const [activeIndex, setActiveIndex] = useState(null)

  if (!images || images.length === 0) return null

  const close = () => setActiveIndex(null)
  const next  = () => setActiveIndex(i => (i + 1) % images.length)
  const prev  = () => setActiveIndex(i => (i - 1 + images.length) % images.length)

  return (
    <>
      <div style={{ margin: '2rem 0' }}>
        <p style={{ fontSize: 12, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(167,139,250,0.6)', marginBottom: 14 }}>
          Gallery
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: images.length === 1 ? '1fr' : images.length === 2 ? '1fr 1fr' : 'repeat(3, 1fr)',
          gap: 8
        }}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              style={{
                padding: 0, border: 'none', cursor: 'pointer', borderRadius: 10,
                overflow: 'hidden', background: 'var(--bg-surface-2)',
                height: images.length === 1 ? 320 : 160
              }}>
              <img src={img} alt={`Gallery ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {activeIndex !== null && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={close}>
          <button onClick={(e) => { e.stopPropagation(); close() }}
            style={{ position: 'absolute', top: 24, right: 24, background: 'var(--border-soft)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <FiX size={20} />
          </button>

          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev() }}
                style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', background: 'var(--border-soft)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <FiChevronLeft size={22} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next() }}
                style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', background: 'var(--border-soft)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <FiChevronRight size={22} />
              </button>
            </>
          )}

          <img src={images[activeIndex]} alt={`Gallery ${activeIndex + 1}`}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8 }} />

          <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontFamily: "'Inter',sans-serif" }}>
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}