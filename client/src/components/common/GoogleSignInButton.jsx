import { useEffect, useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function GoogleSignInButton() {
  const buttonRef = useRef(null)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

    if (!clientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID is not set — Google sign-in disabled')
      return
    }

    const handleCredentialResponse = async (response) => {
      try {
        const res = await authAPI.googleAuth(response.credential)
        login(res.data.user, res.data.token)
        toast.success(`Welcome, ${res.data.user.name.split(' ')[0]}!`)
        navigate(res.data.user.role === 'admin' ? '/admin' : '/')
      } catch (err) {
        toast.error(err.response?.data?.message || 'Google sign-in failed')
      }
    }

    const initGoogle = () => {
      if (!window.google?.accounts?.id) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        // Without this, Google shows a personalized "Continue as [name]"
        // chip instead of the plain button whenever the browser already has
        // an active Google session (a newer feature called FedCM). This
        // keeps the button generic for everyone, letting any visitor pick
        // which account to use instead of defaulting to whoever's logged
        // into Google on that device.
        use_fedcm_for_button: false,
      })
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 360,
          text: 'continue_with',
        })
      }
    }

    if (window.google?.accounts?.id) {
      initGoogle()
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval)
          initGoogle()
        }
      }, 200)
      return () => clearInterval(interval)
    }
  }, [login, navigate])

  return <div ref={buttonRef} style={{ display: 'flex', justifyContent: 'center', width: '100%' }} />
}
