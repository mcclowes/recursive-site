interface CodeContext {
  functions: string[];
  classes: string[];
  imports: string[];
  variables: string[];
  complexity: number;
  patterns: string[];
  language: string;
  codeStructure: string;
}

export function extractCodeContext(
  code: string,
  language: string
): CodeContext {
  const lines = code.split('\n');
  const context: CodeContext = {
    functions: [],
    classes: [],
    imports: [],
    variables: [],
    complexity: 0,
    patterns: [],
    language,
    codeStructure: '',
  };

  if (language === 'javascript' || language === 'typescript') {
    return extractJavaScriptContext(code, lines, context);
  } else if (language === 'python') {
    return extractPythonContext(code, lines, context);
  } else if (language === 'java') {
    return extractJavaContext(code, lines, context);
  }

  return context;
}

function extractJavaScriptContext(
  code: string,
  lines: string[],
  context: CodeContext
): CodeContext {
  // Extract imports
  const importRegex = /import\s+.*?\s+from\s+['"](.+?)['"]/g;
  const requireRegex =
    /(?:const|let|var)\s+.*?\s*=\s*require\(['"](.+?)['"]\)/g;

  let match;
  while ((match = importRegex.exec(code)) !== null) {
    context.imports.push(match[1]);
  }
  while ((match = requireRegex.exec(code)) !== null) {
    context.imports.push(match[1]);
  }

  // Extract function definitions (including methods in classes)
  const functionRegex =
    /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\(.*?\)|.*?)\s*=>|async\s+function\s+(\w+)|(\w+)\s*\(.*?\)\s*{)/g;
  while ((match = functionRegex.exec(code)) !== null) {
    const funcName = match[1] || match[2] || match[3] || match[4];
    if (
      funcName &&
      !['if', 'for', 'while', 'switch', 'catch', 'try'].includes(funcName)
    ) {
      context.functions.push(funcName);
    }
  }

  // Extract class definitions
  const classRegex = /class\s+(\w+)/g;
  while ((match = classRegex.exec(code)) !== null) {
    context.classes.push(match[1]);
  }

  // Extract variable declarations
  const variableRegex = /(?:const|let|var)\s+(\w+)/g;
  while ((match = variableRegex.exec(code)) !== null) {
    context.variables.push(match[1]);
  }

  // Detect patterns
  context.patterns = detectJavaScriptPatterns(code);

  // Calculate complexity
  context.complexity = calculateComplexity(code);

  // Create structure summary
  context.codeStructure = generateStructureSummary(context);

  return context;
}

function extractPythonContext(
  code: string,
  lines: string[],
  context: CodeContext
): CodeContext {
  // Extract imports
  const importRegex =
    /(?:from\s+(\w+(?:\.\w+)*)\s+import|import\s+(\w+(?:\.\w+)*))/g;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    context.imports.push(match[1] || match[2]);
  }

  // Extract function definitions
  const functionRegex = /def\s+(\w+)/g;
  while ((match = functionRegex.exec(code)) !== null) {
    context.functions.push(match[1]);
  }

  // Extract class definitions
  const classRegex = /class\s+(\w+)/g;
  while ((match = classRegex.exec(code)) !== null) {
    context.classes.push(match[1]);
  }

  // Extract variable assignments
  const variableRegex = /^(\w+)\s*=/gm;
  while ((match = variableRegex.exec(code)) !== null) {
    context.variables.push(match[1]);
  }

  context.patterns = detectPythonPatterns(code);
  context.complexity = calculateComplexity(code);
  context.codeStructure = generateStructureSummary(context);

  return context;
}

function extractJavaContext(
  code: string,
  lines: string[],
  context: CodeContext
): CodeContext {
  // Extract imports
  const importRegex = /import\s+(?:static\s+)?([a-zA-Z0-9_.]+(?:\.\*)?)/g;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    context.imports.push(match[1]);
  }

  // Extract method definitions
  const methodRegex =
    /(?:public|private|protected|static|\s)+[\w<>\[\]]+\s+(\w+)\s*\(/g;
  while ((match = methodRegex.exec(code)) !== null) {
    context.functions.push(match[1]);
  }

  // Extract class definitions
  const classRegex = /(?:public|private|protected|\s)+class\s+(\w+)/g;
  while ((match = classRegex.exec(code)) !== null) {
    context.classes.push(match[1]);
  }

  // Extract variable declarations
  const variableRegex =
    /(?:private|public|protected|static|\s)+[\w<>\[\]]+\s+(\w+)\s*[=;]/g;
  while ((match = variableRegex.exec(code)) !== null) {
    context.variables.push(match[1]);
  }

  context.patterns = detectJavaPatterns(code);
  context.complexity = calculateComplexity(code);
  context.codeStructure = generateStructureSummary(context);

  return context;
}

function detectJavaScriptPatterns(code: string): string[] {
  const patterns: string[] = [];

  if (code.includes('async') && code.includes('await')) {
    patterns.push('async/await pattern');
  }
  if (code.includes('Promise')) {
    patterns.push('Promise-based asynchronous code');
  }
  if (code.includes('=>')) {
    patterns.push('arrow functions');
  }
  if (code.includes('class')) {
    patterns.push('ES6 classes');
  }
  if (code.includes('const') || code.includes('let')) {
    patterns.push('modern variable declarations');
  }
  if (code.includes('...')) {
    patterns.push('spread/rest operators');
  }
  if (code.includes('`')) {
    patterns.push('template literals');
  }
  if (code.includes('try') && code.includes('catch')) {
    patterns.push('error handling');
  }
  if (code.includes('export') || code.includes('import')) {
    patterns.push('ES6 modules');
  }

  return patterns;
}

function detectPythonPatterns(code: string): string[] {
  const patterns: string[] = [];

  if (code.includes('with ')) {
    patterns.push('context managers');
  }
  if (code.includes('for ') && code.includes(' in ')) {
    patterns.push('for-in loops');
  }
  if (code.includes('list comprehension') || /\[.*for.*in.*\]/.test(code)) {
    patterns.push('list comprehensions');
  }
  if (code.includes('def ') && code.includes('yield')) {
    patterns.push('generator functions');
  }
  if (code.includes('class ') && code.includes('def __init__')) {
    patterns.push('object-oriented design');
  }
  if (code.includes('try:') && code.includes('except')) {
    patterns.push('exception handling');
  }
  if (code.includes('import ') || code.includes('from ')) {
    patterns.push('module imports');
  }

  return patterns;
}

function detectJavaPatterns(code: string): string[] {
  const patterns: string[] = [];

  if (code.includes('interface')) {
    patterns.push('interface usage');
  }
  if (code.includes('extends')) {
    patterns.push('inheritance');
  }
  if (code.includes('implements')) {
    patterns.push('interface implementation');
  }
  if (code.includes('public static void main')) {
    patterns.push('main method');
  }
  if (code.includes('try') && code.includes('catch')) {
    patterns.push('exception handling');
  }
  if (code.includes('synchronized')) {
    patterns.push('thread synchronization');
  }
  if (code.includes('stream()')) {
    patterns.push('Java streams');
  }
  if (code.includes('@Override') || code.includes('@')) {
    patterns.push('annotations');
  }

  return patterns;
}

function calculateComplexity(code: string): number {
  const complexityKeywords = [
    'if',
    'else',
    'for',
    'while',
    'switch',
    'case',
    'catch',
    'try',
    'except',
    'elif',
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

function generateStructureSummary(context: CodeContext): string {
  const summary = [];

  if (context.functions.length > 0) {
    summary.push(
      `${context.functions.length} function(s): ${context.functions.slice(0, 3).join(', ')}${context.functions.length > 3 ? '...' : ''}`
    );
  }
  if (context.classes.length > 0) {
    summary.push(
      `${context.classes.length} class(es): ${context.classes.slice(0, 3).join(', ')}${context.classes.length > 3 ? '...' : ''}`
    );
  }
  if (context.imports.length > 0) {
    summary.push(
      `${context.imports.length} import(s): ${context.imports.slice(0, 3).join(', ')}${context.imports.length > 3 ? '...' : ''}`
    );
  }
  if (context.patterns.length > 0) {
    summary.push(`Patterns: ${context.patterns.join(', ')}`);
  }

  return summary.join('; ');
}
