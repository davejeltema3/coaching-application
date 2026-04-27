import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Application — Boundless Creator Accelerator',
  description:
    'Apply for the Boundless Creator Accelerator. Premium 1:1 YouTube coaching with Dave Jeltema to grow your channel with proven strategies.',
  openGraph: {
    title: 'Application — Boundless Creator Accelerator',
    description:
      'Apply for the Boundless Creator Accelerator. Premium 1:1 YouTube coaching with Dave Jeltema to grow your channel with proven strategies.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Application — Boundless Creator Accelerator',
    description:
      'Apply for the Boundless Creator Accelerator. Premium 1:1 YouTube coaching with Dave Jeltema to grow your channel with proven strategies.',
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
      </body>
    </html>
  );
}
