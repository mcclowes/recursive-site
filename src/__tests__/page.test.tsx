import { render, screen, fireEvent } from '@testing-library/react'
import Home from '../app/page'

// Mock fetch for API calls
global.fetch = jest.fn()

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

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
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
  })

  it('renders the analysis results section', () => {
    render(<Home />)
    
    const analysisHeading = screen.getByText('Analysis Results')
    expect(analysisHeading).toBeInTheDocument()
    
    const placeholderText = screen.getByText('Enter your code and click "Analyze Code" to get started')
    expect(placeholderText).toBeInTheDocument()
  })

  it('renders the language selector', () => {
    render(<Home />)
    
    const languageSelect = screen.getByRole('combobox')
    expect(languageSelect).toBeInTheDocument()
    expect(languageSelect).toHaveValue('javascript')
  })

  it('renders the analyze button', () => {
    render(<Home />)
    
    const analyzeButton = screen.getByRole('button', { name: /analyze code/i })
    expect(analyzeButton).toBeInTheDocument()
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

  it('updates code when textarea changes', () => {
    render(<Home />)
    
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'console.log("test");' } })
    
    expect(textarea).toHaveValue('console.log("test");')
  })

  it('updates language when select changes', () => {
    render(<Home />)
    
    const languageSelect = screen.getByRole('combobox')
    fireEvent.change(languageSelect, { target: { value: 'typescript' } })
    
    expect(languageSelect).toHaveValue('typescript')
  })
})