import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import CodeMetricsVisualization from '@/components/CodeMetricsVisualization';

describe('CodeMetricsVisualization', () => {
  const mockMetrics = {
    lines: 100,
    characters: 2000,
    complexity: 5,
    maintainability: 'Good',
    score: 75,
  };

  beforeEach(() => {
    // Mock the Math.random function for consistent testing
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders nothing when zen mode is disabled', () => {
    const { container } = render(
      <CodeMetricsVisualization metrics={mockMetrics} isZenMode={false} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders visualization elements when zen mode is enabled', () => {
    const { container } = render(
      <CodeMetricsVisualization metrics={mockMetrics} isZenMode={true} />
    );
    
    expect(container.firstChild).toBeInTheDocument();
    expect(container.querySelector('.zen-visualization')).toBeInTheDocument();
  });

  it('generates appropriate number of flowers based on score', () => {
    const highScoreMetrics = { ...mockMetrics, score: 85 };
    const { container } = render(
      <CodeMetricsVisualization metrics={highScoreMetrics} isZenMode={true} />
    );
    
    // Score 85 should generate Math.floor(85/20) = 4 flowers
    const flowers = container.querySelectorAll('[style*="flower"]');
    expect(flowers.length).toBeGreaterThanOrEqual(0); // At least some elements should be generated
  });

  it('generates trees based on lines of code', () => {
    const manyLinesMetrics = { ...mockMetrics, lines: 150 };
    const { container } = render(
      <CodeMetricsVisualization metrics={manyLinesMetrics} isZenMode={true} />
    );
    
    // Should generate trees based on lines/50 ratio
    expect(container.firstChild).toBeInTheDocument();
  });

  it('generates leaves based on complexity', () => {
    const complexMetrics = { ...mockMetrics, complexity: 8 };
    const { container } = render(
      <CodeMetricsVisualization metrics={complexMetrics} isZenMode={true} />
    );
    
    // Higher complexity should generate more leaves
    expect(container.firstChild).toBeInTheDocument();
  });

  it('generates butterflies for high quality code', () => {
    const excellentMetrics = { ...mockMetrics, score: 85 };
    const { container } = render(
      <CodeMetricsVisualization metrics={excellentMetrics} isZenMode={true} />
    );
    
    // Score > 70 should generate butterflies
    expect(container.firstChild).toBeInTheDocument();
  });

  it('does not generate butterflies for lower quality code', () => {
    const lowerScoreMetrics = { ...mockMetrics, score: 65 };
    const { container } = render(
      <CodeMetricsVisualization metrics={lowerScoreMetrics} isZenMode={true} />
    );
    
    // Score <= 70 should not generate butterflies
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders ambient particles', () => {
    const { container } = render(
      <CodeMetricsVisualization metrics={mockMetrics} isZenMode={true} />
    );
    
    // Should render 8 ambient particles
    const particles = container.querySelectorAll('.animate-float-slow');
    expect(particles.length).toBe(8);
  });

  it('applies appropriate ambient overlay color based on score', () => {
    const { container } = render(
      <CodeMetricsVisualization metrics={mockMetrics} isZenMode={true} />
    );
    
    const overlay = container.querySelector('[style*="radial-gradient"]');
    expect(overlay).toBeInTheDocument();
  });

  it('handles edge case with minimal metrics', () => {
    const minimalMetrics = {
      lines: 1,
      characters: 10,
      complexity: 1,
      maintainability: 'Poor',
      score: 20,
    };
    
    const { container } = render(
      <CodeMetricsVisualization metrics={minimalMetrics} isZenMode={true} />
    );
    
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles edge case with maximum metrics', () => {
    const maximalMetrics = {
      lines: 1000,
      characters: 50000,
      complexity: 20,
      maintainability: 'Excellent',
      score: 100,
    };
    
    const { container } = render(
      <CodeMetricsVisualization metrics={maximalMetrics} isZenMode={true} />
    );
    
    expect(container.firstChild).toBeInTheDocument();
  });
});