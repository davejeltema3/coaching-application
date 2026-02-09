'use client';

import { useState, useEffect } from 'react';

interface WelcomeData {
  success: boolean;
  customerName?: string;
  customerEmail?: string;
  planName?: string;
  duration?: string;
  error?: string;
}

export default function WelcomePage() {
  const [data, setData] = useState<WelcomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const testMode = params.get('test') === 'true';

    if (!sessionId && !testMode) {
      setData({ success: false, error: 'No session found' });
      setLoading(false);
      return;
    }

    const apiUrl = testMode
      ? '/api/welcome?test=true'
      : `/api/welcome?session_id=${sessionId}`;

    fetch(apiUrl)
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => {
        setData({ success: false, error: 'Failed to verify payment' });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-slate-400">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (!data?.success) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-xl">
            <h1 className="text-2xl font-bold text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-slate-400 mb-6">
              We couldn&apos;t verify your payment. Don&apos;t worry — if you were charged,
              your payment is safe.
            </p>
            <p className="text-slate-400">
              Please reach out to{' '}
              <a
                href="mailto:hello@boundlesscreator.com"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                hello@boundlesscreator.com
              </a>{' '}
              and I&apos;ll get you sorted right away.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="max-w-2xl mx-auto text-center">
        {!logoError && (
          <div className="mb-6 flex justify-center">
            <img
              src="/images/logo.png"
              alt="Boundless Creator"
              onError={() => setLogoError(true)}
              className="max-h-[60px] object-contain"
            />
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 md:p-12 shadow-xl">
          {/* Celebration */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Welcome to the BCP{data.customerName ? `, ${data.customerName.split(' ')[0]}` : ''}!
          </h1>

          <p className="text-lg text-slate-300 mb-8 leading-relaxed">
            Your payment is confirmed. I&apos;m excited to work with you.
          </p>

          {/* What Happens Next */}
          <div className="bg-slate-800/50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-white mb-4">
              What Happens Next
            </h2>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                  1
                </span>
                <div>
                  <div className="text-white font-medium">Check your email</div>
                  <div className="text-slate-400 text-sm">
                    You&apos;ll receive a welcome email with everything you need to get started,
                    including your Discord invite.
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                  2
                </span>
                <div>
                  <div className="text-white font-medium">I&apos;ll reach out personally</div>
                  <div className="text-slate-400 text-sm">
                    I&apos;ll be in touch to get your onboarding scheduled.
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                  3
                </span>
                <div>
                  <div className="text-white font-medium">Join office hours</div>
                  <div className="text-slate-400 text-sm">
                    Weekly on Wednesdays at 2 PM EST. You&apos;re welcome to join the next one.
                  </div>
                </div>
              </li>
            </ol>
          </div>

          <p className="text-slate-400">
            Questions? Reach me directly at{' '}
            <a
              href="mailto:hello@boundlesscreator.com"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              hello@boundlesscreator.com
            </a>
          </p>
        </div>

        <div className="mt-6 text-slate-600 text-xs text-center">
          A receipt has been sent to your email.
        </div>
      </div>
    </div>
  );
}
