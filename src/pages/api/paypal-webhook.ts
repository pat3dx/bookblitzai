import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';
import crypto from 'crypto';
import { clerkClient } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from 'uuid';

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;
const ADMIN_EMAIL = 'cheyben71@gmail.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const webhookBody = req.body;
  const webhookEvent = webhookBody.event_type;

  try {
    if (!await verifyWebhookSignature(req)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    switch (webhookEvent) {
      case 'BILLING.SUBSCRIPTION.CREATED':
        await handleSubscriptionCreated(webhookBody);
        break;
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(webhookBody);
        break;
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await handleSubscriptionSuspended(webhookBody);
        break;
      case 'BILLING.SUBSCRIPTION.UPDATED':
        await handleSubscriptionUpdated(webhookBody);
        break;
      default:
        console.log(`Unhandled webhook event: ${webhookEvent}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

interface PayPalWebhookData {
  id: string;
  plan_id: string;
  subscriber: {
    email_address: string;
    payer_id: string;
  };
  status?: string;
}

async function handleSubscriptionCreated(data: PayPalWebhookData) {
  const { id: subscription_id, plan_id, subscriber: { email_address } } = data;
  
  const supabase_user_id = uuidv4();

  // Insert into Supabase
  const { error } = await supabase.from('subscriptions').insert({
    user_id: supabase_user_id,
    plan_id,
    subscription_id,
    status: 'active'
  });

  if (error) {
    console.error('Error inserting subscription into Supabase:', error);
    return;
  }

  // Update Clerk user metadata
  try {
    const users = await clerkClient.users.getUserList({
      emailAddress: [email_address],
    });

    if (users.length === 0) {
      console.error(`No user found with email: ${email_address}`);
      return;
    }

    const user = users[0];

    await clerkClient.users.updateUser(user.id, {
      privateMetadata: {
        supabase_user_id,
        subscription: {
          status: 'active',
          plan_id,
          subscription_id
        },
        isAdmin: email_address === ADMIN_EMAIL
      }
    });

    console.log(`Subscription created and user metadata updated: ${subscription_id}`);
  } catch (error) {
    console.error('Error updating user metadata:', error);
  }
}

async function handleSubscriptionCancelled(data: any) {
  const { id: subscription_id, subscriber: { email_address } } = data.resource;
  await updateSubscriptionStatus(subscription_id, 'cancelled', email_address);
}

async function handleSubscriptionSuspended(data: any) {
  const { id: subscription_id, subscriber: { email_address } } = data.resource;
  await updateSubscriptionStatus(subscription_id, 'suspended', email_address);
}

async function handleSubscriptionUpdated(data: any) {
  const { id: subscription_id, status, subscriber: { email_address } } = data.resource;
  await updateSubscriptionStatus(subscription_id, status, email_address);
}

async function updateSubscriptionStatus(subscription_id: string, status: string, email_address: string) {
  // Update Supabase
  const { error } = await supabase
    .from('subscriptions')
    .update({ status })
    .match({ subscription_id });

  if (error) {
    console.error(`Error updating subscription status in Supabase: ${error}`);
    return;
  }

  // Update Clerk user metadata
  try {
    const users = await clerkClient.users.getUserList({
      emailAddress: [email_address],
    });

    if (users.length === 0) {
      console.error(`No user found with email: ${email_address}`);
      return;
    }

    const user = users[0];

    await clerkClient.users.updateUser(user.id, {
      privateMetadata: {
        ...user.privateMetadata,
        subscription: {
          ...(user.privateMetadata.subscription as Record<string, unknown>),
          status
        }
      }
    });

    console.log(`Subscription updated: ${subscription_id}, new status: ${status}`);
  } catch (error) {
    console.error('Error updating user metadata:', error);
  }
}

async function verifyWebhookSignature(req: NextApiRequest): Promise<boolean> {
  const webhookSignature = req.headers['paypal-transmission-sig'] as string;
  const webhookId = PAYPAL_WEBHOOK_ID;
  const transmissionId = req.headers['paypal-transmission-id'] as string;
  const transmissionTime = req.headers['paypal-transmission-time'] as string;
  const webhookEvent = JSON.stringify(req.body);

  if (!webhookId) {
    console.error('PAYPAL_WEBHOOK_ID is not defined');
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookId)
    .update(transmissionId + '|' + transmissionTime + '|' + webhookEvent)
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(webhookSignature),
    Buffer.from(expectedSignature)
  );
}