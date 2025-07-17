#!/usr/bin/env node

/**
 * Test script to verify the improved similarity detection
 */

const fs = require('fs');
const path = require('path');

// Read the actual functions from generate-suggestions.js
const scriptPath = path.join(__dirname, '../.github/scripts/generate-suggestions.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Extract only the functions we need for testing
const extractRequiredFunctions = (content) => {
  const functions = [];
  
  // Extract FEATURE_CATEGORIES
  const featureCategoriesMatch = content.match(/const FEATURE_CATEGORIES = \{[\s\S]*?\n\};/);
  if (featureCategoriesMatch) {
    functions.push(featureCategoriesMatch[0]);
  }
  
  // Extract helper functions
  const helperFunctions = [
    'function normalizeFeatureName',
    'function categorizeFeature',
    'function calculateCategorySimilarity',
    'function calculateTopicSimilarity'
  ];
  
  helperFunctions.forEach(funcName => {
    const regex = new RegExp(`${funcName}\\([\\s\\S]*?\\n^\\}`, 'm');
    const match = content.match(regex);
    if (match) {
      functions.push(match[0]);
    }
  });
  
  // Extract main functions
  const mainFunctions = ['extractTopics', 'calculateSimilarity'];
  mainFunctions.forEach(funcName => {
    const regex = new RegExp(`function ${funcName}\\([\\s\\S]*?\\n^\\}`, 'm');
    const match = content.match(regex);
    if (match) {
      functions.push(match[0]);
    }
  });
  
  return functions.join('\n\n');
};

// Test data from actual similar issues
const similarIssues = [
  {
    title: "🚀 Context-Aware Code Improvement Suggestions",
    body: "## 🎯 Context-Aware Code Improvement Suggestions\n\nThis feature leverages the latest AI technologies to provide context-aware code improvement suggestions. By using advanced AI models to analyze not just isolated code snippets but the entire code structure and dependencies, developers receive tailored recommendations that enhance code quality, maintainability, and performance."
  },
  {
    title: "🚀 AI-Powered Code Refactoring Suggestions",
    body: "## 🎯 AI-Powered Code Refactoring Suggestions\n\nThis feature provides intelligent, context-aware code refactoring suggestions using advanced AI models. By analyzing not just the syntax but also the semantics and structure of the code, it offers developers actionable insights on how to improve code readability, performance, and maintainability."
  },
  {
    title: "🚀 Intelligent Code Refactoring Suggestions",
    body: "## 🎯 Intelligent Code Refactoring Suggestions\n\nThis feature will provide developers with AI-driven refactoring suggestions based on detected code smells, anti-patterns, and performance bottlenecks. By utilizing advanced language models (such as OpenAI's Codex or similar), the tool can suggest not only simple improvements but also intricate refactorings."
  }
];

const differentIssues = [
  {
    title: "🚀 Advanced Security Vulnerability Scanner",
    body: "## 🎯 Advanced Security Vulnerability Scanner\n\nThis feature provides comprehensive security analysis and vulnerability detection for multiple programming languages. It integrates with security databases and uses pattern matching to identify potential security issues in code."
  },
  {
    title: "🚀 Developer Performance Analytics Dashboard",
    body: "## 🎯 Developer Performance Analytics Dashboard\n\nThis feature creates a comprehensive analytics dashboard that tracks developer productivity, code quality metrics, and team performance over time. It provides insights into coding patterns, bug rates, and improvement trends."
  }
];

// Create test module with extracted functions
const testModule = `
${extractRequiredFunctions(scriptContent)}

// Export the functions we need
if (typeof module !== 'undefined') {
  module.exports = { extractTopics, calculateSimilarity };
}
`;

// Write to a temporary file and require it
const tempPath = path.join(__dirname, '../tmp/test-similarity.js');
fs.mkdirSync(path.dirname(tempPath), { recursive: true });
fs.writeFileSync(tempPath, testModule);

try {
  const { extractTopics, calculateSimilarity } = require(tempPath);

  console.log('🔍 Testing Similarity Detection with Real Issue Data\n');

  // Test similarity between similar issues
  console.log('=== Testing Similar Issues ===');
  for (let i = 0; i < similarIssues.length; i++) {
    for (let j = i + 1; j < similarIssues.length; j++) {
      const issue1 = similarIssues[i];
      const issue2 = similarIssues[j];
      
      const topics1 = extractTopics(issue1.body);
      const topics2 = extractTopics(issue2.body);
      const similarity = calculateSimilarity(topics1, topics2);
      
      console.log(`📊 "${issue1.title}" vs "${issue2.title}"`);
      console.log(`   Categories 1: ${topics1.categories.join(', ')}`);
      console.log(`   Categories 2: ${topics2.categories.join(', ')}`);
      console.log(`   Similarity: ${similarity.toFixed(3)}`);
      console.log(`   Would be blocked: ${similarity > 0.5 ? '✅ YES' : '❌ NO'}\n`);
    }
  }

  // Test similarity between different issues
  console.log('=== Testing Different Issues ===');
  for (let i = 0; i < differentIssues.length; i++) {
    const differentIssue = differentIssues[i];
    const similarIssue = similarIssues[0]; // Compare with first similar issue
    
    const topics1 = extractTopics(differentIssue.body);
    const topics2 = extractTopics(similarIssue.body);
    const similarity = calculateSimilarity(topics1, topics2);
    
    console.log(`📊 "${differentIssue.title}" vs "${similarIssue.title}"`);
    console.log(`   Categories 1: ${topics1.categories.join(', ')}`);
    console.log(`   Categories 2: ${topics2.categories.join(', ')}`);
    console.log(`   Similarity: ${similarity.toFixed(3)}`);
    console.log(`   Would be blocked: ${similarity > 0.5 ? '✅ YES' : '❌ NO'}\n`);
  }

  console.log('✅ Similarity detection test completed successfully!');

} catch (error) {
  console.error('❌ Error running similarity test:', error);
} finally {
  // Clean up temp file
  if (fs.existsSync(tempPath)) {
    fs.unlinkSync(tempPath);
  }
}