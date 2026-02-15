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
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-full text-green-400 text-sm font-medium mb-4">
            Exclusive Alumni Offer — 25% Off
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-lg text-slate-300">
            You've already trusted me once. Let's take it to the next level.
          </p>
        </div>

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* 6-Month Premium */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-green-500 transition-colors">
            <div className="text-sm text-slate-400 mb-1">6-Month Premium</div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold">$7,200</span>
              <span className="text-slate-400 line-through text-lg">$9,600</span>
            </div>
            <ul className="space-y-2 text-sm text-slate-300 mb-6">
              <li className="flex items-start gap-2">
                <CheckIcon />
                <span>3-hour Deep Dive + monthly 1:1 calls</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon />
                <span>Priority chat support</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon />
                <span>Discord community + weekly office hours</span>
              </li>
            </ul>
            <a
              href="/checkout/alumni/6mo-premium"
              className="block w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-center transition-colors"
            >
              View Payment Options →
            </a>
          </div>

          {/* 3-Month Premium */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-green-500 transition-colors">
            <div className="text-sm text-slate-400 mb-1">3-Month Premium</div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold">$4,500</span>
              <span className="text-slate-400 line-through text-lg">$6,000</span>
            </div>
            <ul className="space-y-2 text-sm text-slate-300 mb-6">
              <li className="flex items-start gap-2">
                <CheckIcon />
                <span>3-hour Deep Dive + monthly 1:1 calls</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon />
                <span>Priority chat support</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon />
                <span>Discord community + weekly office hours</span>
              </li>
            </ul>
            <a
              href="/checkout/alumni/3mo-premium"
              className="block w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-center transition-colors"
            >
              View Payment Options →
            </a>
          </div>

          {/* 6-Month Standard */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-green-500 transition-colors">
            <div className="text-sm text-slate-400 mb-1">6-Month Standard</div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold">$4,350</span>
              <span className="text-slate-400 line-through text-lg">$5,800</span>
            </div>
            <ul className="space-y-2 text-sm text-slate-300 mb-6">
              <li className="flex items-start gap-2">
                <CheckIcon />
                <span>30-min onboarding call</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon />
                <span>Discord community + weekly office hours</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon />
                <span>Direct messaging support</span>
              </li>
            </ul>
            <a
              href="/checkout/alumni/6mo-standard"
              className="block w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-center transition-colors"
            >
              View Payment Options →
            </a>
          </div>

          {/* 3-Month Standard */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-green-500 transition-colors">
            <div className="text-sm text-slate-400 mb-1">3-Month Standard</div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold">$2,625</span>
              <span className="text-slate-400 line-through text-lg">$3,500</span>
            </div>
            <ul className="space-y-2 text-sm text-slate-300 mb-6">
              <li className="flex items-start gap-2">
                <CheckIcon />
                <span>30-min onboarding call</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon />
                <span>Discord community + weekly office hours</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon />
                <span>Direct messaging support</span>
              </li>
            </ul>
            <a
              href="/checkout/alumni/3mo-standard"
              className="block w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-center transition-colors"
            >
              View Payment Options →
            </a>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center mb-8">
          <h2 className="text-xl font-bold mb-3">Ready to Get Started?</h2>
          <p className="text-slate-300 mb-4 text-sm">
            Book a quick call to confirm which tier fits best, or choose a payment option above.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://cal.com/davejeltema/bcp-alumni"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              Book a Call
            </a>
            <a
              href="mailto:hello@boundlesscreator.com?subject=Alumni%20Payment%20-%20BCP"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors"
            >
              Email Dave
            </a>
          </div>
        </div>

        {/* Guarantee */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 text-center">
          <div className="text-base font-semibold mb-1">Money-Back Guarantee</div>
          <p className="text-slate-400 text-sm">
            Attend half the calls + upload 12 videos. If you don't see results, full refund.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>Exclusive to previous clients of Dave Jeltema / Boundless Creator</p>
          <p className="mt-2">Questions? <a href="mailto:hello@boundlesscreator.com" className="text-blue-400 hover:text-blue-300">hello@boundlesscreator.com</a></p>
        </div>
      </div>
    </div>
  );
}
