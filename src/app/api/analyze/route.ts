import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, language } = await request.json();

    if (!code || !language) {
      return NextResponse.json({ error: 'Code and language are required' }, { status: 400 });
    }

    // Simple code analysis - in a real app, you'd use AI here
    const analysis = analyzeCode(code, language);
    
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error analyzing code:', error);
    return NextResponse.json({ error: 'Failed to analyze code' }, { status: 500 });
  }
}

function analyzeCode(code: string, language: string) {
  const lines = code.split('\n');
  const suggestions = [];
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