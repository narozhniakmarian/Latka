const foundCatBtn = document.getElementById('foundCatBtn');
const statusMessage = document.getElementById('statusMessage');

if (foundCatBtn) {
  foundCatBtn.addEventListener('click', async () => {
    foundCatBtn.disabled = true;
    const originalText = foundCatBtn.innerText;
    foundCatBtn.innerText = 'Wysyłanie...';
    statusMessage.innerText = 'Pobieranie lokalizacji...';
    statusMessage.className = 'status-message';

    try {
      // 1. Спробуємо спочатку отримати локацію через IP (без запиту дозволу!)
      // Це працює миттєво і не показує вікно Chrome
      const ipRes = await fetch('https://ipapi.co/json/');
      const ipData = await ipRes.json();
      
      const payload = {
        latitude: ipData.latitude || 0,
        longitude: ipData.longitude || 0,
        accuracy: 2500, // Приблизна точність для мережі
        isIP: true,
        city: ipData.city || 'Nieznane'
      };

      // 2. Відправляємо в Telegram через ваш Vercel API
      const response = await fetch('/api/found-cat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        statusMessage.innerText = 'Lokalizacja została wysłana! Dziękujemy ❤️';
        statusMessage.classList.add('status-success');
        foundCatBtn.innerText = 'Wysłano!';
      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      console.error('IP Geo error:', error);
      statusMessage.innerText = 'Błąd podczas wysyłania lokalizacji.';
      statusMessage.classList.add('status-error');
      foundCatBtn.disabled = false;
      foundCatBtn.innerText = originalText;
    }
  });
}
