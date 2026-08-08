import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Breadcrumbs from '../components/common/Breadcrumbs'

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('Breadcrumbs', () => {
  it('renders each item label', () => {
    renderWithRouter(
      <Breadcrumbs items={[{ label: 'Stories', to: '/blogs' }, { label: 'My Article' }]} />
    )
    expect(screen.getByText('Stories')).toBeInTheDocument()
    expect(screen.getByText('My Article')).toBeInTheDocument()
  })

  it('marks the last item as the current page (aria-current) and does not link it', () => {
    renderWithRouter(
      <Breadcrumbs items={[{ label: 'Stories', to: '/blogs' }, { label: 'Current Article' }]} />
    )
    const current = screen.getByText('Current Article')
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(current.tagName).not.toBe('A')
  })

  it('renders non-last items as real links', () => {
    renderWithRouter(
      <Breadcrumbs items={[{ label: 'Stories', to: '/blogs' }, { label: 'Current' }]} />
    )
    const link = screen.getByText('Stories')
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/blogs')
  })

  it('has a nav landmark with an accessible label', () => {
    renderWithRouter(<Breadcrumbs items={[{ label: 'Only Item' }]} />)
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
  })
})
