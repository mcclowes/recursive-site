# Recursive Site

A repository that uses AI to continuously improve itself through automated GitHub Actions.

## 🤖 AI-Powered Improvement System

This repository includes a GitHub Action that runs every hour to analyze the codebase and generate improvement suggestions using OpenAI's GPT-4 model. The action creates GitHub issues with specific, actionable recommendations for enhancing the repository.

## 🚀 Features

- **Automated Analysis**: Scans repository structure and content every hour
- **AI-Powered Suggestions**: Uses OpenAI GPT-4 to generate intelligent improvement recommendations
- **GitHub Integration**: Automatically creates issues with detailed suggestions
- **Smart Filtering**: Focuses on actionable, implementable improvements
- **Manual Triggering**: Can be run manually via GitHub Actions UI

## 📋 Setup Instructions

### 1. Repository Secrets

You need to configure the following secrets in your GitHub repository:

1. Go to your repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add the following secrets:

#### Required Secrets

- **`OPENAI_API_KEY`**: Your OpenAI API key
  - Get one from [OpenAI Platform](https://platform.openai.com/api-keys)
  - This is required for the AI suggestions

#### Optional Secrets

- **`GITHUB_TOKEN`**: Usually provided automatically by GitHub Actions
  - If you need custom permissions, you can create a Personal Access Token

### 2. Repository Permissions

Ensure your repository has the following permissions enabled:

1. Go to repository settings → "Actions" → "General"
2. Under "Workflow permissions", select "Read and write permissions"
3. Enable "Allow GitHub Actions to create and approve pull requests"

### 3. Labels Setup

The action will automatically create issues with the following labels:
- `ai-suggestions`
- `enhancement`

You can create these labels in your repository or the action will create them automatically.

## 🔧 How It Works

### Workflow Structure

```
.github/workflows/ai-improvement-suggestions.yml
├── Scheduled trigger (every hour)
├── Manual trigger option
└── Two main steps:
    ├── Generate suggestions using OpenAI
    └── Create GitHub issue with suggestions
```

### Analysis Process

1. **Repository Analysis**: Scans the entire repository structure
2. **File Content Analysis**: Reads important configuration files
3. **GitHub API Integration**: Fetches repository metadata
4. **AI Processing**: Sends analysis to OpenAI GPT-4
5. **Issue Creation**: Creates a new GitHub issue with suggestions

### What Gets Analyzed

- Repository structure and file organization
- Configuration files (package.json, requirements.txt, etc.)
- Documentation files (README.md, LICENSE, etc.)
- Code patterns and file types
- Repository metadata (stars, forks, language, etc.)

## 📝 Generated Issues

Each generated issue includes:

- **Title**: Timestamped with 🤖 emoji
- **Body**: Detailed markdown-formatted suggestions
- **Labels**: `ai-suggestions` and `enhancement`
- **Content**: 3-5 specific, actionable improvement recommendations

### Example Issue Content

```markdown
# Repository Improvement Suggestions

## 📊 Analysis Summary
- Repository: recursive-site
- Files analyzed: 15
- File types: .md, .yml, .js, .json

## 🎯 Improvement Suggestions

### 1. Documentation Enhancement
- Add comprehensive API documentation
- Include usage examples and tutorials
- Create contributing guidelines

### 2. Code Quality Improvements
- Implement automated testing
- Add code linting and formatting
- Set up CI/CD pipeline

### 3. Structure Optimization
- Organize files into logical directories
- Add proper .gitignore file
- Include development setup instructions
```

## ⚙️ Customization

### Modify Schedule

Edit the cron expression in `.github/workflows/ai-improvement-suggestions.yml`:

```yaml
schedule:
  - cron: '0 * * * *'  # Every hour
  # Other options:
  # '0 */6 * * *'     # Every 6 hours
  # '0 0 * * *'       # Daily at midnight
  # '0 0 * * 1'       # Weekly on Monday
```

### Adjust AI Parameters

Modify the OpenAI API call in `.github/scripts/generate-suggestions.js`:

```javascript
{
  model: 'gpt-4',           // Change model
  max_tokens: 2000,         // Adjust response length
  temperature: 0.7          // Control creativity (0.0-1.0)
}
```

### Customize Analysis

Add or remove files to analyze in the `readImportantFiles()` function:

```javascript
const importantFiles = [
  'README.md',
  'package.json',
  // Add your custom files here
  'custom-config.yml'
];
```

## 🔒 Security Considerations

- **API Key Security**: The OpenAI API key is stored as a GitHub secret
- **Token Permissions**: Uses minimal required permissions
- **Rate Limiting**: Respects OpenAI API rate limits
- **Error Handling**: Graceful failure with detailed logging

## 📊 Monitoring

### Action Logs

Check the action execution in:
1. Go to "Actions" tab in your repository
2. Click on "AI Repository Improvement Suggestions"
3. View detailed logs for each run

### Issue Tracking

- All generated issues are labeled with `ai-suggestions`
- Issues include timestamps for tracking
- Manual review recommended before implementation

## 🛠️ Troubleshooting

### Common Issues

1. **Action Fails**: Check if `OPENAI_API_KEY` secret is set
2. **No Issues Created**: Verify repository permissions
3. **API Errors**: Check OpenAI API key validity and quota
4. **Permission Denied**: Ensure workflow has write permissions

### Debug Mode

To debug the action:

1. Go to Actions → "AI Repository Improvement Suggestions"
2. Click "Run workflow" → "Run workflow"
3. Check the logs for detailed error messages

## 🤝 Contributing

This repository demonstrates AI-powered self-improvement. Feel free to:

- Fork and customize for your own projects
- Submit improvements to the AI analysis logic
- Share your experience with AI-powered development

## 📄 License

This project is licensed under the ISC License.

---

*This repository is a living example of AI-assisted development. The very system that suggests improvements is also subject to its own recommendations!* 