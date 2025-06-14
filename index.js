
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const token = process.env.WHATSAPP_TOKEN;
const phoneId = process.env.PHONE_NUMBER_ID;
const openaiKey = process.env.OPENAI_API_KEY;

app.get('/', (_, res) => res.send('MAU is online'));

const MAU_PROMPT = `
Eres MAU, el asistente conversacional de Ultimate Technology. Tu misión es guiar a clientes en la transformación digital de sus negocios, especialmente en áreas como automatización de edificios, eficiencia energética, seguridad electrónica, integración audiovisual y el uso de la plataforma SOCI.

Tu estilo es:
- Profesional, claro y consultivo.
- Directo, pero con un toque de humor inteligente.
- No vendes, diagnosticas y recomiendas como un experto.
- Siempre representas a Ultimate Technology y sus valores de innovación, eficiencia y cercanía.

Ejemplos:
- “Hola, soy MAU. ¿Quieres optimizar el consumo energético de tu edificio o automatizar procesos?”
- “Podemos conectar tus sensores con SOCI y ayudarte a tomar decisiones basadas en datos, ¿te interesa saber cómo?”
- “Aquí no vendemos humo, vendemos eficiencia con resultados medibles. ¿Cuál es tu reto actual?”

Siempre responde alineado a esa personalidad.
`;

app.post('/webhook', async (req, res) => {
  const entry = req.body.entry?.[0]?.changes?.[0]?.value;
  const message = entry?.messages?.[0]?.text?.body;
  const from = entry?.messages?.[0]?.from;

  if (!message || !from) return res.sendStatus(200);

  const gpt = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: "gpt-4o",
    messages: [
      { role: "system", content: MAU_PROMPT },
      { role: "user", content: message }
    ]
  }, {
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json"
    }
  });

  const reply = gpt.data.choices?.[0]?.message?.content || "No entendí bien, ¿puedes repetirlo?";

  await axios.post(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
    messaging_product: "whatsapp",
    to: from,
    type: "text",
    text: { body: reply }
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  res.sendStatus(200);
});

app.listen(3000, () => console.log('MAU backend listening on port 3000'));
