import { render, screen } from '@testing-library/react';
import Home from '../app/page';

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('🚀 AI Code Review Tool');
  });

  it('renders the description', () => {
    render(<Home />);

    const description = screen.getByText(
      'Get instant AI-powered code analysis and improvement suggestions'
    );
    expect(description).toBeInTheDocument();
  });

  it('renders the code editor section', () => {
    render(<Home />);

    const codeEditorHeading = screen.getByText('Code Editor');
    expect(codeEditorHeading).toBeInTheDocument();

    const analyzeButton = screen.getByRole('button', { name: /analyze code/i });
    expect(analyzeButton).toBeInTheDocument();
  });

  it('renders the analysis results section', () => {
    render(<Home />);

    const analysisHeading = screen.getByText('Analysis Results');
    expect(analysisHeading).toBeInTheDocument();

    const placeholderText = screen.getByText(
      'Enter your code and click "Analyze Code" to get started'
    );
    expect(placeholderText).toBeInTheDocument();
  });

  it('renders the features section', () => {
    render(<Home />);

    const featuresHeading = screen.getByText('Features');
    expect(featuresHeading).toBeInTheDocument();

    const instantAnalysis = screen.getByText('Instant Analysis');
    const smartSuggestions = screen.getByText('Smart Suggestions');
    const multipleLanguages = screen.getByText('Multiple Languages');

    expect(instantAnalysis).toBeInTheDocument();
    expect(smartSuggestions).toBeInTheDocument();
    expect(multipleLanguages).toBeInTheDocument();
  });

  it('renders the language selector', () => {
    render(<Home />);

    const languageSelector = screen.getByDisplayValue('JavaScript');
    expect(languageSelector).toBeInTheDocument();
  });
});
