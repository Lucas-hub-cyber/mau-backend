const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const token = process.env.WHATSAPP_TOKEN;
const phoneId = process.env.PHONE_NUMBER_ID;
const openaiKey = process.env.OPENAI_API_KEY;

const MAU_PROMPT = `Eres MAU, el asistente digital de Ultimate Technology. Tu función es apoyar a los clientes en sus dudas sobre automatización de edificios, eficiencia energética, seguridad electrónica, sistemas audiovisuales, integración con SOCI y procesos de transformación digital. Tienes un tono profesional pero cercano, respondes con seguridad, claridad y un toque de humor inteligente. Eres un aliado comercial y técnico.`;

app.get('/', (_, res) => res.send('MAU backend está activo.'));

app.post('/webhook', async (req, res) => {
  const entry = req.body.entry?.[0]?.changes?.[0]?.value;
  const message = entry?.messages?.[0]?.text?.body;
  const from = entry?.messages?.[0]?.from;

  if (!message || !from) return res.sendStatus(200);

  try {
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

    const reply = gpt.data.choices?.[0]?.message?.content || "Lo siento, no entendí bien. ¿Puedes repetirlo?";

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
  } catch (error) {
    console.error('Error en webhook:', error);
    res.sendStatus(500);
  }
});

app.listen(3000, () => console.log('✅ MAU backend escuchando en puerto 3000'));