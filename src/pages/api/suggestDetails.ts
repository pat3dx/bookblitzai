import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const { topic, ebookType } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a writing assistant that provides detailed context for eBook topics. Consider the eBook type: ${ebookType}. Along with other suggestions, include a creative eBook title. Provide a response in the format: [Title: Some Title]; [Genre: XYZ]; [Target Audience: ABC]; [Writing Style: DEF].`,
        },
        {
          role: "user",
          content: `For an eBook of type ${ebookType}, suggest a title, genre, target audience, and writing style for the topic: ${topic}.`
        }
      ],
    });

    let content = completion.choices[0]?.message?.content || '';

    console.log('AI response content:', content);
    
    // Add 'Non-fiction / ' prefix to genre if not already added
    if (ebookType === 'Non-Fiction' && !content.includes('Non-fiction /')) {
        content = content.replace(/(Genre: )(.*?)(?=\];)/, '$1Non-fiction / $2');
    }

    const titleMatch = content.match(/Title: (.*?)(?=\];)/);
    const genreMatch = content.match(/Genre: (.*?)(?=\];)/);
    const targetAudienceMatch = content.match(/Target Audience: (.*?)(?=\];)/);
    const writingStyleMatch = content.match(/Writing Style: (.*?)(?=\];|\.$)/);

    const title = titleMatch ? titleMatch[1].trim() : 'Untitled';
    const genre = genreMatch ? genreMatch[1].trim() : 'N/A';
    const targetAudience = targetAudienceMatch ? targetAudienceMatch[1].trim() : 'N/A';
    let writingStyle = writingStyleMatch ? writingStyleMatch[1].trim() : 'N/A';

    // Ensure writing style is generated if topic is present
    if (topic && writingStyle === 'N/A') {
      writingStyle = 'Default Writing Style'; // Set a default or prompt for writing style
    }

    console.log('Regex parsing results:', {
      title,
      genre,
      targetAudience,
      writingStyle
    });

    res.status(200).json({ title, genre, targetAudience, writingStyle });
  } catch (error) {
    console.error('Error fetching AI suggestions:', error);
    res.status(500).json({ error: 'Failed to retrieve AI suggestions' });
  }
};

export default handler;

