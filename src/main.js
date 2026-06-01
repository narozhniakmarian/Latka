const foundCatBtn = document.getElementById('foundCatBtn');
const statusMessage = document.getElementById('statusMessage');

if (foundCatBtn) {
  foundCatBtn.addEventListener('click', () => {
    // Відразу блокуємо кнопку, щоб уникнути повторних натискань
    foundCatBtn.disabled = true;
    foundCatBtn.innerText = 'Szukam satelitów...';
    statusMessage.innerText = 'Proszę kliknij "Zezwól" (Allow) у вікні браузера...';
    statusMessage.className = 'status-message';

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // УСПІХ: Маємо точні координати GPS
          statusMessage.innerText = 'Mamy GPS! Wysyłanie do Mariana...';
          await sendToTelegram(position.coords.latitude, position.coords.longitude, position.coords.accuracy, false);
        },
        async (error) => {
          // ПОМИЛКА GPS: наприклад, користувач відмовив або таймаут
          console.warn('GPS error:', error);
          statusMessage.innerText = 'GPS nie odpowiedział. Próba przez IP (mniej dokładna)...';
          
          // Запасний варіант: отримуємо по IP
          try {
            const ipRes = await fetch('https://ipapi.co/json/');
            const ipData = await ipRes.json();
            await sendToTelegram(ipData.latitude, ipData.longitude, 2000, true, ipData.city);
          } catch (e) {
            statusMessage.innerText = 'Błąd sieci. Spróbuj ponownie.';
            statusMessage.classList.add('status-error');
            foundCatBtn.disabled = false;
            foundCatBtn.innerText = 'Znalazłem kota';
          }
        },
        { 
          enableHighAccuracy: true, // Повертаємо справжній GPS
          timeout: 20000,           // Даємо 20 секунд на пошук супутників
          maximumAge: 0 
        }
      );
    }
  });
}

async function sendToTelegram(lat, lon, acc, isIP, city = '') {
  try {
    const response = await fetch('/api/found-cat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude: lat, longitude: lon, accuracy: acc, isIP, city })
    });

    if (response.ok) {
      statusMessage.innerText = 'Lokalizacja wysłana! Dziękujemy ❤️';
      statusMessage.classList.add('status-success');
      foundCatBtn.innerText = 'Wysłano!';
    } else {
      throw new Error();
    }
  } catch (e) {
    console.error('Send error:', e);
    statusMessage.innerText = 'Błąd serwera. Spróbuj za chwilę.';
    statusMessage.classList.add('status-error');
    foundCatBtn.disabled = false;
    foundCatBtn.innerText = 'Znalazłem kota';
  }
}
