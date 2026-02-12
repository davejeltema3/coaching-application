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
    question: 'Are you an active educational YouTube creator?',
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
      { text: "I haven't started yet", value: 'none', score: 0 },
      { text: "None yet, but I have an audience on another platform", value: 'other-platform', score: 1 },
      { text: 'Under 500', value: '<500', score: 1 },
      { text: '500 - 5,000', value: '500-5k', score: 1 },
      { text: '5,000+', value: '5k+', score: 1 },
    ],
  },
  {
    id: 'monetized',
    type: 'multiple-choice',
    question: 'Are you monetized on YouTube yet?',
    subtext: "This just helps me understand where you're at. Not a dealbreaker either way.",
    choices: [
      { text: "Yes, I'm in the Partner Program", value: 'yes', score: 1 },
      { text: 'Not yet, but working toward it', value: 'not-yet', score: 0 },
      { text: "No, and I'm not sure how", value: 'no', score: 0 },
    ],
  },
  {
    id: 'content_type',
    type: 'text',
    question: 'What kind of content do you create?',
    subtext: 'Your niche, topics, style of videos. Help me get a feel for your channel before we talk.',
    required: true,
    placeholder: 'e.g. I teach guitar for beginners, mostly 10-15 minute tutorials...',
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
        text: 'Grow it into a meaningful side income',
        value: 'side-income',
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
    id: 'program_goals',
    type: 'text',
    question: 'What are you hoping to get out of this program?',
    subtext: 'Be honest. There are no wrong answers here.',
    required: true,
    placeholder: 'e.g. I want help figuring out why my videos aren\'t getting views, or I need a content strategy that actually works...',
  },
  {
    id: 'upload_schedule',
    type: 'multiple-choice',
    question: 'What does your current upload schedule look like?',
    choices: [
      { text: 'Multiple times a week', value: 'multiple-weekly', score: 1 },
      { text: 'About once a week', value: 'weekly', score: 1 },
      { text: 'A few times a month', value: 'few-monthly', score: 1 },
      { text: 'Inconsistent or on pause', value: 'inconsistent', score: 0 },
    ],
  },
  {
    id: 'investment_ready',
    type: 'multiple-choice',
    question: 'Are you prepared to invest in your growth?',
    subtext: "The BCP is a serious investment in your channel's future.",
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
    id: 'challenge',
    type: 'text',
    question: "What's the #1 biggest challenge you're facing with your YouTube channel right now?",
    subtext: 'Be as specific as possible. This helps me understand your situation before our call.',
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
  monetized?: string;
  content_type?: string;
  goal?: string;
  program_goals?: string;
  upload_schedule?: string;
  investment_ready?: string;
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
