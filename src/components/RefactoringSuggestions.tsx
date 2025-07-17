'use client';

import { useState } from 'react';

interface RefactoringSuggestion {
  id: string;
  title: string;
  description: string;
  reasoning: string;
  type: string;
  complexity: string;
  impact: string;
  beforeCode: string;
  afterCode: string;
  line: number;
  estimatedTime: string;
  isApplicable: boolean;
  category: string;
}

interface RefactoringSuggestionsProps {
  suggestions: RefactoringSuggestion[];
  onApplySuggestion?: (suggestion: RefactoringSuggestion) => void;
  onDismissSuggestion?: (suggestionId: string) => void;
}

export default function RefactoringSuggestions({
  suggestions,
  onApplySuggestion,
  onDismissSuggestion,
}: RefactoringSuggestionsProps) {
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(
    new Set()
  );
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(
    new Set()
  );
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(
    new Set()
  );

  const toggleExpansion = (suggestionId: string) => {
    setExpandedSuggestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(suggestionId)) {
        newSet.delete(suggestionId);
      } else {
        newSet.add(suggestionId);
      }
      return newSet;
    });
  };

  const handleApply = (suggestion: RefactoringSuggestion) => {
    setAppliedSuggestions(prev => new Set([...prev, suggestion.id]));
    onApplySuggestion?.(suggestion);
  };

  const handleDismiss = (suggestionId: string) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
    onDismissSuggestion?.(suggestionId);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
      case 'medium':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      case 'high':
        return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
      default:
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'extract-method':
        return '🔧';
      case 'extract-class':
        return '📦';
      case 'extract-constant':
        return '🔤';
      case 'apply-pattern':
        return '🎯';
      case 'optimize-algorithm':
        return '⚡';
      case 'improve-naming':
        return '✍️';
      case 'reduce-complexity':
        return '🧩';
      case 'refactor-logging':
        return '📝';
      default:
        return '🔄';
    }
  };

  const visibleSuggestions = suggestions.filter(
    suggestion => !dismissedSuggestions.has(suggestion.id)
  );

  if (visibleSuggestions.length === 0) {
    return (
      <div className='text-center py-8'>
        <div className='text-gray-400 dark:text-gray-500 mb-2'>
          <svg
            className='w-12 h-12 mx-auto'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M13 10V3L4 14h7v7l9-11h-7z'
            />
          </svg>
        </div>
        <p className='text-gray-600 dark:text-gray-300 text-sm'>
          No refactoring suggestions available for this code
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2'>
          <span className='text-2xl'>🔄</span>
          Intelligent Refactoring Suggestions ({visibleSuggestions.length})
        </h3>
        {appliedSuggestions.size > 0 && (
          <div className='flex items-center gap-1 text-sm text-green-600 dark:text-green-400'>
            <span>✅ {appliedSuggestions.size} applied</span>
          </div>
        )}
      </div>

      {visibleSuggestions.map(suggestion => (
        <div
          key={suggestion.id}
          className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 ${
            appliedSuggestions.has(suggestion.id)
              ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20'
              : ''
          }`}
        >
          {/* Header */}
          <div className='flex items-start justify-between mb-4'>
            <div className='flex items-start gap-3 flex-1'>
              <span className='text-2xl mt-1'>{getTypeIcon(suggestion.type)}</span>
              <div className='flex-1'>
                <h4 className='text-lg font-semibold text-gray-800 dark:text-white mb-2'>
                  {suggestion.title}
                </h4>
                <p className='text-sm text-gray-600 dark:text-gray-300 mb-3'>
                  {suggestion.description}
                </p>
                
                {/* Metadata */}
                <div className='flex flex-wrap items-center gap-2 mb-3'>
                  <span className='text-xs font-medium text-gray-500 dark:text-gray-400'>
                    Line {suggestion.line}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getComplexityColor(suggestion.complexity)}`}>
                    {suggestion.complexity} complexity
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getImpactColor(suggestion.impact)}`}>
                    {suggestion.impact} impact
                  </span>
                  <span className='px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full'>
                    {suggestion.estimatedTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className='flex items-center gap-2 ml-4'>
              {!appliedSuggestions.has(suggestion.id) && (
                <>
                  <button
                    onClick={() => handleApply(suggestion)}
                    className='px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'
                  >
                    Apply Refactoring
                  </button>
                  <button
                    onClick={() => handleDismiss(suggestion.id)}
                    className='px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors'
                  >
                    Dismiss
                  </button>
                </>
              )}
              {appliedSuggestions.has(suggestion.id) && (
                <span className='px-3 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-md'>
                  ✅ Applied
                </span>
              )}
            </div>
          </div>

          {/* Reasoning */}
          <div className='mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800'>
            <h5 className='text-sm font-medium text-blue-800 dark:text-blue-200 mb-1'>
              Why this refactoring helps:
            </h5>
            <p className='text-sm text-blue-700 dark:text-blue-300'>
              {suggestion.reasoning}
            </p>
          </div>

          {/* Code comparison */}
          <div className='mb-4'>
            <button
              onClick={() => toggleExpansion(suggestion.id)}
              className='flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-3'
            >
              {expandedSuggestions.has(suggestion.id) ? '▼' : '▶'}
              {expandedSuggestions.has(suggestion.id) ? 'Hide' : 'Show'} before/after code
            </button>

            {expandedSuggestions.has(suggestion.id) && (
              <div className='grid md:grid-cols-2 gap-4'>
                {/* Before */}
                <div>
                  <h6 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2'>
                    <span className='text-red-500'>❌</span>
                    Before
                  </h6>
                  <div className='bg-gray-900 dark:bg-gray-700 rounded-md p-4 text-sm overflow-x-auto'>
                    <pre className='text-red-300'>
                      <code>{suggestion.beforeCode}</code>
                    </pre>
                  </div>
                </div>

                {/* After */}
                <div>
                  <h6 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2'>
                    <span className='text-green-500'>✅</span>
                    After
                  </h6>
                  <div className='bg-gray-900 dark:bg-gray-700 rounded-md p-4 text-sm overflow-x-auto'>
                    <pre className='text-green-300'>
                      <code>{suggestion.afterCode}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}