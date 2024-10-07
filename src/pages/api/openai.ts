import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI();

const createBlogOutline = async (keywords: string) => {
  const messages = [
    {
      role: "system",
      content:
        "You create detailed outlines for blog posts. NEVER add Additional Resources or Call To Action after the Conclusion. Format the outline using Markdown syntax, including headings and bullet points.",
    },
    {
      role: "user",
      content: `Create a detailed outline for a blog post with the following keywords: ${keywords}. Use Markdown formatting.`,
    },
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
  });

  return completion.choices[0].message?.content ?? ""; // Ensure a string is returned
};

const createBlogPost = async (outline: string, length: number) => {
  const messages = [
    {
      role: "system",
      content:
        "You generate blog posts based on given outlines. Format the blog post using Markdown syntax, including appropriate headings, subheadings, bold text, bullet points, and other relevant Markdown formatting.",
    },
    {
      role: "user",
      content: `Based on the following outline, write a ${length}-word blog post using Markdown formatting: ${outline}`,
    },
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
  });

  return completion.choices[0].message?.content ?? ""; // Ensure a string is returned
};

const generateMetaTitle = async (blogPost: string) => {
  const messages = [
    {
      role: "system",
      content: "Generate a concise meta title for the given blog post content, with a maximum of 65 characters.",
    },
    {
      role: "user",
      content: blogPost,
    },
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
  });

  return completion.choices[0].message?.content ?? ""; // Ensure a string is returned
};

const generateMetaDescription = async (blogPost: string) => {
  const messages = [
    {
      role: "system",
      content: "Generate a short meta description for the given blog post content, with a maximum of 155 characters.",
    },
    {
      role: "user",
      content: blogPost,
    },
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
  });

  return completion.choices[0].message?.content ?? ""; // Ensure a string is returned
};

const generateMetaKeywords = async (blogPost: string) => {
  const messages = [
    {
      role: "system",
      content: "Generate a list of 5 highly relevant keywords for the given blog post content. List them as bullet points without any numeric prefixes.",
    },
    {
      role: "user",
      content: blogPost,
    },
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
  });

  return completion.choices[0].message?.content ?? ""; // Ensure a string is returned
};

const generateTwitterPost = async (blogPost: string) => {
  const messages = [
    {
      role: "system",
      content: "Generate a catchy Twitter post for the given blog post content, with a maximum of 250 characters, including emojis and exactly 3 hashtags.",
    },
    {
      role: "user",
      content: blogPost,
    },
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
  });

  return completion.choices[0].message?.content ?? ""; // Ensure a string is returned
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { keywords, length } = req.body;
    console.log('Received request with keywords:', keywords, 'and length:', length);

    if (!keywords || !length) {
      return res.status(400).json({ error: 'Keywords and length are required' });
    }

    const outline = await createBlogOutline(keywords);
    console.log('Generated outline:', outline);

    const blogPost = await createBlogPost(outline!, length);
    console.log('Generated blog post:', blogPost);

    // Generate metadata
    const metaTitle = await generateMetaTitle(blogPost);
    const metaDescription = await generateMetaDescription(blogPost);
    const metaKeywords = await generateMetaKeywords(blogPost);
    const twitterPost = await generateTwitterPost(blogPost);

    res.status(200).json({
      content: blogPost,
      metaTitle: metaTitle.trim(),
      metaDescription: metaDescription.trim(),
      metaKeywords: metaKeywords.trim().split(',').map(k => k.trim()),
      twitterPost: twitterPost.trim()
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error generating blog post:', error.message);
      res.status(500).json({ error: error.message });
    } else {
      console.error('Unknown error generating blog post');
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

export default handler;

