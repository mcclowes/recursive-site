import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import KaleidoscopicModeToggle from '@/components/KaleidoscopicModeToggle';

describe('KaleidoscopicModeToggle', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the toggle component', () => {
    render(
      <KaleidoscopicModeToggle
        isEnabled={false}
        onToggle={mockOnToggle}
        codeQualityScore={75}
      />
    );

    expect(screen.getByText('💎 Kaleidoscopic Wisdom')).toBeInTheDocument();
    expect(screen.getByText('Transform your code into a collaborative 3D canvas')).toBeInTheDocument();
  });

  it('shows correct button text when disabled', () => {
    render(
      <KaleidoscopicModeToggle
        isEnabled={false}
        onToggle={mockOnToggle}
        codeQualityScore={75}
      />
    );

    expect(screen.getByText('Enter Kaleidoscopic Mode')).toBeInTheDocument();
    expect(screen.getByText('Experience code as living art')).toBeInTheDocument();
  });

  it('shows correct button text when enabled', () => {
    render(
      <KaleidoscopicModeToggle
        isEnabled={true}
        onToggle={mockOnToggle}
        codeQualityScore={75}
      />
    );

    expect(screen.getByText('Exit Kaleidoscopic Mode')).toBeInTheDocument();
    expect(screen.getByText('Return to traditional view')).toBeInTheDocument();
  });

  it('calls onToggle when button is clicked', () => {
    render(
      <KaleidoscopicModeToggle
        isEnabled={false}
        onToggle={mockOnToggle}
        codeQualityScore={75}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnToggle).toHaveBeenCalledWith(true);
  });

  it('displays quality descriptions based on score', () => {
    const { rerender } = render(
      <KaleidoscopicModeToggle
        isEnabled={false}
        onToggle={mockOnToggle}
        codeQualityScore={85}
      />
    );

    expect(screen.getByText('Current Vision: Brilliant Diamond Crystal')).toBeInTheDocument();

    rerender(
      <KaleidoscopicModeToggle
        isEnabled={false}
        onToggle={mockOnToggle}
        codeQualityScore={65}
      />
    );

    expect(screen.getByText('Current Vision: Emerald Garden Vision')).toBeInTheDocument();

    rerender(
      <KaleidoscopicModeToggle
        isEnabled={false}
        onToggle={mockOnToggle}
        codeQualityScore={45}
      />
    );

    expect(screen.getByText('Current Vision: Amber Sunset Glow')).toBeInTheDocument();

    rerender(
      <KaleidoscopicModeToggle
        isEnabled={false}
        onToggle={mockOnToggle}
        codeQualityScore={25}
      />
    );

    expect(screen.getByText('Current Vision: Ruby Fire Transformation')).toBeInTheDocument();
  });

  it('shows additional information when enabled', () => {
    render(
      <KaleidoscopicModeToggle
        isEnabled={true}
        onToggle={mockOnToggle}
        codeQualityScore={75}
      />
    );

    expect(screen.getByText('3D Code Visualization Active')).toBeInTheDocument();
    expect(screen.getByText('• Code elements transformed into interactive gems')).toBeInTheDocument();
    expect(screen.getByText('• Voice interaction and gesture controls enabled')).toBeInTheDocument();
    expect(screen.getByText('• Collaborative visual canvas for team exploration')).toBeInTheDocument();
  });

  it('applies correct styling based on enabled state', () => {
    const { rerender } = render(
      <KaleidoscopicModeToggle
        isEnabled={false}
        onToggle={mockOnToggle}
        codeQualityScore={75}
      />
    );

    let button = screen.getByRole('button');
    expect(button).toHaveClass('from-gray-600', 'to-gray-700');

    rerender(
      <KaleidoscopicModeToggle
        isEnabled={true}
        onToggle={mockOnToggle}
        codeQualityScore={75}
      />
    );

    button = screen.getByRole('button');
    expect(button).toHaveClass('animate-pulse');
  });
});