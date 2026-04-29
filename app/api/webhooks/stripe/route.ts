import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

/**
 * Stripe webhook handler for the Accelerator (apply.boundlesscreator.com).
 * 
 * Supports TWO webhook secrets so you can have separate Stripe webhooks:
 *   - STRIPE_WEBHOOK_SECRET: Original webhook (payment plan management)
 *   - STRIPE_WEBHOOK_SECRET_NOTIFICATIONS: New webhook (checkout.session.completed notifications)
 * 
 * Both Stripe webhooks point to the same URL:
 *   https://apply.boundlesscreator.com/api/webhooks/stripe
 * 
 * The route tries both secrets to verify the signature.
 */

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover' as Stripe.LatestApiVersion,
  });
}

function verifyWebhook(stripe: Stripe, body: string, signature: string): Stripe.Event {
  // Collect all configured webhook secrets
  const secrets = [
    process.env.STRIPE_WEBHOOK_SECRET,
    process.env.STRIPE_WEBHOOK_SECRET_NOTIFICATIONS,
  ].filter(Boolean) as string[];

  if (secrets.length === 0) {
    throw new Error('No webhook secrets configured');
  }

  // Try each secret — whichever one matches is the right webhook
  let lastError: Error | null = null;
  for (const secret of secrets) {
    try {
      return stripe.webhooks.constructEvent(body, signature, secret);
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error('Webhook verification failed');
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
    event = verifyWebhook(stripe, body, signature);
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
        
        const name = session.customer_details?.name || 'Unknown';
        const email = session.customer_details?.email || 'N/A';
        const amount = session.amount_total ? `$${(session.amount_total / 100).toLocaleString()}` : 'N/A';
        const plan = session.metadata?.plan_code || '';
        const duration = session.metadata?.duration || '';
        const program = session.metadata?.program || '';

        // Determine what type of payment this is
        const isAccelerator = plan || program === 'bca' || duration;
        const isBCP = program === 'bcp-founders';

        // Skip BCP payments — they're handled by the BCP webhook
        if (isBCP) {
          console.log('Skipping BCP payment — handled by BCP webhook');
          break;
        }

        // Discord notification
        if (process.env.DISCORD_WEBHOOK_URL) {
          // Classify the payment
          let title: string;
          let color: number;

          if (isAccelerator) {
            title = '💰 New Accelerator Payment!';
            color = 0x3b82f6; // blue
          } else {
            // Not an Accelerator or BCP payment — likely a plugin donation, tip, or other Stripe payment
            title = '🎁 New Payment Received!';
            color = 0x22c55e; // green
          }

          try {
            const fields = [
              { name: 'Name', value: name, inline: true },
              { name: 'Email', value: email, inline: true },
              { name: 'Amount', value: amount, inline: true },
            ];

            if (isAccelerator) {
              fields.push(
                { name: 'Plan', value: `${plan} (${duration})`, inline: true },
                { name: 'Type', value: session.mode === 'subscription' ? 'Payment Plan' : 'Paid in Full', inline: true },
              );
            }

            fields.push(
              { name: 'Stripe', value: `[View](https://dashboard.stripe.com/payments/${session.payment_intent})`, inline: true },
            );

            await fetch(process.env.DISCORD_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                embeds: [{
                  title,
                  color,
                  fields,
                  timestamp: new Date().toISOString(),
                }],
              }),
            });
          } catch (err) {
            console.error('Discord notification failed:', err);
          }
        }

        if (session.mode === 'subscription' && session.subscription) {
          console.log(`New subscription created: ${session.subscription}`);
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
