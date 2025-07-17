import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Code Review Tool - Instant Code Analysis',
  description:
    'Transform your code with AI-powered analysis! Get instant quality scores, improvement suggestions, and real-time feedback for JavaScript, TypeScript, Python, Java, and more.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className='antialiased'>{children}</body>
    </html>
  );
}
