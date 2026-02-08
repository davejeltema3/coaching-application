import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BCP Application — Boundless Creator Program',
  description:
    'Apply for the Boundless Creator Program. 1:1 YouTube coaching with Dave Jeltema to grow your channel with proven strategies.',
  openGraph: {
    title: 'BCP Application — Boundless Creator Program',
    description:
      'Apply for the Boundless Creator Program. 1:1 YouTube coaching with Dave Jeltema to grow your channel with proven strategies.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BCP Application — Boundless Creator Program',
    description:
      'Apply for the Boundless Creator Program. 1:1 YouTube coaching with Dave Jeltema to grow your channel with proven strategies.',
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
          <div className="text-slate-600">Your info stays private. No spam, no selling your data.</div>
        </footer>
      </body>
    </html>
  );
}
