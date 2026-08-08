// Returns a reCAPTCHA v3 token for the given action, or null if reCAPTCHA
// isn't configured (no site key) or hasn't loaded yet. The backend's
// verifyRecaptcha middleware treats a missing token as "not configured yet"
// and skips verification, so this fails safe either way.
export function getRecaptchaToken(action = 'submit') {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY

  if (!siteKey || typeof window.grecaptcha === 'undefined') {
    return Promise.resolve(null)
  }

  return new Promise((resolve) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(siteKey, { action })
        .then(resolve)
        .catch(() => resolve(null))
    })
  })
}
