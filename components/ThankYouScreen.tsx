import { useState } from 'react';

interface ThankYouScreenProps {
  qualified: boolean;
  calBookingUrl?: string;
}

export default function ThankYouScreen({
  qualified,
  calBookingUrl = 'https://cal.com/davejeltema/bcp-1',
}: ThankYouScreenProps) {
  const [logoError, setLogoError] = useState(false);

  if (qualified) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-2xl mx-auto text-center">
          {!logoError && (
            <div className="mb-6 flex justify-center">
              <img
                src="/images/logo.png"
                alt="Logo"
                onError={() => setLogoError(true)}
                className="max-h-[60px] object-contain"
              />
            </div>
          )}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 md:p-12 shadow-xl">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
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
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
              You&apos;re in!
            </h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Your application looks great. Pick a time below and I&apos;ll reach out to you as soon as I can.
            </p>
            <div className="mb-8">
              <a
                href={calBookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg px-8 py-4 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-blue-500/50"
              >
                Pick a Time →
              </a>
            </div>
            <p className="text-sm text-slate-400">
              Or reach out directly at{' '}
              <a
                href="mailto:hello@boundlesscreator.com"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                hello@boundlesscreator.com
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Unqualified screen
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="max-w-2xl mx-auto text-center">
        {!logoError && (
          <div className="mb-6 flex justify-center">
            <img
              src="/images/logo.png"
              alt="Logo"
              onError={() => setLogoError(true)}
              className="max-h-[60px] object-contain"
            />
          </div>
        )}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 md:p-12 shadow-xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Thanks for your interest!
          </h1>
          <p className="text-lg text-slate-300 mb-6 leading-relaxed">
            Based on your answers, the 1:1 program might not be the best fit
            right now — and I&apos;d rather be honest about that than take your
            money.
          </p>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed">
            Here are some free resources that can help you get to the next
            level:
          </p>
          <div className="space-y-4 mb-8">
            <a
              href="https://youtube.com/@DaveJeltema"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-slate-800 hover:bg-slate-750 text-white font-semibold px-6 py-4 rounded-lg transition-all duration-200 hover:scale-[1.02] border border-slate-700"
            >
              📺 Watch my YouTube Channel
            </a>
            <a
              href="https://boundlesscreator.com/newsletter"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-slate-800 hover:bg-slate-750 text-white font-semibold px-6 py-4 rounded-lg transition-all duration-200 hover:scale-[1.02] border border-slate-700"
            >
              ✉️ Subscribe to my Newsletter
            </a>
          </div>
          <p className="text-slate-400">
            Keep creating — I hope I can work with you in the future!
          </p>
        </div>
      </div>
    </div>
  );
}
