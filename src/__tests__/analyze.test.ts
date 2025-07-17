/**
 * @jest-environment node
 */
import { POST } from '../app/api/analyze/route';
import { NextRequest } from 'next/server';

// Mock OpenAI to avoid actual API calls in tests
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    })),
  };
});

// Mock environment variables
process.env.OPENAI_API_KEY = '';

describe('/api/analyze', () => {
  it('analyzes code with rule-based analysis when no OpenAI key', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        code: 'function test() {\n  var x = 5;\n  console.log(x);\n}',
        language: 'javascript',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.analysis).toBeDefined();
    expect(data.analysis.score).toBeDefined();
    expect(data.analysis.suggestions).toBeDefined();
    expect(data.analysis.metrics).toBeDefined();
    expect(data.analysis.metrics.aiAnalysisAvailable).toBe(false);
  });

  it('returns error for missing code', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        language: 'javascript',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Code and language are required');
  });

  it('returns error for missing language', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        code: 'function test() { return 1; }',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Code and language are required');
  });

  it('handles various programming languages', async () => {
    const languages = [
      'javascript',
      'typescript',
      'python',
      'java',
      'cpp',
      'go',
    ];

    for (const language of languages) {
      const mockRequest = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: JSON.stringify({
          code: 'function test() { return 1; }',
          language,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.analysis).toBeDefined();
      expect(data.analysis.score).toBeGreaterThanOrEqual(0);
      expect(data.analysis.score).toBeLessThanOrEqual(100);
    }
  });

  it('provides appropriate suggestions for JavaScript code issues', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        code: 'var x = 5;\nconsole.log(x);',
        language: 'javascript',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.analysis.suggestions).toBeDefined();

    // Should suggest avoiding var and console.log
    const suggestionMessages = data.analysis.suggestions.map(
      (s: { message: string }) => s.message
    );
    expect(suggestionMessages.some((msg: string) => msg.includes('var'))).toBe(
      true
    );
    expect(
      suggestionMessages.some((msg: string) => msg.includes('console.log'))
    ).toBe(true);
  });
});
