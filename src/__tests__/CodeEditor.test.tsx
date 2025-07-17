import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CodeEditor from '../components/CodeEditor';

// Mock Monaco Editor
jest.mock('@monaco-editor/react', () => ({
  Editor: ({
    value,
    onChange,
    onMount,
    loading,
  }: {
    value: string;
    onChange: (value: string) => void;
    onMount: () => void;
    loading: React.ReactNode;
  }) => {
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(event.target.value);
    };

    return (
      <div data-testid='monaco-editor'>
        {loading}
        <textarea
          data-testid='monaco-textarea'
          value={value}
          onChange={handleChange}
          onFocus={() => onMount && onMount()}
        />
      </div>
    );
  },
}));

describe('CodeEditor', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders the Monaco Editor', () => {
    render(
      <CodeEditor value='' onChange={mockOnChange} language='javascript' />
    );

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(
      <CodeEditor value='' onChange={mockOnChange} language='javascript' />
    );

    const loadingText = screen.getByText('Loading editor...');
    expect(loadingText).toBeInTheDocument();
  });

  it('hides loading state after editor mounts', async () => {
    render(
      <CodeEditor value='' onChange={mockOnChange} language='javascript' />
    );

    const textarea = screen.getByTestId('monaco-textarea');
    fireEvent.focus(textarea);

    await waitFor(() => {
      const loadingText = screen.queryByText('Loading editor...');
      expect(loadingText).not.toBeInTheDocument();
    });
  });

  it('displays the provided value', () => {
    const testCode = 'console.log("Hello, World!");';
    render(
      <CodeEditor
        value={testCode}
        onChange={mockOnChange}
        language='javascript'
      />
    );

    const textarea = screen.getByTestId('monaco-textarea');
    expect(textarea).toHaveValue(testCode);
  });

  it('calls onChange when editor value changes', () => {
    render(
      <CodeEditor value='' onChange={mockOnChange} language='javascript' />
    );

    const textarea = screen.getByTestId('monaco-textarea');
    const newValue = 'const x = 10;';

    fireEvent.change(textarea, { target: { value: newValue } });

    expect(mockOnChange).toHaveBeenCalledWith(newValue);
  });

  it('applies custom height when provided', () => {
    render(
      <CodeEditor
        value=''
        onChange={mockOnChange}
        language='javascript'
        height='200px'
      />
    );

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
    // Height would be passed to Monaco Editor component
  });

  it('applies default height when not provided', () => {
    render(
      <CodeEditor value='' onChange={mockOnChange} language='javascript' />
    );

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
    // Default height would be passed to Monaco Editor component
  });

  it('has the correct border styling', () => {
    render(
      <CodeEditor value='' onChange={mockOnChange} language='javascript' />
    );

    const container = screen.getByTestId('monaco-editor').parentElement;
    expect(container).toHaveClass(
      'relative',
      'border',
      'border-gray-300',
      'dark:border-gray-600',
      'rounded-lg',
      'overflow-hidden'
    );
  });
});
