interface BenchmarkResult {
  executionTime: number;
  memoryUsage: number;
  iterations: number;
  avgTimePerIteration: number;
}

interface CodeMetrics {
  cyclomaticComplexity: number;
  linesOfCode: number;
  cognitiveComplexity: number;
  maintainabilityIndex: number;
}

interface PerformanceInsights {
  benchmark: BenchmarkResult;
  metrics: CodeMetrics;
  suggestions: string[];
  score: number;
}

export async function benchmarkCode(code: string, language: string): Promise<PerformanceInsights> {
  const startTime = performance.now();
  
  // Simulate code execution and memory usage
  const benchmark = await runCodeBenchmark(code, language);
  const metrics = calculateCodeMetrics(code, language);
  const suggestions = generatePerformanceSuggestions(code, language, benchmark, metrics);
  const score = calculatePerformanceScore(benchmark, metrics);
  
  const endTime = performance.now();
  
  return {
    benchmark: {
      ...benchmark,
      executionTime: endTime - startTime,
    },
    metrics,
    suggestions,
    score,
  };
}

async function runCodeBenchmark(code: string, language: string): Promise<BenchmarkResult> {
  // Simulate benchmarking different aspects of code
  const iterations = 1000;
  const baseTime = 0.1; // Base execution time in ms
  
  // Calculate execution time based on code complexity
  const complexity = calculateComplexity(code);
  const loops = (code.match(/for|while|forEach/g) || []).length;
  const recursion = (code.match(/function.*function|def.*def/g) || []).length;
  
  const executionTime = baseTime + (complexity * 0.05) + (loops * 0.1) + (recursion * 0.2);
  const memoryUsage = Math.round(code.length * 0.1 + complexity * 2); // Simulated memory in KB
  
  // Use language parameter to potentially adjust calculations in the future
  const languageMultiplier = language === 'python' ? 1.2 : 1.0;
  
  return {
    executionTime: executionTime * languageMultiplier,
    memoryUsage,
    iterations,
    avgTimePerIteration: (executionTime * languageMultiplier) / iterations,
  };
}

function calculateCodeMetrics(code: string, language: string): CodeMetrics {
  const lines = code.split('\n').filter(line => line.trim().length > 0);
  const linesOfCode = lines.length;
  
  // Calculate cyclomatic complexity
  const cyclomaticComplexity = calculateCyclomaticComplexity(code, language);
  
  // Calculate cognitive complexity (simplified)
  const cognitiveComplexity = calculateCognitiveComplexity(code, language);
  
  // Calculate maintainability index (0-100 scale)
  const maintainabilityIndex = calculateMaintainabilityIndex(linesOfCode, cyclomaticComplexity, cognitiveComplexity);
  
  return {
    cyclomaticComplexity,
    linesOfCode,
    cognitiveComplexity,
    maintainabilityIndex,
  };
}

function calculateCyclomaticComplexity(code: string, language: string): number {
  const complexityKeywords = {
    javascript: ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', 'try', '&&', '||'],
    typescript: ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', 'try', '&&', '||'],
    python: ['if', 'elif', 'else', 'for', 'while', 'try', 'except', 'and', 'or'],
    java: ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', 'try', '&&', '||'],
    cpp: ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', 'try', '&&', '||'],
    go: ['if', 'else', 'for', 'switch', 'case', 'select', '&&', '||'],
  };

  const keywords = complexityKeywords[language as keyof typeof complexityKeywords] || complexityKeywords.javascript;
  
  let complexity = 1; // Base complexity
  keywords.forEach(keyword => {
    let regex;
    if (keyword === '&&' || keyword === '||') {
      // Handle logical operators specially
      regex = new RegExp(`\\${keyword}`, 'g');
    } else {
      // Handle word boundaries for keywords
      regex = new RegExp(`\\b${keyword}\\b`, 'g');
    }
    const matches = code.match(regex);
    if (matches) {
      complexity += matches.length;
    }
  });
  
  return complexity;
}

function calculateCognitiveComplexity(code: string, _language: string): number {
  // Simplified cognitive complexity calculation
  let complexity = 0;
  
  // Nesting increases cognitive load
  const nestingLevel = calculateNestingLevel(code);
  complexity += nestingLevel * 2;
  
  // Logical operators increase complexity
  const logicalOperators = (code.match(/&&|\|\||and|or/g) || []).length;
  complexity += logicalOperators;
  
  // Recursion increases complexity
  const recursivePatterns = (code.match(/function.*function|def.*def/g) || []).length;
  complexity += recursivePatterns * 3;
  
  return complexity;
}

function calculateNestingLevel(code: string): number {
  const lines = code.split('\n');
  let maxNesting = 0;
  let currentNesting = 0;
  
  lines.forEach(line => {
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    
    currentNesting += openBraces - closeBraces;
    maxNesting = Math.max(maxNesting, currentNesting);
  });
  
  return maxNesting;
}

function calculateMaintainabilityIndex(loc: number, cyclomaticComplexity: number, cognitiveComplexity: number): number {
  // Simplified maintainability index calculation
  // Higher is better (0-100 scale)
  const baseScore = 100;
  const locPenalty = Math.min(loc * 0.1, 20);
  const cyclomaticPenalty = Math.min(cyclomaticComplexity * 2, 30);
  const cognitivePenalty = Math.min(cognitiveComplexity * 1.5, 25);
  
  return Math.max(0, baseScore - locPenalty - cyclomaticPenalty - cognitivePenalty);
}

function calculateComplexity(code: string): number {
  const complexityKeywords = ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', 'try'];
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

function generatePerformanceSuggestions(
  code: string,
  language: string,
  benchmark: BenchmarkResult,
  metrics: CodeMetrics
): string[] {
  const suggestions: string[] = [];
  
  // Execution time suggestions
  if (benchmark.executionTime > 1) {
    suggestions.push('⚡ Consider optimizing algorithms to reduce execution time');
  }
  
  // Memory usage suggestions
  if (benchmark.memoryUsage > 100) {
    suggestions.push('🧠 High memory usage detected - consider optimizing data structures');
  }
  
  // Complexity suggestions
  if (metrics.cyclomaticComplexity > 10) {
    suggestions.push('🔄 High cyclomatic complexity - consider breaking down functions');
  }
  
  if (metrics.cognitiveComplexity > 15) {
    suggestions.push('🧩 High cognitive complexity - simplify logic flow');
  }
  
  // Maintainability suggestions
  if (metrics.maintainabilityIndex < 70) {
    suggestions.push('🔧 Low maintainability - refactor for better readability');
  }
  
  // Language-specific suggestions
  switch (language) {
    case 'javascript':
    case 'typescript':
      if (code.includes('for (') && code.includes('.length')) {
        suggestions.push('🚀 Consider using array methods like map/filter/reduce for better performance');
      }
      if (code.includes('innerHTML')) {
        suggestions.push('⚡ Consider using textContent or modern DOM methods for better performance');
      }
      break;
      
    case 'python':
      if (code.includes('for ') && code.includes('range(len(')) {
        suggestions.push('🐍 Consider using enumerate() or direct iteration for better performance');
      }
      if (code.includes('+=') && code.includes('string')) {
        suggestions.push('📝 Consider using join() for string concatenation in loops');
      }
      break;
      
    case 'java':
      if (code.includes('String +')) {
        suggestions.push('📝 Consider using StringBuilder for string concatenation');
      }
      if (code.includes('ArrayList') && code.includes('for (')) {
        suggestions.push('🔄 Consider using enhanced for-loop or streams for better performance');
      }
      break;
  }
  
  return suggestions;
}

function calculatePerformanceScore(benchmark: BenchmarkResult, metrics: CodeMetrics): number {
  let score = 100;
  
  // Execution time penalty
  if (benchmark.executionTime > 1) {
    score -= Math.min(benchmark.executionTime * 10, 30);
  }
  
  // Memory usage penalty
  if (benchmark.memoryUsage > 50) {
    score -= Math.min(benchmark.memoryUsage * 0.2, 20);
  }
  
  // Complexity penalties
  score -= Math.min(metrics.cyclomaticComplexity * 2, 25);
  score -= Math.min(metrics.cognitiveComplexity * 1.5, 20);
  
  // Maintainability bonus/penalty
  if (metrics.maintainabilityIndex > 80) {
    score += 5;
  } else if (metrics.maintainabilityIndex < 50) {
    score -= 10;
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}