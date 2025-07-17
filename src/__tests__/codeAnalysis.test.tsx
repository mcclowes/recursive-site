// Extract the analysis functions for testing
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
        message:
          'Consider using "let" or "const" instead of "var" for better scoping',
        line: lines.findIndex(line => line.includes('var ')) + 1,
      });
      score -= 5;
    }

    // Check for console.log
    if (code.includes('console.log')) {
      suggestions.push({
        type: 'info',
        message: 'Remove console.log statements before production',
        line: lines.findIndex(line => line.includes('console.log')) + 1,
      });
      score -= 2;
    }

    // Check for missing semicolons
    const missingSemicolons = lines.filter(
      line =>
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
        line: lines.findIndex(line => line === missingSemicolons[0]) + 1,
      });
      score -= 3;
    }
  }

  // Check for long functions
  if (lines.length > 50) {
    suggestions.push({
      type: 'suggestion',
      message: 'Consider breaking down large functions into smaller ones',
      line: 1,
    });
    score -= 5;
  }

  // Check for proper indentation
  const indentationIssues = lines.filter(
    line =>
      line.length > 0 && line.search(/\S/) !== -1 && line.search(/\S/) % 2 !== 0
  );

  if (indentationIssues.length > 0) {
    suggestions.push({
      type: 'info',
      message: 'Inconsistent indentation detected',
      line: 1,
    });
    score -= 2;
  }

  // Positive feedback for good practices
  if (language === 'javascript' || language === 'typescript') {
    if (code.includes('const ') || code.includes('let ')) {
      suggestions.push({
        type: 'success',
        message: 'Great use of modern variable declarations!',
        line:
          lines.findIndex(
            line => line.includes('const ') || line.includes('let ')
          ) + 1,
      });
      score += 2;
    }

    if (code.includes('async ') || code.includes('await ')) {
      suggestions.push({
        type: 'success',
        message: 'Excellent use of async/await for asynchronous operations!',
        line:
          lines.findIndex(
            line => line.includes('async ') || line.includes('await ')
          ) + 1,
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
      maintainability: score > 80 ? 'High' : score > 60 ? 'Medium' : 'Low',
    },
  };
}

function calculateComplexity(code: string): number {
  // Simple complexity calculation
  const complexityKeywords = [
    'if',
    'else',
    'for',
    'while',
    'switch',
    'case',
    'catch',
    'try',
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

describe('Code Analysis Functions', () => {
  describe('analyzeCode', () => {
    it('returns basic analysis structure', () => {
      const code = 'console.log("Hello World");';
      const result = analyzeCode(code, 'javascript');

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('metrics');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(result.metrics).toHaveProperty('lines');
      expect(result.metrics).toHaveProperty('characters');
      expect(result.metrics).toHaveProperty('complexity');
      expect(result.metrics).toHaveProperty('maintainability');
    });

    it('detects var usage warning', () => {
      const code = 'var x = 10;';
      const result = analyzeCode(code, 'javascript');

      const varSuggestion = result.suggestions.find(s =>
        s.message.includes('var')
      );
      expect(varSuggestion).toBeDefined();
      expect(varSuggestion?.type).toBe('warning');
      expect(varSuggestion?.line).toBe(1);
      expect(result.score).toBeLessThan(85);
    });

    it('detects console.log usage', () => {
      const code = 'console.log("test");';
      const result = analyzeCode(code, 'javascript');

      const consoleSuggestion = result.suggestions.find(s =>
        s.message.includes('console.log')
      );
      expect(consoleSuggestion).toBeDefined();
      expect(consoleSuggestion?.type).toBe('info');
      expect(consoleSuggestion?.line).toBe(1);
      expect(result.score).toBeLessThan(85);
    });

    it('gives positive feedback for const usage', () => {
      const code = 'const x = 10;';
      const result = analyzeCode(code, 'javascript');

      const constSuggestion = result.suggestions.find(s =>
        s.message.includes('modern variable declarations')
      );
      expect(constSuggestion).toBeDefined();
      expect(constSuggestion?.type).toBe('success');
      expect(result.score).toBeGreaterThan(85);
    });

    it('gives positive feedback for async/await usage', () => {
      const code = `
        async function fetchData() {
          const response = await fetch('/api/data');
          return response.json();
        }
      `;
      const result = analyzeCode(code, 'javascript');

      const asyncSuggestion = result.suggestions.find(s =>
        s.message.includes('async/await')
      );
      expect(asyncSuggestion).toBeDefined();
      expect(asyncSuggestion?.type).toBe('success');
      expect(result.score).toBeGreaterThan(85);
    });

    it('detects long functions', () => {
      const longCode = Array(60).fill('console.log("line");').join('\n');
      const result = analyzeCode(longCode, 'javascript');

      const longFunctionSuggestion = result.suggestions.find(s =>
        s.message.includes('large functions')
      );
      expect(longFunctionSuggestion).toBeDefined();
      expect(longFunctionSuggestion?.type).toBe('suggestion');
      expect(result.score).toBeLessThan(85);
    });

    it('calculates correct metrics', () => {
      const code = `const x = 10;
console.log(x);`;
      const result = analyzeCode(code, 'javascript');

      expect(result.metrics.lines).toBe(2);
      expect(result.metrics.characters).toBe(code.length);
      expect(result.metrics.complexity).toBeGreaterThan(0);
      expect(['High', 'Medium', 'Low']).toContain(
        result.metrics.maintainability
      );
    });

    it('works with non-JavaScript languages', () => {
      const code = 'print("Hello World")';
      const result = analyzeCode(code, 'python');

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(result.metrics.lines).toBe(1);
      expect(result.metrics.characters).toBe(code.length);
    });

    it('handles empty code', () => {
      const code = '';
      const result = analyzeCode(code, 'javascript');

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(result.metrics.lines).toBe(1);
      expect(result.metrics.characters).toBe(0);
    });
  });

  describe('calculateComplexity', () => {
    it('returns 1 for simple code', () => {
      const code = 'console.log("Hello");';
      const complexity = calculateComplexity(code);
      expect(complexity).toBe(1);
    });

    it('increases complexity for if statements', () => {
      const code = 'if (true) { console.log("yes"); }';
      const complexity = calculateComplexity(code);
      expect(complexity).toBe(2);
    });

    it('increases complexity for loops', () => {
      const code = 'for (let i = 0; i < 10; i++) { console.log(i); }';
      const complexity = calculateComplexity(code);
      expect(complexity).toBe(2);
    });

    it('increases complexity for multiple control structures', () => {
      const code = `
        if (true) {
          for (let i = 0; i < 10; i++) {
            while (i > 0) {
              console.log(i);
            }
          }
        }
      `;
      const complexity = calculateComplexity(code);
      expect(complexity).toBe(4); // 1 + if + for + while
    });

    it('increases complexity for try/catch', () => {
      const code = `
        try {
          console.log("test");
        } catch (error) {
          console.log("error");
        }
      `;
      const complexity = calculateComplexity(code);
      expect(complexity).toBe(3); // 1 + try + catch
    });

    it('increases complexity for switch statements', () => {
      const code = `
        switch (value) {
          case 1:
            console.log("one");
            break;
          case 2:
            console.log("two");
            break;
        }
      `;
      const complexity = calculateComplexity(code);
      expect(complexity).toBe(4); // 1 + switch + case + case
    });
  });
});
