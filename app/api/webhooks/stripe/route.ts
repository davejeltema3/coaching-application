import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover' as Stripe.LatestApiVersion,
  });
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const signature = request.headers.get('stripe-signature');
  
  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // If this is a subscription checkout, handle it
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          // Check if this subscription needs to be converted to a schedule
          if (subscription.metadata.needs_schedule === 'true') {
            const totalPayments = parseInt(subscription.metadata.total_payments || '0');
            
            if (totalPayments > 0) {
              // Create a subscription schedule from the existing subscription
              await stripe.subscriptionSchedules.create({
                from_subscription: subscription.id,
                end_behavior: 'cancel',
                phases: [
                  {
                    items: subscription.items.data.map(item => ({
                      price: item.price.id,
                      quantity: item.quantity,
                    })),
                    iterations: totalPayments,
                    metadata: {
                      plan_code: subscription.metadata.plan_code,
                      payment_option: subscription.metadata.payment_option,
                      duration: subscription.metadata.duration,
                      total_payments: totalPayments.toString(),
                    },
                  },
                ],
                metadata: {
                  plan_code: subscription.metadata.plan_code,
                  payment_option: subscription.metadata.payment_option,
                  duration: subscription.metadata.duration,
                  total_payments: totalPayments.toString(),
                },
              });

              console.log(`Created subscription schedule for ${subscription.id} with ${totalPayments} payments`);
            }
          }
        }
        
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription ${subscription.id} cancelled`);
        // You could add Kit tagging here if needed
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    return NextResponse.json(
      { error: `Webhook handler failed: ${err.message}` },
      { status: 500 }
    );
  }
}
