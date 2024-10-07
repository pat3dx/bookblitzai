import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Webhook received:', req.body);

  if (req.method === 'POST') {
    const { id, email_addresses } = req.body.data;

    // Extract the primary email address
    const primaryEmail = email_addresses.find((email: any) => email.id === req.body.data.primary_email_address_id)?.email_address;

    // Generate a UUID for the user if the Clerk user ID is not a valid UUID
    const userId = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id) ? id : uuidv4();

    console.log('User ID:', userId);
    console.log('Email:', primaryEmail);

    // Add user to Supabase
    const { error } = await supabase.from('users').insert([
      { id: userId, email: primaryEmail }
    ]);

    if (error) {
      console.error('Error inserting user into Supabase:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('User added to Supabase:', { id: userId, email: primaryEmail });
    return res.status(200).json({ message: 'User added to Supabase' });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default handler;

