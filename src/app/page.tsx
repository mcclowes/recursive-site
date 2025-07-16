'use client';

import { useState } from 'react';
import SimpleCodeEditor from '@/components/SimpleCodeEditor';
import toast, { Toaster } from 'react-hot-toast';

interface Suggestion {
  type: 'warning' | 'info' | 'suggestion' | 'success';
  message: string;
  line: number;
}

interface Analysis {
  score: number;
  suggestions: Suggestion[];
  metrics: {
    lines: number;
    characters: number;
    complexity: number;
    maintainability: string;
  };
}

const SAMPLE_CODE = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log('Fibonacci result:', result);`;

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
];

export default function Home() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [language, setLanguage] = useState('javascript');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeCode = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze code');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      toast.success('Code analyzed successfully!');
    } catch (error) {
      toast.error('Failed to analyze code');
      console.error('Error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'suggestion': return '💡';
      case 'success': return '✅';
      default: return '📝';
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'info': return 'border-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'suggestion': return 'border-purple-400 bg-purple-50 dark:bg-purple-900/20';
      case 'success': return 'border-green-400 bg-green-50 dark:bg-green-900/20';
      default: return 'border-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              🚀 AI Code Review Tool
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Get instant AI-powered code analysis and improvement suggestions
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Code Editor Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Code Editor
                </h2>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <SimpleCodeEditor
                  value={code}
                  onChange={setCode}
                  language={language}
                  height="400px"
                />
              </div>

              <button
                onClick={analyzeCode}
                disabled={isAnalyzing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    🔍 Analyze Code
                  </>
                )}
              </button>
            </div>

            {/* Analysis Results Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Analysis Results
              </h2>

              {analysis ? (
                <div className="space-y-6">
                  {/* Score */}
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {analysis.score}%
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">Code Quality Score</div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Lines</div>
                      <div className="text-lg font-semibold text-gray-800 dark:text-white">
                        {analysis.metrics.lines}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Complexity</div>
                      <div className="text-lg font-semibold text-gray-800 dark:text-white">
                        {analysis.metrics.complexity}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Characters</div>
                      <div className="text-lg font-semibold text-gray-800 dark:text-white">
                        {analysis.metrics.characters}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Maintainability</div>
                      <div className="text-lg font-semibold text-gray-800 dark:text-white">
                        {analysis.metrics.maintainability}
                      </div>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                      Suggestions ({analysis.suggestions.length})
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {analysis.suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border-l-4 ${getSuggestionColor(suggestion.type)}`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-800 dark:text-white">
                                Line {suggestion.line}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">
                                {suggestion.message}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Enter your code and click &quot;Analyze Code&quot; to get started
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
              Features
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                  Instant Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Get immediate feedback on your code quality and structure
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">💡</div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                  Smart Suggestions
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Receive actionable recommendations to improve your code
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                  Multiple Languages
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Support for JavaScript, TypeScript, Python, Java, and more
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
