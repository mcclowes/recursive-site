'use client';

import React from 'react';

interface KaleidoscopicModeToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  codeQualityScore: number;
}

export default function KaleidoscopicModeToggle({
  isEnabled,
  onToggle,
  codeQualityScore,
}: KaleidoscopicModeToggleProps) {
  const getQualityGradient = () => {
    if (codeQualityScore >= 80) {
      return 'from-blue-400 via-purple-400 to-pink-400';
    } else if (codeQualityScore >= 60) {
      return 'from-green-400 via-blue-400 to-purple-400';
    } else if (codeQualityScore >= 40) {
      return 'from-yellow-400 via-orange-400 to-red-400';
    } else {
      return 'from-red-400 via-pink-400 to-purple-400';
    }
  };

  const getQualityDescription = () => {
    if (codeQualityScore >= 80) {
      return 'Brilliant Diamond Crystal';
    } else if (codeQualityScore >= 60) {
      return 'Emerald Garden Vision';
    } else if (codeQualityScore >= 40) {
      return 'Amber Sunset Glow';
    } else {
      return 'Ruby Fire Transformation';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          💎 Kaleidoscopic Wisdom
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
          Transform your code into a collaborative 3D canvas
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Current Vision: {getQualityDescription()}
        </p>
      </div>

      <button
        onClick={() => onToggle(!isEnabled)}
        className={`
          relative px-8 py-4 rounded-xl font-semibold text-white transition-all duration-500 transform hover:scale-105
          ${
            isEnabled
              ? `bg-gradient-to-r ${getQualityGradient()} shadow-2xl shadow-purple-500/25 animate-pulse`
              : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 shadow-xl'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {isEnabled ? '🌟' : '💎'}
          </span>
          <div className="text-left">
            <div className="text-sm font-bold">
              {isEnabled ? 'Exit Kaleidoscopic Mode' : 'Enter Kaleidoscopic Mode'}
            </div>
            <div className="text-xs opacity-90">
              {isEnabled 
                ? 'Return to traditional view' 
                : 'Experience code as living art'
              }
            </div>
          </div>
        </div>
        
        {isEnabled && (
          <div className="absolute inset-0 rounded-xl opacity-30">
            <div className={`w-full h-full rounded-xl bg-gradient-to-r ${getQualityGradient()} animate-pulse`}></div>
          </div>
        )}
      </button>

      {isEnabled && (
        <div className="text-center space-y-2 animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse"></span>
            <span className="text-purple-600 dark:text-purple-400 font-medium">
              3D Code Visualization Active
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div>• Code elements transformed into interactive gems</div>
            <div>• Voice interaction and gesture controls enabled</div>
            <div>• Collaborative visual canvas for team exploration</div>
            {navigator.userAgent.includes('Chrome') && (
              <div className="text-purple-600 dark:text-purple-400">• WebXR/VR mode available</div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}