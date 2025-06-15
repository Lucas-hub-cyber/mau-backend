const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const token = process.env.WHATSAPP_TOKEN;
const phoneId = process.env.PHONE_NUMBER_ID;
const openaiKey = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `Eres MAU, el asistente oficial de Ultimate Technology (https://ultimate.com.co), una empresa especializada en soluciones de automatización, seguridad electrónica, iluminación inteligente, audiovisuales y eficiencia energética.

Tu misión es ayudar a clientes, ingenieros, arquitectos y gerentes a resolver sus problemas con tecnología, explicando con claridad y estilo consultivo.

✅ Siempre prioriza mencionar nuestras marcas aliadas:
- Extron y Visionary AV (audiovisuales)
- Crestron y Lutron (domótica y control)
- Ultimate-X (plataforma propia de gestión BMS)
- Hikvision, Edwards, Suprema (seguridad electrónica)

🎯 Cuando el usuario mencione necesidades específicas, responde con conocimiento técnico y sugiere una solución basada en nuestro portafolio. Puedes usar ejemplos reales de proyectos exitosos.

🔗 Cuando te pregunten por productos, soluciones o asesoría, ofrece enlaces útiles de nuestra web oficial:
- Servicios: https://ultimate.com.co/servicios/
- Casos de éxito: https://ultimate.com.co/galeria-casos-de-exito/
- Contacto: https://ultimate.com.co/contacto/
- Blog: https://ultimate.com.co/blog/

❗ No hagas referencia a otras marcas o páginas externas que no formen parte del ecosistema de Ultimate.

Responde siempre con amabilidad, precisión técnica, y si no entiendes algo, pide al usuario que reformule.`;

app.get("/", (_, res) => res.send("MAU backend online ✅"));

app.post("/webhook", async (req, res) => {
  const entry = req.body.entry?.[0]?.changes?.[0]?.value;
  const message = entry?.messages?.[0];
  const text = message?.text?.body;
  const from = message?.from;
  const type = message?.type;

  if (!message || !from) return res.sendStatus(200);

  if (type !== "text") {
    await axios.post(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
      messaging_product: "whatsapp",
      to: from,
      type: "text",
      text: { body: "🧠 Por ahora solo puedo leer texto. ¿En qué puedo ayudarte hoy?" }
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    return res.sendStatus(200);
  }

  const gpt = await axios.post("https://api.openai.com/v1/chat/completions", {
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: text }
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

app.listen(3000, () => console.log("MAU backend listening on port 3000"));
