import { NextRequest, NextResponse } from 'next/server';
import { benchmarkCode } from '@/lib/performance-analyzer';

export async function POST(request: NextRequest) {
  try {
    const { code, language } = await request.json();

    if (!code || !language) {
      return NextResponse.json({ error: 'Code and language are required' }, { status: 400 });
    }

    // Perform performance benchmarking
    const results = await benchmarkCode(code, language);
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error benchmarking code:', error);
    return NextResponse.json({ error: 'Failed to benchmark code' }, { status: 500 });
  }
}