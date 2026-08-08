import { useState, useEffect } from 'react'
import { FiDownload, FiX } from 'react-icons/fi'

// Listens for the browser's native PWA install prompt and shows a small,
// dismissible banner offering to trigger it. Chrome/Edge/Android only —
// the beforeinstallprompt event simply never fires on iOS Safari, so this
// naturally no-ops there.
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('installPromptDismissed') === 'true'
  )

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    sessionStorage.setItem('installPromptDismissed', 'true')
    setDismissed(true)
  }

  if (!deferredPrompt || dismissed) return null

  return (
    <div style={{
      position: 'fixed', bottom: 84, left: 16, right: 16, zIndex: 998,
      maxWidth: 420, margin: '0 auto',
      background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
      borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-pop)',
      padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
      fontFamily: 'var(--font-ui)'
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: 'var(--accent-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <FiDownload size={16} style={{ color: 'var(--accent-strong)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>Install BlogSpace</p>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Add to your home screen for quick access</p>
      </div>
      <button onClick={handleInstall} style={{
        padding: '7px 14px', borderRadius: 8, border: 'none', background: 'var(--accent)',
        color: 'var(--text-on-accent)', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap'
      }}>
        Install
      </button>
      <button onClick={handleDismiss} aria-label="Dismiss install prompt" style={{
        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)',
        display: 'flex', padding: 4, flexShrink: 0
      }}>
        <FiX size={16} />
      </button>
    </div>
  )
}
