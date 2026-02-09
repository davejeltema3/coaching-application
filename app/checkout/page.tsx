'use client';

import { useState, useEffect } from 'react';
import { plans, formatCents, type Plan, type PaymentOption } from '@/lib/plans';

export default function CheckoutPage() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planCode = params.get('plan');
    if (planCode && plans[planCode]) {
      setPlan(plans[planCode]);
      setSelectedOption(plans[planCode].paymentOptions[0].id);
    }
  }, []);

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
              Invalid Payment Link
            </h1>
            <p className="text-slate-400">
              This link doesn&apos;t appear to be valid. If you received this from Dave,
              please reach out at{' '}
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

  const selectedPayment = plan.paymentOptions.find(
    (o) => o.id === selectedOption
  );

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

          {/* Payment Options */}
          <div className="p-6 md:p-8 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white mb-4">
              Payment Options
            </h2>
            <div className="space-y-3">
              {plan.paymentOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedOption === option.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">
                        {option.label}
                      </div>
                      <div className="text-sm text-slate-400 mt-0.5">
                        {option.description}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">
                        {formatCents(option.amountCents)}
                      </div>
                      {option.recurring && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {formatCents(option.recurring.totalCents)} total
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Radio indicator */}
                  <div className="absolute top-0 right-0" />
                </button>
              ))}
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
              disabled={isLoading || !selectedOption}
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
              ) : selectedPayment?.recurring ? (
                `Start Payment Plan - ${formatCents(selectedPayment.amountCents)}/mo`
              ) : (
                `Pay ${selectedPayment ? formatCents(selectedPayment.amountCents) : ''}`
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

        <div className="mt-4 text-center text-slate-600 text-xs">
          Questions?{' '}
          <a
            href="mailto:hello@boundlesscreator.com"
            className="text-slate-500 hover:text-slate-400 underline"
          >
            hello@boundlesscreator.com
          </a>
        </div>
      </div>
    </div>
  );
}
