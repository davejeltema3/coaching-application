import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Apply — Boundless Creator Program',
  description:
    'Apply for 1:1 YouTube coaching with Dave Jeltema. Transform your channel with personalized guidance and proven strategies.',
  openGraph: {
    title: 'Apply — Boundless Creator Program',
    description:
      'Apply for 1:1 YouTube coaching with Dave Jeltema. Transform your channel with personalized guidance and proven strategies.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apply — Boundless Creator Program',
    description:
      'Apply for 1:1 YouTube coaching with Dave Jeltema. Transform your channel with personalized guidance and proven strategies.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
        <footer className="fixed bottom-4 left-0 right-0 text-center text-slate-500 text-xs space-y-1">
          <div>Powered by Boundless Creator</div>
          <div className="text-slate-600">I&apos;ll never message you other than for verification purposes.</div>
        </footer>
      </body>
    </html>
  );
}
