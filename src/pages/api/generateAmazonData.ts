import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Define the structure of the expected request body
interface GenerateAmazonDataRequest {
  language: string;
  ebookType: string;
  title: string;
  genre: string;
  targetAudience: string;
  writingStyle: string;
  wordCount: number;
  outline: string;
}

// Define the structure of the response data
interface GenerateAmazonDataResponse {
  amazonCategories: string;
  longTailKeywords: string;
  priceSuggestions: string;
  twitterPost: string;
  blogPostTitles: string;
  bookSeries: string;
}

const openai = new OpenAI();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateAmazonDataResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const {
    language,
    ebookType,
    title,
    genre,
    targetAudience,
    writingStyle,
    wordCount,
    outline,
  }: GenerateAmazonDataRequest = req.body;

  try {
    // Define the messages for OpenAI
    const messages: { role: string; content: string }[] = [
      {
        role: "system",
        content: `
You are an expert copywriter specialized in Amazon publishing. Based on the following ebook details, generate the required Amazon Publishing data with proper Markdown formatting.

**Ebook Details:**
- **Language:** ${language}
- **Ebook Type:** ${ebookType}
- **Title:** ${title}
- **Genre:** ${genre}
- **Target Audience:** ${targetAudience}
- **Writing Style:** Provide a clear and engaging writing style that reflects the tone of the book.
- **Word Count:** ${wordCount}
- **Outline:** ${outline}

**Tasks:**
1. **Amazon Blurb:** Provide a long and engaging blurb using Markdown syntax, incorporating emojis and bullet points if necessary to attract Amazon buyers.
2. **Amazon Categories:** Suggest the three most relevant and real Amazon categories for the ebook, displaying the full path of each category.
3. **Long-Tail Keywords:** Generate a bullet-point list of the seven most relevant long-tail keywords based on the ebook's title and topic. Do not include the book genre.
4. **Price Suggestions:** Offer a range for both ebook and paperback formats, specifying the lowest and highest prices.
5. **Twitter/X Post:** Create a catchy Twitter/X post to promote the ebook on social media, including relevant hashtags and emojis. Ensure the post does not exceed 230 characters.
6. **Blog Post Titles:** List five engaging blog post titles related to the ebook.
7. **Book Series:** Develop a complete book series with a unique series title and ten short book titles without numerical suffixes.

**Output Format:**
Use Markdown syntax for all generated data to ensure proper rendering in text fields.
        `,
      },
      {
        role: "user",
        content: `
**Ebook Details:**
- **Language:** ${language}
- **Ebook Type:** ${ebookType}
- **Title:** ${title}
- **Genre:** ${genre}
- **Target Audience:** ${targetAudience}
- **Writing Style:** ${writingStyle}
- **Word Count:** ${wordCount}
- **Outline:** ${outline}
        `,
      },
    ];

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as { role: string; content: string; }[],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const aiResponse = response.choices[0].message?.content;

    // Log the raw AI response for debugging
    console.log('Raw AI Response:', aiResponse);

    if (!aiResponse) {
      console.error('No response from OpenAI.');
      return res.status(500).json({ error: 'No response from OpenAI.' });
    }

    // Parse the AI response
    const sections = aiResponse.split('\n\n').filter(section => section.trim() !== '');

    const data: Partial<GenerateAmazonDataResponse> = {};

    sections.forEach((section: string) => {
      if (section.startsWith('## Amazon Categories')) {
        data.amazonCategories = section.replace('## Amazon Categories', '').trim();
      } else if (section.startsWith('## Long-Tail Keywords')) {
        data.longTailKeywords = section.replace('## Long-Tail Keywords', '').trim();
      } else if (section.startsWith('## Price Suggestions')) {
        data.priceSuggestions = section.replace('## Price Suggestions', '').trim();
      } else if (section.startsWith('## Twitter/X Post')) {
        data.twitterPost = section.replace('## Twitter/X Post', '').trim();
      } else if (section.startsWith('## Blog Post Titles')) {
        data.blogPostTitles = section.replace('## Blog Post Titles', '').trim();
      } else if (section.startsWith('## Book Series')) {
        data.bookSeries = section.replace('## Book Series', '').trim();
      }
    });

    // Log parsed data for debugging
    console.log('Parsed Data:', data);

    // Validate that all required data is present
    const requiredFields: (keyof GenerateAmazonDataResponse)[] = [
      'amazonCategories',
      'longTailKeywords',
      'priceSuggestions',
      'twitterPost',
      'blogPostTitles',
      'bookSeries',
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        console.error(`Missing field: ${field}`);
        return res.status(500).json({ error: `Missing field: ${field}` });
      }
    }

    res.status(200).json(data as GenerateAmazonDataResponse);
  } catch (error) {
    console.error('Error generating Amazon data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
