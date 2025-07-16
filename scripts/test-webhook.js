#!/usr/bin/env node

/**
 * Test script for the Vercel webhook endpoint
 * Run with: node test-webhook.js
 */

const testWebhook = async () => {
  const testPayload = {
    type: 'deployment',
    deployment: {
      id: 'test-deployment-id',
      url: 'https://test.vercel.app',
      name: 'test-deployment',
      state: 'ERROR',
      target: 'production',
      error: {
        code: 'BUILD_ERROR',
        message: 'Build failed due to TypeScript errors'
      }
    },
    project: {
      id: 'test-project-id',
      name: 'recursive-site'
    }
  };

  console.log('Testing Vercel webhook endpoint...');
  console.log('Payload:', JSON.stringify(testPayload, null, 2));

  try {
    const response = await fetch('http://localhost:3000/api/vercel-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);

    if (response.ok) {
      console.log('✅ Webhook endpoint is working correctly');
    } else {
      console.log('❌ Webhook endpoint returned an error');
    }
  } catch (error) {
    console.error('❌ Error testing webhook:', error.message);
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  testWebhook();
}

module.exports = testWebhook;