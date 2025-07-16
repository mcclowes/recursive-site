interface Suggestion {
  type: 'warning' | 'info' | 'suggestion' | 'success';
  message: string;
  line: number;
}

interface AnalysisResult {
  score: number;
  suggestions: Suggestion[];
  metrics: {
    lines: number;
    characters: number;
    complexity: number;
    maintainability: string;
  };
}

// Language-specific configuration for AI analysis
const languageConfigs = {
  javascript: { 
    patterns: ['var ', 'console.log', 'function ', 'const ', 'let ', 'async ', 'await '],
    bestPractices: ['Use const/let instead of var', 'Remove console.log in production', 'Use async/await for promises']
  },
  typescript: { 
    patterns: ['any', 'interface', 'type', 'const ', 'let ', 'async ', 'await '],
    bestPractices: ['Avoid any type', 'Use interfaces for object types', 'Use strict TypeScript config']
  },
  python: { 
    patterns: ['import ', 'def ', 'class ', 'if __name__', 'print('],
    bestPractices: ['Use type hints', 'Follow PEP 8 style guide', 'Use f-strings for formatting']
  },
  java: { 
    patterns: ['public class', 'private ', 'public ', 'static ', 'import '],
    bestPractices: ['Use proper access modifiers', 'Follow naming conventions', 'Handle exceptions properly']
  },
  cpp: { 
    patterns: ['#include', 'using namespace', 'int main', 'std::'],
    bestPractices: ['Avoid using namespace std', 'Use smart pointers', 'Follow RAII principles']
  },
  go: { 
    patterns: ['package ', 'import ', 'func ', 'var ', 'const '],
    bestPractices: ['Use gofmt for formatting', 'Handle errors explicitly', 'Use descriptive variable names']
  }
};

export async function analyzeCodeWithAI(code: string, language: string): Promise<AnalysisResult> {
  const lines = code.split('\n');
  const suggestions: Suggestion[] = [];
  let score = 85;

  // Enhanced analysis with AI-like pattern recognition
  await performLanguageSpecificAnalysis(code, language, lines, suggestions);

  // Calculate complexity score
  const complexity = calculateAdvancedComplexity(code, language);
  
  // Adjust score based on complexity
  if (complexity > 10) {
    score -= 10;
    suggestions.push({
      type: 'warning',
      message: 'High complexity detected. Consider refactoring into smaller functions.',
      line: 1
    });
  }

  // Check for code quality patterns
  await checkCodeQualityPatterns(code, language, suggestions);

  // Add positive feedback for good practices
  await addPositiveFeedback(code, language, suggestions);

  return {
    score: Math.max(0, Math.min(100, score)),
    suggestions,
    metrics: {
      lines: lines.length,
      characters: code.length,
      complexity,
      maintainability: score > 80 ? 'High' : score > 60 ? 'Medium' : 'Low'
    }
  };
}

async function performLanguageSpecificAnalysis(
  code: string, 
  language: string, 
  lines: string[], 
  suggestions: Suggestion[]
): Promise<void> {
  switch (language) {
    case 'javascript':
    case 'typescript':
      await analyzeJavaScriptTypeScript(code, lines, suggestions);
      break;
    case 'python':
      await analyzePython(code, lines, suggestions);
      break;
    case 'java':
      await analyzeJava(code, lines, suggestions);
      break;
    case 'cpp':
      await analyzeCpp(code, lines, suggestions);
      break;
    case 'go':
      await analyzeGo(code, lines, suggestions);
      break;
    default:
      await analyzeGeneric(code, lines, suggestions);
  }
}

async function analyzeJavaScriptTypeScript(code: string, lines: string[], suggestions: Suggestion[]): Promise<void> {
  // Check for var usage
  if (code.includes('var ')) {
    suggestions.push({
      type: 'warning',
      message: 'Consider using "let" or "const" instead of "var" for better scoping',
      line: lines.findIndex(line => line.includes('var ')) + 1
    });
  }

  // Check for console.log in production
  if (code.includes('console.log')) {
    suggestions.push({
      type: 'info',
      message: 'Remove console.log statements before production deployment',
      line: lines.findIndex(line => line.includes('console.log')) + 1
    });
  }

  // Check for missing error handling
  if (code.includes('await ') && !code.includes('try') && !code.includes('catch')) {
    suggestions.push({
      type: 'suggestion',
      message: 'Consider adding error handling with try/catch for async operations',
      line: lines.findIndex(line => line.includes('await ')) + 1
    });
  }

  // Check for arrow functions vs regular functions
  if (code.includes('function(') && code.includes('=>')) {
    suggestions.push({
      type: 'info',
      message: 'Consider consistent use of arrow functions or regular functions',
      line: lines.findIndex(line => line.includes('function(')) + 1
    });
  }
}

async function analyzePython(code: string, lines: string[], suggestions: Suggestion[]): Promise<void> {
  // Check for print statements
  if (code.includes('print(')) {
    suggestions.push({
      type: 'info',
      message: 'Consider using logging module instead of print for production code',
      line: lines.findIndex(line => line.includes('print(')) + 1
    });
  }

  // Check for proper import order
  const importLines = lines.filter(line => line.trim().startsWith('import ') || line.trim().startsWith('from '));
  if (importLines.length > 1) {
    suggestions.push({
      type: 'suggestion',
      message: 'Consider organizing imports according to PEP 8 guidelines',
      line: lines.findIndex(line => line.trim().startsWith('import ')) + 1
    });
  }

  // Check for docstrings
  if (code.includes('def ') && !code.includes('"""') && !code.includes("'''")) {
    suggestions.push({
      type: 'suggestion',
      message: 'Add docstrings to document your functions',
      line: lines.findIndex(line => line.includes('def ')) + 1
    });
  }
}

async function analyzeJava(code: string, lines: string[], suggestions: Suggestion[]): Promise<void> {
  // Check for public class naming
  if (code.includes('public class')) {
    suggestions.push({
      type: 'success',
      message: 'Good use of proper class declaration',
      line: lines.findIndex(line => line.includes('public class')) + 1
    });
  }

  // Check for exception handling
  if (code.includes('throws ') || code.includes('try ')) {
    suggestions.push({
      type: 'success',
      message: 'Good exception handling practice',
      line: lines.findIndex(line => line.includes('throws ') || line.includes('try ')) + 1
    });
  }
}

async function analyzeCpp(code: string, lines: string[], suggestions: Suggestion[]): Promise<void> {
  // Check for using namespace std
  if (code.includes('using namespace std')) {
    suggestions.push({
      type: 'warning',
      message: 'Avoid "using namespace std" in header files',
      line: lines.findIndex(line => line.includes('using namespace std')) + 1
    });
  }

  // Check for proper includes
  if (code.includes('#include')) {
    suggestions.push({
      type: 'success',
      message: 'Good use of proper header includes',
      line: lines.findIndex(line => line.includes('#include')) + 1
    });
  }
}

async function analyzeGo(code: string, lines: string[], suggestions: Suggestion[]): Promise<void> {
  // Check for proper package declaration
  if (code.includes('package ')) {
    suggestions.push({
      type: 'success',
      message: 'Good package declaration',
      line: lines.findIndex(line => line.includes('package ')) + 1
    });
  }

  // Check for error handling
  if (code.includes('if err != nil')) {
    suggestions.push({
      type: 'success',
      message: 'Excellent error handling practice',
      line: lines.findIndex(line => line.includes('if err != nil')) + 1
    });
  }
}

async function analyzeGeneric(code: string, lines: string[], suggestions: Suggestion[]): Promise<void> {
  // Generic analysis for unsupported languages
  suggestions.push({
    type: 'info',
    message: 'Generic analysis - consider using a supported language for detailed feedback',
    line: 1
  });
}

async function checkCodeQualityPatterns(code: string, language: string, suggestions: Suggestion[]): Promise<void> {
  // Check for long functions
  const lines = code.split('\n');
  if (lines.length > 50) {
    suggestions.push({
      type: 'suggestion',
      message: 'Consider breaking down large functions into smaller, more manageable pieces',
      line: 1
    });
  }

  // Check for code duplication (basic)
  const duplicateLines = findDuplicateLines(lines);
  if (duplicateLines.length > 0) {
    suggestions.push({
      type: 'warning',
      message: 'Potential code duplication detected',
      line: duplicateLines[0]
    });
  }

  // Check for proper indentation
  const indentationIssues = checkIndentation(lines);
  if (indentationIssues.length > 0) {
    suggestions.push({
      type: 'info',
      message: 'Inconsistent indentation detected',
      line: indentationIssues[0]
    });
  }
}

async function addPositiveFeedback(code: string, language: string, suggestions: Suggestion[]): Promise<void> {
  // Add positive feedback for good practices
  if (language === 'javascript' || language === 'typescript') {
    if (code.includes('const ') || code.includes('let ')) {
      suggestions.push({
        type: 'success',
        message: 'Great use of modern variable declarations!',
        line: 1
      });
    }

    if (code.includes('async ') && code.includes('await ')) {
      suggestions.push({
        type: 'success',
        message: 'Excellent use of async/await for asynchronous operations!',
        line: 1
      });
    }
  }
}

function calculateAdvancedComplexity(code: string, language: string): number {
  // Enhanced complexity calculation
  const complexityKeywords = {
    javascript: ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', 'try', '&&', '||'],
    typescript: ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', 'try', '&&', '||'],
    python: ['if', 'elif', 'else', 'for', 'while', 'try', 'except', 'and', 'or'],
    java: ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', 'try', '&&', '||'],
    cpp: ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', 'try', '&&', '||'],
    go: ['if', 'else', 'for', 'switch', 'case', 'select', '&&', '||']
  };

  const keywords = complexityKeywords[language as keyof typeof complexityKeywords] || complexityKeywords.javascript;
  
  let complexity = 1;
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    const matches = code.match(regex);
    if (matches) {
      complexity += matches.length;
    }
  });
  
  return complexity;
}

function findDuplicateLines(lines: string[]): number[] {
  const lineMap = new Map<string, number[]>();
  const duplicates: number[] = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine.length > 5) { // Only check meaningful lines
      if (!lineMap.has(trimmedLine)) {
        lineMap.set(trimmedLine, []);
      }
      lineMap.get(trimmedLine)!.push(index + 1);
    }
  });

  lineMap.forEach((lineNumbers) => {
    if (lineNumbers.length > 1) {
      duplicates.push(...lineNumbers);
    }
  });

  return duplicates;
}

function checkIndentation(lines: string[]): number[] {
  const issues: number[] = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) return;

    const actualIndent = line.length - line.trimStart().length;
    
    // Simple indentation check (this could be enhanced)
    if (actualIndent % 2 !== 0 && actualIndent > 0) {
      issues.push(index + 1);
    }
  });

  return issues;
}