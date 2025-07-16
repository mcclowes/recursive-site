import { useState } from 'react';

interface BenchmarkResult {
  executionTime: number;
  memoryUsage: number;
  iterations: number;
  avgTimePerIteration: number;
}

interface CodeMetrics {
  cyclomaticComplexity: number;
  linesOfCode: number;
  cognitiveComplexity: number;
  maintainabilityIndex: number;
}

interface PerformanceInsights {
  benchmark: BenchmarkResult;
  metrics: CodeMetrics;
  suggestions: string[];
  score: number;
}

interface PerformanceDashboardProps {
  code: string;
  language: string;
}

export default function PerformanceDashboard({ code, language }: PerformanceDashboardProps) {
  const [insights, setInsights] = useState<PerformanceInsights | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const runBenchmark = async () => {
    if (!code.trim()) return;
    
    setIsBenchmarking(true);
    try {
      const response = await fetch('/api/benchmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setInsights(data.results);
        setIsExpanded(true);
      }
    } catch (error) {
      console.error('Benchmark error:', error);
    } finally {
      setIsBenchmarking(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Performance Insights
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            📊 Benchmark & Analysis
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runBenchmark}
            disabled={isBenchmarking || !code.trim()}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm rounded-md transition-colors"
          >
            {isBenchmarking ? 'Analyzing...' : '🚀 Benchmark'}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {insights ? (
            <div className="space-y-4">
              {/* Performance Score */}
              <div className="text-center">
                <div className={`inline-block px-4 py-2 rounded-lg ${getScoreBackground(insights.score)}`}>
                  <div className={`text-2xl font-bold ${getScoreColor(insights.score)}`}>
                    {insights.score}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Performance Score</div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Execution Time</div>
                  <div className="text-lg font-semibold text-gray-800 dark:text-white">
                    {insights.benchmark.executionTime.toFixed(2)}ms
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Memory Usage</div>
                  <div className="text-lg font-semibold text-gray-800 dark:text-white">
                    {insights.benchmark.memoryUsage}KB
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Complexity</div>
                  <div className="text-lg font-semibold text-gray-800 dark:text-white">
                    {insights.metrics.cyclomaticComplexity}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Maintainability</div>
                  <div className="text-lg font-semibold text-gray-800 dark:text-white">
                    {insights.metrics.maintainabilityIndex.toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Code Metrics</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Lines of Code:</span>
                      <span className="font-mono">{insights.metrics.linesOfCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cognitive Complexity:</span>
                      <span className="font-mono">{insights.metrics.cognitiveComplexity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Time/Iteration:</span>
                      <span className="font-mono">{insights.benchmark.avgTimePerIteration.toFixed(6)}ms</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Performance Chart</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">Execution</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(insights.benchmark.executionTime * 10, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">Memory</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(insights.benchmark.memoryUsage / 2, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">Complexity</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(insights.metrics.cyclomaticComplexity * 5, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Suggestions */}
              {insights.suggestions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                    Performance Suggestions ({insights.suggestions.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {insights.suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-400"
                      >
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {suggestion}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm">
                Click &quot;Benchmark&quot; to analyze performance
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}