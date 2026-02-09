'use client';

import { useState } from 'react';
import { questions } from '@/lib/questions';
import WelcomeScreen from '@/components/WelcomeScreen';
import QuestionCard from '@/components/QuestionCard';
import MultipleChoice from '@/components/MultipleChoice';
import TextInput from '@/components/TextInput';
import ContactForm from '@/components/ContactForm';
import ThankYouScreen from '@/components/ThankYouScreen';

export default function PreviewPage() {
  const [activeTab, setActiveTab] = useState<string>('all');

  const tabs = [
    { id: 'all', label: 'All Screens' },
    { id: 'welcome', label: 'Welcome' },
    ...questions.map((q, i) => ({ id: q.id, label: `Q${i + 1}: ${q.id}` })),
    { id: 'contact', label: 'Contact' },
    { id: 'qualified', label: 'Qualified' },
    { id: 'unqualified', label: 'Unqualified' },
  ];

  const renderScreen = (id: string) => {
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

  const screenIds =
    activeTab === 'all'
      ? ['welcome', ...questions.map((q) => q.id), 'contact', 'qualified', 'unqualified']
      : [activeTab];

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
              {questions.length} questions · 2 outcomes · {questions.length + 3} total screens
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {screenIds.map((id) => renderScreen(id))}
      </div>
    </div>
  );
}
