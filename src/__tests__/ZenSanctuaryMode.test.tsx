import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ZenSanctuaryMode from '@/components/ZenSanctuaryMode';

describe('ZenSanctuaryMode', () => {
  const defaultProps = {
    isEnabled: false,
    onToggle: jest.fn(),
    codeQualityScore: 75,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders zen sanctuary toggle button when disabled', () => {
    render(<ZenSanctuaryMode {...defaultProps} />);
    
    const toggleButton = screen.getByTitle('Enter Code Zen Sanctuary');
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent('Zen Sanctuary');
  });

  it('calls onToggle when toggle button is clicked', () => {
    const mockOnToggle = jest.fn();
    render(<ZenSanctuaryMode {...defaultProps} onToggle={mockOnToggle} />);
    
    const toggleButton = screen.getByTitle('Enter Code Zen Sanctuary');
    fireEvent.click(toggleButton);
    
    expect(mockOnToggle).toHaveBeenCalledWith(true);
  });

  it('renders zen sanctuary panel when enabled', () => {
    render(<ZenSanctuaryMode {...defaultProps} isEnabled={true} />);
    
    expect(screen.getByText(/tranquil forest/i)).toBeInTheDocument();
    expect(screen.getByText(/ambient sounds/i)).toBeInTheDocument();
    expect(screen.getByText(/focus mode/i)).toBeInTheDocument();
  });

  it('displays appropriate theme based on code quality score', () => {
    // High score (80+) - Serene Mountain
    render(<ZenSanctuaryMode {...defaultProps} isEnabled={true} codeQualityScore={85} />);
    expect(screen.getByText(/serene mountain/i)).toBeInTheDocument();
    
    // Medium score (60-79) - Tranquil Forest
    render(<ZenSanctuaryMode {...defaultProps} isEnabled={true} codeQualityScore={65} />);
    expect(screen.getByText(/tranquil forest/i)).toBeInTheDocument();
    
    // Low-medium score (40-59) - Golden Meadow
    render(<ZenSanctuaryMode {...defaultProps} isEnabled={true} codeQualityScore={45} />);
    expect(screen.getByText(/golden meadow/i)).toBeInTheDocument();
    
    // Low score (<40) - Calming Sunset
    render(<ZenSanctuaryMode {...defaultProps} isEnabled={true} codeQualityScore={25} />);
    expect(screen.getByText(/calming sunset/i)).toBeInTheDocument();
  });

  it('toggles ambient sounds when clicked', () => {
    render(<ZenSanctuaryMode {...defaultProps} isEnabled={true} />);
    
    const ambientSoundsToggle = screen.getAllByRole('button').find(button => 
      button.closest('div')?.textContent?.includes('Ambient Sounds')
    );
    
    expect(ambientSoundsToggle).toBeInTheDocument();
    
    // Initially should be off
    expect(ambientSoundsToggle).toHaveClass('bg-gray-200');
    
    if (ambientSoundsToggle) {
      fireEvent.click(ambientSoundsToggle);
      expect(ambientSoundsToggle).toHaveClass('bg-blue-600');
    }
  });

  it('toggles focus mode when clicked', () => {
    render(<ZenSanctuaryMode {...defaultProps} isEnabled={true} />);
    
    const focusModeToggle = screen.getAllByRole('button').find(button => 
      button.closest('div')?.textContent?.includes('Focus Mode')
    );
    
    expect(focusModeToggle).toBeInTheDocument();
    
    if (focusModeToggle) {
      fireEvent.click(focusModeToggle);
      expect(focusModeToggle).toHaveClass('bg-green-600');
    }
  });

  it('exits zen mode when close button is clicked', () => {
    const mockOnToggle = jest.fn();
    render(<ZenSanctuaryMode {...defaultProps} isEnabled={true} onToggle={mockOnToggle} />);
    
    const closeButton = screen.getByTitle('Exit Zen Mode');
    fireEvent.click(closeButton);
    
    expect(mockOnToggle).toHaveBeenCalledWith(false);
  });

  it('shows feedback when ambient sounds are enabled', () => {
    render(<ZenSanctuaryMode {...defaultProps} isEnabled={true} />);
    
    const ambientSoundsToggle = screen.getAllByRole('button').find(button => 
      button.closest('div')?.textContent?.includes('Ambient Sounds')
    );
    
    if (ambientSoundsToggle) {
      fireEvent.click(ambientSoundsToggle);
      expect(screen.getByText(/gentle nature sounds activated/i)).toBeInTheDocument();
    }
  });

  it('shows feedback when focus mode is enabled', () => {
    render(<ZenSanctuaryMode {...defaultProps} isEnabled={true} />);
    
    const focusModeToggle = screen.getAllByRole('button').find(button => 
      button.closest('div')?.textContent?.includes('Focus Mode')
    );
    
    if (focusModeToggle) {
      fireEvent.click(focusModeToggle);
      expect(screen.getByText(/focus mode engaged/i)).toBeInTheDocument();
    }
  });
});