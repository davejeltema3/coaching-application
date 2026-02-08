'use client';

import { useState, useEffect } from 'react';
import { FormData, questions } from '@/lib/questions';
import ProgressBar from '@/components/ProgressBar';
import WelcomeScreen from '@/components/WelcomeScreen';
import QuestionCard from '@/components/QuestionCard';
import MultipleChoice from '@/components/MultipleChoice';
import TextInput from '@/components/TextInput';
import ContactForm from '@/components/ContactForm';
import ThankYouScreen from '@/components/ThankYouScreen';

type Screen = 'welcome' | 'questions' | 'contact' | 'thank-you';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [qualified, setQualified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calBookingUrl, setCalBookingUrl] = useState<string>();
  const [channelUrlError, setChannelUrlError] = useState<string>();
  const [phoneError, setPhoneError] = useState<string>();
  const [logoError, setLogoError] = useState(false);

  // Capture UTM parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utmData: Partial<FormData> = {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
    };
    setFormData((prev) => ({ ...prev, ...utmData }));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (screen !== 'questions') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentQuestion = questions[currentQuestionIndex];

      // Handle multiple choice keyboard shortcuts
      if (currentQuestion.type === 'multiple-choice' && currentQuestion.choices) {
        // Letter keys (A, B, C, D)
        const letterIndex = e.key.toUpperCase().charCodeAt(0) - 65;
        if (letterIndex >= 0 && letterIndex < currentQuestion.choices.length) {
          const choice = currentQuestion.choices[letterIndex];
          updateFormData(currentQuestion.id, choice.value);
          setTimeout(() => handleNext(), 300);
          return;
        }

        // Number keys (1, 2, 3, 4)
        const numberIndex = parseInt(e.key) - 1;
        if (numberIndex >= 0 && numberIndex < currentQuestion.choices.length) {
          const choice = currentQuestion.choices[numberIndex];
          updateFormData(currentQuestion.id, choice.value);
          setTimeout(() => handleNext(), 300);
          return;
        }
      }

      // Enter key to advance (if answer is provided)
      if (e.key === 'Enter' && !e.shiftKey) {
        const currentAnswer = formData[currentQuestion.id as keyof FormData];
        if (currentAnswer) {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, currentQuestionIndex, formData]);

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear errors when user types
    if (field === 'channel_url') {
      setChannelUrlError(undefined);
    }
    if (field === 'phone') {
      setPhoneError(undefined);
    }
  };

  const validateChannelUrl = (url: string): boolean => {
    if (!url) return false;
    const lowercaseUrl = url.toLowerCase();
    return lowercaseUrl.includes('youtube.com') || lowercaseUrl.includes('youtu.be') || lowercaseUrl.includes('@');
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return false;
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10;
  };

  const handleStart = () => {
    setScreen('questions');
  };

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = formData[currentQuestion.id as keyof FormData];

    // Validate YouTube channel URL
    if (currentQuestion.id === 'channel_url' && currentAnswer) {
      if (!validateChannelUrl(currentAnswer)) {
        setChannelUrlError('Please enter a valid YouTube channel URL (must contain youtube.com, youtu.be, or @)');
        return;
      }
    }

    // Check if this answer disqualifies
    if (currentQuestion.type === 'multiple-choice' && currentQuestion.choices) {
      const choice = currentQuestion.choices.find((c) => c.value === currentAnswer);
      if (choice?.disqualifies) {
        // Skip to thank you screen (unqualified)
        setQualified(false);
        setScreen('thank-you');
        submitForm();
        return;
      }
    }

    // Move to next question or contact form
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setScreen('contact');
    }
  };

  const handleBack = () => {
    if (screen === 'contact') {
      setScreen('questions');
      setCurrentQuestionIndex(questions.length - 1);
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number
    if (formData.phone && !validatePhone(formData.phone)) {
      setPhoneError('Please enter a valid phone number (at least 10 digits)');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      setQualified(result.qualified);
      
      // Get Cal.com URL if available
      if (result.calBookingUrl) {
        setCalBookingUrl(result.calBookingUrl);
      }
      
      setScreen('thank-you');
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitForm = async () => {
    // Silent submission for early disqualifications
    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch (error) {
      console.error('Background submission error:', error);
    }
  };

  // Calculate progress
  const totalSteps = questions.length + 2; // questions + contact + thank you
  const currentStep =
    screen === 'welcome'
      ? 0
      : screen === 'questions'
      ? currentQuestionIndex + 1
      : screen === 'contact'
      ? questions.length + 1
      : totalSteps;

  if (screen === 'welcome') {
    return <WelcomeScreen onStart={handleStart} />;
  }

  if (screen === 'thank-you') {
    return <ThankYouScreen qualified={qualified} calBookingUrl={calBookingUrl} />;
  }

  return (
    <>
      {!logoError && (
        <div className="pt-6 flex justify-center">
          <img
            src="/images/logo.png"
            alt="Boundless Creator"
            onError={() => setLogoError(true)}
            className="max-h-[60px] object-contain"
          />
        </div>
      )}
      <ProgressBar current={currentStep} total={totalSteps} />
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-3xl">
          {screen === 'questions' && (
            <div className="transition-smooth">
              {(() => {
                const question = questions[currentQuestionIndex];
                const currentAnswer = formData[question.id as keyof FormData];

                return (
                  <QuestionCard
                    question={question.question}
                    subtext={question.subtext}
                  >
                    {question.type === 'multiple-choice' && question.choices && (
                      <>
                        <MultipleChoice
                          choices={question.choices}
                          value={currentAnswer}
                          onChange={(value) => updateFormData(question.id, value)}
                          onNext={handleNext}
                        />
                        {currentQuestionIndex > 0 && (
                          <button
                            onClick={handleBack}
                            className="mt-6 px-6 py-3 text-slate-400 hover:text-white transition-colors"
                          >
                            ← Back
                          </button>
                        )}
                      </>
                    )}

                    {question.type === 'text' && (
                      <>
                        <TextInput
                          value={currentAnswer}
                          onChange={(value) => updateFormData(question.id, value)}
                          placeholder={question.placeholder}
                          multiline={true}
                          required={question.required}
                        />
                        <div className="flex gap-4 mt-6">
                          {currentQuestionIndex > 0 && (
                            <button
                              onClick={handleBack}
                              className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
                            >
                              ← Back
                            </button>
                          )}
                          <button
                            onClick={handleNext}
                            disabled={!currentAnswer}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                          >
                            Continue →
                          </button>
                        </div>
                      </>
                    )}

                    {question.type === 'url' && (
                      <>
                        <TextInput
                          value={currentAnswer}
                          onChange={(value) => updateFormData(question.id, value)}
                          placeholder={question.placeholder}
                          type="url"
                          required={question.required}
                          error={question.id === 'channel_url' ? channelUrlError : undefined}
                        />
                        <div className="flex gap-4 mt-6">
                          {currentQuestionIndex > 0 && (
                            <button
                              onClick={handleBack}
                              className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
                            >
                              ← Back
                            </button>
                          )}
                          <button
                            onClick={handleNext}
                            disabled={!currentAnswer}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                          >
                            Continue →
                          </button>
                        </div>
                      </>
                    )}
                  </QuestionCard>
                );
              })()}
            </div>
          )}

          {screen === 'contact' && (
            <QuestionCard question="Contact Information">
              <form onSubmit={handleContactSubmit}>
                <ContactForm
                  data={{
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    phone: formData.phone,
                  }}
                  onChange={(field, value) => updateFormData(field, value)}
                  phoneError={phoneError}
                />
                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !formData.first_name ||
                      !formData.last_name ||
                      !formData.email ||
                      !formData.phone
                    }
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application →'}
                  </button>
                </div>
              </form>
            </QuestionCard>
          )}
        </div>
      </div>
    </>
  );
}
