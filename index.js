const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const token = process.env.WHATSAPP_TOKEN;
const phoneId = process.env.PHONE_NUMBER_ID;
const openaiKey = process.env.OPENAI_API_KEY;

// --- ESTA ES LA RUTA PARA VERIFICAR EL WEBHOOK DE META ---
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = "mau_ultimate";
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});
// ---------------------------------------------------------

app.get('/', (_, res) => res.send('MAU is online'));

app.post('/webhook', async (req, res) => {
  const entry = req.body.entry?.[0]?.changes?.[0]?.value;
  const message = entry?.messages?.[0]?.text?.body;
  const from = entry?.messages?.[0]?.from;

  if (!message || !from) return res.sendStatus(200);

  const gpt = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: "gpt-4o",
    messages: [{ role: "user", content: message }]
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
