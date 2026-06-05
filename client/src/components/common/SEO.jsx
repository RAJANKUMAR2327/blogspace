import { useEffect } from 'react'

export default function SEO({ title, description, image, url }) {
  const siteTitle = title ? `${title} | BlogSpace` : 'BlogSpace — Ideas Worth Reading'
  const siteDesc  = description || 'Discover stories, thinking, and expertise from writers on any topic that matters to you.'
  const siteImage = image || 'https://placehold.co/1200x630/9333ea/ffffff?text=BlogSpace'
  const siteURL   = url || window.location.href

  useEffect(() => {
    document.title = siteTitle
    setMeta('description', siteDesc)
    setMeta('og:title',       siteTitle,  true)
    setMeta('og:description', siteDesc,   true)
    setMeta('og:image',       siteImage,  true)
    setMeta('og:url',         siteURL,    true)
    setMeta('og:type',        'website',  true)
    setMeta('twitter:card',        'summary_large_image', true)
    setMeta('twitter:title',       siteTitle,             true)
    setMeta('twitter:description', siteDesc,              true)
    setMeta('twitter:image',       siteImage,             true)
  }, [siteTitle, siteDesc, siteImage, siteURL])

  return null
}

function setMeta(name, content, isProperty = false) {
  const attr     = isProperty ? 'property' : 'name'
  let   existing = document.querySelector(`meta[${attr}="${name}"]`)
  if (!existing) {
    existing = document.createElement('meta')
    existing.setAttribute(attr, name)
    document.head.appendChild(existing)
  }
  existing.setAttribute('content', content)
}