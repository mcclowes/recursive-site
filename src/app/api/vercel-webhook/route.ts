import { NextRequest, NextResponse } from 'next/server';

interface VercelWebhookPayload {
  type: string;
  deployment: {
    id: string;
    url: string;
    name: string;
    state: string;
    target: string;
    error?: {
      code: string;
      message: string;
    };
  };
  team?: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload: VercelWebhookPayload = await request.json();
    
    // Verify this is a deployment event
    if (payload.type !== 'deployment') {
      return NextResponse.json({ message: 'Not a deployment event' }, { status: 200 });
    }

    // Only handle production deployments
    if (payload.deployment.target !== 'production') {
      return NextResponse.json({ message: 'Not a production deployment' }, { status: 200 });
    }

    // Only handle failed deployments
    if (payload.deployment.state !== 'ERROR') {
      return NextResponse.json({ message: 'Deployment not in error state' }, { status: 200 });
    }

    // Create GitHub issue for failed deployment
    const issueCreated = await createDeploymentFailureIssue(payload);
    
    if (issueCreated) {
      return NextResponse.json({ message: 'Issue created successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Failed to create issue' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing Vercel webhook:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}

async function createDeploymentFailureIssue(payload: VercelWebhookPayload): Promise<boolean> {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.error('GITHUB_TOKEN environment variable is not set');
    return false;
  }

  const repoOwner = process.env.GITHUB_REPOSITORY_OWNER || 'mcclowes';
  const repoName = process.env.GITHUB_REPOSITORY_NAME || 'recursive-site';

  const issueTitle = `🚨 Production Deployment Failed - ${new Date().toISOString().split('T')[0]}`;
  const issueBody = `<!-- This issue was automatically created by the Vercel deployment failure webhook -->

## Deployment Failure Details

**Deployment ID**: \`${payload.deployment.id}\`
**Project**: ${payload.project.name}
**Target**: ${payload.deployment.target}
**State**: ${payload.deployment.state}
**URL**: ${payload.deployment.url}
**Timestamp**: ${new Date().toISOString()}

${payload.deployment.error ? `
## Error Details

**Error Code**: \`${payload.deployment.error.code}\`
**Error Message**: 
\`\`\`
${payload.deployment.error.message}
\`\`\`
` : ''}

## Action Required

1. **Investigate the deployment failure** by checking the Vercel dashboard
2. **Review recent changes** that might have caused the failure
3. **Fix the issue** and trigger a new deployment
4. **Close this issue** once the deployment is successful

## Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Deployment Logs](https://vercel.com/${repoOwner}/${repoName}/deployments/${payload.deployment.id})
- [Repository](https://github.com/${repoOwner}/${repoName})

---

**This issue was automatically created by the Vercel deployment failure monitoring system.**
`;

  try {
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        title: issueTitle,
        body: issueBody,
        labels: ['deployment-failure', 'production', 'automated', 'urgent']
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to create GitHub issue:', errorData);
      return false;
    }

    const issue = await response.json();
    console.log(`✅ Created GitHub issue #${issue.number}: ${issueTitle}`);
    return true;
  } catch (error) {
    console.error('Error creating GitHub issue:', error);
    return false;
  }
}