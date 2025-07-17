import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { extractCodeContext } from '@/utils/contextAnalysis';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

interface DocumentationItem {
  id: string;
  title: string;
  url: string;
  type: 'documentation' | 'tutorial' | 'example' | 'discussion';
  source: 'MDN' | 'Stack Overflow' | 'GitHub' | 'Official Docs' | 'Community';
  relevanceScore: number;
  summary: string;
  codeExample?: string;
  tags: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { selectedCode, language } = await request.json();

    if (!selectedCode || !language) {
      return NextResponse.json(
        { error: 'Selected code and language are required' },
        { status: 400 }
      );
    }

    // Extract context from the selected code
    const codeContext = extractCodeContext(selectedCode, language);
    
    // Get AI-enhanced documentation suggestions
    const aiDocumentation = await getAIDocumentation(selectedCode, language, codeContext);
    
    // Get relevant documentation from various sources
    const documentationSuggestions = await fetchRelevantDocumentation(selectedCode, language, codeContext);
    
    // Combine and rank all documentation
    const combinedDocs = [...aiDocumentation, ...documentationSuggestions]
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10); // Limit to top 10 results

    return NextResponse.json({ 
      documentation: combinedDocs,
      context: codeContext,
      totalFound: combinedDocs.length
    });
  } catch (error) {
    console.error('Error fetching documentation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documentation' },
      { status: 500 }
    );
  }
}

async function getAIDocumentation(
  selectedCode: string,
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
  }
): Promise<DocumentationItem[]> {
  if (!openai) {
    return [];
  }

  try {
    const prompt = createDocumentationPrompt(selectedCode, language, context);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert developer assistant specializing in providing relevant documentation and learning resources for code segments. Provide accurate, helpful documentation suggestions in the specified JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return [];
    }

    const aiResult = JSON.parse(content) as { documentation?: DocumentationItem[] };
    return (aiResult.documentation || []).map((doc: DocumentationItem, index: number) => ({
      ...doc,
      id: `ai-${Date.now()}-${index}`,
      source: doc.source || 'AI Generated',
      relevanceScore: doc.relevanceScore || 0.8,
    }));
  } catch (error) {
    console.error('AI documentation error:', error);
    return [];
  }
}

function createDocumentationPrompt(
  selectedCode: string,
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
  }
): string {
  return `Analyze this ${language} code segment and provide relevant documentation suggestions:

Code segment:
\`\`\`${language}
${selectedCode}
\`\`\`

Context: ${context.codeStructure}
Detected patterns: ${context.patterns.join(', ')}

Please provide documentation suggestions that would help a developer understand or improve this code. Focus on:

1. **Official Documentation**: Language-specific or framework documentation
2. **Best Practices**: Coding standards and patterns
3. **Learning Resources**: Tutorials or guides related to the concepts used
4. **Community Discussions**: Relevant Stack Overflow or forum discussions
5. **Code Examples**: Similar implementations or patterns

Provide your response in the following JSON format:
{
  "documentation": [
    {
      "title": "descriptive title",
      "url": "https://example.com/doc",
      "type": "documentation|tutorial|example|discussion",
      "source": "MDN|Stack Overflow|GitHub|Official Docs|Community",
      "relevanceScore": 0.95,
      "summary": "brief description of what this resource covers",
      "codeExample": "optional brief code example",
      "tags": ["array", "of", "relevant", "tags"]
    }
  ]
}

Focus on providing 3-5 highly relevant documentation suggestions.`;
}

async function fetchRelevantDocumentation(
  selectedCode: string,
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
  }
): Promise<DocumentationItem[]> {
  // In a real implementation, this would integrate with various APIs
  // For now, we'll return mock data based on common patterns
  
  const docs: DocumentationItem[] = [];
  
  // Analyze code for specific patterns and suggest relevant documentation
  if (language === 'javascript' || language === 'typescript') {
    if (selectedCode.includes('async') || selectedCode.includes('await')) {
      docs.push({
        id: 'js-async-1',
        title: 'Async/Await - JavaScript | MDN',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function',
        type: 'documentation',
        source: 'MDN',
        relevanceScore: 0.9,
        summary: 'Complete guide to async/await syntax and best practices in JavaScript',
        tags: ['async', 'await', 'promises', 'asynchronous'],
      });
    }
    
    if (selectedCode.includes('fetch') || selectedCode.includes('axios')) {
      docs.push({
        id: 'js-fetch-1',
        title: 'Using Fetch API - Web APIs | MDN',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch',
        type: 'documentation',
        source: 'MDN',
        relevanceScore: 0.85,
        summary: 'Learn how to use the Fetch API to make HTTP requests',
        codeExample: 'fetch(url).then(response => response.json())',
        tags: ['fetch', 'http', 'api', 'requests'],
      });
    }
    
    if (selectedCode.includes('useState') || selectedCode.includes('useEffect')) {
      docs.push({
        id: 'react-hooks-1',
        title: 'Using the State Hook - React',
        url: 'https://reactjs.org/docs/hooks-state.html',
        type: 'documentation',
        source: 'Official Docs',
        relevanceScore: 0.9,
        summary: 'Learn how to use React Hooks for state management',
        tags: ['react', 'hooks', 'state', 'useEffect'],
      });
    }
  }
  
  if (language === 'python') {
    if (selectedCode.includes('def ') || selectedCode.includes('lambda')) {
      docs.push({
        id: 'python-func-1',
        title: 'Defining Functions - Python Documentation',
        url: 'https://docs.python.org/3/tutorial/controlflow.html#defining-functions',
        type: 'documentation',
        source: 'Official Docs',
        relevanceScore: 0.8,
        summary: 'Complete guide to defining and using functions in Python',
        tags: ['python', 'functions', 'lambda', 'def'],
      });
    }
  }
  
  // Add community discussion examples
  if (context.functions.length > 0) {
    docs.push({
      id: 'community-1',
      title: `Best practices for ${context.functions[0]} functions`,
      url: 'https://stackoverflow.com/questions/example',
      type: 'discussion',
      source: 'Stack Overflow',
      relevanceScore: 0.7,
      summary: 'Community discussion about best practices and common patterns',
      tags: ['best-practices', 'community', language],
    });
  }
  
  return docs;
}