import { render, screen } from '@testing-library/react'
import Home from '../app/page'

describe('AI Code Review Tool', () => {
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
    
    const codeEditorHeading = screen.getByRole('heading', { name: 'Code Editor' })
    expect(codeEditorHeading).toBeInTheDocument()
    
    const analyzeButton = screen.getByRole('button', { name: /Analyze Code/ })
    expect(analyzeButton).toBeInTheDocument()
  })

  it('renders the analysis results section', () => {
    render(<Home />)
    
    const resultsHeading = screen.getByRole('heading', { name: 'Analysis Results' })
    expect(resultsHeading).toBeInTheDocument()
    
    const placeholder = screen.getByText('Enter your code and click "Analyze Code" to get started')
    expect(placeholder).toBeInTheDocument()
  })

  it('renders the feature cards', () => {
    render(<Home />)
    
    const instantAnalysis = screen.getByText('Instant Analysis')
    const aiPoweredSuggestions = screen.getByText('AI-Powered Suggestions')
    const multipleLanguages = screen.getByText('Multiple Languages')
    
    expect(instantAnalysis).toBeInTheDocument()
    expect(aiPoweredSuggestions).toBeInTheDocument()
    expect(multipleLanguages).toBeInTheDocument()
  })

  it('renders the analysis type indicators', () => {
    render(<Home />)
    
    const ruleBasedIndicator = screen.getByText('Rule-based Analysis')
    const aiEnhancedIndicator = screen.getByText('AI-Enhanced Analysis')
    
    expect(ruleBasedIndicator).toBeInTheDocument()
    expect(aiEnhancedIndicator).toBeInTheDocument()
  })

  it('renders the language selector', () => {
    render(<Home />)
    
    const languageSelector = screen.getByRole('combobox')
    expect(languageSelector).toBeInTheDocument()
    
    const javascriptOption = screen.getByRole('option', { name: 'JavaScript' })
    expect(javascriptOption).toBeInTheDocument()
  })
})