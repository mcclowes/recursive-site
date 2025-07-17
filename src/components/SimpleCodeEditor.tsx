'use client';

interface SimpleCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
  onSelectionChange?: (selectedText: string) => void;
}

export default function SimpleCodeEditor({
  value,
  onChange,
  language,
  height = '400px',
  onSelectionChange,
}: SimpleCodeEditorProps) {
  const handleSelectionChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const selectedText = target.value.substring(target.selectionStart, target.selectionEnd);
    if (onSelectionChange && selectedText && selectedText.trim().length > 0) {
      onSelectionChange(selectedText);
    }
  };

  return (
    <div className='relative border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden'>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        onSelect={handleSelectionChange}
        className='w-full h-96 p-4 font-mono text-sm bg-gray-900 text-green-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500'
        placeholder={`Enter your ${language} code here...`}
        style={{ height }}
      />
      <div className='absolute top-2 right-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded'>
        {language}
      </div>
    </div>
  );
}
