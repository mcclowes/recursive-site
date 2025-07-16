import { render, screen } from '@testing-library/react'
import Home from '../app/page'

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('🚀 AI Code Review Tool')
  })

  it('renders the description', () => {
    render(<Home />)
    
    const description = screen.getByText('Get instant AI-powered code analysis and improvement suggestions')
    expect(description).toBeInTheDocument()
  })

  it('renders the self-analysis link', () => {
    render(<Home />)
    
    const selfAnalysisLink = screen.getByRole('link', { name: '🔄 Analyze This Project' })
    expect(selfAnalysisLink).toBeInTheDocument()
    expect(selfAnalysisLink).toHaveAttribute('href', '/self-analysis')
  })

  it('renders the code editor section', () => {
    render(<Home />)
    
    const codeEditorHeading = screen.getByRole('heading', { name: 'Code Editor' })
    expect(codeEditorHeading).toBeInTheDocument()
    
    const analyzeButton = screen.getByRole('button', { name: '🔍 Analyze Code' })
    expect(analyzeButton).toBeInTheDocument()
  })

  it('renders the features section', () => {
    render(<Home />)
    
    const featuresHeading = screen.getByRole('heading', { name: 'Features' })
    expect(featuresHeading).toBeInTheDocument()
    
    const instantAnalysisFeature = screen.getByText('Instant Analysis')
    const smartSuggestionsFeature = screen.getByText('Smart Suggestions')
    const multipleLanguagesFeature = screen.getByText('Multiple Languages')
    
    expect(instantAnalysisFeature).toBeInTheDocument()
    expect(smartSuggestionsFeature).toBeInTheDocument()
    expect(multipleLanguagesFeature).toBeInTheDocument()
  })

  it('renders the language selector', () => {
    render(<Home />)
    
    const languageSelector = screen.getByRole('combobox')
    expect(languageSelector).toBeInTheDocument()
    
    // Check that JavaScript is the default selected option
    expect(languageSelector).toHaveValue('javascript')
  })
})