import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface FileAnalysis {
  filename: string;
  path: string;
  analysis: {
    score: number;
    suggestions: Array<{
      type: 'warning' | 'info' | 'suggestion' | 'success';
      message: string;
      line: number;
    }>;
    metrics: {
      lines: number;
      characters: number;
      complexity: number;
      maintainability: string;
    };
  };
}

export async function GET() {
  try {
    const projectRoot = process.cwd();
    const srcPath = path.join(projectRoot, 'src');
    
    const results: FileAnalysis[] = [];
    
    // Get all TypeScript/JavaScript files in the src directory
    const files = await getAllFiles(srcPath, ['.ts', '.tsx', '.js', '.jsx']);
    
    for (const filePath of files) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const relativePath = path.relative(projectRoot, filePath);
        const filename = path.basename(filePath);
        
        // Skip test files for now
        if (filename.includes('.test.') || filename.includes('.spec.')) {
          continue;
        }
        
        // Determine language based on extension
        const extension = path.extname(filePath);
        const language = extension === '.ts' || extension === '.tsx' ? 'typescript' : 'javascript';
        
        const analysis = analyzeCode(content, language);
        
        results.push({
          filename,
          path: relativePath,
          analysis
        });
      } catch (error) {
        console.error(`Error analyzing file ${filePath}:`, error);
      }
    }
    
    // Calculate overall project stats
    const totalFiles = results.length;
    const averageScore = results.reduce((sum, result) => sum + result.analysis.score, 0) / totalFiles;
    const totalLines = results.reduce((sum, result) => sum + result.analysis.metrics.lines, 0);
    const totalSuggestions = results.reduce((sum, result) => sum + result.analysis.suggestions.length, 0);
    
    return NextResponse.json({ 
      files: results,
      summary: {
        totalFiles,
        averageScore: Math.round(averageScore * 100) / 100,
        totalLines,
        totalSuggestions
      }
    });
  } catch (error) {
    console.error('Error analyzing project:', error);
    return NextResponse.json({ error: 'Failed to analyze project' }, { status: 500 });
  }
}

async function getAllFiles(dir: string, extensions: string[]): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and .git directories
        if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== '.next') {
          const subFiles = await getAllFiles(fullPath, extensions);
          files.push(...subFiles);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
  
  return files;
}

// Copy the analyze function from the existing route
function analyzeCode(code: string, language: string) {
  const lines = code.split('\n');
  const suggestions = [];
  let score = 85;

  // Basic analysis rules
  if (language === 'javascript' || language === 'typescript') {
    // Check for var usage
    if (code.includes('var ')) {
      suggestions.push({
        type: 'warning' as const,
        message: 'Consider using "let" or "const" instead of "var" for better scoping',
        line: lines.findIndex(line => line.includes('var ')) + 1
      });
      score -= 5;
    }

    // Check for console.log
    if (code.includes('console.log')) {
      suggestions.push({
        type: 'info' as const,
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
        type: 'warning' as const,
        message: 'Consider adding semicolons for consistency',
        line: lines.findIndex(line => line === missingSemicolons[0]) + 1
      });
      score -= 3;
    }
  }

  // Check for long functions
  if (lines.length > 50) {
    suggestions.push({
      type: 'suggestion' as const,
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
      type: 'info' as const,
      message: 'Inconsistent indentation detected',
      line: 1
    });
    score -= 2;
  }

  // Positive feedback for good practices
  if (language === 'javascript' || language === 'typescript') {
    if (code.includes('const ') || code.includes('let ')) {
      suggestions.push({
        type: 'success' as const,
        message: 'Great use of modern variable declarations!',
        line: lines.findIndex(line => line.includes('const ') || line.includes('let ')) + 1
      });
      score += 2;
    }

    if (code.includes('async ') || code.includes('await ')) {
      suggestions.push({
        type: 'success' as const,
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