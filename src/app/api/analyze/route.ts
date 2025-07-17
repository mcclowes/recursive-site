import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(request: NextRequest) {
  try {
    const { code, language } = await request.json();

    if (!code || !language) {
      return NextResponse.json({ error: 'Code and language are required' }, { status: 400 });
    }

    // Get both rule-based and AI analysis
    const ruleBasedAnalysis = analyzeCode(code, language);
    const aiAnalysis = await getAIAnalysis(code, language);
    
    // Combine both analyses
    const combinedAnalysis = combineAnalyses(ruleBasedAnalysis, aiAnalysis);
    
    return NextResponse.json({ analysis: combinedAnalysis });
  } catch (error) {
    console.error('Error analyzing code:', error);
    return NextResponse.json({ error: 'Failed to analyze code' }, { status: 500 });
  }
}

async function getAIAnalysis(code: string, language: string): Promise<AIAnalysis> {
  if (!openai) {
    return {
      suggestions: [],
      aiScore: 0,
      available: false
    };
  }

  try {
    const prompt = `You are an expert code reviewer. Analyze the following ${language} code and provide specific, actionable improvement suggestions. Focus on:
1. Code quality and best practices
2. Performance optimizations
3. Security considerations
4. Readability and maintainability
5. Language-specific improvements

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Provide your response in the following JSON format:
{
  "score": <number between 0-100>,
  "suggestions": [
    {
      "type": "suggestion|warning|info|success",
      "message": "specific suggestion text",
      "line": <line number or 1 if general>,
      "category": "performance|security|readability|best-practices|style"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert code reviewer. Provide constructive, specific feedback in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse AI response
    const aiResult = JSON.parse(content);
    
    return {
      suggestions: aiResult.suggestions || [],
      aiScore: aiResult.score || 0,
      available: true
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    return {
      suggestions: [],
      aiScore: 0,
      available: false,
      error: 'AI analysis temporarily unavailable'
    };
  }
}

interface RuleBasedAnalysis {
  score: number;
  suggestions: Suggestion[];
  metrics: {
    lines: number;
    characters: number;
    complexity: number;
    maintainability: string;
  };
}

interface AIAnalysis {
  suggestions: Suggestion[];
  aiScore: number;
  available: boolean;
  error?: string;
}

interface Suggestion {
  type: 'warning' | 'info' | 'suggestion' | 'success';
  message: string;
  line: number;
  source?: 'AI' | 'rule-based';
  category?: string;
}

function combineAnalyses(ruleBasedAnalysis: RuleBasedAnalysis, aiAnalysis: AIAnalysis) {
  const combinedSuggestions = [
    ...ruleBasedAnalysis.suggestions,
    ...aiAnalysis.suggestions.map((suggestion: Suggestion) => ({
      ...suggestion,
      source: 'AI' as const
    }))
  ];

  // Calculate combined score (weighted average)
  const ruleBasedWeight = 0.4;
  const aiWeight = 0.6;
  const combinedScore = aiAnalysis.available 
    ? Math.round((ruleBasedAnalysis.score * ruleBasedWeight) + (aiAnalysis.aiScore * aiWeight))
    : ruleBasedAnalysis.score;

  return {
    score: combinedScore,
    suggestions: combinedSuggestions,
    metrics: {
      ...ruleBasedAnalysis.metrics,
      aiAnalysisAvailable: aiAnalysis.available,
      aiError: aiAnalysis.error
    }
  };
}

function analyzeCode(code: string, language: string): RuleBasedAnalysis {
  const lines = code.split('\n');
  const suggestions: Suggestion[] = [];
  let score = 85;

  // Basic analysis rules
  if (language === 'javascript' || language === 'typescript') {
    // Check for var usage
    if (code.includes('var ')) {
      suggestions.push({
        type: 'warning',
        message: 'Consider using "let" or "const" instead of "var" for better scoping',
        line: lines.findIndex(line => line.includes('var ')) + 1
      });
      score -= 5;
    }

    // Check for console.log
    if (code.includes('console.log')) {
      suggestions.push({
        type: 'info',
        message: 'Remove console.log statements before production',
        line: lines.findIndex(line => line.includes('console.log')) + 1
      });
      score -= 2;
    }

    // Check for missing semicolons
    const missingSemicolons = lines.filter(line => 
      line.trim() && 
      !line.trim().endsWith(';') && 
      !line.trim().endsWith('{') && 
      !line.trim().endsWith('}') &&
      !line.trim().startsWith('//') &&
      !line.trim().startsWith('*')
    );
    
    if (missingSemicolons.length > 0) {
      suggestions.push({
        type: 'warning',
        message: 'Consider adding semicolons for consistency',
        line: lines.findIndex(line => line === missingSemicolons[0]) + 1
      });
      score -= 3;
    }
  }

  // Check for long functions
  if (lines.length > 50) {
    suggestions.push({
      type: 'suggestion',
      message: 'Consider breaking down large functions into smaller ones',
      line: 1
    });
    score -= 5;
  }

  // Check for proper indentation
  const indentationIssues = lines.filter(line => 
    line.length > 0 && 
    line.search(/\S/) !== -1 && 
    line.search(/\S/) % 2 !== 0
  );
  
  if (indentationIssues.length > 0) {
    suggestions.push({
      type: 'info',
      message: 'Inconsistent indentation detected',
      line: 1
    });
    score -= 2;
  }

  // Positive feedback for good practices
  if (language === 'javascript' || language === 'typescript') {
    if (code.includes('const ') || code.includes('let ')) {
      suggestions.push({
        type: 'success',
        message: 'Great use of modern variable declarations!',
        line: lines.findIndex(line => line.includes('const ') || line.includes('let ')) + 1
      });
      score += 2;
    }

    if (code.includes('async ') || code.includes('await ')) {
      suggestions.push({
        type: 'success',
        message: 'Excellent use of async/await for asynchronous operations!',
        line: lines.findIndex(line => line.includes('async ') || line.includes('await ')) + 1
      });
      score += 3;
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    suggestions,
    metrics: {
      lines: lines.length,
      characters: code.length,
      complexity: calculateComplexity(code),
      maintainability: score > 80 ? 'High' : score > 60 ? 'Medium' : 'Low'
    }
  };
}

function calculateComplexity(code: string): number {
  // Simple complexity calculation
  const complexityKeywords = [
    'if', 'else', 'for', 'while', 'switch', 'case', 'catch', 'try'
  ];
  
  let complexity = 1;
  complexityKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    const matches = code.match(regex);
    if (matches) {
      complexity += matches.length;
    }
  });
  
  return complexity;
}