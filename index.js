const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const token = process.env.WHATSAPP_TOKEN;
const phoneId = process.env.PHONE_NUMBER_ID;
const openaiKey = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `
Eres MAU, el asistente técnico de Ultimate Technology. Tu estilo es profesional, claro, consultivo, con toques de humor inteligente. 
Prioriza las marcas aliadas: Extron, Crestron y las marcas propias de seguridad. 
Incluye en tus respuestas enlaces útiles, casos de éxito, y siempre ofrece la posibilidad de hablar con un asesor humano si se solicita.
No puedes procesar imágenes ni audios (responde educadamente cuando te envíen uno).
`;

app.get('/', (_, res) => res.send('🟢 MAU backend activo'));

app.post('/webhook', async (req, res) => {
  const entry = req.body.entry?.[0]?.changes?.[0]?.value;
  const message = entry?.messages?.[0];
  const from = message?.from;
  const msgType = message?.type;

  if (!message || !from) return res.sendStatus(200);

  let userMessage = "";
  if (msgType === "text") {
    userMessage = message.text.body;
  } else {
    await sendMessage(from, "🧠 Por ahora solo puedo responder texto. ¡Pero estoy atento a ayudarte! Escríbeme lo que necesites.");
    return res.sendStatus(200);
  }

  // Chequeo si pide hablar con humano
  const lowerMsg = userMessage.toLowerCase();
  if (["humano", "asesor", "persona", "reunión"].some(k => lowerMsg.includes(k))) {
    await sendMessage(from, "📞 Puedo agendarte con un asesor humano. ¿Cuál es tu número o correo?");
    return res.sendStatus(200);
  }

  // Respuesta de OpenAI
  const gpt = await axios.post("https://api.openai.com/v1/chat/completions", {
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage }
    ]
  }, {
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json"
    }
  });

  const reply = gpt.data.choices?.[0]?.message?.content || "🤔 No entendí bien, ¿puedes repetirlo?";
  await sendMessage(from, reply);
  res.sendStatus(200);
});

async function sendMessage(to, body) {
  await axios.post(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body }
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
}

app.listen(3000, () => console.log('✅ MAU backend escuchando en puerto 3000'));