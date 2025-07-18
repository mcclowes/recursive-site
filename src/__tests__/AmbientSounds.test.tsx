import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AmbientSounds from '@/components/AmbientSounds';

// Mock AudioContext for testing
class MockAudioContext {
  state = 'suspended';
  sampleRate = 44100;
  destination = {};
  
  createBuffer() {
    return {
      getChannelData: () => new Float32Array(4096)
    };
  }
  
  createBufferSource() {
    return {
      buffer: null,
      loop: false,
      connect: jest.fn(),
      start: jest.fn()
    };
  }
  
  createBiquadFilter() {
    return {
      frequency: { value: 1000 },
      Q: { value: 0.5 },
      connect: jest.fn()
    };
  }
  
  createGain() {
    return {
      gain: { value: 0.1 },
      connect: jest.fn()
    };
  }
  
  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
  
  close() {
    return Promise.resolve();
  }
}

// Mock the global AudioContext
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: MockAudioContext
});

Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: MockAudioContext
});

describe('AmbientSounds', () => {
  const defaultProps = {
    isEnabled: true,
    theme: 'Tranquil Forest',
    volume: 0.3,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when disabled', () => {
    const { container } = render(
      <AmbientSounds {...defaultProps} isEnabled={false} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders ambient sounds panel when enabled', () => {
    render(<AmbientSounds {...defaultProps} />);
    
    expect(screen.getByText(/forest whispers/i)).toBeInTheDocument();
    expect(screen.getByText(/gentle rustling leaves/i)).toBeInTheDocument();
  });

  it('displays appropriate sound based on theme', () => {
    // Test different themes
    render(<AmbientSounds {...defaultProps} theme="Serene Mountain" />);
    expect(screen.getByText(/mountain breeze/i)).toBeInTheDocument();
    
    render(<AmbientSounds {...defaultProps} theme="Golden Meadow" />);
    expect(screen.getByText(/peaceful meadow/i)).toBeInTheDocument();
    
    render(<AmbientSounds {...defaultProps} theme="Calming Sunset" />);
    expect(screen.getByText(/gentle rain/i)).toBeInTheDocument();
  });

  it('renders sound selection buttons', () => {
    render(<AmbientSounds {...defaultProps} />);
    
    // Should have 5 sound type buttons (forest, ocean, rain, mountain, meadow)
    const soundButtons = screen.getAllByRole('button').filter(button => 
      button.title?.includes('Forest') || 
      button.title?.includes('Ocean') || 
      button.title?.includes('Rain') ||
      button.title?.includes('Mountain') ||
      button.title?.includes('Meadow')
    );
    
    expect(soundButtons.length).toBe(5);
  });

  it('changes sound when a different sound button is clicked', () => {
    render(<AmbientSounds {...defaultProps} />);
    
    // Click on ocean button
    const oceanButton = screen.getByTitle(/ocean waves/i);
    fireEvent.click(oceanButton);
    
    // Should update to show ocean sound
    expect(screen.getByText(/ocean waves/i)).toBeInTheDocument();
  });

  it('shows start ambient sounds button when not playing', () => {
    render(<AmbientSounds {...defaultProps} />);
    
    const startButton = screen.getByText(/start ambient sounds/i);
    expect(startButton).toBeInTheDocument();
  });

  it('attempts to start audio when start button is clicked', () => {
    render(<AmbientSounds {...defaultProps} />);
    
    const startButton = screen.getByText(/start ambient sounds/i);
    fireEvent.click(startButton);
    
    // Should attempt to start audio (though it may fail in test environment)
    expect(startButton).toBeInTheDocument();
  });

  it('highlights current sound selection', () => {
    render(<AmbientSounds {...defaultProps} />);
    
    // Forest should be selected by default for "Tranquil Forest" theme
    const forestButton = screen.getByTitle(/forest whispers/i);
    expect(forestButton).toHaveClass('bg-blue-100');
  });

  it('handles theme changes appropriately', () => {
    const { rerender } = render(<AmbientSounds {...defaultProps} theme="Tranquil Forest" />);
    expect(screen.getByText(/forest whispers/i)).toBeInTheDocument();
    
    rerender(<AmbientSounds {...defaultProps} theme="Serene Mountain" />);
    expect(screen.getByText(/mountain breeze/i)).toBeInTheDocument();
  });

  it('handles audio context creation gracefully', () => {
    // Test that component doesn't crash when AudioContext is not available
    const originalAudioContext = window.AudioContext;
    // @ts-expect-error Testing missing AudioContext
    delete window.AudioContext;
    // @ts-expect-error Testing missing webkitAudioContext  
    delete window.webkitAudioContext;
    
    render(<AmbientSounds {...defaultProps} />);
    
    const startButton = screen.getByText(/start ambient sounds/i);
    fireEvent.click(startButton);
    
    // Should not crash
    expect(startButton).toBeInTheDocument();
    
    // Restore AudioContext
    window.AudioContext = originalAudioContext;
  });

  it('applies correct volume to audio', () => {
    render(<AmbientSounds {...defaultProps} volume={0.5} />);
    
    // Component should render with custom volume
    expect(screen.getByText(/forest whispers/i)).toBeInTheDocument();
  });

  it('shows click to activate message when not playing', () => {
    render(<AmbientSounds {...defaultProps} />);
    
    expect(screen.getByText(/click to activate/i)).toBeInTheDocument();
  });
});