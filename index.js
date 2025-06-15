const express = require('express');
const fs = require('fs');
const { google } = require('googleapis');
const app = express();
app.use(express.json());

const calendarId = process.env.GOOGLE_CALENDAR_ID;
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/calendar']
);

const calendar = google.calendar({ version: 'v3', auth });

app.post('/agenda', async (req, res) => {
  const { name, email, datetime } = req.body;
  const event = {
    summary: `Cita con ${name}`,
    description: `Agendada por MAU - Cliente: ${name}, Email: ${email}`,
    start: { dateTime: datetime, timeZone: 'America/Bogota' },
    end: {
      dateTime: new Date(new Date(datetime).getTime() + 60 * 60 * 1000).toISOString(),
      timeZone: 'America/Bogota',
    },
  };

  try {
    const response = await calendar.events.insert({ calendarId, resource: event });
    res.status(200).send({ message: 'Cita agendada', link: response.data.htmlLink });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(3000, () => console.log('MAU agenda backend listo en puerto 3000'));