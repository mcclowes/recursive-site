'use client';

import { useEffect, useState } from 'react';

interface DocumentationItem {
  id: string;
  title: string;
  url: string;
  type: 'documentation' | 'tutorial' | 'example' | 'discussion';
  source: 'MDN' | 'Stack Overflow' | 'GitHub' | 'Official Docs' | 'Community' | 'AI Generated';
  relevanceScore: number;
  summary: string;
  codeExample?: string;
  tags: string[];
}

interface DocumentationSidebarProps {
  selectedCode: string;
  language: string;
  onDocumentationLoad?: (docs: DocumentationItem[]) => void;
}

const DocumentationSidebar = ({ selectedCode, language, onDocumentationLoad }: DocumentationSidebarProps) => {
  const [docs, setDocs] = useState<DocumentationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadDocs = async () => {
      if (!selectedCode.trim() || selectedCode.length < 10) {
        setDocs([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/analyze/documentation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            selectedCode, 
            language,
            context: {}
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch documentation');
        }

        const data = await response.json();
        const fetchedDocs = data.documentation || [];
        setDocs(fetchedDocs);
        onDocumentationLoad?.(fetchedDocs);
      } catch (err) {
        console.error('Error fetching documentation:', err);
        setError('Failed to load documentation');
        setDocs([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(loadDocs, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedCode, language, onDocumentationLoad]);

  const toggleExpanded = (docId: string) => {
    setExpandedDocs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'documentation':
        return '📚';
      case 'tutorial':
        return '🎓';
      case 'example':
        return '💡';
      case 'discussion':
        return '💬';
      default:
        return '📄';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'MDN':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'Stack Overflow':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      case 'GitHub':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
      case 'Official Docs':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'AI Generated':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400';
    if (score >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="documentation-sidebar h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📖</span>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Related Documentation
        </h2>
      </div>
      
      {!selectedCode.trim() && (
        <div className="flex-1 flex items-center justify-center text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm">
              Select some code in the editor to see relevant documentation and resources
            </p>
          </div>
        </div>
      )}

      {selectedCode.trim() && selectedCode.length < 10 && (
        <div className="flex-1 flex items-center justify-center text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-sm">
              Select more code to get better documentation suggestions
            </p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-sm">Loading documentation...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <span>⚠️</span>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {!isLoading && !error && docs.length === 0 && selectedCode.trim().length >= 10 && (
        <div className="flex-1 flex items-center justify-center text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">🤔</div>
            <p className="text-sm">
              No relevant documentation found for the selected code
            </p>
          </div>
        </div>
      )}

      {docs.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-3">
          {docs.map(doc => (
            <div
              key={doc.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-2">
                <span className="text-lg flex-shrink-0">{getTypeIcon(doc.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSourceColor(doc.source)}`}>
                      {doc.source}
                    </span>
                    <span className={`text-xs font-medium ${getRelevanceColor(doc.relevanceScore)}`}>
                      {Math.round(doc.relevanceScore * 100)}% match
                    </span>
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm line-clamp-2 block"
                  >
                    {doc.title}
                  </a>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                {doc.summary}
              </p>

              {doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {doc.tags.slice(0, 4).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {doc.tags.length > 4 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                      +{doc.tags.length - 4} more
                    </span>
                  )}
                </div>
              )}

              {doc.codeExample && (
                <div>
                  <button
                    onClick={() => toggleExpanded(doc.id)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mb-2"
                  >
                    {expandedDocs.has(doc.id) ? '▼' : '▶'}
                    {expandedDocs.has(doc.id) ? 'Hide' : 'Show'} code example
                  </button>
                  {expandedDocs.has(doc.id) && (
                    <div className="bg-gray-900 dark:bg-gray-700 rounded p-3 text-sm text-green-400 font-mono overflow-x-auto">
                      <pre>{doc.codeExample}</pre>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>📖</span>
                  Read more
                  <span>↗</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentationSidebar;