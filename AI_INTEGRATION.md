# AI Integration Guide

## Overview

The AI Code Review Tool now includes advanced AI-powered analysis capabilities that work alongside the existing rule-based analysis system.

## Features

### 🔍 Rule-Based Analysis (Always Available)
- Static code analysis with predefined rules
- Language-specific best practices
- Performance and maintainability scoring
- No external dependencies required

### 🤖 AI-Powered Analysis (Optional)
- Context-aware suggestions using OpenAI GPT models
- Advanced code quality insights
- Personalized recommendations
- Enhanced scoring system

## Setup

### Prerequisites
- OpenAI API account
- API key from [OpenAI Platform](https://platform.openai.com/account/api-keys)

### Configuration
1. Copy the environment template:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. Restart the development server:
   ```bash
   npm run dev
   ```

## How It Works

### Analysis Process
1. **Rule-Based Analysis**: Always runs first with predefined rules
2. **AI Analysis**: Runs if OpenAI API key is available
3. **Combined Results**: Merges both analyses with weighted scoring
4. **Fallback**: Gracefully uses only rule-based analysis if AI fails

### Scoring System
- **Without AI**: 100% rule-based scoring
- **With AI**: 40% rule-based + 60% AI-weighted scoring

### UI Indicators
- **Green dot**: AI analysis is active
- **Yellow dot**: AI analysis unavailable
- **AI badge**: Shows AI-generated suggestions
- **Category tags**: Performance, security, readability, etc.

## API Usage

### Request Format
```json
{
  "code": "function example() { return 'hello'; }",
  "language": "javascript"
}
```

### Response Format
```json
{
  "analysis": {
    "score": 85,
    "suggestions": [
      {
        "type": "suggestion",
        "message": "Consider using arrow functions for better readability",
        "line": 1,
        "source": "AI",
        "category": "readability"
      }
    ],
    "metrics": {
      "lines": 1,
      "characters": 34,
      "complexity": 1,
      "maintainability": "High",
      "aiAnalysisAvailable": true
    }
  }
}
```

## Security

- API keys are stored in environment variables only
- No code is stored or logged
- All analysis happens in real-time
- No data persistence or external sharing

## Troubleshooting

### AI Not Working
- Check if `OPENAI_API_KEY` is set correctly
- Verify API key is valid and has sufficient quota
- Check network connectivity
- Look for error messages in browser console

### Performance Issues
- AI analysis adds ~1-3 seconds to response time
- Consider rate limiting for production use
- Monitor OpenAI API usage and costs

## Cost Considerations

- OpenAI API calls are charged per token
- Average cost: ~$0.001-$0.01 per analysis
- Consider implementing caching for repeated analyses
- Set up usage monitoring and alerts

## Development

### Running Tests
```bash
npm test
```

### Building
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Contributing

When adding new AI features:
1. Ensure graceful fallback to rule-based analysis
2. Add proper error handling
3. Include comprehensive tests
4. Update documentation
5. Consider cost implications

## License

This AI integration is part of the main project license (ISC).