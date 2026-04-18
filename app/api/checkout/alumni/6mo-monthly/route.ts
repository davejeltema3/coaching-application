import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'BCP 6-Month Monthly Plan (Alumni)',
              description: '25% Alumni Discount • 6 months of support • Monthly 1:1 calls • Instant chat • Deep-dive review • Weekly office hours • Private Discord',
            },
            unit_amount: 150000, // $1,500/month (25% off $2,000)
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        metadata: {
          tier: '6mo-monthly',
          discount: 'alumni-25',
          total_payments: '6',
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://apply.boundlesscreator.com'}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://apply.boundlesscreator.com'}`,
      metadata: {
        tier: '6mo-monthly',
        discount: 'alumni-25',
        total_payments: '6',
        original_price: '12000',
      },
    });

    return NextResponse.redirect(session.url!);
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
