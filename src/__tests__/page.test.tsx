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

  it('renders the code editor section', () => {
    render(<Home />)
    
    const codeEditorHeading = screen.getByText('Code Editor')
    expect(codeEditorHeading).toBeInTheDocument()
  })

  it('renders the analysis results section', () => {
    render(<Home />)
    
    const analysisResultsHeading = screen.getByText('Analysis Results')
    expect(analysisResultsHeading).toBeInTheDocument()
  })

  it('renders the feature cards', () => {
    render(<Home />)
    
    const instantAnalysisCard = screen.getByText('Instant Analysis')
    const smartSuggestionsCard = screen.getByText('Smart Suggestions')
    const multipleLanguagesCard = screen.getByText('Multiple Languages')
    
    expect(instantAnalysisCard).toBeInTheDocument()
    expect(smartSuggestionsCard).toBeInTheDocument()
    expect(multipleLanguagesCard).toBeInTheDocument()
  })

  it('renders the analyze button', () => {
    render(<Home />)
    
    const analyzeButton = screen.getByRole('button', { name: /analyze code/i })
    expect(analyzeButton).toBeInTheDocument()
  })
})