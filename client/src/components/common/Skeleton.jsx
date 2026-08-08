export function Skeleton({ width = '100%', height = 20, radius = 8, style = {} }) {
  return (
    <div
      className="bs-skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  )
}

export function SkeletonCard({ height = 360 }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 14, overflow: 'hidden' }}>
      <Skeleton height={height * 0.5} radius={0} />
      <div style={{ padding: 18 }}>
        <Skeleton height={10} width="40%" style={{ marginBottom: 10 }} />
        <Skeleton height={16} width="90%" style={{ marginBottom: 8 }} />
        <Skeleton height={16} width="70%" style={{ marginBottom: 14 }} />
        <Skeleton height={12} width="100%" style={{ marginBottom: 6 }} />
        <Skeleton height={12} width="80%" />
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3, lastLineWidth = '60%' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton key={i} height={14} width={i === lines - 1 ? lastLineWidth : '100%'} />
      ))}
    </div>
  )
}

export function SkeletonAvatar({ size = 40 }) {
  return <Skeleton width={size} height={size} radius="50%" />
}