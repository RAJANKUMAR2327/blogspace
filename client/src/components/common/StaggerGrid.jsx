import { motion } from 'framer-motion'

// Drop-in replacement for a grid container div — children (wrapped in
// StaggerItem) animate in one after another instead of all at once.
//
//   <StaggerGrid style={{ display: 'grid', ... }}>
//     {items.map(x => <StaggerItem key={x.id}><BlogCard blog={x} /></StaggerItem>)}
//   </StaggerGrid>

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export function StaggerGrid({ children, ...props }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, ...props }) {
  return (
    <motion.div variants={itemVariants} {...props}>
      {children}
    </motion.div>
  )
}
