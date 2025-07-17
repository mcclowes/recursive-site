'use client';

import { Editor } from '@monaco-editor/react';
import { useState, useCallback, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

interface ContextualSuggestion {
  id: string;
  type: string;
  message: string;
  explanation: string;
  line: number;
  column: number;
  category: string;
  confidence: number;
  severity: string;
  isInline: boolean;
  actionable: boolean;
  quickFix: string | null;
}

interface EnhancedCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
  enableRealTimeAnalysis?: boolean;
  onSuggestionsChange?: (suggestions: ContextualSuggestion[]) => void;
  onSelectionChange?: (selectedText: string) => void;
}

export default function EnhancedCodeEditor({
  value,
  onChange,
  language,
  height = '400px',
  enableRealTimeAnalysis = true,
  onSuggestionsChange,
  onSelectionChange,
}: EnhancedCodeEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<ContextualSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const editorRef = useRef<unknown>(null);
  const monacoRef = useRef<unknown>(null);
  const decorationsRef = useRef<unknown[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const showSuggestionNotification = (suggestions: ContextualSuggestion[]) => {
    const highPriority = suggestions.filter(
      s => s.severity === 'error' || s.severity === 'warning'
    );
    if (highPriority.length > 0) {
      toast.success(
        `💡 ${highPriority.length} new contextual suggestion${highPriority.length > 1 ? 's' : ''} available!`,
        {
          duration: 3000,
          position: 'top-right',
        }
      );
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'error':
        return '#ff5555';
      case 'warning':
        return '#ffbb33';
      case 'info':
        return '#3399ff';
      case 'hint':
        return '#50fa7b';
      default:
        return '#3399ff';
    }
  };

  const updateEditorDecorations = useCallback(
    (suggestions: ContextualSuggestion[]) => {
      if (!editorRef.current || !monacoRef.current) return;

      const editor = editorRef.current as {
        deltaDecorations: (
          prev: unknown[],
          decorations: unknown[]
        ) => unknown[];
      };
      const monaco = monacoRef.current as {
        Range: new (
          startLine: number,
          startColumn: number,
          endLine: number,
          endColumn: number
        ) => unknown;
      };

      const decorations = suggestions.map(suggestion => {
        return {
          range: new monaco.Range(
            suggestion.line,
            suggestion.column,
            suggestion.line,
            suggestion.column + 10
          ),
          options: {
            isWholeLine: false,
            className: `suggestion-decoration ${suggestion.severity}`,
            glyphMarginClassName: `suggestion-glyph ${suggestion.severity}`,
            hoverMessage: {
              value: `${suggestion.message}\n\n${suggestion.explanation}`,
            },
            minimap: {
              color: getSeverityColor(suggestion.severity),
              position: 1,
            },
            overviewRuler: {
              color: getSeverityColor(suggestion.severity),
              position: 1,
            },
          },
        };
      });

      // Clear previous decorations and add new ones
      decorationsRef.current = editor.deltaDecorations(
        decorationsRef.current,
        decorations
      );
    },
    []
  );

  // Debounced function to fetch contextual suggestions
  const fetchContextualSuggestions = useCallback(
    async (code: string) => {
      if (!code.trim() || !enableRealTimeAnalysis) return;

      setIsAnalyzing(true);
      try {
        const response = await fetch('/api/analyze/suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, language }),
        });

        if (!response.ok) {
          throw new Error('Failed to get suggestions');
        }

        const data = await response.json();
        const newSuggestions = data.suggestions || [];

        setSuggestions(newSuggestions);
        onSuggestionsChange?.(newSuggestions);

        // Update editor decorations
        updateEditorDecorations(newSuggestions);

        // Show notification for new suggestions
        if (newSuggestions.length > 0) {
          showSuggestionNotification(newSuggestions);
        }
      } catch (error) {
        console.error('Error fetching contextual suggestions:', error);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [
      language,
      enableRealTimeAnalysis,
      onSuggestionsChange,
      updateEditorDecorations,
    ]
  );

  // Debounced analysis trigger
  const triggerAnalysis = useCallback(
    (code: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        fetchContextualSuggestions(code);
      }, 1500); // 1.5 second debounce
    },
    [fetchContextualSuggestions]
  );

  const handleEditorDidMount = (editor: unknown, monaco: unknown) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setIsLoading(false);

    // Add selection change listener
    if (onSelectionChange && typeof editor === 'object' && editor !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const editorInstance = editor as any;
      editorInstance.onDidChangeCursorSelection?.((event: unknown) => {
        const model = editorInstance.getModel();
        if (model && event && typeof event === 'object' && 'selection' in event) {
          const eventWithSelection = event as { selection: unknown };
          const selectedText = model.getValueInRange(eventWithSelection.selection);
          if (selectedText && selectedText.trim().length > 0) {
            onSelectionChange(selectedText);
          }
        }
      });
    }

    // Initial analysis
    if (value.trim() && enableRealTimeAnalysis) {
      triggerAnalysis(value);
    }
  };

  const handleEditorChange = (newValue: string | undefined) => {
    const code = newValue || '';
    onChange(code);

    // Trigger real-time analysis
    if (enableRealTimeAnalysis) {
      triggerAnalysis(code);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className='relative border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden'>
      {/* Real-time analysis indicator */}
      {enableRealTimeAnalysis && (
        <div className='absolute top-2 right-2 z-10 flex items-center gap-2 bg-white dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600'>
          <div
            className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}
          ></div>
          <span className='text-xs text-gray-600 dark:text-gray-400'>
            {isAnalyzing ? 'Analyzing...' : 'Live Analysis'}
          </span>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className='absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10'>
          <div className='text-gray-500 dark:text-gray-400'>
            Loading editor...
          </div>
        </div>
      )}

      {/* Monaco Editor */}
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme='vs-dark'
        loading={
          <div className='flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800'>
            <div className='text-gray-500 dark:text-gray-400'>
              Loading Monaco Editor...
            </div>
          </div>
        }
        options={{
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          fontSize: 14,
          tabSize: 2,
          wordWrap: 'on',
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          lineNumbers: 'on',
          glyphMargin: true,
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          renderLineHighlight: 'line',
          selectOnLineNumbers: true,
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true,
          },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
          tabCompletion: 'on',
          wordBasedSuggestions: 'matchingDocuments',
          parameterHints: {
            enabled: true,
          },
        }}
      />

      {/* Contextual Suggestions Panel */}
      {suggestions.length > 0 && (
        <div className='absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 max-h-32 overflow-y-auto'>
          <div className='p-2'>
            <div className='text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1'>
              Contextual Suggestions ({suggestions.length})
            </div>
            <div className='space-y-1'>
              {suggestions.slice(0, 3).map(suggestion => (
                <div
                  key={suggestion.id}
                  className='flex items-center gap-2 p-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700'
                >
                  <div
                    className={`w-2 h-2 rounded-full ${getSeverityColor(suggestion.severity)}`}
                  ></div>
                  <span className='text-gray-700 dark:text-gray-300'>
                    Line {suggestion.line}: {suggestion.message}
                  </span>
                  <span className='text-gray-500 dark:text-gray-400'>
                    ({Math.round(suggestion.confidence * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for decorations */}
      <style jsx global>{`
        .suggestion-decoration.error {
          background-color: rgba(255, 85, 85, 0.2);
          border-bottom: 2px solid #ff5555;
        }
        .suggestion-decoration.warning {
          background-color: rgba(255, 187, 51, 0.2);
          border-bottom: 2px solid #ffbb33;
        }
        .suggestion-decoration.info {
          background-color: rgba(51, 153, 255, 0.2);
          border-bottom: 2px solid #3399ff;
        }
        .suggestion-decoration.hint {
          background-color: rgba(80, 250, 123, 0.2);
          border-bottom: 2px solid #50fa7b;
        }
        .suggestion-glyph.error::before {
          content: '❌';
          font-size: 12px;
        }
        .suggestion-glyph.warning::before {
          content: '⚠️';
          font-size: 12px;
        }
        .suggestion-glyph.info::before {
          content: '💡';
          font-size: 12px;
        }
        .suggestion-glyph.hint::before {
          content: '💭';
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
