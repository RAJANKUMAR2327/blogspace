import { useState, useContext } from 'react'
import { useMutation } from '@tanstack/react-query'
import { AuthContext } from '../../context/AuthContext'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { FiShield, FiCheckCircle, FiCopy, FiDownload, FiAlertTriangle } from 'react-icons/fi'

function BackupCodesDisplay({ codes, onDone }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(codes.join('\n'))
    toast.success('Copied to clipboard')
  }

  const handleDownload = () => {
    const blob = new Blob([
      'BlogSpace Two-Factor Backup Codes\n',
      'Each code can only be used once. Store this somewhere safe.\n\n',
      codes.join('\n')
    ], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'blogspace-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: 12, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 10 }}>
        <FiAlertTriangle size={15} style={{ color: '#fbbf24', flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Save these somewhere safe now — they won't be shown again. Each code works once and lets you
          log in if you lose access to your authenticator app.
        </p>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)',
        borderRadius: 10, padding: 16, fontFamily: 'monospace', fontSize: 14
      }}>
        {codes.map(c => (
          <div key={c} style={{ color: 'var(--text-primary)', letterSpacing: '1px' }}>{c}</div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={handleCopy} className="save-btn" style={{ background: 'var(--bg-surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiCopy size={13} /> Copy
        </button>
        <button onClick={handleDownload} className="save-btn" style={{ background: 'var(--bg-surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiDownload size={13} /> Download
        </button>
      </div>

      <button onClick={onDone} className="save-btn" style={{ width: 'fit-content' }}>
        I've saved these codes
      </button>
    </div>
  )
}

export default function TwoFactorSettings() {
  const { user, updateUser } = useContext(AuthContext)

  const [step, setStep] = useState('idle') // 'idle' | 'setup' | 'backup-codes' | 'disabling' | 'regenerating'
  const [qrCode, setQrCode] = useState(null)
  const [secret, setSecret] = useState(null)
  const [code, setCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [regenPassword, setRegenPassword] = useState('')
  const [backupCodes, setBackupCodes] = useState([])

  const isEnabled = user?.twoFactorEnabled

  const setupMutation = useMutation({
    mutationFn: () => authAPI.setupTwoFactor(),
    onSuccess: (res) => {
      setQrCode(res.data.qrCode)
      setSecret(res.data.secret)
      setStep('setup')
    },
    onError: () => toast.error('Could not start 2FA setup — please try again')
  })

  const verifyMutation = useMutation({
    mutationFn: () => authAPI.verifySetupTwoFactor(code),
    onSuccess: (res) => {
      toast.success('Two-factor authentication enabled!')
      updateUser({ twoFactorEnabled: true })
      setBackupCodes(res.data.backupCodes || [])
      setStep('backup-codes')
      setCode('')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Invalid code')
  })

  const disableMutation = useMutation({
    mutationFn: () => authAPI.disableTwoFactor(disablePassword),
    onSuccess: () => {
      toast.success('Two-factor authentication disabled')
      updateUser({ twoFactorEnabled: false })
      setStep('idle')
      setDisablePassword('')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Incorrect password')
  })

  const regenerateMutation = useMutation({
    mutationFn: () => authAPI.regenerateBackupCodes(regenPassword),
    onSuccess: (res) => {
      setBackupCodes(res.data.backupCodes || [])
      setStep('backup-codes')
      setRegenPassword('')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Incorrect password')
  })

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 14, padding: 24 }}>
      <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        <FiShield size={15} style={{ color: '#34d399' }} /> Two-Factor Authentication
      </h3>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 16 }}>
        Add an extra layer of security using an authenticator app (Google Authenticator, Authy, etc.)
      </p>

      {step === 'idle' && (
        isEnabled ? (
          <>
            <p style={{ fontSize: 'var(--text-sm)', color: '#34d399', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
              <FiCheckCircle size={14} /> Two-factor authentication is enabled
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep('disabling')} className="save-btn" style={{ background: 'var(--bg-surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border-strong)' }}>
                Disable 2FA
              </button>
              <button onClick={() => setStep('regenerating')} className="save-btn" style={{ background: 'var(--bg-surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border-strong)' }}>
                Regenerate backup codes
              </button>
            </div>
          </>
        ) : (
          <button onClick={() => setupMutation.mutate()} disabled={setupMutation.isPending} className="save-btn" style={{ width: 'fit-content' }}>
            {setupMutation.isPending ? 'Starting setup...' : 'Enable 2FA'}
          </button>
        )
      )}

      {step === 'setup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            1. Scan this QR code with your authenticator app
          </p>
          <img src={qrCode} alt="2FA QR code" style={{ width: 180, height: 180, borderRadius: 10, background: '#fff', padding: 8 }} />
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            Can't scan? Enter this code manually: <code style={{ background: 'var(--bg-surface-2)', padding: '2px 6px', borderRadius: 4 }}>{secret}</code>
          </p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            2. Enter the 6-digit code from your app to confirm
          </p>
          <input
            className="profile-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            style={{ textAlign: 'center', fontSize: 20, letterSpacing: '6px', fontFamily: 'monospace', maxWidth: 180 }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => verifyMutation.mutate()}
              disabled={verifyMutation.isPending || code.length !== 6}
              className="save-btn"
            >
              {verifyMutation.isPending ? 'Verifying...' : 'Confirm & Enable'}
            </button>
            <button
              onClick={() => { setStep('idle'); setCode(''); setQrCode(null) }}
              style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === 'backup-codes' && (
        <BackupCodesDisplay codes={backupCodes} onDone={() => { setStep('idle'); setBackupCodes([]) }} />
      )}

      {step === 'disabling' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Enter your password to confirm disabling 2FA</p>
          <input
            className="profile-input"
            type="password"
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.target.value)}
            placeholder="Password"
            style={{ maxWidth: 240 }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => disableMutation.mutate()}
              disabled={disableMutation.isPending}
              className="save-btn"
              style={{ background: '#f87171' }}
            >
              {disableMutation.isPending ? 'Disabling...' : 'Confirm Disable'}
            </button>
            <button
              onClick={() => { setStep('idle'); setDisablePassword('') }}
              style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === 'regenerating' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Enter your password to generate a fresh set of backup codes. Your old codes will stop working immediately.
          </p>
          <input
            className="profile-input"
            type="password"
            value={regenPassword}
            onChange={(e) => setRegenPassword(e.target.value)}
            placeholder="Password"
            style={{ maxWidth: 240 }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => regenerateMutation.mutate()}
              disabled={regenerateMutation.isPending}
              className="save-btn"
            >
              {regenerateMutation.isPending ? 'Generating...' : 'Generate New Codes'}
            </button>
            <button
              onClick={() => { setStep('idle'); setRegenPassword('') }}
              style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
