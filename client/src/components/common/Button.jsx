const VARIANTS = {
  primary: {
    background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
    color: 'var(--text-primary)', border: 'none', boxShadow: '0 6px 20px rgba(124,58,237,0.3)'
  },
  secondary: {
    background: 'var(--bg-surface-2)', color: 'var(--text-secondary)',
    border: '1px solid var(--border-soft)'
  },
  ghost: {
    background: 'none', color: 'var(--text-secondary)', border: 'none'
  },
  danger: {
    background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)'
  },
}

export default function Button({ variant = 'primary', size = 'md', children, icon, disabled, style = {}, ...props }) {
  const sizeStyles = {
    sm: { padding: '7px 14px', fontSize: 12 },
    md: { padding: '11px 22px', fontSize: 14 },
    lg: { padding: '14px 28px', fontSize: 'var(--text-base)' },
  }

  return (
    <button
      disabled={disabled}
      {...props}
      style={{
        ...VARIANTS[variant],
        ...sizeStyles[size],
        borderRadius: 10, fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'Inter',sans-serif", display: 'inline-flex', alignItems: 'center', gap: 8,
        opacity: disabled ? 0.5 : 1, transition: 'all 0.2s ease',
        ...style
      }}
      onMouseEnter={(e) => {
        if (!disabled && variant === 'primary') e.currentTarget.style.transform = 'translateY(-1px)'
        props.onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        props.onMouseLeave?.(e)
      }}
    >
      {icon}
      {children}
    </button>
  )
}