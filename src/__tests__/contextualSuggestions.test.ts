/**
 * @jest-environment node
 */

import { POST } from '../app/api/analyze/suggestions/route';
import { NextRequest } from 'next/server';

// Mock Request and Headers for Node.js environment
global.Request = class MockRequest {
  constructor(
    public url: string,
    public init?: { body?: string }
  ) {}
  json() {
    return Promise.resolve(this.init?.body ? JSON.parse(this.init.body) : {});
  }
} as unknown as typeof Request;

global.Headers = class MockHeaders {
  private headers: Record<string, string> = {};
  set(key: string, value: string) {
    this.headers[key] = value;
  }
  get(key: string) {
    return this.headers[key];
  }
} as unknown as typeof Headers;

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    suggestions: [
                      {
                        type: 'suggestion',
                        message:
                          'Consider using const instead of let for immutable variables',
                        explanation:
                          'Using const helps prevent accidental reassignment',
                        line: 1,
                        column: 1,
                        category: 'best-practices',
                        confidence: 0.9,
                        severity: 'info',
                        actionable: true,
                        quickFix: 'const result = fibonacci(10);',
                      },
                    ],
                  }),
                },
              },
            ],
          }),
        },
      },
    })),
  };
});

// Mock contextAnalysis
jest.mock('../utils/contextAnalysis', () => ({
  extractCodeContext: jest.fn().mockReturnValue({
    functions: ['fibonacci'],
    classes: [],
    imports: [],
    variables: ['result'],
    complexity: 5,
    patterns: ['recursion'],
    language: 'javascript',
    codeStructure: '1 function(s): fibonacci; Patterns: recursion',
  }),
}));

describe('/api/analyze/suggestions', () => {
  beforeEach(() => {
    // Set up environment variables
    process.env.OPENAI_API_KEY = 'test-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.OPENAI_API_KEY;
  });

  it('should handle missing parameters', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/analyze/suggestions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: 'let result = fibonacci(10);',
          // missing language
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Code and language are required');
  });

  it('should handle empty code', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/analyze/suggestions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: '',
          language: 'javascript',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Code and language are required');
  });

  it('should handle OpenAI API not available', async () => {
    delete process.env.OPENAI_API_KEY;

    const request = new NextRequest(
      'http://localhost:3000/api/analyze/suggestions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: 'let result = fibonacci(10);',
          language: 'javascript',
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.suggestions).toHaveLength(0);
  });
});
