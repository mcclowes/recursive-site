'use client';

import { useEffect, useState } from 'react';

interface AmbientSoundsProps {
  isEnabled: boolean;
  theme: string;
  volume?: number;
}

type SoundType = 'forest' | 'ocean' | 'rain' | 'mountain' | 'meadow';

// Extend Window interface for webkitAudioContext
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

const AMBIENT_SOUNDS: Record<SoundType, { name: string; emoji: string; description: string }> = {
  forest: {
    name: 'Forest Whispers',
    emoji: '🌲',
    description: 'Gentle rustling leaves and distant bird songs'
  },
  ocean: {
    name: 'Ocean Waves',
    emoji: '🌊',
    description: 'Rhythmic waves and seagulls in the distance'
  },
  rain: {
    name: 'Gentle Rain',
    emoji: '🌧️',
    description: 'Soft raindrops on leaves and distant thunder'
  },
  mountain: {
    name: 'Mountain Breeze',
    emoji: '🏔️',
    description: 'Crisp mountain air and echoing valleys'
  },
  meadow: {
    name: 'Peaceful Meadow',
    emoji: '🌾',
    description: 'Buzzing bees and swaying grass'
  }
};

export default function AmbientSounds({ 
  isEnabled, 
  theme, 
  volume = 0.3 
}: AmbientSoundsProps) {
  const [currentSound, setCurrentSound] = useState<SoundType>('forest');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Map themes to appropriate sounds
  const getThemeSound = (themeName: string): SoundType => {
    if (themeName.includes('Mountain')) return 'mountain';
    if (themeName.includes('Forest')) return 'forest';
    if (themeName.includes('Meadow')) return 'meadow';
    if (themeName.includes('Ocean') || themeName.includes('Stream')) return 'ocean';
    return 'rain'; // Default for sunset/other themes
  };

  useEffect(() => {
    const themeSound = getThemeSound(theme);
    setCurrentSound(themeSound);
  }, [theme]);

  useEffect(() => {
    if (isEnabled && !isPlaying) {
      startAmbientSound();
    } else if (!isEnabled && isPlaying) {
      stopAmbientSound();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled]); // Only depend on isEnabled to avoid infinite loops

  const createWebAudioSynth = (type: SoundType): AudioContext => {
    const ctx = new (window.AudioContext || window.webkitAudioContext || AudioContext)();
    
    // Create a simple ambient sound synthesizer
    // This is a basic implementation - in a real app you'd load actual audio files
    const createNoise = () => {
      const bufferSize = 4096;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      return buffer;
    };

    const noise = ctx.createBufferSource();
    noise.buffer = createNoise();
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    // Configure filter and gain based on sound type
    switch (type) {
      case 'forest':
        filter.frequency.value = 1000;
        filter.Q.value = 0.5;
        gainNode.gain.value = volume * 0.1;
        break;
      case 'ocean':
        filter.frequency.value = 300;
        filter.Q.value = 0.3;
        gainNode.gain.value = volume * 0.15;
        break;
      case 'rain':
        filter.frequency.value = 2000;
        filter.Q.value = 0.1;
        gainNode.gain.value = volume * 0.08;
        break;
      case 'mountain':
        filter.frequency.value = 800;
        filter.Q.value = 0.7;
        gainNode.gain.value = volume * 0.05;
        break;
      case 'meadow':
        filter.frequency.value = 1500;
        filter.Q.value = 0.4;
        gainNode.gain.value = volume * 0.12;
        break;
    }

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    return ctx;
  };

  const startAmbientSound = async () => {
    try {
      const ctx = createWebAudioSynth(currentSound);
      setAudioContext(ctx);
      
      // Start the audio context (required by browser policies)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      
      // Create and start the sound source
      const source = ctx.createBufferSource();
      const noise = ctx.createBuffer(1, 4096, ctx.sampleRate);
      const output = noise.getChannelData(0);
      
      for (let i = 0; i < 4096; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      source.buffer = noise;
      source.loop = true;
      
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();
      
      // Apply sound-specific settings
      switch (currentSound) {
        case 'forest':
          filter.frequency.value = 1000;
          gainNode.gain.value = volume * 0.1;
          break;
        case 'ocean':
          filter.frequency.value = 300;
          gainNode.gain.value = volume * 0.15;
          break;
        case 'rain':
          filter.frequency.value = 2000;
          gainNode.gain.value = volume * 0.08;
          break;
        case 'mountain':
          filter.frequency.value = 800;
          gainNode.gain.value = volume * 0.05;
          break;
        case 'meadow':
          filter.frequency.value = 1500;
          gainNode.gain.value = volume * 0.12;
          break;
      }
      
      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      source.start();
      setIsPlaying(true);
    } catch (error) {
      console.log('Ambient sound not available (user interaction required)', error);
      setIsPlaying(false);
    }
  };

  const stopAmbientSound = () => {
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
    }
    setIsPlaying(false);
  };

  const handleSoundChange = (soundType: SoundType) => {
    setCurrentSound(soundType);
    if (isPlaying) {
      stopAmbientSound();
      setTimeout(() => {
        if (isEnabled) {
          startAmbientSound();
        }
      }, 100);
    }
  };

  if (!isEnabled) {
    return null;
  }

  const sound = AMBIENT_SOUNDS[currentSound];

  return (
    <div className="ambient-sounds-panel bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-white/30">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{sound.emoji}</span>
        <div>
          <h4 className="font-medium text-gray-800 dark:text-white text-sm">
            {sound.name}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {sound.description}
          </p>
        </div>
        <div className="ml-auto">
          {isPlaying ? (
            <div className="flex items-center gap-1">
              <div className="w-1 h-3 bg-green-400 rounded animate-pulse"></div>
              <div className="w-1 h-2 bg-green-400 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-4 bg-green-400 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            </div>
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Click to activate
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-1">
        {Object.entries(AMBIENT_SOUNDS).map(([type, soundData]) => (
          <button
            key={type}
            onClick={() => handleSoundChange(type as SoundType)}
            className={`p-2 rounded text-lg transition-all duration-200 ${
              currentSound === type
                ? 'bg-blue-100 dark:bg-blue-900/50 scale-110'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105'
            }`}
            title={soundData.name}
          >
            {soundData.emoji}
          </button>
        ))}
      </div>
      
      {!isPlaying && isEnabled && (
        <button
          onClick={startAmbientSound}
          className="w-full mt-3 py-1 px-3 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
        >
          Start Ambient Sounds
        </button>
      )}
    </div>
  );
}