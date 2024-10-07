import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { keyword, location = 'US', lang = 'en' } = req.body;
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const url = `https://google-keyword-insight1.p.rapidapi.com/keysuggest/?keyword=${encodeURIComponent(keyword)}&location=${location}&lang=${lang}`;

    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': 'a2f6e55c91msha441d0cfe12586bp11d0a4jsna2992d13a8d5',
        'x-rapidapi-host': 'google-keyword-insight1.p.rapidapi.com',
      },
    };

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Unable to fetch keywords');
    }

    res.status(200).json(data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

export default handler;