import { render, screen, fireEvent } from '@testing-library/react'
import SimpleCodeEditor from '../components/SimpleCodeEditor'

describe('SimpleCodeEditor', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('renders the textarea', () => {
    render(
      <SimpleCodeEditor
        value=""
        onChange={mockOnChange}
        language="javascript"
      />
    )
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
  })

  it('displays the correct placeholder text', () => {
    render(
      <SimpleCodeEditor
        value=""
        onChange={mockOnChange}
        language="python"
      />
    )
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('placeholder', 'Enter your python code here...')
  })

  it('displays the language indicator', () => {
    render(
      <SimpleCodeEditor
        value=""
        onChange={mockOnChange}
        language="typescript"
      />
    )
    
    const languageIndicator = screen.getByText('typescript')
    expect(languageIndicator).toBeInTheDocument()
  })

  it('displays the provided value', () => {
    const testCode = 'console.log("Hello, World!");'
    render(
      <SimpleCodeEditor
        value={testCode}
        onChange={mockOnChange}
        language="javascript"
      />
    )
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue(testCode)
  })

  it('calls onChange when textarea value changes', () => {
    render(
      <SimpleCodeEditor
        value=""
        onChange={mockOnChange}
        language="javascript"
      />
    )
    
    const textarea = screen.getByRole('textbox')
    const newValue = 'const x = 10;'
    
    fireEvent.change(textarea, { target: { value: newValue } })
    
    expect(mockOnChange).toHaveBeenCalledWith(newValue)
  })

  it('applies custom height when provided', () => {
    render(
      <SimpleCodeEditor
        value=""
        onChange={mockOnChange}
        language="javascript"
        height="200px"
      />
    )
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveStyle({ height: '200px' })
  })

  it('applies default height when not provided', () => {
    render(
      <SimpleCodeEditor
        value=""
        onChange={mockOnChange}
        language="javascript"
      />
    )
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveStyle({ height: '400px' })
  })

  it('has the correct CSS classes for styling', () => {
    render(
      <SimpleCodeEditor
        value=""
        onChange={mockOnChange}
        language="javascript"
      />
    )
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass(
      'w-full',
      'h-96',
      'p-4',
      'font-mono',
      'text-sm',
      'bg-gray-900',
      'text-green-400',
      'resize-none',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-blue-500'
    )
  })
})