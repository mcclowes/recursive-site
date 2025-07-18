/**
 * @jest-environment node
 */

import { POST as SuggestionsPost } from '../app/api/analyze/suggestions/route';
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

describe('AI Creativity Variation', () => {
  beforeEach(() => {
    // Remove API key to test fallback behavior
    delete process.env.OPENAI_API_KEY;
  });

  it('should handle requests without OpenAI API key', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/analyze/suggestions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: 'function fibonacci(n) { return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }',
          language: 'javascript',
        }),
      }
    );

    const response = await SuggestionsPost(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.suggestions).toHaveLength(0);
  });

  it('should validate required parameters', async () => {
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

    const response = await SuggestionsPost(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Code and language are required');
  });

  it('should have implemented randomization logic in the code', () => {
    // Test that the randomization logic exists in the source code
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    
    const suggestionsPath = path.join(__dirname, '../app/api/analyze/suggestions/route.ts');
    const suggestionsContent = fs.readFileSync(suggestionsPath, 'utf8');
    
    // Check for randomization logic
    expect(suggestionsContent).toContain('Math.random()');
    expect(suggestionsContent).toContain('< 0.3');
    expect(suggestionsContent).toContain('creative');
    expect(suggestionsContent).toContain('conservative');
    expect(suggestionsContent).toContain('temperature: isCreative ? 0.7 : 0.1');
  });

  it('should have different prompts for creative vs conservative mode', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    
    const suggestionsPath = path.join(__dirname, '../app/api/analyze/suggestions/route.ts');
    const suggestionsContent = fs.readFileSync(suggestionsPath, 'utf8');
    
    // Check for different prompts
    expect(suggestionsContent).toContain('innovative');
    expect(suggestionsContent).toContain('Unconventional Approaches');
    expect(suggestionsContent).toContain('Immediate Improvements');
    expect(suggestionsContent).toContain('Best Practices');
  });
});