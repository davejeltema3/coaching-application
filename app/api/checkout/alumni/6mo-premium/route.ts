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
              name: 'BCP 6-Month Premium (Alumni 25% Off)',
              description: '6 months of support • Monthly 1:1 calls • Instant chat • Deep-dive review • Weekly office hours • Private Discord',
            },
            unit_amount: 720000, // $7,200 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://apply.boundlesscreator.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://apply.boundlesscreator.com'}/alumni`,
      customer_email: undefined,
      allow_promotion_codes: false,
      metadata: {
        tier: '6mo-premium',
        discount: 'alumni-25',
        original_price: '9600'
      }
    });

    return NextResponse.redirect(session.url!);
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
