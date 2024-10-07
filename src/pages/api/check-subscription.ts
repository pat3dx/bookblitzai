import { getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .single();

  const isSubscribed = subscription?.status === 'active';

  if (!isSubscribed) {
    return res.redirect('/pricing');
  }

  // If subscribed, redirect to the original destination
  const destination = req.query.destination || '/ebook-generator';
  res.redirect(destination as string);
}