'use client';

import { useEffect, useState } from 'react';

interface CodeMetricsVisualizationProps {
  metrics: {
    lines: number;
    characters: number;
    complexity: number;
    maintainability: string;
    score: number;
  };
  isZenMode: boolean;
}

interface FloralElement {
  id: string;
  type: 'flower' | 'tree' | 'leaf' | 'butterfly';
  x: number;
  y: number;
  scale: number;
  delay: number;
  emoji: string;
}

export default function CodeMetricsVisualization({ 
  metrics, 
  isZenMode 
}: CodeMetricsVisualizationProps) {
  const [floralElements, setFloralElements] = useState<FloralElement[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Generate nature elements based on code metrics
  useEffect(() => {
    if (!isZenMode) {
      setFloralElements([]);
      return;
    }

    const elements: FloralElement[] = [];
    
    // Generate flowers based on code quality score
    const flowerCount = Math.max(1, Math.floor(metrics.score / 20));
    for (let i = 0; i < flowerCount; i++) {
      elements.push({
        id: `flower-${i}`,
        type: 'flower',
        x: Math.random() * 80 + 10, // 10-90% from left
        y: Math.random() * 60 + 20, // 20-80% from top
        scale: 0.8 + Math.random() * 0.4, // 0.8-1.2 scale
        delay: i * 200,
        emoji: ['🌸', '🌺', '🌼', '🌻', '🌷'][Math.floor(Math.random() * 5)]
      });
    }

    // Generate trees based on lines of code (representing code structure)
    const treeCount = Math.min(3, Math.max(1, Math.floor(metrics.lines / 50)));
    for (let i = 0; i < treeCount; i++) {
      elements.push({
        id: `tree-${i}`,
        type: 'tree',
        x: 15 + i * 30, // Evenly spaced trees
        y: 60 + Math.random() * 20, // Bottom area
        scale: 0.9 + Math.random() * 0.2,
        delay: i * 300 + 100,
        emoji: ['🌲', '🌳', '🌴'][Math.floor(Math.random() * 3)]
      });
    }

    // Generate leaves based on complexity (swirling around)
    const leafCount = Math.min(5, Math.max(0, metrics.complexity - 2));
    for (let i = 0; i < leafCount; i++) {
      elements.push({
        id: `leaf-${i}`,
        type: 'leaf',
        x: Math.random() * 90 + 5,
        y: Math.random() * 50 + 10,
        scale: 0.6 + Math.random() * 0.3,
        delay: i * 400 + 500,
        emoji: ['🍃', '🍂', '🌿'][Math.floor(Math.random() * 3)]
      });
    }

    // Add butterflies for high quality code (score > 70)
    if (metrics.score > 70) {
      const butterflyCount = Math.floor((metrics.score - 70) / 15) + 1;
      for (let i = 0; i < butterflyCount; i++) {
        elements.push({
          id: `butterfly-${i}`,
          type: 'butterfly',
          x: Math.random() * 70 + 15,
          y: Math.random() * 40 + 10,
          scale: 0.8 + Math.random() * 0.4,
          delay: i * 600 + 800,
          emoji: ['🦋', '🦋'][Math.floor(Math.random() * 2)]
        });
      }
    }

    setFloralElements(elements);
    setIsAnimating(true);

    // Stop animation after elements are shown
    setTimeout(() => setIsAnimating(false), elements.length * 200 + 2000);
  }, [metrics, isZenMode]);

  if (!isZenMode || floralElements.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden zen-visualization">
      {/* Floating nature elements */}
      {floralElements.map((element) => (
        <div
          key={element.id}
          className={`absolute transition-all duration-1000 ease-out ${
            isAnimating ? 'animate-float' : ''
          }`}
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            transform: `scale(${element.scale})`,
            animationDelay: `${element.delay}ms`,
            animationDuration: element.type === 'butterfly' ? '3s' : '4s'
          }}
        >
          <span
            className={`text-2xl opacity-80 ${
              element.type === 'butterfly' ? 'animate-butterfly' : ''
            } ${
              element.type === 'leaf' ? 'animate-sway' : ''
            }`}
          >
            {element.emoji}
          </span>
        </div>
      ))}

      {/* Ambient particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-current opacity-20 rounded-full animate-float-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 1000}ms`,
              animationDuration: '8s',
              color: metrics.score > 70 ? '#3b82f6' : metrics.score > 50 ? '#10b981' : '#f59e0b'
            }}
          />
        ))}
      </div>

      {/* Quality-based ambient overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${
            metrics.score > 80 
              ? 'rgba(59, 130, 246, 0.05)' 
              : metrics.score > 60 
              ? 'rgba(34, 197, 94, 0.05)'
              : metrics.score > 40
              ? 'rgba(245, 158, 11, 0.05)'
              : 'rgba(249, 115, 22, 0.05)'
          } 0%, transparent 70%)`,
          opacity: isZenMode ? 1 : 0
        }}
      />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(var(--scale, 1)); }
          50% { transform: translateY(-10px) scale(var(--scale, 1)); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.2; }
          25% { transform: translateY(-15px) translateX(5px); opacity: 0.4; }
          50% { transform: translateY(-20px) translateX(-5px); opacity: 0.6; }
          75% { transform: translateY(-10px) translateX(3px); opacity: 0.4; }
        }
        
        @keyframes butterfly {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          25% { transform: translateX(10px) translateY(-5px); }
          50% { transform: translateX(20px) translateY(5px); }
          75% { transform: translateX(10px) translateY(-3px); }
        }
        
        @keyframes sway {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(3deg); }
          50% { transform: rotate(-3deg); }
          75% { transform: rotate(1deg); }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        
        .animate-butterfly {
          animation: butterfly 3s ease-in-out infinite;
        }
        
        .animate-sway {
          animation: sway 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}