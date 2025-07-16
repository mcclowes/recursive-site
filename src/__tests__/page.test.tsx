import { render, screen } from '@testing-library/react'
import Home from '../app/page'

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('🤖 Recursive Site')
  })

  it('renders the welcome message', () => {
    render(<Home />)
    
    const welcomeHeading = screen.getByRole('heading', { level: 2 })
    expect(welcomeHeading).toBeInTheDocument()
    expect(welcomeHeading).toHaveTextContent('Welcome to Your AI-Enhanced Site')
  })

  it('renders the description', () => {
    render(<Home />)
    
    const description = screen.getByText('A NextJS web application with AI-powered improvement suggestions')
    expect(description).toBeInTheDocument()
  })

  it('renders the feature cards', () => {
    render(<Home />)
    
    const modernStackCard = screen.getByText('🚀 Modern Stack')
    const aiPoweredCard = screen.getByText('🤖 AI-Powered')
    
    expect(modernStackCard).toBeInTheDocument()
    expect(aiPoweredCard).toBeInTheDocument()
  })

  it('renders the documentation links', () => {
    render(<Home />)
    
    const nextjsLink = screen.getByRole('link', { name: 'Next.js Docs' })
    const tailwindLink = screen.getByRole('link', { name: 'Tailwind CSS' })
    const typescriptLink = screen.getByRole('link', { name: 'TypeScript' })
    
    expect(nextjsLink).toBeInTheDocument()
    expect(nextjsLink).toHaveAttribute('href', 'https://nextjs.org/docs')
    expect(tailwindLink).toBeInTheDocument()
    expect(tailwindLink).toHaveAttribute('href', 'https://tailwindcss.com/docs')
    expect(typescriptLink).toBeInTheDocument()
    expect(typescriptLink).toHaveAttribute('href', 'https://www.typescriptlang.org/docs')
  })
})