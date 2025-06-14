# MAU Backend - WhatsApp + OpenAI

Este es el backend del asistente MAU para Ultimate Technology.

## ¿Qué hace?

- Recibe mensajes por WhatsApp
- Consulta OpenAI con personalidad de MAU
- Responde automáticamente al usuario

## 🚀 Cómo desplegar

1. Clona el repositorio
2. Renombra `.env.example` a `.env` y coloca tus claves
3. Instala dependencias:
   ```bash
   npm install
   ```
4. Inicia el servidor:
   ```bash
   npm start
   ```

## 🔐 Variables de entorno

```
WHATSAPP_TOKEN=...
PHONE_NUMBER_ID=...
OPENAI_API_KEY=...
```

## 🌐 Webhook para Meta

Configura tu webhook en Meta con la URL:
```
https://TU_DOMINIO/webhook
```

Listo. MAU comenzará a responder automáticamente.