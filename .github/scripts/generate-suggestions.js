const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const MAX_TOKENS = 12000; // Higher limit for GPT-3.5-turbo (16k context window)

if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY environment variable is required');
  process.exit(1);
}

// Simple token estimation (rough approximation: 1 token ≈ 4 characters)
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// Function to get repository information
async function getRepositoryInfo() {
  try {
    const response = await axios.get('https://api.github.com/repos/mcclowes/recursive-site', {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching repository info:', error.message);
    return null;
  }
}

// Function to analyze repository structure (optimized for token usage)
function analyzeRepositoryStructure() {
  const analysis = {
    files: [],
    directories: [],
    fileTypes: {},
    totalFiles: 0,
    totalDirectories: 0,
    topLevelItems: []
  };

  function scanDirectory(dirPath, relativePath = '', depth = 0) {
    try {
      const items = fs.readdirSync(dirPath);
      
      // Limit depth to avoid scanning too deep
      if (depth > 3) return;
      
      // Limit items per directory to avoid overwhelming context
      const maxItemsPerDir = depth === 0 ? 50 : 20;
      const limitedItems = items.slice(0, maxItemsPerDir);
      
      for (const item of limitedItems) {
        const fullPath = path.join(dirPath, item);
        const relativeItemPath = path.join(relativePath, item);
        
        if (item.startsWith('.') && item !== '.git') {
          continue; // Skip hidden files except .git
        }
        
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          if (depth === 0) {
            analysis.topLevelItems.push(relativeItemPath);
          }
          analysis.directories.push(relativeItemPath);
          analysis.totalDirectories++;
          scanDirectory(fullPath, relativeItemPath, depth + 1);
        } else {
          analysis.files.push(relativeItemPath);
          analysis.totalFiles++;
          
          const ext = path.extname(item).toLowerCase();
          analysis.fileTypes[ext] = (analysis.fileTypes[ext] || 0) + 1;
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error.message);
    }
  }

  scanDirectory('.');
  return analysis;
}

// Function to analyze current project features
function analyzeProjectFeatures() {
  const features = {
    codeEditor: false,
    apiAnalysis: false,
    multiLanguage: false,
    realTimeAnalysis: false,
    aiIntegration: false,
    testingFramework: false,
    deployment: false,
    authentication: false,
    collaboration: false,
    analytics: false
  };

  try {
    // Check for code editor
    const pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');
    if (pageContent.includes('SimpleCodeEditor') || pageContent.includes('monaco')) {
      features.codeEditor = true;
    }

    // Check for API analysis
    if (fs.existsSync('src/app/api/analyze/route.ts')) {
      features.apiAnalysis = true;
    }

    // Check for multi-language support
    if (pageContent.includes('javascript') && pageContent.includes('python') && pageContent.includes('typescript')) {
      features.multiLanguage = true;
    }

    // Check for real-time features
    if (pageContent.includes('useState') && pageContent.includes('useEffect')) {
      features.realTimeAnalysis = true;
    }

    // Check for AI integration
    const analyzeContent = fs.readFileSync('src/app/api/analyze/route.ts', 'utf8');
    if (analyzeContent.includes('openai') || analyzeContent.includes('claude') || analyzeContent.includes('gemini')) {
      features.aiIntegration = true;
    }

    // Check for testing
    if (fs.existsSync('jest.config.js') || fs.existsSync('__tests__')) {
      features.testingFramework = true;
    }

    // Check for deployment config
    if (fs.existsSync('vercel.json') || fs.existsSync('netlify.toml') || fs.existsSync('Dockerfile')) {
      features.deployment = true;
    }

  } catch (error) {
    console.error('Error analyzing project features:', error.message);
  }

  return features;
}

// Function to get project roadmap insights
function getProjectRoadmap() {
  const roadmap = [];
  
  try {
    const readmeContent = fs.readFileSync('README.md', 'utf8');
    
    // Extract "What's Next" section
    const whatsNextMatch = readmeContent.match(/## 📈 What's Next\?(.*?)(?=##|$)/s);
    if (whatsNextMatch) {
      const whatsNext = whatsNextMatch[1];
      const items = whatsNext.match(/- ([^\n]+)/g);
      if (items) {
        roadmap.push(...items.map(item => item.replace(/^- /, '')));
      }
    }
    
    // Extract TODO comments from code
    const todoPattern = /\/\/\s*TODO:?\s*([^\n]+)/gi;
    const files = ['src/app/page.tsx', 'src/app/api/analyze/route.ts'];
    
    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const todos = content.match(todoPattern);
        if (todos) {
          roadmap.push(...todos.map(todo => todo.replace(/\/\/\s*TODO:?\s*/, '')));
        }
      } catch (e) {
        // File might not exist
      }
    });
    
  } catch (error) {
    console.error('Error getting project roadmap:', error.message);
  }
  
  return roadmap;
}

// Function to read important files (optimized for token usage)
function readImportantFiles() {
  const importantFiles = [
    'README.md',
    'package.json',
    'package-lock.json',
    'yarn.lock',
    'requirements.txt',
    'Pipfile',
    'pyproject.toml',
    'Cargo.toml',
    'go.mod',
    'Gemfile',
    'composer.json',
    'docker-compose.yml',
    'Dockerfile',
    '.gitignore',
    'LICENSE',
    'src/app/page.tsx',
    'src/app/api/analyze/route.ts',
    'next.config.ts',
    'tailwind.config.ts'
  ];

  const fileContents = {};
  let totalTokens = 0;
  
  for (const file of importantFiles) {
    try {
      if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Limit file content to reduce tokens, but keep more for key files
        let maxCharsPerFile = 500;
        if (file === 'README.md') maxCharsPerFile = 1000;
        if (file === 'package.json') maxCharsPerFile = 800;
        if (file.endsWith('.tsx') || file.endsWith('.ts')) maxCharsPerFile = 1200;
        
        if (content.length > maxCharsPerFile) {
          content = content.substring(0, maxCharsPerFile) + '...';
        }
        
        const fileTokens = estimateTokens(content);
        if (totalTokens + fileTokens > MAX_TOKENS * 0.4) { // Use 40% of tokens for file contents
          console.log(`⚠️ Stopping file reading to stay within token limits (${totalTokens} tokens used)`);
          break;
        }
        
        fileContents[file] = content;
        totalTokens += fileTokens;
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  }
  
  return fileContents;
}

// Function to check for existing similar issues
async function checkForExistingIssues(suggestions) {
  try {
    // Get recent issues with ai-suggestion label
    const response = await axios.get('https://api.github.com/repos/mcclowes/recursive-site/issues', {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        state: 'open',
        labels: 'ai-suggestion',
        per_page: 10,
        sort: 'created',
        direction: 'desc'
      }
    });

    const recentIssues = response.data;
    
    if (recentIssues.length === 0) {
      console.log('No existing AI suggestion issues found');
      return false;
    }

    // Extract key topics from current suggestions
    const currentTopics = extractTopics(suggestions);
    
    // Check each recent issue for similarity
    for (const issue of recentIssues) {
      const issueTopics = extractTopics(issue.body);
      const similarity = calculateSimilarity(currentTopics, issueTopics);
      
      // Calculate time factor - more recent issues get higher weight
      const issueDate = new Date(issue.created_at);
      const now = new Date();
      const daysSinceCreation = (now - issueDate) / (1000 * 60 * 60 * 24);
      
      // Adjust similarity based on recency (issues older than 7 days get lower weight)
      const timeFactor = Math.max(0.5, 1 - (daysSinceCreation / 7));
      const adjustedSimilarity = similarity * timeFactor;
      
      console.log(`Checking similarity with issue #${issue.number}: ${similarity.toFixed(2)} (adjusted: ${adjustedSimilarity.toFixed(2)}, days old: ${daysSinceCreation.toFixed(1)})`);
      
      // If adjusted similarity is above threshold, consider it a duplicate
      if (adjustedSimilarity > 0.6) {
        console.log(`⚠️ Similar issue found: #${issue.number} (adjusted similarity: ${adjustedSimilarity.toFixed(2)})`);
        return true;
      }
    }
    
    console.log('✅ No similar issues found');
    return false;
  } catch (error) {
    console.error('Error checking for existing issues:', error.message);
    // If we can't check, allow creation to be safe
    return false;
  }
}

// Function to extract key topics from text
function extractTopics(text) {
  const topics = new Set();
  
  // Extract AI and feature-specific keywords
  const keywords = [
    'ai integration', 'openai', 'claude', 'gemini', 'machine learning', 'neural network',
    'real-time analysis', 'code review', 'static analysis', 'security scanning',
    'collaboration', 'team features', 'workflow integration', 'api integration',
    'performance optimization', 'scalability', 'monitoring', 'analytics',
    'authentication', 'authorization', 'deployment', 'ci/cd', 'testing',
    'documentation', 'typescript', 'next.js', 'react', 'tailwind',
    'monaco editor', 'code editor', 'syntax highlighting', 'autocomplete',
    'linting', 'formatting', 'refactoring', 'code quality', 'metrics',
    'github integration', 'version control', 'pull requests', 'code diff',
    'plugin system', 'extensibility', 'customization', 'themes',
    'mobile support', 'responsive design', 'accessibility', 'offline mode',
    'websockets', 'real-time updates', 'notifications', 'alerts',
    'dashboard', 'reporting', 'insights', 'visualizations', 'charts'
  ];
  
  const lowerText = text.toLowerCase();
  
  for (const keyword of keywords) {
    if (lowerText.includes(keyword)) {
      topics.add(keyword);
    }
  }
  
  // Extract feature names from markdown headers
  const featureHeaders = text.match(/##\s+🎯\s+([^\n]+)/g);
  if (featureHeaders) {
    featureHeaders.forEach(header => {
      const cleanHeader = header.replace(/^##\s+🎯\s+/, '').toLowerCase();
      topics.add(cleanHeader);
    });
  }
  
  // Extract technical terms from code blocks
  const codeBlocks = text.match(/```[\s\S]*?```/g);
  if (codeBlocks) {
    codeBlocks.forEach(block => {
      const techTerms = block.match(/\b(async|await|fetch|api|openai|claude|websocket|mongodb|redis|jwt|oauth|docker|kubernetes|terraform|aws|azure|gcp)\b/gi);
      if (techTerms) {
        techTerms.forEach(term => topics.add(term.toLowerCase()));
      }
    });
  }
  
  // Extract impact and priority indicators
  const impactPriority = text.match(/\*\*(Impact|Priority):\*\*\s*([^\n]+)/g);
  if (impactPriority) {
    impactPriority.forEach(item => {
      const cleanItem = item.replace(/\*\*(Impact|Priority):\*\*\s*/, '').toLowerCase();
      topics.add(cleanItem.substring(0, 30));
    });
  }
  
  return Array.from(topics);
}

// Function to calculate similarity between two sets of topics
function calculateSimilarity(topics1, topics2) {
  if (topics1.length === 0 || topics2.length === 0) {
    return 0;
  }
  
  const set1 = new Set(topics1);
  const set2 = new Set(topics2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

// Function to call OpenAI API
async function generateSuggestions(repoInfo, analysis, fileContents) {
  // Create a sophisticated, project-specific prompt
  const prompt = `
You are an expert software architect specializing in AI-powered developer tools. You are analyzing the "recursive-site" repository, which is an AI Code Review Tool built with Next.js.

**PROJECT CONTEXT:**
This is an AI Code Review Tool that provides instant code analysis, quality scoring, and improvement suggestions across multiple programming languages. The tool currently has:
- A Next.js frontend with code editor and analysis interface
- Basic code analysis API that provides suggestions for JavaScript/TypeScript
- Simple rule-based analysis (not using real AI APIs yet)
- Support for multiple programming languages
- GitHub Actions workflow for generating improvement suggestions

**REPOSITORY ANALYSIS:**
- Total files: ${analysis.totalFiles}
- Total directories: ${analysis.totalDirectories}
- Main technologies: ${Object.entries(analysis.fileTypes)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([ext, count]) => `${ext}:${count}`)
    .join(', ')}
- Key files analyzed: ${Object.keys(fileContents).join(', ')}

**CURRENT FEATURES DETECTED:**
${Object.entries(analysis.currentFeatures)
  .map(([feature, enabled]) => `- ${feature}: ${enabled ? '✅ Implemented' : '❌ Not implemented'}`)
  .join('\n')}

**EXISTING ROADMAP ITEMS:**
${analysis.roadmap.length > 0 ? analysis.roadmap.map(item => `- ${item}`).join('\n') : '- No explicit roadmap items found'}

**CURRENT TECH STACK (from analysis):**
${Object.entries(fileContents).map(([file, content]) => {
  if (file === 'package.json') {
    return `- Frontend: Next.js, React, TypeScript, TailwindCSS, Monaco Editor`;
  }
  if (file === 'README.md') {
    return `- Core Features: Multi-language support, real-time analysis, quality scoring, improvement suggestions`;
  }
  return '';
}).filter(Boolean).join('\n')}

**YOUR TASK:**
Generate ONE ADVANCED, SPECIFIC feature suggestion that would transform this basic code review tool into a professional-grade AI development platform. Focus on a feature that is:

1. **Innovative & Cutting-edge**: Use latest AI technologies and modern development practices
2. **High-impact**: A feature that would make developers choose this over other tools
3. **Technically feasible**: Can be implemented with current technology stack
4. **Progressive**: Build upon existing features rather than replacing them
5. **Professional-grade**: A feature you'd expect in a commercial product
6. **Discrete**: A single, focused problem that can be solved independently

**FOCUS AREAS (choose ONE):**
- Real AI API integration (OpenAI, Claude, Gemini)
- Advanced code analysis beyond basic rules
- Developer workflow integration
- Collaboration and team features
- Performance and scalability improvements
- Unique differentiating features

**REQUIREMENTS:**
- The suggestion should be a significant feature (1-3 weeks implementation)
- Include specific technical implementation details
- Provide code examples where relevant
- Consider existing codebase and build upon it
- Focus on a feature that would drive user adoption
- Make it a single, discrete improvement that stands alone

**OUTPUT FORMAT:**
Use this exact format:

# 🚀 AI Code Review Tool - Feature Suggestion

## 🎯 [Feature Name]

**Impact:** [Brief description of the value this brings to developers]

**Technical Implementation:**
[Detailed technical approach, including specific technologies, APIs, and architecture]

**Code Example:**
\`\`\`javascript
// Include relevant code snippet showing the feature
\`\`\`

**Integration Points:**
- [How it integrates with existing features]
- [Required changes to current codebase]

**Priority:** [High/Medium/Low] - [Justification based on impact and feasibility]

**Implementation Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

Make this suggestion exciting and innovative - a feature that would make developers genuinely excited to use this tool!
`;

  // Check token usage before making API call
  const estimatedTokens = estimateTokens(prompt);
  console.log(`📊 Estimated tokens for prompt: ${estimatedTokens}`);
  
  if (estimatedTokens > MAX_TOKENS) {
    console.error(`❌ Prompt too large (${estimatedTokens} tokens > ${MAX_TOKENS} limit)`);
    return null;
  }

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a senior software architect and AI specialist who creates detailed, innovative feature suggestions for developer tools. You focus on cutting-edge AI capabilities, modern development practices, and features that would genuinely excite developers.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.8
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response?.data || error.message);
    return null;
  }
}

// Main execution
async function main() {
  console.log('🔍 Analyzing AI Code Review Tool repository...');
  
  // Get repository information
  const repoInfo = await getRepositoryInfo();
  
  // Analyze repository structure
  const analysis = analyzeRepositoryStructure();
  
  // Analyze current project features
  const features = analyzeProjectFeatures();
  
  // Get project roadmap
  const roadmap = getProjectRoadmap();
  
  // Read important files
  const fileContents = readImportantFiles();
  
  console.log(`📊 Found ${analysis.totalFiles} files and ${analysis.totalDirectories} directories`);
  console.log(`📁 Top-level items: ${analysis.topLevelItems.length}`);
  console.log(`📄 File types found: ${Object.keys(analysis.fileTypes).length}`);
  console.log(`🎯 Current features detected: ${Object.entries(features).filter(([,v]) => v).map(([k]) => k).join(', ')}`);
  console.log(`🗺️ Roadmap items found: ${roadmap.length}`);
  
  // Generate suggestions with enhanced context
  console.log('🤖 Generating AI-powered feature suggestion...');
  
  // Add feature and roadmap context to the analysis
  const enhancedAnalysis = {
    ...analysis,
    currentFeatures: features,
    roadmap: roadmap
  };
  
  const suggestions = await generateSuggestions(repoInfo, enhancedAnalysis, fileContents);
  
  if (suggestions) {
    // Check for existing similar issues before creating new ones
    console.log('🔍 Checking for existing similar issues...');
    const hasSimilarIssues = await checkForExistingIssues(suggestions);
    
    if (hasSimilarIssues) {
      console.log('⏭️ Skipping issue creation - similar issues already exist');
      // Write a flag to indicate no new issue should be created
      fs.writeFileSync('.github/skip-issue-creation.txt', 'true');
      return;
    }
    
    // Write suggestions to file
    fs.writeFileSync('.github/suggestions.txt', suggestions);
    console.log('✅ AI feature suggestion generated and saved');
  } else {
    console.log('❌ Failed to generate suggestion');
    process.exit(1);
  }
}

// Run the script
main().catch(console.error); 