import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion'

/**
 * Counts up from 0 to `value` once it scrolls into view. Drop-in replacement
 * for rendering a raw number:
 *
 *   <AnimatedCounter value={blog.views} />
 *   <AnimatedCounter value={1234} suffix="+" />
 */
export default function AnimatedCounter({ value = 0, duration = 1.2, suffix = '', style }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (v) => Math.round(v).toLocaleString())

  useEffect(() => {
    if (!isInView) return
    const controls = animate(motionValue, value, { duration, ease: [0.22, 1, 0.36, 1] })
    return controls.stop
  }, [isInView, value])

  return (
    <motion.span ref={ref} style={style}>
      <motion.span>{rounded}</motion.span>{suffix}
    </motion.span>
  )
}
