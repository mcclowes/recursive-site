import { NextRequest, NextResponse } from 'next/server';
import { analyzeCodeWithAI } from '@/lib/ai-analyzer';

export async function POST(request: NextRequest) {
  try {
    const { code, language } = await request.json();

    if (!code || !language) {
      return NextResponse.json({ error: 'Code and language are required' }, { status: 400 });
    }

    // Use AI-powered code analysis
    const analysis = await analyzeCodeWithAI(code, language);
    
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error analyzing code:', error);
    return NextResponse.json({ error: 'Failed to analyze code' }, { status: 500 });
  }
}