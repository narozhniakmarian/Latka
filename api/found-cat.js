export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { latitude, longitude, accuracy, isIP, city } = req.body;

  const BOT_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.VITE_TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ error: 'Telegram configuration missing' });
  }

  const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  const methodText = isIP ? `🌐 *Lokalizacja przybliżona (Sieć/IP)*\n🏙 Miasto: ${city}` : `🎯 *Lokalizacja GPS (Dokładna)*`;
  
  const message = `🐾 *Kot Łatka został znaleziony!* \n\n${methodText}\n📍 Mapa: [Zobacz tutaj](${mapUrl})\n🌐 Współrzędne: ${latitude}, ${longitude}\n🎯 Dokładność: ~${accuracy}m`;

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
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: 'Telegram API error', detail: data });
    }
  } catch (error) {
    console.error('Vercel function error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
