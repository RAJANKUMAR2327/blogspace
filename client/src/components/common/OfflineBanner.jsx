import { useState, useEffect } from 'react'
import { FiWifiOff } from 'react-icons/fi'

// Shows a slim banner whenever the browser loses network connectivity —
// useful since this is a PWA (service worker registered in main.jsx) that
// people may open with a flaky connection.
export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline  = () => setIsOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div style={{
      position: 'fixed', top: 64, left: 0, right: 0, zIndex: 999,
      background: 'var(--danger)', color: '#fff',
      padding: '8px 16px', textAlign: 'center',
      fontSize: 'var(--text-sm)', fontWeight: 500, fontFamily: 'var(--font-ui)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
    }}>
      <FiWifiOff size={14} /> You're offline — some content may be unavailable
    </div>
  )
}
