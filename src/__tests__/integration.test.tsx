import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../app/page';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => <div data-testid='toaster' />,
}));

describe('Home Page Integration', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('successfully analyzes code when API call succeeds', async () => {
    const mockAnalysis = {
      score: 92,
      suggestions: [
        {
          type: 'success',
          message: 'Great use of modern variable declarations!',
          line: 1,
        },
      ],
      metrics: {
        lines: 2,
        characters: 25,
        complexity: 1,
        maintainability: 'High',
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ analysis: mockAnalysis }),
    });

    render(<Home />);

    // Change the code
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'const x = 10;' } });

    // Click analyze button
    const analyzeButton = screen.getByRole('button', { name: /analyze code/i });
    fireEvent.click(analyzeButton);

    // Wait for API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: 'const x = 10;', language: 'javascript' }),
      });
    });

    // Check that analysis results are displayed
    await waitFor(() => {
      expect(screen.getByText('92%')).toBeInTheDocument();
      expect(screen.getByText('Code Quality Score')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // lines
      expect(screen.getByText('1')).toBeInTheDocument(); // complexity
      expect(screen.getByText('25')).toBeInTheDocument(); // characters
      expect(screen.getByText('High')).toBeInTheDocument(); // maintainability
    });
  });

  it('shows loading state during analysis', async () => {
    mockFetch.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  analysis: {
                    score: 85,
                    suggestions: [],
                    metrics: {
                      lines: 1,
                      characters: 10,
                      complexity: 1,
                      maintainability: 'High',
                    },
                  },
                }),
              }),
            100
          );
        })
    );

    render(<Home />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'test' } });

    const analyzeButton = screen.getByRole('button', { name: /analyze code/i });
    fireEvent.click(analyzeButton);

    // Check loading state
    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    expect(analyzeButton).toBeDisabled();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Analyzing...')).not.toBeInTheDocument();
      expect(analyzeButton).not.toBeDisabled();
    });
  });

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'));

    render(<Home />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'test' } });

    const analyzeButton = screen.getByRole('button', { name: /analyze code/i });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Should not crash and should show error toast
    expect(
      screen.getByText(
        'Enter your code and click "Analyze Code" to get started'
      )
    ).toBeInTheDocument();
  });

  it('handles API response errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<Home />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'test' } });

    const analyzeButton = screen.getByRole('button', { name: /analyze code/i });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Should not crash and should show error toast
    expect(
      screen.getByText(
        'Enter your code and click "Analyze Code" to get started'
      )
    ).toBeInTheDocument();
  });

  it('prevents analysis when code is empty', async () => {
    render(<Home />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '' } });

    const analyzeButton = screen.getByRole('button', { name: /analyze code/i });
    fireEvent.click(analyzeButton);

    // Should not make API call
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('prevents analysis when code is only whitespace', async () => {
    render(<Home />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '   \n\n   ' } });

    const analyzeButton = screen.getByRole('button', { name: /analyze code/i });
    fireEvent.click(analyzeButton);

    // Should not make API call
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('displays suggestions with correct styling', async () => {
    const mockAnalysis = {
      score: 80,
      suggestions: [
        {
          type: 'warning',
          message: 'Consider using "let" or "const" instead of "var"',
          line: 1,
        },
        {
          type: 'info',
          message: 'Remove console.log statements before production',
          line: 2,
        },
        {
          type: 'suggestion',
          message: 'Consider breaking down large functions',
          line: 3,
        },
        {
          type: 'success',
          message: 'Great use of modern syntax!',
          line: 4,
        },
      ],
      metrics: {
        lines: 4,
        characters: 100,
        complexity: 2,
        maintainability: 'High',
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ analysis: mockAnalysis }),
    });

    render(<Home />);

    // Basic editor should be default now
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, {
      target: { value: 'var x = 10;\nconsole.log(x);' },
    });

    const analyzeButton = screen.getByRole('button', { name: /analyze code/i });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByText('Suggestions (4)')).toBeInTheDocument();
      expect(screen.getByText('Line 1')).toBeInTheDocument();
      expect(screen.getByText('Line 2')).toBeInTheDocument();
      expect(screen.getByText('Line 3')).toBeInTheDocument();
      expect(screen.getByText('Line 4')).toBeInTheDocument();
    });
  });
});
