import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { language, topic, ebookType, title, genre, targetAudience, writingStyle, wordCount, outline } = req.body;
  console.log('Received request with the following data:', req.body);

  try {
    console.log('Parsing the outline');
    const parsedOutline = parseOutline(outline);
    console.log('Parsed outline:', parsedOutline);

    // Initialize the eBook content with the title
    let ebookContent = `# ${parsedOutline.title}\n\n`;

    // Add the introduction if it exists
    if (parsedOutline.introduction) {
      const cleanedIntroduction = cleanContent(parsedOutline.introduction);
      ebookContent += `## Introduction\n\n${cleanedIntroduction}\n\n`;
    }

    // Calculate total number of subchapters
    let totalSubchapters = 0;
    for (const chapter of parsedOutline.chapters) {
      totalSubchapters += chapter.subchapters.length;
    }
    console.log(`Total number of subchapters: ${totalSubchapters}`);

    // Calculate word count per subchapter
    const wordCountPerSubchapter = Math.floor(wordCount / totalSubchapters);
    console.log(`Word count per subchapter: ${wordCountPerSubchapter}`);

    // Loop over chapters and subchapters
    for (const chapter of parsedOutline.chapters) {
      ebookContent += `## ${chapter.title}\n\n`;

      for (const subchapter of chapter.subchapters) {
        console.log(`Generating content for subchapter: ${subchapter.title}`);

        const subchapterContent = await generateSubchapterContent(
          language,
          genre,
          ebookType,
          subchapter.title,
          writingStyle,
          targetAudience,
          topic,
          wordCountPerSubchapter
        );

        // Add subchapter title and content
        ebookContent += `### ${subchapter.title}\n\n${subchapterContent}\n\n`;
      }
    }

    // Add the 'Thank You' chapter if it exists
    if (parsedOutline.thankYou) {
      const cleanedThankYou = cleanContent(parsedOutline.thankYou);
      ebookContent += `## Thank You\n\n${cleanedThankYou}\n\n`;
    }

    res.status(200).json({ fullEbookContent: ebookContent });
  } catch (error: any) {
    console.error('Error generating eBook:', error);

    if (error.response) {
      console.error('OpenAI API Error:', error.response.data);
      res.status(500).json({ error: error.response.data });
    } else {
      res.status(500).json({ error: 'Failed to generate eBook content' });
    }
  }
};

function parseOutline(outline: string) {
  const lines = outline.split('\n').map(line => line.trim());
  const parsedOutline = {
    title: '',
    introduction: '',
    chapters: [] as any[],
    thankYou: '',
  };

  let currentChapter = null;
  let inIntroduction = false;
  let inThankYou = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line === '') continue;

    if (!parsedOutline.title) {
      // First non-empty line is the title (remove '#' if present)
      parsedOutline.title = line.replace(/^#+\s*/, '').trim();
      continue;
    }

    const normalizedLine = line.toLowerCase().replace(/^#+\s*/, '').trim();

    if (normalizedLine === 'introduction') {
      inIntroduction = true;
      continue;
    }

    if (normalizedLine === 'thank you') {
      inThankYou = true;
      continue;
    }

    if (inIntroduction) {
      if (line.startsWith('##')) {
        inIntroduction = false;
        i--; // Re-process this line as it might be a chapter
        continue;
      } else {
        parsedOutline.introduction += line + '\n';
        continue;
      }
    }

    if (inThankYou) {
      parsedOutline.thankYou += line + '\n';
      continue;
    }

    if (line.startsWith('## ')) {
      // Start a new chapter
      currentChapter = {
        title: line.substring(3).trim(), // Remove '## ' from the line
        subchapters: [],
      };
      parsedOutline.chapters.push(currentChapter);
    } else if (line.startsWith('### ')) {
      // Subchapter
      if (currentChapter) {
        currentChapter.subchapters.push({
          title: line.substring(4).trim(), // Remove '### ' from the line
        });
      }
    }
  }

  return parsedOutline;
}

function cleanContent(content: string) {
  return content
    .split('\n')
    .map(line => line.replace(/^#+\s*/, '').trim())
    .join('\n');
}

async function generateSubchapterContent(
  language: string,
  genre: string,
  ebookType: string,
  subchapterTitle: string,
  writingStyle: string,
  targetAudience: string,
  topic: string,
  wordCount: number
) {
  try {
    const estimatedTokens = Math.ceil(wordCount * 1.5); // approximate tokens needed
    console.log(`Generating approximately ${wordCount} words (~${estimatedTokens} tokens) for subchapter: ${subchapterTitle}`);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Adjusted model to support more tokens
      messages: [
        {
          role: 'system',
          content: `You are a skilled writer who creates detailed eBook content in ${language} for a ${genre} eBook of type ${ebookType}. The writing style is ${writingStyle}, and the target audience is ${targetAudience}. Use Markdown formatting with appropriate '#' symbols for headers. Include bullet lists when appropriate, using correct Markdown syntax.`,
        },
        {
          role: 'user',
          content: `Please write the content for the subchapter titled '${subchapterTitle}' in the context of the topic '${topic}'. The content should be approximately ${wordCount} words. **Do not include the subchapter title in your response.** When relevant, include bullet lists using Markdown syntax. Ensure the content is coherent, informative, and follows the subchapter title closely.`,
        },
      ],
      max_tokens: estimatedTokens,
    });

    const subchapterContent = completion.choices[0]?.message?.content || '';

    // Remove any subchapter titles included in the content
    const cleanedContent = removeSubchapterTitle(subchapterContent, subchapterTitle);

    return cleanedContent.trim();
  } catch (error) {
    console.error(`Error generating content for subchapter '${subchapterTitle}':`, error);
    throw error;
  }
}

function removeSubchapterTitle(content: string, subchapterTitle: string) {
  // Remove the subchapter title if the AI included it
  const lines = content.split('\n');
  if (lines.length > 0 && lines[0].toLowerCase().includes(subchapterTitle.toLowerCase())) {
    return lines.slice(1).join('\n').trim();
  }
  return content;
}

export default handler;








