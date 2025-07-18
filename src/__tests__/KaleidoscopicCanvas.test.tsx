import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import KaleidoscopicCanvas from '@/components/KaleidoscopicCanvas';

// Mock Three.js
jest.mock('three', () => ({
  Scene: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    remove: jest.fn(),
  })),
  WebGLRenderer: jest.fn().mockImplementation(() => ({
    setSize: jest.fn(),
    dispose: jest.fn(),
    xr: { enabled: false, setSession: jest.fn() },
    shadowMap: { enabled: false, type: null },
    domElement: document.createElement('canvas'),
    render: jest.fn(),
  })),
  PerspectiveCamera: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn(), x: 0, z: 0 },
    aspect: 1,
    updateProjectionMatrix: jest.fn(),
    lookAt: jest.fn(),
  })),
  AmbientLight: jest.fn(),
  DirectionalLight: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn() },
    castShadow: false,
  })),
  BufferGeometry: jest.fn().mockImplementation(() => ({
    setAttribute: jest.fn(),
  })),
  Float32BufferAttribute: jest.fn(),
  PointsMaterial: jest.fn(),
  Points: jest.fn(),
  SphereGeometry: jest.fn(),
  BoxGeometry: jest.fn(),
  ConeGeometry: jest.fn(),
  CylinderGeometry: jest.fn(),
  TetrahedronGeometry: jest.fn(),
  MeshPhongMaterial: jest.fn(),
  Mesh: jest.fn().mockImplementation(() => ({
    position: { copy: jest.fn(), x: 0, y: 0, z: 0 },
    rotation: { y: 0 },
    userData: {},
    material: { emissive: { setHex: jest.fn() } },
  })),
  Color: jest.fn().mockImplementation(() => ({
    setHSL: jest.fn(),
  })),
  Vector3: jest.fn().mockImplementation((x, y, z) => ({
    x: x || 0,
    y: y || 0,
    z: z || 0,
    clone: jest.fn(() => ({ x: x || 0, y: y || 0, z: z || 0 })),
    copy: jest.fn(),
  })),
  Raycaster: jest.fn().mockImplementation(() => ({
    setFromCamera: jest.fn(),
    intersectObjects: jest.fn(() => []),
  })),
  Vector2: jest.fn(),
  PCFSoftShadowMap: 'PCFSoftShadowMap',
}));

// Mock Web Speech API
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: jest.fn(),
  },
});

Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  writable: true,
  value: jest.fn().mockImplementation((text) => ({ text })),
});

// Mock navigator.xr
Object.defineProperty(navigator, 'xr', {
  writable: true,
  value: {
    isSessionSupported: jest.fn(() => Promise.resolve(false)),
    requestSession: jest.fn(() => Promise.reject(new Error('XR not supported'))),
  },
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn();

const mockAnalysis = {
  score: 75,
  suggestions: [
    {
      type: 'info',
      message: 'Consider using memoization',
      line: 2,
      source: 'AI',
      category: 'performance',
      confidence: 0.8,
      id: 'suggestion-1',
    },
  ],
  metrics: {
    lines: 8,
    characters: 150,
    complexity: 3,
    maintainability: 'Good',
    aiAnalysisAvailable: true,
  },
};

const sampleCode = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log('Fibonacci result:', result);`;

describe('KaleidoscopicCanvas', () => {
  const mockOnElementSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when disabled', () => {
    const { container } = render(
      <KaleidoscopicCanvas
        code={sampleCode}
        language="javascript"
        analysis={mockAnalysis}
        isEnabled={false}
        onElementSelect={mockOnElementSelect}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders the kaleidoscopic canvas when enabled', () => {
    render(
      <KaleidoscopicCanvas
        code={sampleCode}
        language="javascript"
        analysis={mockAnalysis}
        isEnabled={true}
        onElementSelect={mockOnElementSelect}
      />
    );

    expect(screen.getByText('Kaleidoscopic Wisdom')).toBeInTheDocument();
    expect(screen.getByText('Instructions')).toBeInTheDocument();
  });

  it('displays code element counts correctly', async () => {
    render(
      <KaleidoscopicCanvas
        code={sampleCode}
        language="javascript"
        analysis={mockAnalysis}
        isEnabled={true}
        onElementSelect={mockOnElementSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Functions \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Classes \(0\)/)).toBeInTheDocument();
      expect(screen.getByText(/Variables \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Imports \(0\)/)).toBeInTheDocument();
    });
  });

  it('toggles voice interaction', async () => {
    render(
      <KaleidoscopicCanvas
        code={sampleCode}
        language="javascript"
        analysis={mockAnalysis}
        isEnabled={true}
        onElementSelect={mockOnElementSelect}
      />
    );

    const voiceButton = screen.getByRole('button', { name: /voice on/i });
    expect(voiceButton).toBeInTheDocument();

    fireEvent.click(voiceButton);
    
    // The component should handle the click event
    expect(voiceButton).toBeInTheDocument();
  });

  it('shows instructions for user interaction', () => {
    render(
      <KaleidoscopicCanvas
        code={sampleCode}
        language="javascript"
        analysis={mockAnalysis}
        isEnabled={true}
        onElementSelect={mockOnElementSelect}
      />
    );

    expect(screen.getByText('• Click gems to explore code elements')).toBeInTheDocument();
    expect(screen.getByText('• Different shapes represent different code types')).toBeInTheDocument();
    expect(screen.getByText('• Gem size indicates complexity')).toBeInTheDocument();
    expect(screen.getByText('• Colors reflect code quality')).toBeInTheDocument();
    expect(screen.getByText('• Enable voice for audio feedback')).toBeInTheDocument();
  });

  it('renders with null analysis gracefully', () => {
    render(
      <KaleidoscopicCanvas
        code={sampleCode}
        language="javascript"
        analysis={null}
        isEnabled={true}
        onElementSelect={mockOnElementSelect}
      />
    );

    expect(screen.getByText('Kaleidoscopic Wisdom')).toBeInTheDocument();
  });

  it('handles empty code gracefully', () => {
    render(
      <KaleidoscopicCanvas
        code=""
        language="javascript"
        analysis={mockAnalysis}
        isEnabled={true}
        onElementSelect={mockOnElementSelect}
      />
    );

    expect(screen.getByText('Kaleidoscopic Wisdom')).toBeInTheDocument();
  });

  it('extracts code elements correctly', async () => {
    render(
      <KaleidoscopicCanvas
        code={sampleCode}
        language="javascript"
        analysis={mockAnalysis}
        isEnabled={true}
        onElementSelect={mockOnElementSelect}
      />
    );

    // Wait for the component to process the code
    await waitFor(() => {
      expect(screen.getByText(/Functions \(1\)/)).toBeInTheDocument();
    });

    // Should detect the fibonacci function and result variable
    expect(screen.getByText(/Functions \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Variables \(1\)/)).toBeInTheDocument();
  });

  it('supports different code element types', async () => {
    const complexCode = `
import React from 'react';
import axios from 'axios';

class UserManager {
  constructor() {
    this.users = [];
  }

  async fetchUsers() {
    const response = await axios.get('/api/users');
    return response.data;
  }
}

const manager = new UserManager();
// This is a comment
const userData = await manager.fetchUsers();
`;

    render(
      <KaleidoscopicCanvas
        code={complexCode}
        language="javascript"
        analysis={mockAnalysis}
        isEnabled={true}
        onElementSelect={mockOnElementSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Functions \(\d+\)/)).toBeInTheDocument();
      expect(screen.getByText(/Classes \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Variables \(\d+\)/)).toBeInTheDocument();
      expect(screen.getByText(/Imports \(2\)/)).toBeInTheDocument();
    });
  });
});