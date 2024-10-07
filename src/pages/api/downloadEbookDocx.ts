import { NextApiRequest, NextApiResponse } from 'next';
import officegen from 'officegen';
import { PassThrough } from 'stream';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Buffer | { error: string }>) {
  try {
    const { fullEbookContent, title } = req.body;

    // Check if fullEbookContent is defined, else abort
    if (!fullEbookContent) {
      throw new Error('No content provided for DOCX generation');
    }

    const docx = officegen('docx');
    const docxStream = new PassThrough();

    docx.on('finalize', () => console.log('DOCX file created.'));
    docx.on('error', (err) => console.error(err));

    // Function to add formatted text to a paragraph
    const addFormattedText = (pObj: any, text: string, options = {}) => {
      const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3/g; // matches bold and italic markdown
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          pObj.addText(text.substring(lastIndex, match.index), { font_size: 12, ...options });
        }
        // Determine formatting based on the matched pattern
        const formatting = { font_size: 12, ...options };
        if (match[1] === '**' || match[1] === '__') {
          formatting.bold = true;
          pObj.addText(match[2], formatting);
        } else if (match[3] === '*' || match[3] === '_') {
          formatting.italics = true;
          pObj.addText(match[4], formatting);
        }
        lastIndex = regex.lastIndex;
      }

      // Add any remaining text after the last match
      if (lastIndex < text.length) {
        pObj.addText(text.substring(lastIndex), { font_size: 12, ...options });
      }
    };

    // Helper function to render lines with Markdown
    const renderMarkdownLine = (line: string, docx: any) => {
      let pObj;
      const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
      const listMatch = line.match(/^(\s*)[-*+] (.*)/);
      const quoteMatch = line.match(/^>\s+(.*)/);

      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2];
        const fontSize = 24 - (level - 1) * 2; // Adjust font size based on heading level
        pObj = docx.createP();
        addFormattedText(pObj, text, { bold: true, font_size: fontSize });
      } else if (listMatch) {
        const indent = listMatch[1].length;
        const text = listMatch[2];
        const level = Math.floor(indent / 2);
        pObj = docx.createListOfDots(level);
        addFormattedText(pObj, text);
      } else if (quoteMatch) {
        const text = quoteMatch[1];
        pObj = docx.createP();
        pObj.options.indentLeft = 720; // Indent the paragraph (720 = 0.5 inches)
        pObj.options.borderLeft = { type: 'single', size: 6, color: '999999' }; // Add left border for blockquote
        addFormattedText(pObj, text, { italics: true, color: '666666' });
      } else {
        pObj = docx.createP();
        addFormattedText(pObj, line);
      }
    };

    // Attempt to separate the Table of Contents from the body content
    let toContent = '', bodyContent = fullEbookContent;
    const splitContent = fullEbookContent.split("Thank You");
    if (splitContent.length === 2) {
      [toContent, bodyContent] = splitContent;
    }

    // Render the Table of Contents
    toContent.split('\n').forEach((line) => {
      renderMarkdownLine(line, docx);
    });

    // Render the body content
    bodyContent.split('\n').forEach((line) => {
      renderMarkdownLine(line, docx);
    });

    res.setHeader('Content-Disposition', `attachment; filename="${title}.docx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    const buffer: Buffer = await docx.generateBuffer();
    docxStream.pipe(res);
  } catch (error) {
    console.error('Error generating DOCX:', error);
    res.status(500).json({ error: 'Failed to generate DOCX file' });
  }
}




