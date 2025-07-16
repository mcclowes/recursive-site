const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY environment variable is required');
  process.exit(1);
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

// Function to analyze repository structure
function analyzeRepositoryStructure() {
  const analysis = {
    files: [],
    directories: [],
    fileTypes: {},
    totalFiles: 0,
    totalDirectories: 0
  };

  function scanDirectory(dirPath, relativePath = '') {
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const relativeItemPath = path.join(relativePath, item);
        
        if (item.startsWith('.') && item !== '.git') {
          continue; // Skip hidden files except .git
        }
        
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          analysis.directories.push(relativeItemPath);
          analysis.totalDirectories++;
          scanDirectory(fullPath, relativeItemPath);
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

// Function to read important files
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
  
  for (const file of importantFiles) {
    try {
      if (fs.existsSync(file)) {
        fileContents[file] = fs.readFileSync(file, 'utf8');
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
  const prompt = `
You are an expert software developer and repository analyst. Analyze the following repository information and provide specific, actionable improvement suggestions.

Repository Information:
- Name: ${repoInfo?.name || 'recursive-site'}
- Description: ${repoInfo?.description || 'No description'}
- Language: ${repoInfo?.language || 'Not specified'}
- Stars: ${repoInfo?.stargazers_count || 0}
- Forks: ${repoInfo?.forks_count || 0}
- Created: ${repoInfo?.created_at || 'Unknown'}
- Last updated: ${repoInfo?.updated_at || 'Unknown'}

Repository Structure Analysis:
- Total files: ${analysis.totalFiles}
- Total directories: ${analysis.totalDirectories}
- File types: ${JSON.stringify(analysis.fileTypes)}
- Directories: ${analysis.directories.join(', ')}
- Files: ${analysis.files.slice(0, 20).join(', ')}${analysis.files.length > 20 ? '...' : ''}

Important Files Content:
${Object.entries(fileContents).map(([file, content]) => `\n${file}:\n\`\`\`\n${content.substring(0, 1000)}${content.length > 1000 ? '...' : ''}\n\`\`\``).join('\n')}

Based on this analysis, please provide:
1. 3-5 specific, actionable improvement suggestions
2. Each suggestion should be concrete and implementable
3. Focus on code quality, documentation, structure, and best practices
4. Consider the repository's current state and potential for growth
5. Include technical recommendations that would add value

Format your response as a markdown document with clear sections and bullet points.
`;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
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