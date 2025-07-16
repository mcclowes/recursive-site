'use client';

import { Editor } from '@monaco-editor/react';
import { useState } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
}

export default function CodeEditor({ value, onChange, language, height = "400px" }: CodeEditorProps) {
  const [isLoading, setIsLoading] = useState(true);

  const handleEditorDidMount = () => {
    setIsLoading(false);
  };

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  return (
    <div className="relative border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
          <div className="text-gray-500 dark:text-gray-400">Loading editor...</div>
        </div>
      )}
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        loading={<div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
          <div className="text-gray-500 dark:text-gray-400">Loading Monaco Editor...</div>
        </div>}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          tabSize: 2,
          wordWrap: 'on',
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          lineNumbers: 'on',
          glyphMargin: true,
          folding: true,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
          renderLineHighlight: 'line',
          selectOnLineNumbers: true,
        }}
      />
    </div>
  );
}