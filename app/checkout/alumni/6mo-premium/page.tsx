'use client';

import React from 'react';

const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default function AlumniSixMonthPremiumCheckout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-400 text-sm font-medium mb-4">
            Alumni Pricing - Save $2,400
          </div>
          <div className="text-5xl font-bold mb-2">$7,200</div>
          <div className="text-slate-400 line-through text-xl mb-6">$9,600</div>
          <h1 className="text-3xl font-bold mb-2">6 months</h1>
          <p className="text-xl text-slate-300">Boundless Creator Program</p>
          <p className="text-slate-400 mt-2">The ultimate coaching experience. Deep Dive strategy, monthly calls, and priority access.</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-4">What's Included</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckIcon />
              <span>3-hour Deep Dive strategy call (with prep)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckIcon />
              <span>6 monthly 1:1 accountability calls</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckIcon />
              <span>Priority chat support (ASAP response)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckIcon />
              <span>Community access (Discord)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckIcon />
              <span>Weekly office hours (Wednesdays 2 PM EST)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckIcon />
              <span>Personalized strategy document</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-6">Payment Options</h2>
          
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-semibold text-lg">Pay in Full</div>
                  <div className="text-sm text-slate-400">One-time payment</div>
                </div>
                <div className="text-2xl font-bold">$7,200</div>
              </div>
              <a
                href="/api/checkout/alumni/6mo-premium"
                className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-center transition-colors"
              >
                Pay $7,200
              </a>
            </div>

            <div className="bg-slate-900 rounded-lg p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-lg">2 Monthly Payments</div>
                  <div className="text-sm text-slate-400">$3,600/mo for 2 months</div>
                </div>
                <div className="text-2xl font-bold">$3,600</div>
              </div>
              <div className="text-sm text-slate-500 mb-4">$7,200 total</div>
              <a
                href="/api/checkout/alumni/6mo-premium-2pay"
                className="block w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-center transition-colors"
              >
                Start with $3,600
              </a>
            </div>

            <div className="bg-slate-900 rounded-lg p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-lg">3 Monthly Payments</div>
                  <div className="text-sm text-slate-400">$2,400/mo for 3 months</div>
                </div>
                <div className="text-2xl font-bold">$2,400</div>
              </div>
              <div className="text-sm text-slate-500 mb-4">$7,200 total</div>
              <a
                href="/api/checkout/alumni/6mo-premium-3pay"
                className="block w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-center transition-colors"
              >
                Start with $2,400
              </a>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center text-sm">
          <div className="font-semibold mb-2">Money-Back Guarantee</div>
          <div className="text-slate-400">
            Attend at least half the calls and publish 12 videos. Full refund if not worth it.
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="/alumni" className="text-blue-400 hover:text-blue-300">
            ← Back to alumni pricing
          </a>
        </div>
      </div>
    </div>
  );
}
