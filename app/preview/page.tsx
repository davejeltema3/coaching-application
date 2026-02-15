'use client';

import { useState } from 'react';
import { questions } from '@/lib/questions';
import { plans, formatCents } from '@/lib/plans';
import WelcomeScreen from '@/components/WelcomeScreen';
import QuestionCard from '@/components/QuestionCard';
import MultipleChoice from '@/components/MultipleChoice';
import TextInput from '@/components/TextInput';
import ContactForm from '@/components/ContactForm';
import ThankYouScreen from '@/components/ThankYouScreen';

type Section = 'application' | 'checkout' | 'post-payment';

export default function PreviewPage() {
  const [activeSection, setActiveSection] = useState<Section>('application');
  const [activeTab, setActiveTab] = useState<string>('all');

  const sections: { id: Section; label: string }[] = [
    { id: 'application', label: 'Application Flow' },
    { id: 'checkout', label: 'Checkout Pages' },
    { id: 'post-payment', label: 'Post-Payment' },
  ];

  // Application tabs
  const appTabs = [
    { id: 'all', label: 'All Screens' },
    { id: 'welcome', label: 'Welcome' },
    ...questions.map((q, i) => ({ id: q.id, label: `Q${i + 1}: ${q.id}` })),
    { id: 'contact', label: 'Contact' },
    { id: 'qualified', label: 'Qualified' },
    { id: 'unqualified', label: 'Unqualified' },
  ];

  // Checkout tabs
  const alumniPlans = ['3mo', '3mo-plus', '6mo', '6mo-plus'];
  const checkoutTabs = [
    { id: 'all-checkout', label: 'All Plans' },
    ...Object.keys(plans).map((code) => ({ id: `checkout-${code}`, label: code })),
    { id: 'alumni-divider', label: '—' },
    { id: 'all-alumni', label: 'All Alumni' },
    ...alumniPlans.map((code) => ({ id: `alumni-${code}`, label: `alumni/${code}` })),
  ];

  // Post-payment tabs
  const postTabs = [
    { id: 'welcome-success', label: 'Welcome (Success)' },
    { id: 'welcome-error', label: 'Welcome (Error)' },
  ];

  const currentTabs =
    activeSection === 'application'
      ? appTabs
      : activeSection === 'checkout'
      ? checkoutTabs
      : postTabs;

  const renderAppScreen = (id: string) => {
    if (id === 'welcome') {
      return (
        <div key={id} className="border border-slate-700 rounded-lg overflow-hidden">
          <div className="bg-slate-800 px-4 py-2 text-sm text-slate-400 font-mono">
            Welcome Screen
          </div>
          <div className="bg-slate-950 p-4" style={{ minHeight: 400 }}>
            <WelcomeScreen onStart={() => {}} />
          </div>
        </div>
      );
    }

    if (id === 'contact') {
      return (
        <div key={id} className="border border-slate-700 rounded-lg overflow-hidden">
          <div className="bg-slate-800 px-4 py-2 text-sm text-slate-400 font-mono">
            Contact Form (after all questions)
          </div>
          <div className="bg-slate-950 p-8">
            <QuestionCard question="Contact Information">
              <ContactForm
                data={{ first_name: '', last_name: '', email: '', phone: '' }}
                onChange={() => {}}
              />
              <div className="flex gap-4 mt-8">
                <button className="px-6 py-3 text-slate-400">← Back</button>
                <button className="flex-1 bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg opacity-50">
                  Submit Application →
                </button>
              </div>
            </QuestionCard>
          </div>
        </div>
      );
    }

    if (id === 'qualified') {
      return (
        <div key={id} className="border border-slate-700 rounded-lg overflow-hidden">
          <div className="bg-slate-800 px-4 py-2 text-sm text-slate-400 font-mono">
            Thank You — Qualified ✅
          </div>
          <div className="bg-slate-950 p-4" style={{ minHeight: 400 }}>
            <ThankYouScreen qualified={true} />
          </div>
        </div>
      );
    }

    if (id === 'unqualified') {
      return (
        <div key={id} className="border border-slate-700 rounded-lg overflow-hidden">
          <div className="bg-slate-800 px-4 py-2 text-sm text-slate-400 font-mono">
            Thank You — Unqualified ❌
          </div>
          <div className="bg-slate-950 p-4" style={{ minHeight: 400 }}>
            <ThankYouScreen qualified={false} />
          </div>
        </div>
      );
    }

    // Question screens
    const questionIndex = questions.findIndex((q) => q.id === id);
    if (questionIndex === -1) return null;
    const question = questions[questionIndex];

    return (
      <div key={id} className="border border-slate-700 rounded-lg overflow-hidden">
        <div className="bg-slate-800 px-4 py-2 text-sm text-slate-400 font-mono">
          Question {questionIndex + 1}/{questions.length}: {question.id}
          {question.type === 'multiple-choice' && (
            <span className="ml-2 text-blue-400">[multiple-choice]</span>
          )}
          {question.type === 'text' && (
            <span className="ml-2 text-green-400">[text]</span>
          )}
          {question.type === 'url' && (
            <span className="ml-2 text-purple-400">[url]</span>
          )}
        </div>
        <div className="bg-slate-950 p-8">
          <QuestionCard question={question.question} subtext={question.subtext}>
            {question.type === 'multiple-choice' && question.choices && (
              <div>
                <MultipleChoice
                  choices={question.choices}
                  value=""
                  onChange={() => {}}
                  onNext={() => {}}
                />
                <div className="mt-4 space-y-1">
                  {question.choices.map((c) => (
                    <div key={c.value} className="text-xs text-slate-500 font-mono">
                      {c.value}: score={c.score}
                      {c.disqualifies && (
                        <span className="text-red-400 ml-2">⚠️ DISQUALIFIES</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {question.type === 'text' && (
              <TextInput
                value=""
                onChange={() => {}}
                placeholder={question.placeholder}
                multiline={true}
                required={question.required}
              />
            )}
            {question.type === 'url' && (
              <TextInput
                value=""
                onChange={() => {}}
                placeholder={question.placeholder}
                type="url"
                required={question.required}
              />
            )}
          </QuestionCard>
        </div>
      </div>
    );
  };

  const renderCheckoutScreen = (planCode: string) => {
    const plan = plans[planCode];
    if (!plan) return null;

    return (
      <div key={planCode} className="border border-slate-700 rounded-lg overflow-hidden">
        <div className="bg-slate-800 px-4 py-2 text-sm text-slate-400 font-mono flex justify-between">
          <span>Checkout: /checkout?plan={planCode}</span>
          <span className="text-green-400">{formatCents(plan.paymentOptions[0].amountCents)}</span>
        </div>
        <div className="bg-slate-950 p-6">
          {/* Plan Header */}
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-500/10 border border-slate-800 rounded-lg p-6 mb-6">
            <div className="text-blue-400 text-sm font-medium mb-1">{plan.duration}</div>
            <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
            <p className="text-slate-300">{plan.tagline}</p>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">What&apos;s Included</h3>
            <ul className="space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Options */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Payment Options</h3>
            <div className="space-y-3">
              {plan.paymentOptions.map((option, i) => (
                <div
                  key={option.id}
                  className={`p-4 rounded-lg border-2 ${
                    i === 0
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{option.label}</div>
                      <div className="text-sm text-slate-400 mt-0.5">{option.description}</div>
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
                </div>
              ))}
            </div>
          </div>

          {/* Button preview */}
          <button className="w-full bg-blue-600 text-white font-semibold text-lg px-8 py-4 rounded-lg opacity-75 cursor-default">
            Pay {formatCents(plan.paymentOptions[0].amountCents)}
          </button>

          <div className="mt-4 bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
            <p className="text-slate-400 text-sm">
              <span className="text-white font-medium">Money-Back Guarantee:</span>{' '}
              Attend at least half the calls and publish 12 videos. Full refund if not worth it.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderAlumniCheckoutScreen = (planCode: string) => {
    const alumniPricing: Record<string, { name: string; duration: string; tagline: string; features: string[]; price: number; originalPrice: number; paymentOptions: Array<{ label: string; description: string; amount: number; total?: number }> }> = {
      '3mo': {
        name: 'Boundless Creator Program',
        duration: '3 months',
        tagline: 'Kickstart your channel growth with focused, personalized coaching.',
        features: ['30-minute onboarding call', 'Community access (Discord)', 'Weekly office hours (Wednesdays 2 PM EST)', 'Direct messaging support'],
        price: 2625,
        originalPrice: 3500,
        paymentOptions: [
          { label: 'Pay in Full', description: 'One-time payment', amount: 2625 },
          { label: '2 Monthly Payments', description: '$1,500/mo for 2 months', amount: 1500, total: 3000 },
        ],
      },
      '3mo-plus': {
        name: 'Boundless Creator Program',
        duration: '3 months',
        tagline: 'The full Deep Dive experience with hands-on strategy and accountability.',
        features: ['3-hour Deep Dive strategy call (with prep)', 'Monthly 1:1 accountability call', 'Priority chat support (ASAP response)', 'Community access (Discord)', 'Weekly office hours (Wednesdays 2 PM EST)', 'Personalized strategy document'],
        price: 4500,
        originalPrice: 6000,
        paymentOptions: [
          { label: 'Pay in Full', description: 'One-time payment', amount: 4500 },
          { label: '2 Monthly Payments', description: '$2,625/mo for 2 months', amount: 2625, total: 5250 },
          { label: '3 Monthly Payments', description: '$1,875/mo for 3 months', amount: 1875, total: 5625 },
        ],
      },
      '6mo': {
        name: 'Boundless Creator Program',
        duration: '6 months',
        tagline: 'Six months of focused coaching to transform your channel.',
        features: ['30-minute onboarding call', 'Community access (Discord)', 'Weekly office hours (Wednesdays 2 PM EST)', 'Direct messaging support'],
        price: 4350,
        originalPrice: 5800,
        paymentOptions: [
          { label: 'Pay in Full', description: 'One-time payment', amount: 4350 },
          { label: '2 Monthly Payments', description: '$2,475/mo for 2 months', amount: 2475, total: 4950 },
          { label: '3 Monthly Payments', description: '$1,800/mo for 3 months', amount: 1800, total: 5400 },
        ],
      },
      '6mo-plus': {
        name: 'Boundless Creator Program',
        duration: '6 months',
        tagline: 'The ultimate coaching experience. Deep Dive strategy, monthly calls, and priority access.',
        features: ['3-hour Deep Dive strategy call (with prep)', 'Monthly 1:1 accountability call', 'Priority chat support (ASAP response)', 'Community access (Discord)', 'Weekly office hours (Wednesdays 2 PM EST)', 'Personalized strategy document'],
        price: 7200,
        originalPrice: 9600,
        paymentOptions: [
          { label: 'Pay in Full', description: 'One-time payment', amount: 7200 },
          { label: '2 Monthly Payments', description: '$4,125/mo for 2 months', amount: 4125, total: 8250 },
          { label: '3 Monthly Payments', description: '$3,000/mo for 3 months', amount: 3000, total: 9000 },
        ],
      },
    };

    const plan = alumniPricing[planCode];
    if (!plan) return null;

    return (
      <div key={`alumni-${planCode}`} className="border border-slate-700 rounded-lg overflow-hidden">
        <div className="bg-slate-800 px-4 py-2 text-sm text-slate-400 font-mono flex justify-between">
          <span>Checkout: /checkout/alumni/{planCode}</span>
          <span className="text-green-400">${plan.price} (25% off ${plan.originalPrice})</span>
        </div>
        <div className="bg-slate-950 p-6">
          {/* Plan Header */}
          <div className="bg-gradient-to-r from-green-600/20 to-green-500/10 border border-slate-800 rounded-lg p-6 mb-6">
            <div className="inline-block px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-400 text-xs font-medium mb-3">
              25% Alumni Discount
            </div>
            <div className="text-green-400 text-sm font-medium mb-1">{plan.duration}</div>
            <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
            <p className="text-slate-300">{plan.tagline}</p>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">What&apos;s Included</h3>
            <ul className="space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Options */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Payment Options</h3>
            <div className="space-y-3">
              {plan.paymentOptions.map((option, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border-2 ${
                    i === 0
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-slate-700 bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{option.label}</div>
                      <div className="text-sm text-slate-400 mt-0.5">{option.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">
                        ${option.amount.toLocaleString()}
                      </div>
                      {option.total && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          ${option.total.toLocaleString()} total
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Button preview */}
          <button className="w-full bg-green-600 text-white font-semibold text-lg px-8 py-4 rounded-lg opacity-75 cursor-default">
            Pay ${plan.paymentOptions[0].amount.toLocaleString()}
          </button>

          <div className="mt-4 bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
            <p className="text-slate-400 text-sm">
              <span className="text-white font-medium">Money-Back Guarantee:</span>{' '}
              Attend at least half the calls and publish 12 videos. Full refund if not worth it.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderWelcomeScreen = (type: 'success' | 'error') => {
    if (type === 'success') {
      return (
        <div key="welcome-success" className="border border-slate-700 rounded-lg overflow-hidden">
          <div className="bg-slate-800 px-4 py-2 text-sm text-slate-400 font-mono">
            Welcome Page — Payment Confirmed ✅ (/welcome?session_id=...)
          </div>
          <div className="bg-slate-950 p-4" style={{ minHeight: 400 }}>
            <div className="flex items-center justify-center py-8 px-4">
              <div className="max-w-2xl mx-auto text-center">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-xl">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
                      <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-4">
                    Welcome to the BCP, Dave!
                  </h1>
                  <p className="text-lg text-slate-300 mb-8">
                    Your payment is confirmed. I&apos;m excited to work with you.
                  </p>
                  <div className="bg-slate-800/50 rounded-lg p-6 text-left">
                    <h2 className="text-lg font-semibold text-white mb-4">What Happens Next</h2>
                    <ol className="space-y-4">
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white">1</span>
                        <div>
                          <div className="text-white font-medium">Check your email</div>
                          <div className="text-slate-400 text-sm">Welcome email with Discord invite and everything you need.</div>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white">2</span>
                        <div>
                          <div className="text-white font-medium">I&apos;ll reach out personally</div>
                          <div className="text-slate-400 text-sm">Within 24 hours to schedule your onboarding.</div>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white">3</span>
                        <div>
                          <div className="text-white font-medium">Join office hours</div>
                          <div className="text-slate-400 text-sm">Wednesdays at 2 PM EST. Jump in anytime.</div>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key="welcome-error" className="border border-slate-700 rounded-lg overflow-hidden">
        <div className="bg-slate-800 px-4 py-2 text-sm text-slate-400 font-mono">
          Welcome Page — Error State ❌ (payment verification failed)
        </div>
        <div className="bg-slate-950 p-4" style={{ minHeight: 300 }}>
          <div className="flex items-center justify-center py-8 px-4">
            <div className="max-w-lg mx-auto text-center">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-xl">
                <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
                <p className="text-slate-400 mb-6">
                  We couldn&apos;t verify your payment. Don&apos;t worry — if you were charged, your payment is safe.
                </p>
                <p className="text-slate-400">
                  Please reach out to{' '}
                  <span className="text-blue-400 underline">hello@boundlesscreator.com</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Determine which screens to render
  let content: React.ReactNode = null;

  if (activeSection === 'application') {
    const screenIds =
      activeTab === 'all'
        ? ['welcome', ...questions.map((q) => q.id), 'contact', 'qualified', 'unqualified']
        : [activeTab];
    content = (
      <div className="space-y-8">
        {screenIds.map((id) => renderAppScreen(id))}
      </div>
    );
  } else if (activeSection === 'checkout') {
    if (activeTab === 'alumni-divider') {
      content = null; // Divider tab, do nothing
    } else if (activeTab === 'all-alumni') {
      const alumniPlans = ['3mo', '3mo-plus', '6mo', '6mo-plus'];
      content = (
        <div className="space-y-8">
          {alumniPlans.map((code) => renderAlumniCheckoutScreen(code))}
        </div>
      );
    } else if (activeTab.startsWith('alumni-')) {
      const planCode = activeTab.replace('alumni-', '');
      content = (
        <div className="space-y-8">
          {renderAlumniCheckoutScreen(planCode)}
        </div>
      );
    } else {
      const planCodes =
        activeTab === 'all-checkout'
          ? Object.keys(plans)
          : [activeTab.replace('checkout-', '')];
      content = (
        <div className="space-y-8">
          {planCodes.map((code) => renderCheckoutScreen(code))}
        </div>
      );
    }
  } else if (activeSection === 'post-payment') {
    if (activeTab === 'welcome-success' || activeTab === 'all') {
      content = (
        <div className="space-y-8">
          {renderWelcomeScreen('success')}
          {activeTab !== 'welcome-success' && renderWelcomeScreen('error')}
        </div>
      );
    } else {
      content = renderWelcomeScreen('error');
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-white">
              BCP Application — Preview
            </h1>
            <span className="text-sm text-slate-400">
              {Object.keys(plans).length} plans · {questions.length} questions · Full funnel
            </span>
          </div>

          {/* Section tabs */}
          <div className="flex gap-2 mb-3">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  setActiveTab(
                    section.id === 'application'
                      ? 'all'
                      : section.id === 'checkout'
                      ? 'all-checkout'
                      : 'welcome-success'
                  );
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>

          {/* Sub-tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {currentTabs.map((tab) => (
              tab.id === 'alumni-divider' ? (
                <span key={tab.id} className="px-3 py-1.5 text-slate-600 text-sm">
                  {tab.label}
                </span>
              ) : (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-800/50 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {content}
      </div>
    </div>
  );
}
