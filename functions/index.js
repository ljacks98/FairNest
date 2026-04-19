const { setGlobalOptions } = require('firebase-functions');
const { onRequest } = require('firebase-functions/v2/https');

const cors = require('cors')({ origin: true });
const OpenAI = require('openai');

setGlobalOptions({ maxInstances: 10 });

exports.chatGPT = onRequest(
  { secrets: ['OPENAI_API_KEY'] },
  async (req, res) => {
    cors(req, res, async () => {
      try {
        // Handle preflight
        if (req.method === 'OPTIONS') {
          return res.status(204).send('');
        }

        const { message } = req.body;

        if (!message || typeof message !== 'string') {
          return res.status(400).json({ error: 'Message is required and must be a string.' });
        }

        // Limit message length to prevent abuse
        const sanitizedMessage = message.trim().slice(0, 2000);

        if (!sanitizedMessage) {
          return res.status(400).json({ error: 'Message cannot be empty.' });
        }

        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        const completion = await openai.chat.completions.create({
          model: 'gpt-4.1-mini',
          messages: [
            {
              role: 'system',
              content: `
You are FairNest AI, a North Carolina housing assistant.

Respond using clean mobile-friendly formatting.

Rules:
- Do NOT use markdown.
- Do NOT use asterisks.
- Do NOT use symbols like ** or ###.
- Use simple line breaks.
- Use short paragraphs.
- When listing items, start each line with a dash like:
- Example item one
- Example item two

Keep responses easy to read on a phone screen.
`,
            },
            {
              role: 'user',
              content: sanitizedMessage,
            },
          ],
          max_tokens: 500,
        });

        res.status(200).json({
          reply: completion.choices[0].message.content,
        });
      } catch (error) {
        console.error('OpenAI Error:', error.message);
        res.status(500).json({ error: 'AI request failed.' });
      }
    });
  }
);
