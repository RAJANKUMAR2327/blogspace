import { describe, it, expect } from 'vitest'
import { extractHeadings } from '../components/blog/TableOfContents'

describe('TableOfContents heading extraction', () => {
  it('extracts headings with the exact ID scheme ContentRenderer.jsx uses', () => {
    const content = '# First Heading\n\nSome text.\n\n## Second Heading\n\nMore text.'
    const headings = extractHeadings(content)

    expect(headings).toHaveLength(2)
    expect(headings[0]).toEqual({ id: 'heading-0-first-heading', text: 'First Heading', level: 1 })
    expect(headings[1]).toEqual({ id: 'heading-1-second-heading', text: 'Second Heading', level: 2 })
  })

  it('does not count headings inside code blocks (matches ContentRenderer.jsx behavior)', () => {
    const content = '# Real Heading\n\n```\n# This is a comment, not a heading\n```\n\n## Another Real One'
    const headings = extractHeadings(content)

    expect(headings).toHaveLength(2)
    expect(headings.map(h => h.text)).toEqual(['Real Heading', 'Another Real One'])
  })

  it('the counter increments across all heading levels together, not per-level', () => {
    // This matters because ContentRenderer.jsx's own counter is a single
    // running index too — if TableOfContents diverged to a per-level
    // counter, generated IDs would stop matching and jump links would break.
    const content = '# H1\n## H2\n### H3\n## Another H2'
    const headings = extractHeadings(content)

    expect(headings.map(h => h.id)).toEqual([
      'heading-0-h1',
      'heading-1-h2',
      'heading-2-h3',
      'heading-3-another-h2'
    ])
  })

  it('returns an empty array for content with no headings', () => {
    expect(extractHeadings('Just a plain paragraph, no headings here.')).toEqual([])
  })

  it('handles empty/null content without throwing', () => {
    expect(extractHeadings('')).toEqual([])
    expect(extractHeadings(null)).toEqual([])
    expect(extractHeadings(undefined)).toEqual([])
  })
})
