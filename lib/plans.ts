export interface PaymentOption {
  id: string;
  label: string;
  description: string;
  amountCents: number;
  recurring?: {
    interval: 'month';
    totalPayments: number;
    totalCents: number;
  };
}

export interface Plan {
  code: string;
  name: string;
  duration: string;
  tagline: string;
  features: string[];
  paymentOptions: PaymentOption[];
}

export const plans: Record<string, Plan> = {
  '3mo': {
    code: '3mo',
    name: 'Boundless Creator Program',
    duration: '3 months',
    tagline: 'Kickstart your channel growth with focused, personalized coaching.',
    features: [
      '30-minute onboarding call',
      'Community access (Discord)',
      'Weekly office hours (Wednesdays 2 PM EST)',
      'Direct messaging support',
    ],
    paymentOptions: [
      {
        id: '3mo-full',
        label: 'Pay in Full',
        description: 'One-time payment',
        amountCents: 350000,
      },
      {
        id: '3mo-2x',
        label: '2 Monthly Payments',
        description: '$2,000/mo for 2 months',
        amountCents: 200000,
        recurring: { interval: 'month', totalPayments: 2, totalCents: 400000 },
      },
    ],
  },
  '3mo-plus': {
    code: '3mo-plus',
    name: 'Boundless Creator Program',
    duration: '3 months',
    tagline: 'The full Deep Dive experience with hands-on strategy and accountability.',
    features: [
      '3-hour Deep Dive strategy call (with prep)',
      'Monthly 1:1 accountability call',
      'Priority chat support (ASAP response)',
      'Community access (Discord)',
      'Weekly office hours (Wednesdays 2 PM EST)',
      'Personalized strategy document',
    ],
    paymentOptions: [
      {
        id: '3mo-plus-full',
        label: 'Pay in Full',
        description: 'One-time payment',
        amountCents: 600000,
      },
      {
        id: '3mo-plus-2x',
        label: '2 Monthly Payments',
        description: '$3,500/mo for 2 months',
        amountCents: 350000,
        recurring: { interval: 'month', totalPayments: 2, totalCents: 700000 },
      },
      {
        id: '3mo-plus-3x',
        label: '3 Monthly Payments',
        description: '$2,500/mo for 3 months',
        amountCents: 250000,
        recurring: { interval: 'month', totalPayments: 3, totalCents: 750000 },
      },
    ],
  },
  '6mo': {
    code: '6mo',
    name: 'Boundless Creator Program',
    duration: '6 months',
    tagline: 'Six months of focused coaching to transform your channel.',
    features: [
      '30-minute onboarding call',
      'Community access (Discord)',
      'Weekly office hours (Wednesdays 2 PM EST)',
      'Direct messaging support',
    ],
    paymentOptions: [
      {
        id: '6mo-full',
        label: 'Pay in Full',
        description: 'One-time payment',
        amountCents: 580000,
      },
      {
        id: '6mo-2x',
        label: '2 Monthly Payments',
        description: '$3,300/mo for 2 months',
        amountCents: 330000,
        recurring: { interval: 'month', totalPayments: 2, totalCents: 660000 },
      },
      {
        id: '6mo-3x',
        label: '3 Monthly Payments',
        description: '$2,400/mo for 3 months',
        amountCents: 240000,
        recurring: { interval: 'month', totalPayments: 3, totalCents: 720000 },
      },
    ],
  },
  '6mo-plus': {
    code: '6mo-plus',
    name: 'Boundless Creator Program',
    duration: '6 months',
    tagline: 'The ultimate coaching experience. Deep Dive strategy, monthly calls, and priority access.',
    features: [
      '3-hour Deep Dive strategy call (with prep)',
      'Monthly 1:1 accountability call',
      'Priority chat support (ASAP response)',
      'Community access (Discord)',
      'Weekly office hours (Wednesdays 2 PM EST)',
      'Personalized strategy document',
    ],
    paymentOptions: [
      {
        id: '6mo-plus-full',
        label: 'Pay in Full',
        description: 'One-time payment',
        amountCents: 960000,
      },
      {
        id: '6mo-plus-2x',
        label: '2 Monthly Payments',
        description: '$5,500/mo for 2 months',
        amountCents: 550000,
        recurring: { interval: 'month', totalPayments: 2, totalCents: 1100000 },
      },
      {
        id: '6mo-plus-3x',
        label: '3 Monthly Payments',
        description: '$4,000/mo for 3 months',
        amountCents: 400000,
        recurring: { interval: 'month', totalPayments: 3, totalCents: 1200000 },
      },
    ],
  },
};

export function getPlan(code: string): Plan | undefined {
  return plans[code];
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
