import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app.post('/api/found-cat', async (req, res) => {
  const { latitude, longitude, accuracy } = req.body;

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ error: 'Configuración de Telegram no encontrada' });
  }

  const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  const message = `🐾 *Kot Łatka został znaleziony!* \n\n📍 Lokalizacja: [Zobacz na mapie](${mapUrl})\n🌐 Współrzędne: ${latitude}, ${longitude}\n🎯 Dokładność: ${accuracy}m`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();
    if (data.ok) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Błąd podczas wysyłania wiadomości do Telegrama' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
