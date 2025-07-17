/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react';
import EnhancedCodeEditor from '@/components/EnhancedCodeEditor';

// Mock Monaco Editor
jest.mock('@monaco-editor/react', () => ({
  Editor: ({
    onChange,
    value,
  }: {
    onChange: (value: string) => void;
    value: string;
  }) => {
    return (
      <div data-testid='monaco-editor'>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          data-testid='editor-textarea'
        />
      </div>
    );
  },
}));

// Mock fetch
global.fetch = jest.fn();

// Mock toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('EnhancedCodeEditor', () => {
  const mockOnChange = jest.fn();
  const mockOnSuggestionsChange = jest.fn();

  const defaultProps = {
    value: 'function test() { return "hello"; }',
    onChange: mockOnChange,
    language: 'javascript',
    height: '400px',
    enableRealTimeAnalysis: true,
    onSuggestionsChange: mockOnSuggestionsChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        suggestions: [
          {
            id: 'test-1',
            type: 'suggestion',
            message: 'Test suggestion',
            explanation: 'Test explanation',
            line: 1,
            column: 1,
            category: 'best-practices',
            confidence: 0.8,
            severity: 'info',
            isInline: true,
            actionable: true,
            quickFix: null,
          },
        ],
      }),
    });
  });

  it('renders Monaco Editor with correct props', () => {
    render(<EnhancedCodeEditor {...defaultProps} />);

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    expect(screen.getByTestId('editor-textarea')).toHaveValue(
      defaultProps.value
    );
  });

  it('shows real-time analysis indicator when enabled', () => {
    render(<EnhancedCodeEditor {...defaultProps} />);
    expect(screen.getByText('Live Analysis')).toBeInTheDocument();
  });

  it('hides real-time analysis indicator when disabled', () => {
    render(
      <EnhancedCodeEditor {...defaultProps} enableRealTimeAnalysis={false} />
    );
    expect(screen.queryByText('Live Analysis')).not.toBeInTheDocument();
  });

  it('calls onChange when textarea value changes', () => {
    render(<EnhancedCodeEditor {...defaultProps} />);

    const textarea = screen.getByTestId('editor-textarea');
    fireEvent.change(textarea, { target: { value: 'function newTest() {}' } });

    expect(mockOnChange).toHaveBeenCalledWith('function newTest() {}');
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<EnhancedCodeEditor {...defaultProps} />);

    // Component should still render without crashing
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  it('handles API response errors gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Server error' }),
    });

    render(<EnhancedCodeEditor {...defaultProps} />);

    // Component should still render without crashing
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });
});
