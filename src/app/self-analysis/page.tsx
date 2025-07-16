'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

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

interface ProjectAnalysis {
  files: FileAnalysis[];
  summary: {
    totalFiles: number;
    averageScore: number;
    totalLines: number;
    totalSuggestions: number;
  };
}

export default function SelfAnalysis() {
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileAnalysis | null>(null);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      const response = await fetch('/api/analyze-project');
      if (!response.ok) {
        throw new Error('Failed to fetch analysis');
      }
      const data = await response.json();
      setAnalysis(data);
      toast.success('Project analysis completed!');
    } catch (error) {
      toast.error('Failed to analyze project');
      console.error('Error:', error);
    } finally {
      setLoading(false);
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Analyzing project files...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              🔄 Self-Analysis Report
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Code quality analysis of this project&apos;s own codebase
            </p>
            <Link
              href="/"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Code Editor
            </Link>
          </div>

          {analysis && (
            <>
              {/* Summary Cards */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {analysis.summary.totalFiles}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">Files Analyzed</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 text-center">
                  <div className={`text-3xl font-bold mb-2 ${getScoreColor(analysis.summary.averageScore)}`}>
                    {analysis.summary.averageScore}%
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">Average Score</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {analysis.summary.totalLines}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">Total Lines</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 text-center">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                    {analysis.summary.totalSuggestions}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">Total Suggestions</div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Files List */}
                <div className="lg:col-span-1">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                      Project Files
                    </h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {analysis.files.map((file, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedFile(file)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedFile?.path === file.path
                              ? 'bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-500'
                              : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-800 dark:text-white text-sm">
                                {file.filename}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {file.path}
                              </div>
                            </div>
                            <div className={`text-sm font-bold ${getScoreColor(file.analysis.score)}`}>
                              {file.analysis.score}%
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* File Details */}
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                      File Analysis
                    </h2>

                    {selectedFile ? (
                      <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                            {selectedFile.filename}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            {selectedFile.path}
                          </p>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Quality Score</div>
                              <div className={`text-2xl font-bold ${getScoreColor(selectedFile.analysis.score)}`}>
                                {selectedFile.analysis.score}%
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Maintainability</div>
                              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                                {selectedFile.analysis.metrics.maintainability}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 dark:text-gray-400">Lines</div>
                            <div className="text-lg font-semibold text-gray-800 dark:text-white">
                              {selectedFile.analysis.metrics.lines}
                            </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 dark:text-gray-400">Complexity</div>
                            <div className="text-lg font-semibold text-gray-800 dark:text-white">
                              {selectedFile.analysis.metrics.complexity}
                            </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 dark:text-gray-400">Characters</div>
                            <div className="text-lg font-semibold text-gray-800 dark:text-white">
                              {selectedFile.analysis.metrics.characters}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                            Suggestions ({selectedFile.analysis.suggestions.length})
                          </h3>
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {selectedFile.analysis.suggestions.map((suggestion, index) => (
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                          Select a file from the list to view detailed analysis
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}