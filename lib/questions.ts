export type QuestionType = 'multiple-choice' | 'text' | 'url' | 'contact';

export interface Choice {
  text: string;
  value: string;
  score: number;
  disqualifies?: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  subtext?: string;
  choices?: Choice[];
  required?: boolean;
  placeholder?: string;
}

export const questions: Question[] = [
  {
    id: 'active_creator',
    type: 'multiple-choice',
    question: 'Are you an active YouTube creator?',
    choices: [
      { text: 'Yes', value: 'yes', score: 0 },
      { text: 'No', value: 'no', score: 0, disqualifies: true },
    ],
  },
  {
    id: 'duration',
    type: 'multiple-choice',
    question: 'How long have you been creating on YouTube?',
    choices: [
      { text: 'Less than 6 months', value: '<6mo', score: 0 },
      { text: '6-12 months', value: '6-12mo', score: 1 },
      { text: '1-2 years', value: '1-2yr', score: 1 },
      { text: 'More than 2 years', value: '2yr+', score: 1 },
    ],
  },
  {
    id: 'subscribers',
    type: 'multiple-choice',
    question: 'How many subscribers do you have?',
    choices: [
      { text: '0-99', value: '0-99', score: 0 },
      { text: '100-1,000', value: '100-1k', score: 1 },
      { text: '1,001-5,000', value: '1k-5k', score: 1 },
      { text: '5,000+', value: '5k+', score: 1 },
    ],
  },
  {
    id: 'goal',
    type: 'multiple-choice',
    question: 'What is your primary goal with YouTube?',
    choices: [
      {
        text: 'Turn it into a full-time career or significantly grow my business',
        value: 'full-time',
        score: 1,
      },
      {
        text: "It's more of a hobby or side project",
        value: 'hobby',
        score: 0,
      },
    ],
  },
  {
    id: 'investment_ready',
    type: 'multiple-choice',
    question: 'Are you prepared to invest in your growth?',
    subtext: "The Boundless Creator Program is a serious investment in your channel's future.",
    choices: [
      {
        text: "Yes, I'm ready to invest in my growth",
        value: 'yes',
        score: 1,
      },
      {
        text: 'Not right now',
        value: 'no',
        score: 0,
        disqualifies: true,
      },
    ],
  },
  {
    id: 'time_commitment',
    type: 'multiple-choice',
    question: 'Are you ready to commit the time?',
    subtext: 'This program requires dedicating 5-10+ hours per week to your channel.',
    choices: [
      { text: "Yes, I'm all in", value: 'yes', score: 1 },
      {
        text: "I'm not sure I have the time",
        value: 'unsure',
        score: 0,
        disqualifies: true,
      },
    ],
  },
  {
    id: 'challenge',
    type: 'text',
    question: "What's the #1 biggest challenge you're facing with your YouTube channel right now?",
    subtext: 'Be as specific as possible — this helps me understand your situation before our call.',
    required: true,
    placeholder: 'Type your answer here...',
  },
  {
    id: 'channel_url',
    type: 'url',
    question: 'Link to your YouTube channel',
    required: true,
    placeholder: 'https://youtube.com/@yourchannel',
  },
];

export interface FormData {
  active_creator?: string;
  duration?: string;
  subscribers?: string;
  goal?: string;
  investment_ready?: string;
  time_commitment?: string;
  challenge?: string;
  channel_url?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}
