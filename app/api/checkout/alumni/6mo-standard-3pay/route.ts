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
              name: 'BCP 6-Month Standard (Alumni 25% Off) - 3 Payments',
              description: '3 monthly payments of $1,450 • 6 months of support • Monthly 1:1 calls • Instant chat',
            },
            unit_amount: 145000, // $1,450 per payment
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        metadata: {
          payment_count: '3',
          total_payments: '3'
        }
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://apply.boundlesscreator.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://apply.boundlesscreator.com'}/alumni`,
      metadata: {
        tier: '6mo-standard',
        discount: 'alumni-25',
        payment_plan: '3-pay',
        original_price: '5800'
      }
    });

    return NextResponse.redirect(session.url!);
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
