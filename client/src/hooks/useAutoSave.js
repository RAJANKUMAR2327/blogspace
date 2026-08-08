import { useEffect, useRef, useState } from 'react'

const AUTOSAVE_KEY_PREFIX = 'blogspace_draft_'

// Saves to localStorage every `delay` ms after the last change, and provides recovery helpers
export function useAutoSave(draftId, data, delay = 3000) {
  const [lastSaved, setLastSaved] = useState(null)
  const timeoutRef = useRef(null)
  const storageKey = `${AUTOSAVE_KEY_PREFIX}${draftId}`

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    // Don't save completely empty drafts
    const hasContent = data?.title?.trim() || data?.content?.trim()
    if (!hasContent) return

    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ data, savedAt: Date.now() }))
        setLastSaved(Date.now())
      } catch { /* localStorage full or unavailable — non-critical */ }
    }, delay)

    return () => clearTimeout(timeoutRef.current)
  }, [data, storageKey, delay])

  const clearDraft = () => {
    localStorage.removeItem(storageKey)
    setLastSaved(null)
  }

  return { lastSaved, clearDraft }
}

// Call this once on mount to check if there's a recoverable draft
export function getRecoverableDraft(draftId) {
  try {
    const stored = localStorage.getItem(`${AUTOSAVE_KEY_PREFIX}${draftId}`)
    if (!stored) return null
    const parsed = JSON.parse(stored)
    // Only offer recovery if saved within the last 7 days
    if (Date.now() - parsed.savedAt > 7 * 24 * 60 * 60 * 1000) return null
    return parsed
  } catch {
    return null
  }
}