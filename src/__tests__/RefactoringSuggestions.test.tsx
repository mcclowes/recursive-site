import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RefactoringSuggestions from '@/components/RefactoringSuggestions';

const mockSuggestions = [
  {
    id: 'refactor-1',
    title: 'Extract Large Function',
    description: 'Break down this large function into smaller, more focused functions',
    reasoning: 'Large functions are harder to understand, test, and maintain. Breaking them into smaller functions improves readability and reusability.',
    type: 'extract-method',
    complexity: 'medium',
    impact: 'high',
    beforeCode: 'function largeFn() {\n  // lots of code\n  return result;\n}',
    afterCode: 'function smallFn1() {\n  // specific logic\n}\n\nfunction smallFn2() {\n  // other logic\n}\n\nfunction mainFn() {\n  smallFn1();\n  smallFn2();\n}',
    line: 1,
    estimatedTime: '10-15 minutes',
    isApplicable: true,
    category: 'refactoring',
  },
  {
    id: 'refactor-2',
    title: 'Extract Constants',
    description: 'Replace magic numbers with named constants',
    reasoning: 'Magic numbers make code harder to understand and maintain.',
    type: 'extract-constant',
    complexity: 'low',
    impact: 'medium',
    beforeCode: 'if (user.age >= 18) {\n  // Do something\n}',
    afterCode: 'const LEGAL_AGE = 18;\n\nif (user.age >= LEGAL_AGE) {\n  // Do something\n}',
    line: 5,
    estimatedTime: '2-5 minutes',
    isApplicable: true,
    category: 'refactoring',
  }
];

describe('RefactoringSuggestions', () => {
  const mockOnApply = jest.fn();
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders refactoring suggestions correctly', () => {
    render(
      <RefactoringSuggestions
        suggestions={mockSuggestions}
        onApplySuggestion={mockOnApply}
        onDismissSuggestion={mockOnDismiss}
      />
    );

    expect(screen.getByText('Intelligent Refactoring Suggestions (2)')).toBeInTheDocument();
    expect(screen.getByText('Extract Large Function')).toBeInTheDocument();
    expect(screen.getByText('Extract Constants')).toBeInTheDocument();
  });

  it('displays suggestion metadata correctly', () => {
    render(
      <RefactoringSuggestions
        suggestions={mockSuggestions}
        onApplySuggestion={mockOnApply}
        onDismissSuggestion={mockOnDismiss}
      />
    );

    expect(screen.getByText('Line 1')).toBeInTheDocument();
    expect(screen.getByText('medium complexity')).toBeInTheDocument();
    expect(screen.getByText('high impact')).toBeInTheDocument();
    expect(screen.getByText('10-15 minutes')).toBeInTheDocument();
  });

  it('shows reasoning for refactoring suggestions', () => {
    render(
      <RefactoringSuggestions
        suggestions={mockSuggestions}
        onApplySuggestion={mockOnApply}
        onDismissSuggestion={mockOnDismiss}
      />
    );

    expect(screen.getByText(/Large functions are harder to understand/)).toBeInTheDocument();
    expect(screen.getByText(/Magic numbers make code harder to understand/)).toBeInTheDocument();
  });

  it('expands and collapses code examples when clicked', async () => {
    render(
      <RefactoringSuggestions
        suggestions={mockSuggestions}
        onApplySuggestion={mockOnApply}
        onDismissSuggestion={mockOnDismiss}
      />
    );

    const expandButton = screen.getAllByText(/Show before\/after code/)[0];
    fireEvent.click(expandButton);

    await waitFor(() => {
      expect(screen.getByText('Before')).toBeInTheDocument();
      expect(screen.getByText('After')).toBeInTheDocument();
      expect(screen.getByText(/function largeFn/)).toBeInTheDocument();
    });

    const collapseButton = screen.getByText(/Hide before\/after code/);
    fireEvent.click(collapseButton);

    await waitFor(() => {
      expect(screen.queryByText('Before')).not.toBeInTheDocument();
    });
  });

  it('calls onApplySuggestion when Apply Refactoring is clicked', () => {
    render(
      <RefactoringSuggestions
        suggestions={mockSuggestions}
        onApplySuggestion={mockOnApply}
        onDismissSuggestion={mockOnDismiss}
      />
    );

    const applyButtons = screen.getAllByText('Apply Refactoring');
    fireEvent.click(applyButtons[0]);

    expect(mockOnApply).toHaveBeenCalledWith(mockSuggestions[0]);
  });

  it('calls onDismissSuggestion when Dismiss is clicked', () => {
    render(
      <RefactoringSuggestions
        suggestions={mockSuggestions}
        onApplySuggestion={mockOnApply}
        onDismissSuggestion={mockOnDismiss}
      />
    );

    const dismissButtons = screen.getAllByText('Dismiss');
    fireEvent.click(dismissButtons[0]);

    expect(mockOnDismiss).toHaveBeenCalledWith('refactor-1');
  });

  it('updates button state when refactoring is applied', () => {
    render(
      <RefactoringSuggestions
        suggestions={mockSuggestions}
        onApplySuggestion={mockOnApply}
        onDismissSuggestion={mockOnDismiss}
      />
    );

    const applyButtons = screen.getAllByText('Apply Refactoring');
    fireEvent.click(applyButtons[0]);

    expect(screen.getByText('✅ Applied')).toBeInTheDocument();
    expect(screen.getByText('✅ 1 applied')).toBeInTheDocument();
  });

  it('hides dismissed suggestions', () => {
    render(
      <RefactoringSuggestions
        suggestions={mockSuggestions}
        onApplySuggestion={mockOnApply}
        onDismissSuggestion={mockOnDismiss}
      />
    );

    const dismissButtons = screen.getAllByText('Dismiss');
    fireEvent.click(dismissButtons[0]);

    expect(screen.getByText('Intelligent Refactoring Suggestions (1)')).toBeInTheDocument();
    expect(screen.queryByText('Extract Large Function')).not.toBeInTheDocument();
    expect(screen.getByText('Extract Constants')).toBeInTheDocument();
  });

  it('renders correct icons for different refactoring types', () => {
    render(
      <RefactoringSuggestions
        suggestions={mockSuggestions}
        onApplySuggestion={mockOnApply}
        onDismissSuggestion={mockOnDismiss}
      />
    );

    // Check for type icons (emojis are in the DOM)
    expect(screen.getByText('🔧')).toBeInTheDocument(); // extract-method
    expect(screen.getByText('🔤')).toBeInTheDocument(); // extract-constant
  });

  it('renders empty state when no suggestions', () => {
    render(
      <RefactoringSuggestions
        suggestions={[]}
        onApplySuggestion={mockOnApply}
        onDismissSuggestion={mockOnDismiss}
      />
    );

    expect(screen.getByText('No refactoring suggestions available for this code')).toBeInTheDocument();
  });

  it('applies correct CSS classes for complexity levels', () => {
    render(
      <RefactoringSuggestions
        suggestions={mockSuggestions}
        onApplySuggestion={mockOnApply}
        onDismissSuggestion={mockOnDismiss}
      />
    );

    const mediumComplexity = screen.getByText('medium complexity');
    const lowComplexity = screen.getByText('low complexity');

    expect(mediumComplexity).toHaveClass('text-yellow-600');
    expect(lowComplexity).toHaveClass('text-green-600');
  });

  it('applies correct CSS classes for impact levels', () => {
    render(
      <RefactoringSuggestions
        suggestions={mockSuggestions}
        onApplySuggestion={mockOnApply}
        onDismissSuggestion={mockOnDismiss}
      />
    );

    const highImpact = screen.getByText('high impact');
    const mediumImpact = screen.getByText('medium impact');

    expect(highImpact).toHaveClass('text-purple-600');
    expect(mediumImpact).toHaveClass('text-blue-600');
  });
});