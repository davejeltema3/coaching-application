'use client';

import React from 'react';

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-5 h-5 text-green-400 flex-shrink-0 mt-0.5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function AlumniOfferPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-full text-green-400 text-sm font-medium mb-6">
            Exclusive Alumni Offer
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-xl text-slate-300 mb-4">
            You've already trusted me once. Let's take it to the next level.
          </p>
          <p className="text-lg text-slate-400">
            As a thank you for being a previous client, you get <span className="text-green-400 font-bold">25% off</span> any BCP tier.
          </p>
        </div>

        {/* Discount Badge */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 mb-12 text-center shadow-2xl">
          <div className="text-6xl font-bold mb-2">25% OFF</div>
          <div className="text-xl">Exclusive Alumni Pricing</div>
        </div>

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* 6-Month Premium */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-colors">
            <div className="text-sm text-slate-400 mb-2">6-Month Premium</div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold">$7,200</span>
              <span className="text-slate-400 line-through">$9,600</span>
            </div>
            <div className="text-xs text-green-400 mb-4">Save $2,400</div>
            <ul className="space-y-2 text-sm text-slate-300 mb-6">
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>6 months of support</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Monthly 1:1 strategy calls</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Instant chat access</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Weekly office hours</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Private Discord community</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Deep-dive channel review</span>
              </li>
            </ul>
            <a
              href="/checkout/alumni/6mo-premium"
              className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-center transition-colors"
            >
              Choose Payment Option →
            </a>
          </div>

          {/* 3-Month Premium */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-colors">
            <div className="text-sm text-slate-400 mb-2">3-Month Premium</div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold">$4,500</span>
              <span className="text-slate-400 line-through">$6,000</span>
            </div>
            <div className="text-xs text-green-400 mb-4">Save $1,500</div>
            <ul className="space-y-2 text-sm text-slate-300 mb-6">
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>3 months of support</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Monthly 1:1 strategy calls</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Instant chat access</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Weekly office hours</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Private Discord community</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Deep-dive channel review</span>
              </li>
            </ul>
            <a
              href="/checkout/alumni/3mo-premium"
              className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-center transition-colors"
            >
              Choose Payment Option →
            </a>
          </div>

          {/* 6-Month Standard */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-colors">
            <div className="text-sm text-slate-400 mb-2">6-Month Standard</div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold">$4,350</span>
              <span className="text-slate-400 line-through">$5,800</span>
            </div>
            <div className="text-xs text-green-400 mb-4">Save $1,450</div>
            <ul className="space-y-2 text-sm text-slate-300 mb-6">
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>6 months of support</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Monthly 1:1 strategy calls</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Instant chat access</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Weekly office hours</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Private Discord community</span>
              </li>
            </ul>
            <a
              href="/checkout/alumni/6mo-standard"
              className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-center transition-colors"
            >
              Choose Payment Option →
            </a>
          </div>

          {/* 3-Month Standard */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-colors">
            <div className="text-sm text-slate-400 mb-2">3-Month Standard</div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold">$2,625</span>
              <span className="text-slate-400 line-through">$3,500</span>
            </div>
            <div className="text-xs text-green-400 mb-4">Save $875</div>
            <ul className="space-y-2 text-sm text-slate-300 mb-6">
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>3 months of support</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Monthly 1:1 strategy calls</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Instant chat access</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Weekly office hours</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Private Discord community</span>
              </li>
            </ul>
            <a
              href="/checkout/alumni/3mo-standard"
              className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-center transition-colors"
            >
              Choose Payment Option →
            </a>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-slate-300 mb-6">
            Book a quick call to confirm which tier fits best, or if you already know, we can skip straight to payment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://cal.com/davejeltema/bcp-alumni"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition-colors"
            >
              Book a Call
            </a>
            <a
              href="mailto:hello@boundlesscreator.com?subject=Alumni%20Payment%20-%20BCP"
              className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-lg transition-colors"
            >
              Email to Pay Directly
            </a>
          </div>
        </div>

        {/* Guarantee */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
          <div className="text-lg font-semibold mb-2">Same Money-Back Guarantee</div>
          <p className="text-slate-400 text-sm">
            Attend half the calls + upload 12 videos. If you don't see results, I'll refund you in full.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-slate-500">
          <p>This offer is exclusive to previous clients of Dave Jeltema / Boundless Creator</p>
          <p className="mt-2">Questions? Email <a href="mailto:hello@boundlesscreator.com" className="text-blue-400 hover:text-blue-300">hello@boundlesscreator.com</a></p>
        </div>
      </div>
    </div>
  );
}
