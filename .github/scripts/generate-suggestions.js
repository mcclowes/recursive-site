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
    const response = await axios.get(
      'https://api.github.com/repos/mcclowes/recursive-site',
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
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
    topLevelItems: [],
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
    analytics: false,
  };

  try {
    // Check for code editor
    const pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');
    if (
      pageContent.includes('SimpleCodeEditor') ||
      pageContent.includes('monaco')
    ) {
      features.codeEditor = true;
    }

    // Check for API analysis
    if (fs.existsSync('src/app/api/analyze/route.ts')) {
      features.apiAnalysis = true;
    }

    // Check for multi-language support
    if (
      pageContent.includes('javascript') &&
      pageContent.includes('python') &&
      pageContent.includes('typescript')
    ) {
      features.multiLanguage = true;
    }

    // Check for real-time features
    if (pageContent.includes('useState') && pageContent.includes('useEffect')) {
      features.realTimeAnalysis = true;
    }

    // Check for AI integration
    const analyzeContent = fs.readFileSync(
      'src/app/api/analyze/route.ts',
      'utf8'
    );
    if (
      analyzeContent.includes('openai') ||
      analyzeContent.includes('claude') ||
      analyzeContent.includes('gemini')
    ) {
      features.aiIntegration = true;
    }

    // Check for testing
    if (fs.existsSync('jest.config.js') || fs.existsSync('__tests__')) {
      features.testingFramework = true;
    }

    // Check for deployment config
    if (
      fs.existsSync('vercel.json') ||
      fs.existsSync('netlify.toml') ||
      fs.existsSync('Dockerfile')
    ) {
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
    const whatsNextMatch = readmeContent.match(
      /## 📈 What's Next\?(.*?)(?=##|$)/s
    );
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
          roadmap.push(
            ...todos.map(todo => todo.replace(/\/\/\s*TODO:?\s*/, ''))
          );
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
    'tailwind.config.ts',
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
        if (file.endsWith('.tsx') || file.endsWith('.ts'))
          maxCharsPerFile = 1200;

        if (content.length > maxCharsPerFile) {
          content = content.substring(0, maxCharsPerFile) + '...';
        }

        const fileTokens = estimateTokens(content);
        if (totalTokens + fileTokens > MAX_TOKENS * 0.4) {
          // Use 40% of tokens for file contents
          console.log(
            `⚠️ Stopping file reading to stay within token limits (${totalTokens} tokens used)`
          );
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
    const response = await axios.get(
      'https://api.github.com/repos/mcclowes/recursive-site/issues',
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
        params: {
          state: 'open',
          labels: 'ai-suggestion',
          per_page: 15, // Increased to check more issues
          sort: 'created',
          direction: 'desc',
        },
      }
    );

    const recentIssues = response.data;

    if (recentIssues.length === 0) {
      console.log('No existing AI suggestion issues found');
      return { hasSimilar: false, similarityData: null };
    }

    // Extract topics and categories from current suggestions
    const currentTopicData = extractTopics(suggestions);
    console.log('Current suggestion categories:', currentTopicData.categories);
    console.log(
      'Current suggestion topics:',
      currentTopicData.topics.slice(0, 10)
    ); // Show first 10 topics

    // Check each recent issue for similarity
    let highestSimilarity = 0;
    let mostSimilarIssue = null;
    let overlapCategories = [];

    for (const issue of recentIssues) {
      const issueTopicData = extractTopics(issue.body);
      const similarity = calculateSimilarity(currentTopicData, issueTopicData);

      // Calculate time factor - more recent issues get higher weight
      const issueDate = new Date(issue.created_at);
      const now = new Date();
      const daysSinceCreation = (now - issueDate) / (1000 * 60 * 60 * 24);

      // Adjust similarity based on recency (issues older than 14 days get lower weight)
      const timeFactor = Math.max(0.3, 1 - daysSinceCreation / 14);
      const adjustedSimilarity = similarity * timeFactor;

      console.log(`Checking similarity with issue #${issue.number}:`);
      console.log(`  Title: ${issue.title}`);
      console.log(`  Categories: ${issueTopicData.categories.join(', ')}`);
      console.log(`  Raw similarity: ${similarity.toFixed(3)}`);
      console.log(`  Adjusted similarity: ${adjustedSimilarity.toFixed(3)}`);
      console.log(`  Days old: ${daysSinceCreation.toFixed(1)}`);

      // Track highest similarity for potential use in outlandish mode
      if (adjustedSimilarity > highestSimilarity) {
        highestSimilarity = adjustedSimilarity;
        mostSimilarIssue = issue;
        overlapCategories = [...currentTopicData.categories].filter(x =>
          issueTopicData.categories.includes(x)
        );
      }

      // More aggressive similarity threshold for better duplicate detection
      // Different thresholds based on category overlap
      const categoryOverlap = new Set(
        [...currentTopicData.categories].filter(x =>
          issueTopicData.categories.includes(x)
        )
      );

      let similarityThreshold = 0.5; // Default threshold

      // If both issues are about AI + Refactoring, use stricter threshold
      if (
        categoryOverlap.has('AI_INTEGRATION') &&
        categoryOverlap.has('CODE_REFACTORING')
      ) {
        similarityThreshold = 0.4;
      }

      // If both issues are about the same core feature category, use stricter threshold
      if (categoryOverlap.size >= 2) {
        similarityThreshold = 0.45;
      }

      console.log(
        `  Category overlap: ${Array.from(categoryOverlap).join(', ')}`
      );
      console.log(`  Similarity threshold: ${similarityThreshold}`);

      if (adjustedSimilarity > similarityThreshold) {
        console.log(
          `⚠️ Similar issue found: #${issue.number} (adjusted similarity: ${adjustedSimilarity.toFixed(3)}, threshold: ${similarityThreshold})`
        );
        return {
          hasSimilar: true,
          similarityData: {
            highestSimilarity,
            mostSimilarIssue,
            overlapCategories,
            currentCategories: currentTopicData.categories,
            recentIssues: recentIssues.slice(0, 5) // Keep recent issues for context
          }
        };
      }
    }

    console.log('✅ No similar issues found');
    return { hasSimilar: false, similarityData: null };
  } catch (error) {
    console.error('Error checking for existing issues:', error.message);
    // If we can't check, allow creation to be safe
    return { hasSimilar: false, similarityData: null };
  }
}

// Define feature categories for better similarity detection
const FEATURE_CATEGORIES = {
  AI_INTEGRATION: {
    keywords: [
      'ai integration',
      'openai',
      'claude',
      'gemini',
      'machine learning',
      'neural network',
      'artificial intelligence',
      'ai-powered',
      'ai-driven',
      'intelligent',
      'smart',
      'context-aware',
      'llm',
      'language model',
    ],
    weight: 3.0,
  },
  CODE_REFACTORING: {
    keywords: [
      'refactoring',
      'code improvement',
      'code restructuring',
      'code optimization',
      'code quality',
      'code enhancement',
      'code cleanup',
      'code transformation',
      'improve code',
      'optimize code',
      'clean code',
      'code suggestions',
      'code recommendations',
    ],
    weight: 2.5,
  },
  CODE_ANALYSIS: {
    keywords: [
      'code review',
      'static analysis',
      'code analysis',
      'code scanning',
      'code inspection',
      'code validation',
      'code checking',
      'linting',
      'code metrics',
      'quality metrics',
      'complexity analysis',
      'maintainability',
    ],
    weight: 2.0,
  },
  EDITOR_FEATURES: {
    keywords: [
      'monaco editor',
      'code editor',
      'syntax highlighting',
      'autocomplete',
      'intellisense',
      'editor enhancement',
      'text editor',
      'code formatting',
      'editor ui',
      'editor interface',
    ],
    weight: 2.0,
  },
  REAL_TIME_FEATURES: {
    keywords: [
      'real-time analysis',
      'live analysis',
      'real-time updates',
      'instant feedback',
      'live suggestions',
      'real-time processing',
      'continuous analysis',
      'live coding',
      'real-time collaboration',
    ],
    weight: 2.0,
  },
  COLLABORATION: {
    keywords: [
      'collaboration',
      'team features',
      'team collaboration',
      'sharing',
      'collaborative editing',
      'team workflow',
      'team integration',
      'multi-user',
      'shared workspace',
    ],
    weight: 2.0,
  },
  WORKFLOW_INTEGRATION: {
    keywords: [
      'workflow integration',
      'api integration',
      'github integration',
      'version control',
      'pull requests',
      'ci/cd',
      'deployment',
      'automation',
      'pipeline integration',
    ],
    weight: 2.0,
  },
  UI_UX: {
    keywords: [
      'user interface',
      'user experience',
      'ui enhancement',
      'ux improvement',
      'interface design',
      'responsive design',
      'accessibility',
      'usability',
      'frontend',
      'dashboard',
    ],
    weight: 1.5,
  },
  PERFORMANCE: {
    keywords: [
      'performance optimization',
      'scalability',
      'speed improvement',
      'optimization',
      'efficiency',
      'performance enhancement',
      'faster analysis',
      'performance metrics',
    ],
    weight: 1.5,
  },
  SECURITY: {
    keywords: [
      'security scanning',
      'vulnerability detection',
      'security analysis',
      'security features',
      'authentication',
      'authorization',
      'security enhancement',
      'secure coding',
    ],
    weight: 1.5,
  },
};

// Function to extract key topics and categorize them
function extractTopics(text) {
  const topics = new Set();
  const categories = new Set();

  const lowerText = text.toLowerCase();

  // Extract feature categories with weights
  for (const [categoryName, categoryData] of Object.entries(
    FEATURE_CATEGORIES
  )) {
    for (const keyword of categoryData.keywords) {
      if (lowerText.includes(keyword)) {
        topics.add(keyword);
        categories.add(categoryName);
      }
    }
  }

  // Extract feature names from markdown headers (main feature titles)
  const featureHeaders = text.match(/##\s+🎯\s+([^\n]+)/g);
  if (featureHeaders) {
    featureHeaders.forEach(header => {
      const cleanHeader = header.replace(/^##\s+🎯\s+/, '').toLowerCase();
      // Normalize common feature variations
      const normalizedHeader = normalizeFeatureName(cleanHeader);
      topics.add(normalizedHeader);
      // Try to categorize this feature
      for (const [categoryName, categoryData] of Object.entries(
        FEATURE_CATEGORIES
      )) {
        if (categoryData.keywords.some(kw => normalizedHeader.includes(kw))) {
          categories.add(categoryName);
        }
      }
    });
  }

  // Extract feature names from bullet points (secondary features)
  const featureBullets = text.match(/•\s+([^\n]+)/g);
  if (featureBullets) {
    featureBullets.forEach(bullet => {
      const cleanBullet = bullet.replace(/^•\s+/, '').toLowerCase();
      const normalizedBullet = normalizeFeatureName(cleanBullet);
      topics.add(normalizedBullet);
      // Try to categorize this feature
      for (const [categoryName, categoryData] of Object.entries(
        FEATURE_CATEGORIES
      )) {
        if (categoryData.keywords.some(kw => normalizedBullet.includes(kw))) {
          categories.add(categoryName);
        }
      }
    });
  }

  // Extract code-related terms
  const codeTerms = text.match(/`([^`]+)`/g);
  if (codeTerms) {
    codeTerms.forEach(term => {
      const cleanTerm = term.replace(/`/g, '').toLowerCase();
      topics.add(cleanTerm);
    });
  }

  console.log(
    `Extracted ${topics.size} topics and ${categories.size} categories from text`
  );
  return { topics: Array.from(topics), categories: Array.from(categories) };
}

// Function to normalize feature names to catch similar variations
function normalizeFeatureName(featureName) {
  const normalizations = {
    'ai-powered code refactoring': 'code refactoring',
    'ai-driven code refactoring': 'code refactoring',
    'intelligent code refactoring': 'code refactoring',
    'smart code refactoring': 'code refactoring',
    'context-aware code improvement': 'code improvement',
    'ai-powered refactoring': 'refactoring',
    'contextual ai code review': 'code review',
    'ai code review assistant': 'code review',
    'contextual ai-powered feedback': 'feedback system',
    'ai-powered code improvement': 'code improvement',
  };

  for (const [variation, normalized] of Object.entries(normalizations)) {
    if (featureName.includes(variation)) {
      return normalized;
    }
  }

  return featureName;
}

// Function to categorize a feature based on its name
function categorizeFeature(featureName) {
  if (featureName.includes('refactor')) return 'CODE_REFACTORING';
  if (
    featureName.includes('ai') ||
    featureName.includes('intelligent') ||
    featureName.includes('smart')
  )
    return 'AI_INTEGRATION';
  if (featureName.includes('review') || featureName.includes('analysis'))
    return 'CODE_ANALYSIS';
  if (featureName.includes('editor')) return 'EDITOR_FEATURES';
  if (featureName.includes('collaboration') || featureName.includes('team'))
    return 'COLLABORATION';
  if (featureName.includes('real-time') || featureName.includes('live'))
    return 'REAL_TIME_FEATURES';
  if (featureName.includes('ui') || featureName.includes('interface'))
    return 'UI_UX';
  if (
    featureName.includes('performance') ||
    featureName.includes('optimization')
  )
    return 'PERFORMANCE';
  if (featureName.includes('security')) return 'SECURITY';
  return null;
}

// Function to calculate similarity between two topic extractions
function calculateSimilarity(topicData1, topicData2) {
  if (!topicData1 || !topicData2) {
    return 0;
  }

  // Calculate category-based similarity (most important)
  const categorySimilarity = calculateCategorySimilarity(
    topicData1.categories,
    topicData2.categories
  );

  // Calculate topic-based similarity (traditional approach)
  const topicSimilarity = calculateTopicSimilarity(
    topicData1.topics,
    topicData2.topics
  );

  // Calculate weighted similarity
  // Category similarity is more important for detecting feature overlap
  const weightedSimilarity = categorySimilarity * 0.7 + topicSimilarity * 0.3;

  return weightedSimilarity;
}

// Function to calculate similarity based on feature categories
function calculateCategorySimilarity(categories1, categories2) {
  if (categories1.length === 0 || categories2.length === 0) {
    return 0;
  }

  const set1 = new Set(categories1);
  const set2 = new Set(categories2);

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  let similarityScore = intersection.size / union.size;

  // Apply category-specific weights
  // If both issues are in high-weight categories (like AI_INTEGRATION + CODE_REFACTORING),
  // they are more likely to be duplicates
  let weightMultiplier = 1.0;
  const highImpactOverlap = [...intersection].filter(
    category =>
      FEATURE_CATEGORIES[category] && FEATURE_CATEGORIES[category].weight >= 2.0
  );

  if (highImpactOverlap.length > 0) {
    weightMultiplier = 1.0 + highImpactOverlap.length * 0.2;
  }

  return Math.min(similarityScore * weightMultiplier, 1.0);
}

// Function to calculate traditional topic similarity
function calculateTopicSimilarity(topics1, topics2) {
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
  return await generateSuggestionsWithRetry(repoInfo, analysis, fileContents, 0, null);
}

// Function to generate outlandish suggestions when similarity is detected
async function generateOutlandishSuggestions(repoInfo, analysis, fileContents, similarityData) {
  console.log('🎭 Generating OUTLANDISH suggestions to avoid similarity...');
  
  // Build a list of categories and topics to explicitly avoid
  const avoidCategories = similarityData.overlapCategories;
  const recentTitles = similarityData.recentIssues.map(issue => issue.title);
  
  console.log('Categories to avoid:', avoidCategories);
  console.log('Recent titles to avoid similarity with:', recentTitles);

  // Create an extremely diverse, outlandish prompt
  const prompt = `
You are an avant-garde software innovation expert specializing in RADICAL, UNCONVENTIONAL developer experiences. You are analyzing the "recursive-site" repository, which is an AI Code Review Tool.

**CRITICAL CONSTRAINT - AVOID THESE OVER-SUGGESTED CATEGORIES:**
❌ ABSOLUTELY DO NOT suggest anything related to: ${avoidCategories.join(', ')}
❌ AVOID anything similar to these recent suggestions: ${recentTitles.join('; ')}

**RECENT ISSUES HAVE BEEN TOO FOCUSED ON:**
- AI-powered code refactoring and improvement
- Context-aware code analysis
- Smart code suggestions
- Performance optimization
- Basic AI integration

**YOUR MISSION: BE RADICALLY DIFFERENT**
Generate ONE completely OUTLANDISH, UNCONVENTIONAL feature that would make developers say "WOW, I've never seen that before!" Focus on something that:

1. **BREAKS CONVENTIONAL PATTERNS**: Not typical code review/analysis features
2. **USES CUTTING-EDGE TECH**: AR/VR, blockchain, IoT, quantum, biometrics, voice, gesture control, etc.
3. **CREATES EMOTIONAL CONNECTION**: Gaming, social, creative, artistic, musical elements
4. **SOLVES UNIQUE PROBLEMS**: Developer wellness, environmental impact, accessibility in new ways
5. **IS GENUINELY INNOVATIVE**: Something that would get featured in tech blogs as "revolutionary"

**CHOOSE ONE RADICALLY DIFFERENT FOCUS AREA:**
- 🎮 **Gamification & Developer Engagement**: Achievement systems, multiplayer coding, code battles
- 🌱 **Environmental & Sustainability**: Carbon footprint tracking, green coding metrics, eco-friendly development
- 🎨 **Creative & Artistic**: Code visualization as art, musical code composition, creative coding tools
- 🧠 **Developer Wellness**: Mental health tracking, break reminders, stress monitoring, mindfulness
- 🌍 **Social & Community**: Developer networking, mentorship matching, knowledge sharing platforms
- 🔮 **Futuristic Interfaces**: Voice coding, gesture control, AR/VR development environments
- 🎵 **Audio & Music**: Code sonification, music-based programming, audio feedback systems
- 📊 **Data Visualization**: 3D code visualization, interactive code maps, immersive analytics
- 🤖 **AI Personality**: AI companion, emotional AI feedback, personalized AI coaching
- 🔒 **Privacy & Security**: Blockchain code verification, decentralized development, privacy-first tools
- 🏥 **Accessibility & Inclusion**: Disability-friendly coding tools, inclusive design features
- 🚀 **Space & Sci-Fi**: Cosmic themes, space exploration metaphors, futuristic interfaces

**REPOSITORY CONTEXT:**
This tool currently has basic code analysis and editing. Transform it into something UNPRECEDENTED.

**TECHNICAL CONSTRAINTS:**
- Must be technically feasible with current technology
- Should integrate with the existing Next.js/TypeScript stack
- Can use external APIs, services, or hardware
- Implementation should be 1-3 weeks of work

**OUTPUT FORMAT:**
Use this exact format:

# 🚀 AI Code Review Tool - OUTLANDISH Feature Suggestion

## 🎯 [Completely Unique Feature Name]

**Revolutionary Impact:** [Describe how this changes everything about developer experience]

**Technical Implementation:**
[Detailed technical approach using genuinely innovative technologies]

**Code Example:**
\`\`\`javascript
// Include futuristic/innovative code snippet
\`\`\`

**Integration Points:**
- [How it transforms existing features]
- [Required cutting-edge changes]

**Why This Is Groundbreaking:**
[Explain why this has never been done before and why it's revolutionary]

**Priority:** High - [Justification for why this unconventional approach is valuable]

**Implementation Steps:**
1. [Revolutionary step 1]
2. [Innovative step 2] 
3. [Groundbreaking step 3]

Make this so innovative and different that it would be impossible to confuse with any existing code review tool feature!
`;

  // Check token usage before making API call
  const estimatedTokens = estimateTokens(prompt);
  console.log(`📊 Estimated tokens for OUTLANDISH prompt: ${estimatedTokens}`);

  if (estimatedTokens > MAX_TOKENS) {
    console.error(
      `❌ Prompt too large (${estimatedTokens} tokens > ${MAX_TOKENS} limit)`
    );
    return null;
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a visionary software architect who creates REVOLUTIONARY, UNPRECEDENTED features that no one has ever thought of before. You specialize in breaking conventions and creating genuinely innovative developer experiences that combine technology, creativity, and human psychology in unexpected ways.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 1.2, // Maximum creativity for truly outlandish ideas
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      'Error calling OpenAI API for outlandish suggestions:',
      error.response?.data || error.message
    );
    return null;
  }
}

// Main suggestion generation with retry logic
async function generateSuggestionsWithRetry(repoInfo, analysis, fileContents, retryCount = 0, lastSimilarityData = null) {
  const maxRetries = 2;
  
  console.log(`🎯 Generating suggestions (attempt ${retryCount + 1}/${maxRetries + 1})`);

  let suggestions;
  
  // If we have similarity data from a previous attempt, go straight to outlandish mode
  if (lastSimilarityData) {
    suggestions = await generateOutlandishSuggestions(repoInfo, analysis, fileContents, lastSimilarityData);
  } else {
    suggestions = await generateNormalSuggestions(repoInfo, analysis, fileContents);
  }

  if (!suggestions) {
    console.log('❌ Failed to generate suggestions');
    return null;
  }

  // Check for similarity
  console.log('🔍 Checking for existing similar issues...');
  const { hasSimilar, similarityData } = await checkForExistingIssues(suggestions);

  if (!hasSimilar) {
    console.log('✅ Suggestions are unique!');
    return suggestions;
  }

  // If we found similarity and haven't exhausted retries, try again with outlandish mode
  if (retryCount < maxRetries) {
    console.log(`🔄 Similarity detected, retrying with more outlandish approach (retry ${retryCount + 1}/${maxRetries})`);
    return await generateSuggestionsWithRetry(repoInfo, analysis, fileContents, retryCount + 1, similarityData);
  }

  // If we've exhausted retries, return the outlandish suggestions anyway
  console.log('⚠️ Exhausted retries, but proceeding with outlandish suggestions to ensure novelty');
  return suggestions;
}

// Original suggestion generation (now renamed)
async function generateNormalSuggestions(repoInfo, analysis, fileContents) {
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
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([ext, count]) => `${ext}:${count}`)
    .join(', ')}
- Key files analyzed: ${Object.keys(fileContents).join(', ')}

**CURRENT FEATURES DETECTED:**
${Object.entries(analysis.currentFeatures)
  .map(
    ([feature, enabled]) =>
      `- ${feature}: ${enabled ? '✅ Implemented' : '❌ Not implemented'}`
  )
  .join('\n')}

**EXISTING ROADMAP ITEMS:**
${analysis.roadmap.length > 0 ? analysis.roadmap.map(item => `- ${item}`).join('\n') : '- No explicit roadmap items found'}

**IMPORTANT: AVOID THESE OVER-SUGGESTED FEATURES:**
Recent AI suggestions have been too focused on similar themes. Please ACTIVELY AVOID suggesting features that are primarily about:
- AI-powered code refactoring (already suggested many times)
- General AI code review assistance 
- Basic code improvement suggestions
- Simple OpenAI API integration for code analysis
- Context-aware code suggestions
- Smart refactoring tools

**SEEK TRULY DIVERSE AREAS - Choose from UNDEREXPLORED categories:**
- Advanced developer analytics and workflow insights
- Team collaboration and knowledge sharing platforms
- Code security and vulnerability detection systems
- Performance monitoring and optimization dashboards
- Developer onboarding and learning assistance tools
- Project management and workflow automation
- Code documentation and API generation systems
- Testing and quality assurance automation
- Multi-repository and enterprise features
- Developer productivity and time tracking
- Code deployment and infrastructure management
- Custom plugin and extension systems
- Developer wellness and experience features
- Social coding and community features
- Creative coding and visualization tools

**CURRENT TECH STACK (from analysis):**
${Object.entries(fileContents)
  .map(([file, content]) => {
    if (file === 'package.json') {
      return `- Frontend: Next.js, React, TypeScript, TailwindCSS, Monaco Editor`;
    }
    if (file === 'README.md') {
      return `- Core Features: Multi-language support, real-time analysis, quality scoring, improvement suggestions`;
    }
    return '';
  })
  .filter(Boolean)
  .join('\n')}

**YOUR TASK:**
Generate ONE UNIQUE, DIVERSE feature suggestion that would transform this basic code review tool into a professional-grade AI development platform. Focus on a feature that is:

1. **Innovative & Cutting-edge**: Use latest AI technologies and modern development practices
2. **Unique & Diverse**: NOT about basic code refactoring or simple AI code review
3. **High-impact**: A feature that would make developers choose this over other tools
4. **Technically feasible**: Can be implemented with current technology stack
5. **Progressive**: Build upon existing features rather than replacing them
6. **Professional-grade**: A feature you'd expect in a commercial product
7. **Discrete**: A single, focused problem that can be solved independently

**DIVERSE FOCUS AREAS (choose ONE unique area):**
- Advanced developer analytics and insights
- Team collaboration and knowledge sharing
- Code security and vulnerability detection
- Performance monitoring and optimization
- Developer onboarding and learning assistance
- Project management and workflow automation
- Code documentation and API generation
- Testing and quality assurance automation
- Multi-repository and enterprise features
- Developer productivity and time tracking
- Code deployment and infrastructure management
- Custom plugin and extension system

**REQUIREMENTS:**
- The suggestion should be a significant feature (1-3 weeks implementation)
- Include specific technical implementation details
- Provide code examples where relevant
- Consider existing codebase and build upon it
- Focus on a feature that would drive user adoption
- Make it a single, discrete improvement that stands alone
- BE CREATIVE and suggest something NOT commonly seen in other code review tools

**OUTPUT FORMAT:**
Use this exact format:

# 🚀 AI Code Review Tool - Feature Suggestion

## 🎯 [Feature Name]

**Impact:** [Brief description of the unique value this brings to developers]

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

Make this suggestion exciting, innovative, and DIFFERENT from typical code review features!
`;

  // Check token usage before making API call
  const estimatedTokens = estimateTokens(prompt);
  console.log(`📊 Estimated tokens for prompt: ${estimatedTokens}`);

  if (estimatedTokens > MAX_TOKENS) {
    console.error(
      `❌ Prompt too large (${estimatedTokens} tokens > ${MAX_TOKENS} limit)`
    );
    return null;
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a senior software architect and AI specialist who creates detailed, innovative, and DIVERSE feature suggestions for developer tools. You avoid suggesting repetitive features and focus on unique, cutting-edge capabilities that would genuinely excite developers and differentiate the tool from competitors.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 1.0, // Increased temperature for more creative, diverse suggestions
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      'Error calling OpenAI API:',
      error.response?.data || error.message
    );
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

  console.log(
    `📊 Found ${analysis.totalFiles} files and ${analysis.totalDirectories} directories`
  );
  console.log(`📁 Top-level items: ${analysis.topLevelItems.length}`);
  console.log(`📄 File types found: ${Object.keys(analysis.fileTypes).length}`);
  console.log(
    `🎯 Current features detected: ${Object.entries(features)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(', ')}`
  );
  console.log(`🗺️ Roadmap items found: ${roadmap.length}`);

  // Generate suggestions with enhanced context
  console.log('🤖 Generating AI-powered feature suggestion...');

  // Add feature and roadmap context to the analysis
  const enhancedAnalysis = {
    ...analysis,
    currentFeatures: features,
    roadmap: roadmap,
  };

  const suggestions = await generateSuggestions(
    repoInfo,
    enhancedAnalysis,
    fileContents
  );

  if (suggestions) {
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
