'use client';

import { useState, useEffect } from 'react';

interface ZenSanctuaryModeProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  codeQualityScore: number;
  className?: string;
}

// Define zen themes based on code quality
const getZenTheme = (score: number) => {
  if (score >= 80) {
    return {
      name: 'Serene Mountain',
      gradient: 'from-blue-100 via-blue-50 to-indigo-100 dark:from-blue-950 dark:via-blue-900 dark:to-indigo-950',
      accent: 'text-blue-600 dark:text-blue-400',
      description: 'Your code flows like a peaceful mountain stream',
      emoji: '🏔️',
      ambientColor: 'rgba(59, 130, 246, 0.1)' // blue
    };
  } else if (score >= 60) {
    return {
      name: 'Tranquil Forest',
      gradient: 'from-green-100 via-green-50 to-emerald-100 dark:from-green-950 dark:via-green-900 dark:to-emerald-950',
      accent: 'text-green-600 dark:text-green-400',
      description: 'Your code grows like a healthy forest',
      emoji: '🌲',
      ambientColor: 'rgba(34, 197, 94, 0.1)' // green
    };
  } else if (score >= 40) {
    return {
      name: 'Golden Meadow',
      gradient: 'from-yellow-100 via-yellow-50 to-amber-100 dark:from-yellow-950 dark:via-yellow-900 dark:to-amber-950',
      accent: 'text-yellow-600 dark:text-yellow-400',
      description: 'Your code is finding its natural rhythm',
      emoji: '🌾',
      ambientColor: 'rgba(245, 158, 11, 0.1)' // yellow/amber
    };
  } else {
    return {
      name: 'Calming Sunset',
      gradient: 'from-orange-100 via-orange-50 to-red-100 dark:from-orange-950 dark:via-orange-900 dark:to-red-950',
      accent: 'text-orange-600 dark:text-orange-400',
      description: 'Every sunset brings the promise of a new dawn',
      emoji: '🌅',
      ambientColor: 'rgba(249, 115, 22, 0.1)' // orange
    };
  }
};

export default function ZenSanctuaryMode({ 
  isEnabled, 
  onToggle, 
  codeQualityScore, 
  className = '' 
}: ZenSanctuaryModeProps) {
  const [ambientSounds, setAmbientSounds] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const theme = getZenTheme(codeQualityScore);

  useEffect(() => {
    // Apply zen theme to body when enabled
    if (isEnabled) {
      document.body.style.setProperty('--zen-ambient-color', theme.ambientColor);
      document.body.classList.add('zen-mode');
    } else {
      document.body.classList.remove('zen-mode');
      document.body.style.removeProperty('--zen-ambient-color');
    }

    return () => {
      document.body.classList.remove('zen-mode');
      document.body.style.removeProperty('--zen-ambient-color');
    };
  }, [isEnabled, theme.ambientColor]);

  const handleAmbientSounds = () => {
    setAmbientSounds(!ambientSounds);
    // Note: Actual sound implementation would go here
    // For now, just show feedback
  };

  if (!isEnabled) {
    return (
      <button
        onClick={() => onToggle(true)}
        className={`group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl ${className}`}
        title="Enter Code Zen Sanctuary"
      >
        <span className="text-lg">🧘‍♀️</span>
        <span className="font-medium">Zen Sanctuary</span>
        <span className="text-sm opacity-75 group-hover:opacity-100">✨</span>
      </button>
    );
  }

  return (
    <div className={`zen-sanctuary-panel bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-xl ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{theme.emoji}</span>
          <div>
            <h3 className={`font-semibold ${theme.accent}`}>
              {theme.name}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {theme.description}
            </p>
          </div>
        </div>
        <button
          onClick={() => onToggle(false)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Exit Zen Mode"
        >
          <span className="text-lg">✕</span>
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">🎵</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Ambient Sounds
            </span>
          </div>
          <button
            onClick={handleAmbientSounds}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              ambientSounds 
                ? 'bg-blue-600' 
                : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                ambientSounds ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">🎯</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Focus Mode
            </span>
          </div>
          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              focusMode 
                ? 'bg-green-600' 
                : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                focusMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {ambientSounds && (
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            🌊 Gentle nature sounds activated for enhanced focus
          </p>
        </div>
      )}

      {focusMode && (
        <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-xs text-green-700 dark:text-green-300">
            🎯 Focus mode engaged - distractions minimized
          </p>
        </div>
      )}
    </div>
  );
}