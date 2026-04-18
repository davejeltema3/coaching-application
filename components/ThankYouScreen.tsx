import { useState } from 'react';

export default function ThankYouScreen() {
  const [logoError, setLogoError] = useState(false);

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
            Thanks for applying!
          </h1>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed">
            I&apos;ll review your application and channel. If you&apos;re a good fit,
            you&apos;ll hear from me soon at the email you provided.
          </p>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed">
            In the meantime, if you want more from me:
          </p>
          <div className="mb-8">
            <a
              href="https://boundlesscreator.kit.com/newsletter"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
            >
              ✉️ Subscribe to my Newsletter
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
