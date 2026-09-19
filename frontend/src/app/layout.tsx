import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { QueryProvider } from '../components/QueryProvider';
import { ToastProvider } from '../components/Toast';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Inter, Outfit } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'CareerPilot AI | Know Your Next Career Move',
  description:
    'The definitive career navigation system for engineering students and freshers. Identify skill gaps, take quick assessments, and receive actionable roadmaps to target roles.',
  metadataBase: new URL('https://careerpilot-ai-coral.vercel.app'),
  keywords: [
    'career roadmap',
    'skill gap analysis',
    'engineering career',
    'AI career coach',
    'resume analysis',
    'frontend developer roadmap',
    'backend developer roadmap',
    'CareerPilot',
  ],
  authors: [{ name: 'CareerPilot AI' }],
  robots: { index: true, follow: true },
  openGraph: {
    title: 'CareerPilot AI | Know Your Next Career Move',
    description:
      'AI-powered career GPS for engineering students. Identify gaps, build your roadmap, and reach your target role faster.',
    url: 'https://careerpilot-ai-coral.vercel.app',
    siteName: 'CareerPilot AI',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CareerPilot AI | Know Your Next Career Move',
    description:
      'AI-powered career GPS for engineering students. Identify gaps, build your roadmap, and reach your target role faster.',
    creator: '@careerpilotai',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} ${outfit.variable} min-h-full flex flex-col antialiased font-sans`}>
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
