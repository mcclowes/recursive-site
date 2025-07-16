import { useEffect, useState } from 'react';

interface Suggestion {
  type: 'warning' | 'info' | 'suggestion' | 'success';
  message: string;
  line: number;
}

interface RealtimeSuggestionsProps {
  suggestions: Suggestion[];
  isConnected: boolean;
}

export default function RealtimeSuggestions({ suggestions, isConnected }: RealtimeSuggestionsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

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

  const getTypeCount = (type: string) => {
    return suggestions.filter(s => s.type === type).length;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Real-time Suggestions
          </h3>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <>
          {suggestions.length > 0 ? (
            <>
              {/* Summary counts */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded">
                  <div className="text-yellow-600 dark:text-yellow-400 font-semibold">
                    {getTypeCount('warning')}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Warnings</div>
                </div>
                <div className="text-center p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                  <div className="text-blue-600 dark:text-blue-400 font-semibold">
                    {getTypeCount('info')}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Info</div>
                </div>
                <div className="text-center p-2 bg-purple-100 dark:bg-purple-900/20 rounded">
                  <div className="text-purple-600 dark:text-purple-400 font-semibold">
                    {getTypeCount('suggestion')}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Suggestions</div>
                </div>
                <div className="text-center p-2 bg-green-100 dark:bg-green-900/20 rounded">
                  <div className="text-green-600 dark:text-green-400 font-semibold">
                    {getTypeCount('success')}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Success</div>
                </div>
              </div>

              {/* Suggestions list */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg border-l-4 ${getSuggestionColor(suggestion.type)} animate-fade-in`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-sm">{getSuggestionIcon(suggestion.type)}</span>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Line {suggestion.line}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {suggestion.message}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-2xl mb-2">🔍</div>
              <div className="text-sm">
                Start typing to see real-time suggestions
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}