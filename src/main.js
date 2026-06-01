const foundCatBtn = document.getElementById('foundCatBtn');
const statusMessage = document.getElementById('statusMessage');

// Отримуємо токени зі змінних Vite (вони мають бути в .env з префіксом VITE_)
const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

if (foundCatBtn) {
  foundCatBtn.addEventListener('click', () => {
    foundCatBtn.disabled = true;
    const originalText = foundCatBtn.innerText;
    foundCatBtn.innerText = 'Wysyłanie...';
    statusMessage.innerText = 'Pobieranie lokalizacji...';
    statusMessage.className = 'status-message';

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude, accuracy } = position.coords;
            const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
            const message = `🐾 *Kot Łatka został znaleziony!* \n\n📍 Lokalizacja: [Zobacz na mapie](${mapUrl})\n🌐 Współrzędne: ${latitude}, ${longitude}\n🎯 Dokładność: ${accuracy}m`;

            // Відправляємо НАПРЯМУ в Telegram (бо GitHub Pages не має бекенду)
            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
              })
            });

            if (response.ok) {
              statusMessage.innerText = 'Lokalizacja została wysłana! Dziękujemy ❤️';
              statusMessage.classList.add('status-success');
              foundCatBtn.innerText = 'Wysłano!';
            } else {
              throw new Error('Telegram API error');
            }
          } catch (error) {
            console.error(error);
            statusMessage.innerText = 'Błąd wysyłki do Telegrama. Sprawdź połączenie.';
            statusMessage.classList.add('status-error');
            foundCatBtn.disabled = false;
            foundCatBtn.innerText = originalText;
          }
        },
        (error) => {
          console.error('Geo error:', error);
          let msg = 'Nie udało się pobrać lokalizacji.';
          if (error.code === 1) msg = 'Proszę zezwolić на доступ до локації в налаштуваннях браузера.';
          if (error.code === 3) msg = 'Czas oczekiwania minął. Spróbuj ponownie на відкритому місці.';
          
          statusMessage.innerText = msg;
          statusMessage.classList.add('status-error');
          foundCatBtn.disabled = false;
          foundCatBtn.innerText = originalText;
        },
        { 
          enableHighAccuracy: false, // Швидше отримання даних (через мережу/Wi-Fi)
          timeout: 10000,           // 10 секунд на відповідь
          maximumAge: 30000         // Можна використовувати дані 30-секундної давності
        }
      );
    } else {
      statusMessage.innerText = 'Twoja przeglądarka nie wspiera geolokalizacji.';
      statusMessage.classList.add('status-error');
      foundCatBtn.disabled = false;
      foundCatBtn.innerText = originalText;
    }
  });
}
