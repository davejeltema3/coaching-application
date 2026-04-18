'use client';

import { useState, useEffect } from 'react';
import { plans, formatCents, type Plan, type PaymentOption } from '@/lib/plans';

export default function Custom6MonthCheckoutPage() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('6mo-plus-6x');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    // Use the standalone 6mo-monthly plan
    const bcpPlan = plans['6mo-monthly'];
    if (bcpPlan) {
      setPlan(bcpPlan);
      setSelectedOption('6mo-monthly-6x');
    }
  }, []);

  // Get applicant email from localStorage or URL param for Stripe pre-fill
  const getApplicantEmail = (): string | undefined => {
    const params = new URLSearchParams(window.location.search);
    return params.get('email') || 
      (typeof window !== 'undefined' ? localStorage.getItem('bcp_applicant_email') || undefined : undefined);
  };

  const handleCheckout = async () => {
    if (!plan || !selectedOption) return;
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planCode: plan.code,
          paymentOptionId: selectedOption,
          customerEmail: getApplicantEmail(),
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setIsLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-xl">
            <h1 className="text-2xl font-bold text-white mb-4">
              Loading...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  // Only show the 6-month payment option
  const sixMonthOption = plan.paymentOptions.find((o) => o.id === '6mo-plus-6x');
  
  if (!sixMonthOption) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-xl">
            <h1 className="text-2xl font-bold text-white mb-4">
              Payment plan not available
            </h1>
            <p className="text-slate-400">
              Please contact{' '}
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

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        {!logoError && (
          <div className="mb-8 flex justify-center">
            <img
              src="/images/logo.png"
              alt="Boundless Creator"
              onError={() => setLogoError(true)}
              className="max-h-[60px] object-contain"
            />
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
          {/* Plan Header */}
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-500/10 border-b border-slate-800 p-6 md:p-8">
            <div className="text-blue-400 text-sm font-medium mb-1">
              {plan.duration}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {plan.name}
            </h1>
            <p className="text-slate-300">{plan.tagline}</p>
          </div>

          {/* What's Included */}
          <div className="p-6 md:p-8 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white mb-4">
              What&apos;s Included
            </h2>
            <ul className="space-y-3">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
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
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Option (6 months only) */}
          <div className="p-6 md:p-8 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white mb-4">
              Payment Plan
            </h2>
            <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">
                    {sixMonthOption.label}
                  </div>
                  <div className="text-sm text-slate-400 mt-0.5">
                    {sixMonthOption.description}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">
                    {formatCents(sixMonthOption.amountCents)}/mo
                  </div>
                  {sixMonthOption.recurring && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      {formatCents(sixMonthOption.recurring.totalCents)} total
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="p-6 md:p-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold text-lg px-8 py-4 rounded-lg transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-blue-500/30 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
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
                  Redirecting to payment...
                </span>
              ) : (
                `Start Payment Plan - ${formatCents(sixMonthOption.amountCents)}/mo`
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-slate-500 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Secure payment powered by Stripe
            </div>
          </div>
        </div>

        {/* Guarantee */}
        <div className="mt-6 bg-slate-900/50 border border-slate-800 rounded-lg p-6 text-center">
          <p className="text-slate-400 text-sm">
            <span className="text-white font-medium">Money-Back Guarantee:</span>{' '}
            Attend at least half the calls and publish 12 videos using the system.
            If it&apos;s not worth it, you get a full refund.
          </p>
        </div>

        <div className="mt-4 mb-8 text-center space-y-2">
          <p className="text-slate-500 text-xs">
            Your info stays private. No spam, no selling your data.
          </p>
          <p className="text-slate-600 text-xs">
            Questions?{' '}
            <a
              href="mailto:hello@boundlesscreator.com"
              className="text-slate-500 hover:text-slate-400 underline"
            >
              hello@boundlesscreator.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
