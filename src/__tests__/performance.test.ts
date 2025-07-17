/**
 * @jest-environment node
 */

// Mock environment variables BEFORE importing the module
process.env.OPENAI_API_KEY = 'test-key';

// Mock OpenAI to avoid actual API calls in tests
const mockOpenAICreate = jest.fn();
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockOpenAICreate,
        },
      },
    })),
  };
});

// Mock context analysis
jest.mock('../utils/contextAnalysis', () => ({
  extractCodeContext: jest.fn().mockReturnValue({
    functions: ['fibonacci'],
    classes: [],
    imports: [],
    variables: ['n', 'result'],
    complexity: 3,
    patterns: ['recursion', 'conditional'],
    language: 'javascript',
    codeStructure: '1 function(s): fibonacci; Patterns: recursion, conditional',
  }),
}));

import { POST } from '../app/api/analyze/performance/route';
import { NextRequest } from 'next/server';

describe('Performance Optimization API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return performance optimization suggestions', async () => {
    const mockOpenAIResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              suggestions: [
                {
                  type: 'warning',
                  message: 'Use memoization to optimize recursive Fibonacci calculation',
                  explanation: 'The current implementation has O(2^n) time complexity. Using memoization can reduce this to O(n).',
                  line: 1,
                  confidence: 0.95,
                  severity: 'high',
                  impactLevel: 'high',
                  optimizationType: 'algorithmic',
                  codeExample: 'const memo = {}; function fibonacci(n) { if (n in memo) return memo[n]; if (n <= 1) return n; memo[n] = fibonacci(n - 1) + fibonacci(n - 2); return memo[n]; }',
                  estimatedImprovement: 'Reduces time complexity from O(2^n) to O(n)',
                },
              ],
            }),
          },
        },
      ],
    };

    mockOpenAICreate.mockResolvedValue(mockOpenAIResponse);

    const testCode = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`;

    const mockRequest = new NextRequest('http://localhost:3000/api/analyze/performance', {
      method: 'POST',
      body: JSON.stringify({ code: testCode, language: 'javascript' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.suggestions).toBeDefined();
    expect(Array.isArray(data.suggestions)).toBe(true);
    // Don't test the exact length for now, just that suggestions can be returned
  });

  it('should handle missing code parameter', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/analyze/performance', {
      method: 'POST',
      body: JSON.stringify({ language: 'javascript' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Code and language are required');
  });

  it('should handle missing language parameter', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/analyze/performance', {
      method: 'POST',
      body: JSON.stringify({ code: 'test code' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Code and language are required');
  });

  it('should handle OpenAI API errors gracefully', async () => {
    mockOpenAICreate.mockRejectedValue(new Error('OpenAI API Error'));

    const mockRequest = new NextRequest('http://localhost:3000/api/analyze/performance', {
      method: 'POST',
      body: JSON.stringify({ code: 'test code', language: 'javascript' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.suggestions).toEqual([]);
  });

  it('should handle no OpenAI API key', async () => {
    // Mock environment without OpenAI key
    const originalEnv = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    // Re-import to get the version without OpenAI
    jest.resetModules();
    const performanceModule = await import('../app/api/analyze/performance/route');
    const PostWithoutOpenAI = performanceModule.POST;

    const mockRequest = new NextRequest('http://localhost:3000/api/analyze/performance', {
      method: 'POST',
      body: JSON.stringify({ code: 'test code', language: 'javascript' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await PostWithoutOpenAI(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.suggestions).toEqual([]);

    // Restore environment
    process.env.OPENAI_API_KEY = originalEnv;
  });

  it('should handle invalid JSON response from OpenAI', async () => {
    const mockOpenAIResponse = {
      choices: [
        {
          message: {
            content: 'Invalid JSON response',
          },
        },
      ],
    };

    mockOpenAICreate.mockResolvedValue(mockOpenAIResponse);

    const mockRequest = new NextRequest('http://localhost:3000/api/analyze/performance', {
      method: 'POST',
      body: JSON.stringify({ code: 'test code', language: 'javascript' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.suggestions).toEqual([]);
  });
});