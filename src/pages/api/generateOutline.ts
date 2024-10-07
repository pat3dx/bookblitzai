import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const { language, topic, title, genre, targetAudience, writingStyle } = req.body;

  try {
    const messages = [
      {
        role: "system",
        content: `You are an AI specialized in creating detailed outlines for eBooks. You generate these outlines in ${language}, the topic is ${topic}, the title is ${title}, focusing on the genre of ${genre}. The target audience is ${targetAudience}, with a writing style that is ${writingStyle}. Topical coherence and creativity are essential.`,
      },
      {
        role: "user",
        content: `Please create a structured eBook outline comprising only a generated book title, an introduction of around 50-70 words, all 15 chapters with 3 subchapters, and a single concluding chapter titled 'Thank You'. Use Markdown formatting with appropriate '#' symbols for headers. Omit any additional comments or content that isn't part of the structured outline or the final chapter. Example format:

#[Book Title]

## Introduction

[Brief introduction]

## Chapter 1: [Chapter Title]

### 1.1 [Unique Subchapter Title]

### 1.2 [Unique Subchapter Title]

### 1.3 [Unique Subchapter Title]

## Chapter 2: [Chapter Title]

### 2.1 [Unique Subchapter Title]

### 2.2 [Unique Subchapter Title]

### 2.3 [Unique Subchapter Title]

## Chapter 3: [Chapter Title]

### 3.1 [Unique Subchapter Title]

### 3.2 [Unique Subchapter Title]

### 3.3 [Unique Subchapter Title]

## Chapter 4: [Chapter Title]

### 4.1 [Unique Subchapter Title]

### 4.2 [Unique Subchapter Title]

### 4.3 [Unique Subchapter Title]

## Chapter 5: [Chapter Title]

### 5.1 [Unique Subchapter Title]

### 5.2 [Unique Subchapter Title]

### 5.3 [Unique Subchapter Title]

## Chapter 6: [Chapter Title]

### 6.1 [Unique Subchapter Title]

### 6.2 [Unique Subchapter Title]

### 6.3 [Unique Subchapter Title]

## Chapter 7: [Chapter Title]

### 7.1 [Unique Subchapter Title]

### 7.2 [Unique Subchapter Title]

### 7.3 [Unique Subchapter Title]

## Chapter 8: [Chapter Title]

### 8.1 [Unique Subchapter Title]

### 8.2 [Unique Subchapter Title]

### 8.3 [Unique Subchapter Title]

## Chapter 9: [Chapter Title]

### 9.1 [Unique Subchapter Title]

### 9.2 [Unique Subchapter Title]

### 9.3 [Unique Subchapter Title]

## Chapter 10: [Chapter Title]

### 10.1 [Unique Subchapter Title]

### 10.2 [Unique Subchapter Title]

### 10.3 [Unique Subchapter Title]

## Chapter 11: [Chapter Title]

### 11.1 [Unique Subchapter Title]

### 11.2 [Unique Subchapter Title]

### 11.3 [Unique Subchapter Title]

## Chapter 12: [Chapter Title]

### 12.1 [Unique Subchapter Title]

### 12.2 [Unique Subchapter Title]

### 12.3 [Unique Subchapter Title]

## Chapter 13: [Chapter Title]

### 13.1 [Unique Subchapter Title]

### 13.2 [Unique Subchapter Title]

### 13.3 [Unique Subchapter Title]

## Chapter 14: [Chapter Title]

### 14.1 [Unique Subchapter Title]

### 14.2 [Unique Subchapter Title]

### 14.3 [Unique Subchapter Title]

## Chapter 15: [Chapter Title]

### 15.1 [Unique Subchapter Title]

### 15.2 [Unique Subchapter Title]

### 15.3 [Unique Subchapter Title]

## Thank You

[Thank the reader, mention the Amazon Author page: https://www.amazon.com/author/jade_summers, and encourage them to visit the personal website: https://www.triptroveguides.com/. Include the full links as specified.]`,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    const outputContent = completion.choices[0]?.message?.content || '';

    res.status(200).json({ outlineContent: outputContent });
  } catch (error) {
    console.error('Error generating outline:', error);
    res.status(500).json({ error: 'Failed to generate eBook outline' });
  }
};

export default handler;



