import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'BlogSpace'
const SITE_URL  = 'https://blogspace-2f5r.vercel.app' // ⚠️ update to your actual live domain
const DEFAULT_IMAGE = 'https://placehold.co/1200x630/7c3aed/ffffff?text=BlogSpace'
const DEFAULT_DESC  = 'Discover stories, thinking, and expertise from writers on any topic that matters to you.'

export default function SEO({
  title,
  description = DEFAULT_DESC,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  article = null, // { author, publishedTime, modifiedTime, tags, category }
  noIndex = false
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Ideas Worth Reading`
  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href.split('?')[0] : SITE_URL)

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type"        content={type} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image"       content={image} />
      <meta property="og:url"         content={canonicalUrl} />
      <meta property="og:site_name"   content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={image} />

      {/* Article-specific Open Graph */}
      {article && (
        <>
          {article.author && <meta property="article:author" content={article.author} />}
          {article.publishedTime && <meta property="article:published_time" content={article.publishedTime} />}
          {article.modifiedTime && <meta property="article:modified_time" content={article.modifiedTime} />}
          {article.category && <meta property="article:section" content={article.category} />}
          {article.tags?.map(tag => (
            <meta property="article:tag" content={tag} key={tag} />
          ))}
        </>
      )}

      {/* Structured Data — JSON-LD */}
      {article && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: title,
            description,
            image,
            datePublished: article.publishedTime,
            dateModified: article.modifiedTime || article.publishedTime,
            author: { '@type': 'Person', name: article.author },
            publisher: {
              '@type': 'Organization',
              name: SITE_NAME,
              logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` }
            },
            mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl }
          })}
        </script>
      )}
    </Helmet>
  )
}