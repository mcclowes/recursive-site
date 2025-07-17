# Vercel Deployment Failure Webhook Setup

This guide explains how to set up automatic GitHub issue creation when Vercel production deployments fail.

## Overview

When a production deployment fails on Vercel, a webhook will automatically create a GitHub issue with details about the failure. This helps maintain visibility and quick response to production issues.

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your deployment environment:

```env
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_REPOSITORY_OWNER=mcclowes
GITHUB_REPOSITORY_NAME=recursive-site
```

#### GitHub Token Setup

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token" > "Generate new token (classic)"
3. Give it a name like "Vercel Deployment Webhook"
4. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `write:org` (Write org and team membership, read org projects)
5. Click "Generate token"
6. Copy the token and add it to your environment variables

### 2. Vercel Webhook Configuration

1. Go to your Vercel project dashboard
2. Navigate to "Settings" > "Git"
3. Scroll down to "Deploy Hooks"
4. Click "Create Hook"
5. Configure the hook:
   - **Name**: `Production Deployment Failure`
   - **URL**: `https://your-domain.com/api/vercel-webhook`
   - **Events**: Select `deployment.created` and `deployment.failed`

### 3. Testing the Webhook

You can test the webhook locally using the provided test script:

```bash
# Start the development server
npm run dev

# In another terminal, run the test script
node scripts/test-webhook.js
```

### 4. Webhook Payload

The webhook expects a payload from Vercel with the following structure:

```json
{
  "type": "deployment",
  "deployment": {
    "id": "deployment-id",
    "url": "https://your-app.vercel.app",
    "name": "deployment-name",
    "state": "ERROR",
    "target": "production",
    "error": {
      "code": "BUILD_ERROR",
      "message": "Error details"
    }
  },
  "project": {
    "id": "project-id",
    "name": "project-name"
  }
}
```

## How It Works

1. **Webhook Trigger**: Vercel sends a POST request to `/api/vercel-webhook` when a deployment event occurs
2. **Filtering**: The webhook only processes deployment events that are:
   - Type: `deployment`
   - Target: `production`
   - State: `ERROR`
3. **Issue Creation**: When conditions are met, a GitHub issue is created with:
   - Deployment details
   - Error information
   - Useful links for debugging
   - Automatic labels: `deployment-failure`, `production`, `automated`, `urgent`

## Security Considerations

- The webhook endpoint is public but only creates issues for genuine deployment failures
- The GitHub token should have minimal required permissions
- Consider adding webhook signature verification for production use

## Troubleshooting

### Common Issues

1. **Missing GitHub Token**
   - Ensure `GITHUB_TOKEN` is set in your environment variables
   - Verify the token has `repo` scope permissions

2. **Repository Not Found**
   - Check `GITHUB_REPOSITORY_OWNER` and `GITHUB_REPOSITORY_NAME` are correct
   - Ensure the GitHub token has access to the repository

3. **Webhook Not Triggering**
   - Verify the webhook URL is correct and accessible
   - Check Vercel webhook configuration includes the right events
   - Check server logs for any errors

### Logs

The webhook endpoint logs information about:
- Received webhook events
- Filtering decisions
- Issue creation success/failure
- API errors

Check your deployment logs for debugging information.

## Future Enhancements

Potential improvements for this webhook:

1. **Webhook Signature Verification**: Add Vercel webhook signature verification for security
2. **Duplicate Issue Prevention**: Check for existing open issues before creating new ones
3. **Slack/Discord Integration**: Send notifications to team channels
4. **Auto-Assignment**: Automatically assign issues to team members based on deployment context
5. **Deployment Status Updates**: Update issues when deployments are fixed

## Example Issue

When a deployment fails, an issue like this will be created:

```
🚨 Production Deployment Failed - 2024-01-15

## Deployment Failure Details

**Deployment ID**: `dpl_abc123`
**Project**: recursive-site
**Target**: production
**State**: ERROR
**URL**: https://recursive-site.vercel.app
**Timestamp**: 2024-01-15T10:30:00.000Z

## Error Details

**Error Code**: `BUILD_ERROR`
**Error Message**: 
```
Build failed due to TypeScript errors
```

## Action Required

1. **Investigate the deployment failure** by checking the Vercel dashboard
2. **Review recent changes** that might have caused the failure
3. **Fix the issue** and trigger a new deployment
4. **Close this issue** once the deployment is successful

[Additional details and links...]
```

This automated issue creation helps maintain visibility of production issues and ensures quick response times.