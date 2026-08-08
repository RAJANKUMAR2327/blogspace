import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowUp } from 'react-icons/fi'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <AnimatePresence>
      {visible && (
        <>
          <style>{`
            .bs-scroll-top { bottom: 28px; }
            @media (max-width: 768px) { .bs-scroll-top { bottom: 84px; } }
          `}</style>
          <motion.button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="bs-scroll-top"
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            whileHover={{ scale: 1.08, y: -3 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            style={{
              position: 'fixed', right: 28, zIndex: 900,
              width: 44, height: 44, borderRadius: '50%', border: 'none',
              background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 8px 24px rgba(124,58,237,0.35)'
            }}
          >
            <FiArrowUp size={18} />
          </motion.button>
        </>
      )}
    </AnimatePresence>
  )
}
