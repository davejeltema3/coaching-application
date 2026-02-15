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
              name: 'BCP 6-Month Standard (Alumni 25% Off)',
              description: '6 months • Onboarding call • Discord • Office hours • Direct messaging',
            },
            unit_amount: 435000, // $4,350
          },
          quantity: 1,
        }];
        break;
      
      case '2x':
        lineItems = [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'BCP 6-Month Standard (Alumni 25% Off) - 2 Payments',
              description: '6 months • Onboarding call • Discord • Office hours • Direct messaging',
            },
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
            unit_amount: 247500, // $2,475/mo
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
              name: 'BCP 6-Month Standard (Alumni 25% Off) - 3 Payments',
              description: '6 months • Onboarding call • Discord • Office hours • Direct messaging',
            },
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
            unit_amount: 180000, // $1,800/mo
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
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://apply.boundlesscreator.com'}/checkout/alumni/6mo`,
      allow_promotion_codes: false,
      metadata: {
        tier: '6mo-standard',
        discount: 'alumni-25',
        original_price: '5800',
        payment_option: paymentOptionId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
