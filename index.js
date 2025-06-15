const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const token = process.env.WHATSAPP_TOKEN;
const phoneId = process.env.PHONE_NUMBER_ID;
const openaiKey = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = \`Eres MAU, el asistente inteligente de Ultimate Technology. Respondes con conocimiento técnico, tono consultivo y referencias a nuestras marcas aliadas como Extron, Crestron y Ultimate-X. Siempre buscas ayudar al usuario a resolver problemas reales de automatización, seguridad y eficiencia energética.\`;

app.get('/', (_, res) => res.send('MAU backend online'));

app.post('/webhook', async (req, res) => {
  const entry = req.body.entry?.[0]?.changes?.[0]?.value;
  const message = entry?.messages?.[0]?.text?.body;
  const from = entry?.messages?.[0]?.from;
  const type = entry?.messages?.[0]?.type;

  if (!message || !from || type !== "text") {
    await axios.post(\`https://graph.facebook.com/v19.0/\${phoneId}/messages\`, {
      messaging_product: "whatsapp",
      to: from,
      type: "text",
      text: { body: "🧠 ¡Por ahora solo puedo responder a mensajes de texto! ¿Cómo puedo ayudarte hoy?" }
    }, {
      headers: {
        Authorization: \`Bearer \${token}\`,
        "Content-Type": "application/json"
      }
    });
    return res.sendStatus(200);
  }

  const gpt = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: message }
    ]
  }, {
    headers: {
      Authorization: \`Bearer \${openaiKey}\`,
      "Content-Type": "application/json"
    }
  });

  const reply = gpt.data.choices?.[0]?.message?.content || "🤖 No entendí bien, ¿puedes repetirlo?";

  await axios.post(\`https://graph.facebook.com/v19.0/\${phoneId}/messages\`, {
    messaging_product: "whatsapp",
    to: from,
    type: "text",
    text: { body: reply }
  }, {
    headers: {
      Authorization: \`Bearer \${token}\`,
      "Content-Type": "application/json"
    }
  });

  res.sendStatus(200);
});

app.listen(3000, () => console.log('✅ MAU backend listening on port 3000'));
