const { setGlobalOptions } = require('firebase-functions');
const { onRequest } = require('firebase-functions/v2/https');

const cors = require('cors')({ origin: true });
const OpenAI = require('openai');

setGlobalOptions({ maxInstances: 10 });

exports.chatGPT = onRequest(
  { secrets: ['OPENAI_API_KEY'] }, // 🔥 THIS IS CRITICAL
  async (req, res) => {
    cors(req, res, async () => {
      try {
        // Handle preflight
        if (req.method === 'OPTIONS') {
          return res.status(204).send('');
        }

        const { message } = req.body;

        if (!message) {
          return res.status(400).json({ error: 'Message is required.' });
        }

        // 🔥 Create OpenAI instance INSIDE function
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        console.log('API KEY LENGTH:', process.env.OPENAI_API_KEY?.length);

        const completion = await openai.responses.create({
          model: 'gpt-4.1-mini',
          input: [
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
              content: userMessage,
            },
          ],
          max_output_tokens: 500,
        });

        res.status(200).json({
          reply: completion.choices[0].message.content,
        });
      } catch (error) {
        console.error('OpenAI Error:', error);
        res.status(500).json({ error: 'AI request failed.' });
      }
    });
  }
);
