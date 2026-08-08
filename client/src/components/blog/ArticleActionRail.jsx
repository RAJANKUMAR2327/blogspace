import { motion } from 'framer-motion'
import { FiHeart, FiMessageSquare, FiBookmark, FiShare2 } from 'react-icons/fi'
import LikeBurst from './LikeBurst'
import AnimatedCounter from '../common/AnimatedCounter'

export default function ArticleActionRail({
  isLiked, likeCount, onLike, likeBurst = 0,
  commentCount, onCommentClick,
  isSaved, onSave,
  onShare,
}) {
  const items = [
    { icon: FiHeart, active: isLiked, count: likeCount, onClick: onLike, fill: true, label: 'Like', burst: true },
    { icon: FiMessageSquare, count: commentCount, onClick: onCommentClick, label: 'Comments' },
    { icon: FiBookmark, active: isSaved, onClick: onSave, fill: true, label: 'Save' },
    { icon: FiShare2, onClick: onShare, label: 'Share' },
  ]

  return (
    <div className="article-rail" style={{
      position: 'sticky', top: '40vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 18, width: 56
    }}>
      {items.map(({ icon: Icon, active, count, onClick, fill, label, burst }, i) => {
        const button = (
          <motion.button
            onClick={onClick}
            title={label}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', cursor: 'pointer',
              color: active ? 'var(--accent)' : 'var(--text-tertiary)',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: active ? 'var(--accent-soft)' : 'var(--bg-surface-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--border-soft)', transition: 'all 0.2s'
            }}>
              <Icon size={17} fill={fill && active ? 'currentColor' : 'none'} />
            </div>
            {typeof count === 'number' && (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}><AnimatedCounter value={count} duration={0.8} /></span>
            )}
          </motion.button>
        )

        return burst ? <LikeBurst key={i} burst={likeBurst}>{button}</LikeBurst> : <div key={i}>{button}</div>
      })}

      <style>{`
        @media (max-width: 1100px) { .article-rail { display: none; } }
      `}</style>
    </div>
  )
}
