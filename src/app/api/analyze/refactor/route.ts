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

    // Get intelligent refactoring suggestions
    const refactoringSuggestions = await getRefactoringSuggestions(
      code,
      language
    );

    return NextResponse.json({ suggestions: refactoringSuggestions });
  } catch (error) {
    console.error('Error getting refactoring suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to get refactoring suggestions' },
      { status: 500 }
    );
  }
}

async function getRefactoringSuggestions(
  code: string,
  language: string
): Promise<RefactoringSuggestion[]> {
  if (!openai) {
    return getFallbackRefactoringSuggestions(code, language);
  }

  try {
    // Extract context from the code
    const context = extractCodeContext(code, language);

    // Randomly determine creativity level (70% conservative, 30% creative)
    const isCreative = Math.random() < 0.3;
    const creativity = isCreative ? 'creative' : 'conservative';

    // Create focused prompt for refactoring suggestions
    const refactoringPrompt = createRefactoringPrompt(code, language, context, creativity);

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: isCreative
            ? 'You are an innovative code refactoring expert who thinks outside the box. Suggest creative refactoring approaches, advanced design patterns, and unconventional but practical solutions. Push the boundaries of what\'s possible while maintaining code quality and readability.'
            : 'You are an expert code refactoring assistant specializing in identifying code smells, anti-patterns, and structural improvements. Provide sophisticated refactoring suggestions with concrete before/after examples that enhance maintainability, readability, and performance.',
        },
        {
          role: 'user',
          content: refactoringPrompt,
        },
      ],
      max_tokens: 2000,
      temperature: isCreative ? 0.7 : 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return getFallbackRefactoringSuggestions(code, language);
    }

    // Parse AI response
    const aiResult = JSON.parse(content);

    // Transform suggestions to include refactoring-specific information
    const suggestions = (aiResult.suggestions || []).map(
      (
        suggestion: {
          title: string;
          description: string;
          reasoning: string;
          type: string;
          complexity: string;
          impact: string;
          beforeCode: string;
          afterCode: string;
          line?: number;
          estimatedTime?: string;
        },
        index: number
      ) => ({
        id: `refactor-${Date.now()}-${index}`,
        title: suggestion.title,
        description: suggestion.description,
        reasoning: suggestion.reasoning,
        type: suggestion.type || 'refactoring',
        complexity: suggestion.complexity || 'medium',
        impact: suggestion.impact || 'medium',
        beforeCode: suggestion.beforeCode,
        afterCode: suggestion.afterCode,
        line: suggestion.line || 1,
        estimatedTime: suggestion.estimatedTime || '5-10 minutes',
        isApplicable: true,
        category: 'refactoring',
      })
    );

    return suggestions;
  } catch (error) {
    console.error('AI refactoring suggestions error:', error);
    return getFallbackRefactoringSuggestions(code, language);
  }
}

function getFallbackRefactoringSuggestions(
  code: string,
  language: string
): RefactoringSuggestion[] {
  const suggestions: RefactoringSuggestion[] = [];
  const lines = code.split('\n');

  if (language === 'javascript' || language === 'typescript') {
    // Check for long functions that could be extracted
    if (lines.length > 20) {
      suggestions.push({
        id: `fallback-extract-function-${Date.now()}`,
        title: 'Extract Large Function',
        description: 'Break down this large function into smaller, more focused functions',
        reasoning: 'Large functions are harder to understand, test, and maintain. Breaking them into smaller functions improves readability and reusability.',
        type: 'extract-method',
        complexity: 'medium',
        impact: 'high',
        beforeCode: lines.slice(0, 10).join('\n') + '\n// ... rest of function',
        afterCode: `// Extract specific logic into separate functions\nfunction extractedHelper() {\n  // Specific logic here\n}\n\nfunction mainFunction() {\n  extractedHelper();\n  // Main logic here\n}`,
        line: 1,
        estimatedTime: '10-15 minutes',
        isApplicable: true,
        category: 'refactoring',
      });
    }

    // Check for repeated code patterns
    if (code.includes('console.log')) {
      const consoleLogCount = (code.match(/console\.log/g) || []).length;
      if (consoleLogCount > 3) {
        suggestions.push({
          id: `fallback-logging-${Date.now()}`,
          title: 'Implement Proper Logging',
          description: 'Replace multiple console.log statements with a proper logging system',
          reasoning: 'Using a proper logging system provides better control over log levels, formatting, and output destinations.',
          type: 'refactor-logging',
          complexity: 'low',
          impact: 'medium',
          beforeCode: 'console.log("Debug info:", data);\nconsole.log("Error:", error);',
          afterCode: `const logger = {\n  debug: (msg, data) => console.debug('[DEBUG]', msg, data),\n  error: (msg, error) => console.error('[ERROR]', msg, error)\n};\n\nlogger.debug("Debug info:", data);\nlogger.error("Error:", error);`,
          line: lines.findIndex(line => line.includes('console.log')) + 1,
          estimatedTime: '5-10 minutes',
          isApplicable: true,
          category: 'refactoring',
        });
      }
    }

    // Check for magic numbers
    const magicNumberRegex = /\b\d{2,}\b/g;
    const magicNumbers = code.match(magicNumberRegex);
    if (magicNumbers && magicNumbers.length > 0) {
      suggestions.push({
        id: `fallback-constants-${Date.now()}`,
        title: 'Extract Magic Numbers to Constants',
        description: 'Replace magic numbers with named constants for better maintainability',
        reasoning: 'Magic numbers make code harder to understand and maintain. Named constants provide context and make changes easier.',
        type: 'extract-constant',
        complexity: 'low',
        impact: 'medium',
        beforeCode: `if (user.age >= 18) {\n  // Do something\n}`,
        afterCode: `const LEGAL_AGE = 18;\n\nif (user.age >= LEGAL_AGE) {\n  // Do something\n}`,
        line: 1,
        estimatedTime: '2-5 minutes',
        isApplicable: true,
        category: 'refactoring',
      });
    }
  }

  return suggestions;
}

function createRefactoringPrompt(
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

  const basePrompt = `Analyze this ${language} code for intelligent refactoring opportunities.

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

Focus on innovative and creative refactoring opportunities:
1. **Advanced Design Patterns** - Suggest sophisticated patterns like Strategy, Observer, Command, or functional programming approaches
2. **Architectural Innovations** - Recommend modern architectural patterns, microservices patterns, or event-driven approaches
3. **Creative Abstractions** - Identify opportunities for elegant abstractions, fluent interfaces, or DSL-like approaches
4. **Experimental Techniques** - Suggest cutting-edge language features, metaprogramming, or advanced functional concepts
5. **Unconventional Solutions** - Think outside the box for unique approaches to common problems

Provide 1-3 creative refactoring suggestions in JSON format:
{
  "suggestions": [
    {
      "title": "Creative and innovative refactoring title",
      "description": "What this creative refactoring accomplishes",
      "reasoning": "Why this innovative approach is beneficial and worth exploring",
      "type": "creative-pattern|architectural-innovation|advanced-abstraction|experimental-technique|unconventional-solution",
      "complexity": "medium|high",
      "impact": "medium|high", 
      "beforeCode": "// Original code snippet showing the area for creative improvement",
      "afterCode": "// Creatively refactored code showing the innovative approach",
      "line": <line number where improvement starts>,
      "estimatedTime": "estimated time to apply creative refactoring"
    }
  ]
}

Be bold and innovative while ensuring the suggestions remain practical and beneficial.`;
  } else {
    return `${basePrompt}

Focus on identifying standard refactoring opportunities:
1. **Code Smells** - Long methods, duplicate code, large classes, feature envy, etc.
2. **Anti-Patterns** - God objects, spaghetti code, magic numbers, etc.
3. **Design Pattern Opportunities** - Where applying standard design patterns would improve structure
4. **Performance Bottlenecks** - Inefficient algorithms, unnecessary computations
5. **Maintainability Issues** - Hard-to-understand code, tight coupling

Provide 2-4 most impactful refactoring suggestions in JSON format:
{
  "suggestions": [
    {
      "title": "Descriptive refactoring title",
      "description": "What this refactoring accomplishes",
      "reasoning": "Why this refactoring is beneficial",
      "type": "extract-method|extract-class|extract-constant|apply-pattern|optimize-algorithm|improve-naming|reduce-complexity",
      "complexity": "low|medium|high",
      "impact": "low|medium|high", 
      "beforeCode": "// Original code snippet showing the issue",
      "afterCode": "// Refactored code showing the improvement",
      "line": <line number where issue starts>,
      "estimatedTime": "estimated time to apply refactoring"
    }
  ]
}

Provide concrete, actionable refactoring suggestions with realistic before/after code examples.`;
  }
}

interface RefactoringSuggestion {
  id: string;
  title: string;
  description: string;
  reasoning: string;
  type: string;
  complexity: string;
  impact: string;
  beforeCode: string;
  afterCode: string;
  line: number;
  estimatedTime: string;
  isApplicable: boolean;
  category: string;
}