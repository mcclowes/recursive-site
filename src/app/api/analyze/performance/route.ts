import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { extractCodeContext } from '@/utils/contextAnalysis';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    const { code, language } = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    // Get performance optimization suggestions
    const performanceSuggestions = await getPerformanceOptimizations(
      code,
      language
    );

    return NextResponse.json({ suggestions: performanceSuggestions });
  } catch (error) {
    console.error('Error getting performance suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to get performance suggestions' },
      { status: 500 }
    );
  }
}

async function getPerformanceOptimizations(
  code: string,
  language: string
): Promise<PerformanceOptimization[]> {
  if (!openai) {
    return [];
  }

  try {
    // Extract context from the code
    const context = extractCodeContext(code, language);

    // Create performance-focused prompt
    const performancePrompt = createPerformancePrompt(code, language, context);

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert performance optimization specialist with deep knowledge of algorithmic complexity, memory usage, and language-specific performance patterns. Provide detailed, actionable performance improvement suggestions that focus on measurable optimizations.',
        },
        {
          role: 'user',
          content: performancePrompt,
        },
      ],
      max_tokens: 1200,
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return [];
    }

    // Parse AI response
    const aiResult = JSON.parse(content);

    // Transform suggestions to include performance-specific information
    const suggestions = (aiResult.suggestions || []).map(
      (
        suggestion: {
          type?: string;
          message: string;
          explanation?: string;
          line?: number;
          category?: string;
          confidence?: number;
          severity?: string;
          impactLevel?: string;
          optimizationType?: string;
          codeExample?: string;
          estimatedImprovement?: string;
        },
        index: number
      ) => ({
        id: `performance-${Date.now()}-${index}`,
        type: suggestion.type || 'suggestion',
        message: suggestion.message,
        explanation: suggestion.explanation || suggestion.message,
        line: suggestion.line || 1,
        category: 'performance',
        confidence: suggestion.confidence || 0.8,
        severity: suggestion.severity || 'info',
        impactLevel: suggestion.impactLevel || 'medium',
        optimizationType: suggestion.optimizationType || 'general',
        codeExample: suggestion.codeExample || null,
        estimatedImprovement: suggestion.estimatedImprovement || null,
      })
    );

    return suggestions;
  } catch (error) {
    console.error('Performance optimization error:', error);
    return [];
  }
}

function createPerformancePrompt(
  code: string,
  language: string,
  context: {
    functions: string[];
    classes: string[];
    imports: string[];
    variables: string[];
    complexity: number;
    patterns: string[];
    language: string;
    codeStructure: string;
  }
): string {
  const contextInfo = context.codeStructure
    ? `Code Structure: ${context.codeStructure}`
    : '';
  const patterns =
    context.patterns.length > 0
      ? `Detected Patterns: ${context.patterns.join(', ')}`
      : '';
  const complexity = `Complexity Score: ${context.complexity}`;

  return `Analyze this ${language} code specifically for performance optimization opportunities.

Context:
${contextInfo}
${patterns}
${complexity}

Focus on identifying and providing solutions for:
1. **Algorithmic Complexity** - Identify O(n²) or higher complexity operations that can be optimized
2. **Memory Usage** - Unnecessary object creation, memory leaks, or inefficient data structures
3. **Language-Specific Optimizations** - Leverage ${language}-specific performance patterns
4. **Data Structure Efficiency** - Suggest better data structures for specific use cases
5. **Execution Performance** - Reduce function calls, optimize loops, minimize DOM manipulations
6. **Caching Opportunities** - Identify values that can be cached or memoized
7. **Async/Concurrency** - Improve async handling and parallel processing where applicable

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Provide 3-7 most impactful performance optimization suggestions in JSON format:
{
  "suggestions": [
    {
      "type": "suggestion|warning|info",
      "message": "Brief description of the performance optimization",
      "explanation": "Detailed explanation of the performance issue and why the optimization helps",
      "line": <line number>,
      "category": "performance",
      "confidence": <0-1>,
      "severity": "high|medium|low",
      "impactLevel": "high|medium|low",
      "optimizationType": "algorithmic|memory|caching|async|data-structure|language-specific",
      "codeExample": "example of optimized code" or null,
      "estimatedImprovement": "description of expected performance gain" or null
    }
  ]
}

Focus on optimizations that provide measurable performance improvements and are practical to implement.`;
}

interface PerformanceOptimization {
  id: string;
  type: string;
  message: string;
  explanation: string;
  line: number;
  category: string;
  confidence: number;
  severity: string;
  impactLevel: string;
  optimizationType: string;
  codeExample: string | null;
  estimatedImprovement: string | null;
}