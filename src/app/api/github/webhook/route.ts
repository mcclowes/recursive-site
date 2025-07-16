import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { analyzeCodeWithAI } from '@/lib/ai-analyzer';

interface GitHubPullRequest {
  number: number;
  head: {
    sha: string;
    repo: {
      full_name: string;
    };
  };
  base: {
    repo: {
      full_name: string;
    };
  };
}

interface GitHubWebhookPayload {
  action: string;
  pull_request: GitHubPullRequest;
  repository: {
    full_name: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload: GitHubWebhookPayload = await request.json();
    
    // Only process opened or synchronized PRs
    if (payload.action !== 'opened' && payload.action !== 'synchronize') {
      return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
    }

    const { pull_request, repository } = payload;
    
    // Get GitHub token from environment variables
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      console.error('GITHUB_TOKEN not configured');
      return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    const octokit = new Octokit({
      auth: githubToken,
    });

    try {
      // Get PR files
      const { data: files } = await octokit.rest.pulls.listFiles({
        owner: repository.full_name.split('/')[0],
        repo: repository.full_name.split('/')[1],
        pull_number: pull_request.number,
      });

      // Analyze code files
      const analysisResults = [];
      
      for (const file of files.slice(0, 10)) { // Limit to first 10 files
        if (file.patch && shouldAnalyzeFile(file.filename)) {
          const language = detectLanguage(file.filename);
          const codeToAnalyze = extractCodeFromPatch(file.patch);
          
          if (codeToAnalyze) {
            const analysis = await analyzeCodeWithAI(codeToAnalyze, language);
            analysisResults.push({
              filename: file.filename,
              analysis,
              language,
            });
          }
        }
      }

      // Create comment with analysis results
      const commentBody = formatAnalysisComment(analysisResults);
      
      await octokit.rest.issues.createComment({
        owner: repository.full_name.split('/')[0],
        repo: repository.full_name.split('/')[1],
        issue_number: pull_request.number,
        body: commentBody,
      });

      return NextResponse.json({ 
        message: 'PR analyzed successfully', 
        filesAnalyzed: analysisResults.length 
      });

    } catch (error) {
      console.error('GitHub API error:', error);
      return NextResponse.json({ error: 'Failed to analyze PR' }, { status: 500 });
    }

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }
}

function shouldAnalyzeFile(filename: string): boolean {
  const supportedExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.go'];
  return supportedExtensions.some(ext => filename.endsWith(ext));
}

function detectLanguage(filename: string): string {
  if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript';
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript';
  if (filename.endsWith('.py')) return 'python';
  if (filename.endsWith('.java')) return 'java';
  if (filename.endsWith('.cpp') || filename.endsWith('.c')) return 'cpp';
  if (filename.endsWith('.go')) return 'go';
  return 'javascript'; // default
}

function extractCodeFromPatch(patch: string): string {
  // Extract added lines from the patch
  const lines = patch.split('\n');
  const addedLines = lines
    .filter(line => line.startsWith('+') && !line.startsWith('+++'))
    .map(line => line.substring(1));
  
  return addedLines.join('\n');
}

function formatAnalysisComment(results: Array<{
  filename: string;
  analysis: {
    score: number;
    suggestions: Array<{
      type: string;
      message: string;
      line: number;
    }>;
    metrics: {
      complexity: number;
      maintainability: string;
    };
  };
  language: string;
}>): string {
  if (results.length === 0) {
    return `## 🤖 AI Code Review

No code changes detected for analysis.`;
  }

  let comment = `## 🤖 AI Code Review

I've analyzed the code changes in this PR. Here are my findings:

`;

  results.forEach(result => {
    const { filename, analysis, language } = result;
    
    comment += `### 📄 \`${filename}\` (${language})\n\n`;
    comment += `**Quality Score:** ${analysis.score}% | **Complexity:** ${analysis.metrics.complexity} | **Maintainability:** ${analysis.metrics.maintainability}\n\n`;
    
    if (analysis.suggestions.length > 0) {
      comment += `**Suggestions:**\n`;
      analysis.suggestions.forEach(suggestion => {
        const icon = getSuggestionIcon(suggestion.type);
        comment += `- ${icon} **Line ${suggestion.line}:** ${suggestion.message}\n`;
      });
      comment += `\n`;
    } else {
      comment += `✅ No suggestions - great code!\n\n`;
    }
  });

  comment += `---
*Generated by AI Code Review Tool - [Learn more](https://github.com/mcclowes/recursive-site)*`;

  return comment;
}

function getSuggestionIcon(type: string): string {
  switch (type) {
    case 'warning': return '⚠️';
    case 'info': return 'ℹ️';
    case 'suggestion': return '💡';
    case 'success': return '✅';
    default: return '📝';
  }
}