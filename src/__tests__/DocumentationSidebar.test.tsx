import { render, screen, waitFor, act } from '@testing-library/react';
import DocumentationSidebar from '@/components/DocumentationSidebar';

// Mock fetch
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock timers
jest.useFakeTimers();

describe('DocumentationSidebar', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  it('renders empty state when no code is selected', () => {
    render(
      <DocumentationSidebar selectedCode="" language="javascript" />
    );

    expect(screen.getByText('Related Documentation')).toBeInTheDocument();
    expect(screen.getByText('Select some code in the editor to see relevant documentation and resources')).toBeInTheDocument();
  });

  it('shows message when selected code is too short', () => {
    render(
      <DocumentationSidebar selectedCode="var x" language="javascript" />
    );

    expect(screen.getByText('Select more code to get better documentation suggestions')).toBeInTheDocument();
  });

  it('fetches and displays documentation for selected code', async () => {
    const mockDocumentation = {
      documentation: [
        {
          id: 'test-1',
          title: 'Async/Await - JavaScript | MDN',
          url: 'https://developer.mozilla.org/docs/async',
          type: 'documentation',
          source: 'MDN',
          relevanceScore: 0.9,
          summary: 'Complete guide to async/await syntax',
          tags: ['async', 'await'],
        },
      ],
      context: {},
      totalFound: 1,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockDocumentation,
    } as Response);

    render(
      <DocumentationSidebar
        selectedCode="async function test() { await fetch(); }"
        language="javascript"
      />
    );

    // Fast-forward the debounce timer
    act(() => {
      jest.runAllTimers();
    });

    // Wait for documentation to load
    await waitFor(() => {
      expect(screen.getByText('Async/Await - JavaScript | MDN')).toBeInTheDocument();
    });

    expect(screen.getByText('MDN')).toBeInTheDocument();
    expect(screen.getByText('90% match')).toBeInTheDocument();
    expect(screen.getByText('Complete guide to async/await syntax')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'));

    render(
      <DocumentationSidebar
        selectedCode="async function test() { await fetch(); }"
        language="javascript"
      />
    );

    // Fast-forward the debounce timer
    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to load documentation')).toBeInTheDocument();
    });
  });

  it('calls API with correct parameters', async () => {
    const selectedCode = 'async function test() { await fetch(); }';
    const language = 'javascript';

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ documentation: [], context: {}, totalFound: 0 }),
    } as Response);

    render(
      <DocumentationSidebar selectedCode={selectedCode} language={language} />
    );

    // Fast-forward the debounce timer
    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/analyze/documentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedCode,
          language,
          context: {},
        }),
      });
    });
  });

  it('shows no documentation found message when API returns empty results', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ documentation: [], context: {}, totalFound: 0 }),
    } as Response);

    render(
      <DocumentationSidebar
        selectedCode="test code here that is long enough"
        language="javascript"
      />
    );

    // Fast-forward the debounce timer
    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(screen.getByText('No relevant documentation found for the selected code')).toBeInTheDocument();
    });
  });
});