import { motion } from 'framer-motion'

/**
 * Wraps any content and fades/slides it up into place the first time it
 * scrolls into view. Drop-in — just wrap a section:
 *
 *   <Reveal><h2>Some heading</h2></Reveal>
 *   <Reveal delay={0.1}><BlogGrid /></Reveal>
 *
 * `once` defaults to true so it doesn't re-animate every time you scroll
 * back up past it (feels distracting on a long feed page).
 */
export default function Reveal({ children, delay = 0, y = 24, duration = 0.5, once = true, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
