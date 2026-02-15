import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentOptionId } = body;

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
    let mode: 'payment' | 'subscription' = 'payment';

    switch (paymentOptionId) {
      case 'full':
        lineItems = [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'BCP 6-Month Premium (Alumni 25% Off)',
              description: '6 months • Deep Dive • Monthly 1:1 • Priority chat • Discord • Office hours',
            },
            unit_amount: 720000, // $7,200
          },
          quantity: 1,
        }];
        break;
      
      case '2x':
        lineItems = [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'BCP 6-Month Premium (Alumni 25% Off) - 2 Payments',
              description: '6 months • Deep Dive • Monthly 1:1 • Priority chat • Discord • Office hours',
            },
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
            unit_amount: 412500, // $4,125/mo
          },
          quantity: 1,
        }];
        mode = 'subscription';
        break;
      
      case '3x':
        lineItems = [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'BCP 6-Month Premium (Alumni 25% Off) - 3 Payments',
              description: '6 months • Deep Dive • Monthly 1:1 • Priority chat • Discord • Office hours',
            },
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
            unit_amount: 300000, // $3,000/mo
          },
          quantity: 1,
        }];
        mode = 'subscription';
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid payment option' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://apply.boundlesscreator.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://apply.boundlesscreator.com'}/checkout/alumni/6mo-premium`,
      allow_promotion_codes: false,
      metadata: {
        tier: '6mo-premium',
        discount: 'alumni-25',
        original_price: '9600',
        payment_option: paymentOptionId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
