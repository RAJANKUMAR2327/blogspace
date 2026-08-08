import { useEffect, useState } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

export default function RouteLoadingBar() {
  const location = useLocation()
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setVisible(true)
    setProgress(30)

    const t1 = setTimeout(() => setProgress(70), 100)
    const t2 = setTimeout(() => setProgress(100), 300)
    const t3 = setTimeout(() => setVisible(false), 500)

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [location.pathname])

  if (!visible) return null

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 9999, background: 'transparent' }}>
      <div style={{
        height: '100%', width: `${progress}%`,
        background: 'linear-gradient(90deg, #7c3aed, #60a5fa)',
        transition: 'width 0.3s ease-out',
        boxShadow: '0 0 8px rgba(124,58,237,0.6)'
      }} />
    </div>
  )
}