import { AnimatePresence, motion } from 'framer-motion'

/**
 * Drop-in replacement for `{isLoading ? <Skeleton/> : <RealContent/>}`.
 * Crossfades between the two instead of swapping instantly.
 *
 *   <CrossfadeLoader
 *     isLoading={isLoading}
 *     skeleton={<div className="skeleton" style={{ height: 360 }} />}
 *     content={<BlogCard blog={blog} />}
 *   />
 */
export default function CrossfadeLoader({ isLoading, skeleton, content, className, style }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={isLoading ? 'skeleton' : 'content'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={className}
        style={style}
      >
        {isLoading ? skeleton : content}
      </motion.div>
    </AnimatePresence>
  )
}
