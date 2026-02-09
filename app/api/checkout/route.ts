import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getPlan } from '@/lib/plans';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover' as Stripe.LatestApiVersion,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { planCode, paymentOptionId, customerEmail } = await request.json();

    const plan = getPlan(planCode);
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const paymentOption = plan.paymentOptions.find(
      (o) => o.id === paymentOptionId
    );
    if (!paymentOption) {
      return NextResponse.json(
        { error: 'Invalid payment option' },
        { status: 400 }
      );
    }

    const origin = request.headers.get('origin') || 'https://apply.boundlesscreator.com';

    if (paymentOption.recurring) {
      // Subscription (payment plan)
      const session = await getStripe().checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        ...(customerEmail ? { customer_email: customerEmail } : {}),
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${plan.name} — ${plan.duration}`,
                description: `${paymentOption.label} (${paymentOption.description})`,
              },
              unit_amount: paymentOption.amountCents,
              recurring: {
                interval: paymentOption.recurring.interval,
              },
            },
            quantity: 1,
          },
        ],
        subscription_data: {
          metadata: {
            plan_code: plan.code,
            payment_option: paymentOption.id,
            total_payments: paymentOption.recurring.totalPayments.toString(),
            duration: plan.duration,
          },
        },
        metadata: {
          plan_code: plan.code,
          payment_option: paymentOption.id,
          duration: plan.duration,
        },
        success_url: `${origin}/welcome?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout?plan=${plan.code}`,
        allow_promotion_codes: true,
      });

      return NextResponse.json({ url: session.url });
    } else {
      // One-time payment
      const session = await getStripe().checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        ...(customerEmail ? { customer_email: customerEmail } : {}),
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${plan.name} — ${plan.duration}`,
                description: paymentOption.description,
              },
              unit_amount: paymentOption.amountCents,
            },
            quantity: 1,
          },
        ],
        metadata: {
          plan_code: plan.code,
          payment_option: paymentOption.id,
          duration: plan.duration,
        },
        success_url: `${origin}/welcome?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout?plan=${plan.code}`,
        allow_promotion_codes: true,
      });

      return NextResponse.json({ url: session.url });
    }
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
