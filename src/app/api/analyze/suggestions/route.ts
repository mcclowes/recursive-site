import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { extractCodeContext } from '@/utils/contextAnalysis';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(request: NextRequest) {
  try {
    const { code, language } = await request.json();

    if (!code || !language) {
      return NextResponse.json({ error: 'Code and language are required' }, { status: 400 });
    }

    // Get contextual AI suggestions focused on real-time feedback
    const contextualSuggestions = await getContextualSuggestions(code, language);
    
    return NextResponse.json({ suggestions: contextualSuggestions });
  } catch (error) {
    console.error('Error getting contextual suggestions:', error);
    return NextResponse.json({ error: 'Failed to get suggestions' }, { status: 500 });
  }
}

async function getContextualSuggestions(code: string, language: string): Promise<ContextualSuggestion[]> {
  if (!openai) {
    return [];
  }

  try {
    // Extract context from the code
    const context = extractCodeContext(code, language);
    
    // Create focused prompt for real-time suggestions
    const contextPrompt = createRealTimePrompt(code, language, context);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an advanced code assistant providing real-time, contextual suggestions. Focus on immediate improvements, best practices, and actionable feedback that helps developers as they write code. Provide specific, contextual suggestions based on the code structure and patterns."
        },
        {
          role: "user",
          content: contextPrompt
        }
      ],
      max_tokens: 800,
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return [];
    }

    // Parse AI response
    const aiResult = JSON.parse(content);
    
    // Transform suggestions to include inline display information
    const suggestions = (aiResult.suggestions || []).map((suggestion: {
      type?: string;
      message: string;
      explanation?: string;
      line?: number;
      column?: number;
      category?: string;
      confidence?: number;
      severity?: string;
      actionable?: boolean;
      quickFix?: string | null;
    }, index: number) => ({
      id: `contextual-${Date.now()}-${index}`,
      type: suggestion.type || 'info',
      message: suggestion.message,
      explanation: suggestion.explanation || suggestion.message,
      line: suggestion.line || 1,
      column: suggestion.column || 1,
      category: suggestion.category || 'general',
      confidence: suggestion.confidence || 0.8,
      severity: suggestion.severity || 'info',
      isInline: true,
      actionable: suggestion.actionable || false,
      quickFix: suggestion.quickFix || null
    }));
    
    return suggestions;
  } catch (error) {
    console.error('Contextual suggestions error:', error);
    return [];
  }
}

function createRealTimePrompt(code: string, language: string, context: {
  functions: string[];
  classes: string[];
  imports: string[];
  variables: string[];
  complexity: number;
  patterns: string[];
  language: string;
  codeStructure: string;
}): string {
  const contextInfo = context.codeStructure ? `Code Structure: ${context.codeStructure}` : '';
  const patterns = context.patterns.length > 0 ? `Detected Patterns: ${context.patterns.join(', ')}` : '';
  const complexity = `Complexity Score: ${context.complexity}`;
  
  return `Analyze this ${language} code for real-time contextual suggestions.

Context:
${contextInfo}
${patterns}
${complexity}

Focus on:
1. **Immediate Improvements** - Quick wins and optimizations
2. **Best Practices** - Language-specific conventions
3. **Potential Issues** - Security, performance, or logic concerns
4. **Code Quality** - Readability and maintainability
5. **Contextual Advice** - Based on detected patterns and structure

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Provide 3-5 most relevant suggestions in JSON format:
{
  "suggestions": [
    {
      "type": "suggestion|warning|info|error",
      "message": "Brief, actionable suggestion",
      "explanation": "Detailed explanation of why this is important",
      "line": <line number>,
      "column": <column number or 1>,
      "category": "performance|security|readability|best-practices|maintainability",
      "confidence": <0-1>,
      "severity": "error|warning|info|hint",
      "actionable": true|false,
      "quickFix": "suggested code fix" or null
    }
  ]
}

Focus on the most impactful suggestions that provide immediate value to the developer.`;
}

interface ContextualSuggestion {
  id: string;
  type: string;
  message: string;
  explanation: string;
  line: number;
  column: number;
  category: string;
  confidence: number;
  severity: string;
  isInline: boolean;
  actionable: boolean;
  quickFix: string | null;
}