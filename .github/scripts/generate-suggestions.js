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
    'LICENSE'
  ];

  const fileContents = {};
  let totalTokens = 0;
  
  for (const file of importantFiles) {
    try {
      if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Limit file content to reduce tokens
        const maxCharsPerFile = 500; // Reduced from 1000
        if (content.length > maxCharsPerFile) {
          content = content.substring(0, maxCharsPerFile) + '...';
        }
        
        const fileTokens = estimateTokens(content);
        if (totalTokens + fileTokens > MAX_TOKENS * 0.3) { // Use only 30% of tokens for file contents
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
    // Get recent issues with ai-suggestions label
    const response = await axios.get('https://api.github.com/repos/mcclowes/recursive-site/issues', {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        state: 'open',
        labels: 'ai-suggestions',
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
  
  // Extract common improvement keywords
  const keywords = [
    'documentation', 'testing', 'linting', 'ci/cd', 'security', 'performance',
    'code quality', 'structure', 'organization', 'readme', 'setup', 'dependencies',
    'error handling', 'logging', 'monitoring', 'deployment', 'docker', 'dockerfile',
    'github actions', 'workflow', 'automation', 'best practices', 'standards',
    'refactoring', 'optimization', 'maintenance', 'scalability', 'reliability',
    'eslint', 'prettier', 'jest', 'vitest', 'cypress', 'playwright', 'typescript',
    'github pages', 'netlify', 'vercel', 'travis', 'circleci', 'github actions',
    'docker compose', 'kubernetes', 'helm', 'terraform', 'ansible', 'chef', 'puppet'
  ];
  
  const lowerText = text.toLowerCase();
  
  for (const keyword of keywords) {
    if (lowerText.includes(keyword)) {
      topics.add(keyword);
    }
  }
  
  // Also extract numbered suggestions (1., 2., etc.)
  const numberedSuggestions = text.match(/\d+\.\s*([^\n]+)/g);
  if (numberedSuggestions) {
    numberedSuggestions.forEach(suggestion => {
      const cleanSuggestion = suggestion.replace(/^\d+\.\s*/, '').toLowerCase();
      topics.add(cleanSuggestion.substring(0, 50)); // First 50 chars of each suggestion
    });
  }
  
  // Extract section headers (## Header)
  const headers = text.match(/##\s+([^\n]+)/g);
  if (headers) {
    headers.forEach(header => {
      const cleanHeader = header.replace(/^##\s+/, '').toLowerCase();
      topics.add(cleanHeader);
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
  // Create a more concise prompt
  const prompt = `
You are an expert software developer and repository analyst. Analyze the following repository information and provide specific, actionable improvement suggestions.

Repository Information:
- Name: ${repoInfo?.name || 'recursive-site'}
- Description: ${repoInfo?.description || 'No description'}
- Language: ${repoInfo?.language || 'Not specified'}
- Stars: ${repoInfo?.stargazers_count || 0}
- Forks: ${repoInfo?.forks_count || 0}

Repository Structure:
- Total files: ${analysis.totalFiles}
- Total directories: ${analysis.totalDirectories}
- Top-level items: ${analysis.topLevelItems.slice(0, 15).join(', ')}${analysis.topLevelItems.length > 15 ? '...' : ''}
- Main file types: ${Object.entries(analysis.fileTypes)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([ext, count]) => `${ext}:${count}`)
    .join(', ')}

Important Files:
${Object.entries(fileContents).map(([file, content]) => `${file}: ${content.substring(0, 200)}${content.length > 200 ? '...' : ''}`).join('\n')}

Provide 3-5 specific, actionable improvement suggestions focusing on code quality, documentation, structure, and best practices. Format as markdown with clear sections.
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
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful software development expert who provides clear, actionable advice for improving repositories.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
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
  console.log('🔍 Analyzing repository...');
  
  // Get repository information
  const repoInfo = await getRepositoryInfo();
  
  // Analyze repository structure
  const analysis = analyzeRepositoryStructure();
  
  // Read important files
  const fileContents = readImportantFiles();
  
  console.log(`📊 Found ${analysis.totalFiles} files and ${analysis.totalDirectories} directories`);
  console.log(`📁 Top-level items: ${analysis.topLevelItems.length}`);
  console.log(`📄 File types found: ${Object.keys(analysis.fileTypes).length}`);
  
  // Generate suggestions
  console.log('🤖 Generating improvement suggestions...');
  const suggestions = await generateSuggestions(repoInfo, analysis, fileContents);
  
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
    console.log('✅ Suggestions generated and saved');
  } else {
    console.log('❌ Failed to generate suggestions');
    process.exit(1);
  }
}

// Run the script
main().catch(console.error); 