import { AnimatePresence, motion } from 'framer-motion'
import { FiHeart } from 'react-icons/fi'

const PARTICLE_OFFSETS = [
  { x: -18, y: -22 }, { x: 0, y: -30 }, { x: 18, y: -22 },
  { x: -24, y: -4 },  { x: 24, y: -4 },
]

/**
 * Wrap a like button with this and pass `burst` (a changing key/counter that
 * increments each time the user likes) to trigger a one-shot particle burst.
 *
 *   const [burstKey, setBurstKey] = useState(0)
 *   <LikeBurst active={isLiked} burst={burstKey}>
 *     <button onClick={() => { like(); setBurstKey(k => k + 1) }}>...</button>
 *   </LikeBurst>
 */
export default function LikeBurst({ children, burst }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {children}
      <AnimatePresence>
        {burst > 0 && (
          <motion.div key={burst} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {PARTICLE_OFFSETS.map((offset, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                animate={{ opacity: 0, scale: 1, x: offset.x, y: offset.y }}
                transition={{ duration: 0.6, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'absolute', top: '50%', left: '50%',
                  color: 'var(--like)', display: 'flex'
                }}
              >
                <FiHeart size={12} fill="currentColor" />
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
