/**
 * Tests for the improved similarity detection system
 */

import fs from 'fs';
import path from 'path';

// Mock the functions from generate-suggestions.js
const scriptPath = path.join(
  __dirname,
  '../../.github/scripts/generate-suggestions.js'
);
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Extract the functions we need to test
const extractTopicsFunction = scriptContent.match(
  /function extractTopics\([\s\S]*?\n^}/m
)?.[0];
const featureCategoriesMatch = scriptContent.match(
  /const FEATURE_CATEGORIES = \{[\s\S]*?\n\};/
);

// Create a test module
const testModule = `
${featureCategoriesMatch ? featureCategoriesMatch[0] : ''}

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
    'ai-powered code improvement': 'code improvement'
  };
  
  for (const [variation, normalized] of Object.entries(normalizations)) {
    if (featureName.includes(variation)) {
      return normalized;
    }
  }
  
  return featureName;
}

function categorizeFeature(featureName) {
  if (featureName.includes('refactor')) return 'CODE_REFACTORING';
  if (featureName.includes('ai') || featureName.includes('intelligent') || featureName.includes('smart')) return 'AI_INTEGRATION';
  if (featureName.includes('review') || featureName.includes('analysis')) return 'CODE_ANALYSIS';
  if (featureName.includes('editor')) return 'EDITOR_FEATURES';
  if (featureName.includes('collaboration') || featureName.includes('team')) return 'COLLABORATION';
  if (featureName.includes('real-time') || featureName.includes('live')) return 'REAL_TIME_FEATURES';
  if (featureName.includes('ui') || featureName.includes('interface')) return 'UI_UX';
  if (featureName.includes('performance') || featureName.includes('optimization')) return 'PERFORMANCE';
  if (featureName.includes('security')) return 'SECURITY';
  return null;
}

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
  let weightMultiplier = 1.0;
  const highImpactOverlap = [...intersection].filter(category => 
    FEATURE_CATEGORIES[category] && FEATURE_CATEGORIES[category].weight >= 2.0
  );
  
  if (highImpactOverlap.length > 0) {
    weightMultiplier = 1.0 + (highImpactOverlap.length * 0.2);
  }
  
  return Math.min(similarityScore * weightMultiplier, 1.0);
}

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

${extractTopicsFunction || ''}

function calculateSimilarity(topicData1, topicData2) {
  if (!topicData1 || !topicData2) {
    return 0;
  }
  
  const categorySimilarity = calculateCategorySimilarity(topicData1.categories, topicData2.categories);
  const topicSimilarity = calculateTopicSimilarity(topicData1.topics, topicData2.topics);
  
  const weightedSimilarity = (categorySimilarity * 0.7) + (topicSimilarity * 0.3);
  
  return weightedSimilarity;
}

module.exports = { extractTopics, calculateSimilarity };
`;

// Create test functions
const createTestFunctions = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-function-type
  const tempModule = eval(
    `(function() { ${testModule}; return { extractTopics, calculateSimilarity }; })()`
  ) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  return tempModule;
};

describe('Similarity Detection System', () => {
  let extractTopics: (text: string) => {
    topics: string[];
    categories: string[];
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let calculateSimilarity: (topicData1: any, topicData2: any) => number;

  beforeAll(() => {
    const functions = createTestFunctions();
    extractTopics = functions.extractTopics;
    calculateSimilarity = functions.calculateSimilarity;
  });

  describe('extractTopics', () => {
    it('should extract AI integration topics', () => {
      const text =
        'This feature uses OpenAI API for intelligent code refactoring';
      const result = extractTopics(text);

      expect(result.topics).toContain('openai');
      expect(result.topics).toContain('intelligent');
      expect(result.categories).toContain('AI_INTEGRATION');
      expect(result.categories).toContain('CODE_REFACTORING');
    });

    it('should normalize similar feature names', () => {
      const text1 = '## 🎯 AI-Powered Code Refactoring';
      const text2 = '## 🎯 Intelligent Code Refactoring';
      const text3 = '## 🎯 Smart Code Refactoring';

      const result1 = extractTopics(text1);
      const result2 = extractTopics(text2);
      const result3 = extractTopics(text3);

      // All should contain refactoring-related topics
      expect(result1.topics).toContain('code refactoring');
      expect(result2.topics).toContain('code refactoring');
      expect(result3.topics).toContain('code refactoring');

      // All should be categorized as CODE_REFACTORING
      expect(result1.categories).toContain('CODE_REFACTORING');
      expect(result2.categories).toContain('CODE_REFACTORING');
      expect(result3.categories).toContain('CODE_REFACTORING');
    });

    it('should categorize different types of features', () => {
      const editorText =
        'Monaco Editor enhancement for better syntax highlighting';
      const collaborationText = 'Team collaboration features for shared coding';
      const securityText = 'Security scanning and vulnerability detection';

      const editorResult = extractTopics(editorText);
      const collaborationResult = extractTopics(collaborationText);
      const securityResult = extractTopics(securityText);

      expect(editorResult.categories).toContain('EDITOR_FEATURES');
      expect(collaborationResult.categories).toContain('COLLABORATION');
      expect(securityResult.categories).toContain('SECURITY');
    });
  });

  describe('calculateSimilarity', () => {
    it('should detect high similarity between AI refactoring features', () => {
      const aiRefactoring1 = {
        topics: ['ai integration', 'openai', 'code refactoring', 'intelligent'],
        categories: ['AI_INTEGRATION', 'CODE_REFACTORING'],
      };

      const aiRefactoring2 = {
        topics: ['ai-powered', 'claude', 'refactoring', 'smart'],
        categories: ['AI_INTEGRATION', 'CODE_REFACTORING'],
      };

      const similarity = calculateSimilarity(aiRefactoring1, aiRefactoring2);

      // Should be high similarity due to category overlap
      expect(similarity).toBeGreaterThan(0.6);
    });

    it('should detect low similarity between different feature categories', () => {
      const aiFeature = {
        topics: ['ai integration', 'openai', 'intelligent'],
        categories: ['AI_INTEGRATION'],
      };

      const securityFeature = {
        topics: ['security scanning', 'vulnerability detection'],
        categories: ['SECURITY'],
      };

      const similarity = calculateSimilarity(aiFeature, securityFeature);

      // Should be low similarity due to no category overlap
      expect(similarity).toBeLessThan(0.3);
    });

    it('should handle empty or missing data', () => {
      const validFeature = {
        topics: ['ai integration'],
        categories: ['AI_INTEGRATION'],
      };

      const emptyFeature = {
        topics: [],
        categories: [],
      };

      expect(calculateSimilarity(validFeature, emptyFeature)).toBe(0);
      expect(calculateSimilarity(null, validFeature)).toBe(0);
      expect(calculateSimilarity(undefined, validFeature)).toBe(0);
    });

    it('should weight category similarity higher than topic similarity', () => {
      const feature1 = {
        topics: ['completely', 'different', 'topics'],
        categories: ['AI_INTEGRATION', 'CODE_REFACTORING'],
      };

      const feature2 = {
        topics: ['totally', 'unrelated', 'words'],
        categories: ['AI_INTEGRATION', 'CODE_REFACTORING'],
      };

      const similarity = calculateSimilarity(feature1, feature2);

      // Should still have high similarity due to identical categories
      expect(similarity).toBeGreaterThan(0.5);
    });
  });

  describe('Real-world similarity tests', () => {
    it('should detect similarity between actual similar issues', () => {
      const issue1 = `# 🚀 AI Code Review Tool - Feature Suggestion
## 🎯 AI-Powered Code Refactoring Suggestions
**Impact:** This feature provides intelligent, context-aware code refactoring suggestions using advanced AI models.`;

      const issue2 = `# 🚀 AI Code Review Tool - Feature Suggestion
## 🎯 Intelligent Code Refactoring Suggestions
**Impact:** This feature will provide developers with AI-driven refactoring suggestions based on detected code smells.`;

      const topics1 = extractTopics(issue1);
      const topics2 = extractTopics(issue2);
      const similarity = calculateSimilarity(topics1, topics2);

      // Should detect high similarity
      expect(similarity).toBeGreaterThan(0.7);
    });

    it('should not detect similarity between genuinely different features', () => {
      const aiRefactoringIssue = `# 🚀 AI Code Review Tool - Feature Suggestion
## 🎯 AI-Powered Code Refactoring Suggestions
**Impact:** This feature provides intelligent, context-aware code refactoring suggestions using advanced AI models.`;

      const securityIssue = `# 🚀 AI Code Review Tool - Feature Suggestion
## 🎯 Advanced Security Vulnerability Scanner
**Impact:** This feature provides comprehensive security analysis and vulnerability detection for multiple programming languages.`;

      const topics1 = extractTopics(aiRefactoringIssue);
      const topics2 = extractTopics(securityIssue);
      const similarity = calculateSimilarity(topics1, topics2);

      // Should not detect high similarity
      expect(similarity).toBeLessThan(0.4);
    });
  });
});
