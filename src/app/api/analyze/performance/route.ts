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

    // Randomly determine creativity level (70% conservative, 30% creative)
    const isCreative = Math.random() < 0.3;
    const creativity = isCreative ? 'creative' : 'conservative';

    // Create performance-focused prompt
    const performancePrompt = createPerformancePrompt(code, language, context, creativity);

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: isCreative
            ? 'You are an innovative performance optimization expert who thinks outside the box. Suggest creative optimization techniques, advanced algorithms, unconventional approaches, and cutting-edge performance patterns. Push the boundaries of what\'s possible while maintaining code clarity.'
            : 'You are an expert performance optimization specialist with deep knowledge of algorithmic complexity, memory usage, and language-specific performance patterns. Provide detailed, actionable performance improvement suggestions that focus on measurable optimizations.',
        },
        {
          role: 'user',
          content: performancePrompt,
        },
      ],
      max_tokens: 1200,
      temperature: isCreative ? 0.7 : 0.1,
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
  },
  creativity: 'conservative' | 'creative' = 'conservative'
): string {
  const contextInfo = context.codeStructure
    ? `Code Structure: ${context.codeStructure}`
    : '';
  const patterns =
    context.patterns.length > 0
      ? `Detected Patterns: ${context.patterns.join(', ')}`
      : '';
  const complexity = `Complexity Score: ${context.complexity}`;

  const basePrompt = `Analyze this ${language} code specifically for performance optimization opportunities.

Context:
${contextInfo}
${patterns}
${complexity}

Code to analyze:
\`\`\`${language}
${code}
\`\`\``;

  if (creativity === 'creative') {
    return `${basePrompt}

Focus on innovative and creative performance optimization opportunities:
1. **Advanced Algorithms** - Suggest sophisticated algorithmic approaches, novel data structures, or mathematical optimizations
2. **Creative Caching** - Innovative memoization techniques, result caching strategies, or computation sharing approaches
3. **Parallel Processing** - Creative use of concurrency, web workers, or distributed processing patterns
4. **Unconventional Optimizations** - Think outside the box for unique performance improvements
5. **Modern Techniques** - Cutting-edge ${language} features, experimental APIs, or advanced optimization patterns
6. **Creative Architecture** - Suggest innovative architectural patterns that improve performance

Provide 2-4 creative performance optimization suggestions in JSON format:
{
  "suggestions": [
    {
      "type": "suggestion|warning|info",
      "message": "Creative performance optimization approach",
      "explanation": "Detailed explanation of the innovative optimization and its benefits",
      "line": <line number>,
      "category": "performance",
      "confidence": <0-1>,
      "severity": "high|medium|low",
      "impactLevel": "high|medium|low",
      "optimizationType": "creative-algorithm|innovative-caching|advanced-parallel|unconventional|modern-technique|creative-architecture",
      "codeExample": "example of creatively optimized code" or null,
      "estimatedImprovement": "description of expected performance gain from creative approach" or null
    }
  ]
}

Be innovative and think outside the box while ensuring suggestions remain practical.`;
  } else {
    return `${basePrompt}

Focus on identifying and providing solutions for standard performance optimizations:
1. **Algorithmic Complexity** - Identify O(n²) or higher complexity operations that can be optimized
2. **Memory Usage** - Unnecessary object creation, memory leaks, or inefficient data structures
3. **Language-Specific Optimizations** - Leverage ${language}-specific performance patterns
4. **Data Structure Efficiency** - Suggest better data structures for specific use cases
5. **Execution Performance** - Reduce function calls, optimize loops, minimize DOM manipulations
6. **Caching Opportunities** - Identify values that can be cached or memoized
7. **Async/Concurrency** - Improve async handling and parallel processing where applicable

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