const foundCatBtn = document.getElementById('foundCatBtn');
const statusMessage = document.getElementById('statusMessage');

if (foundCatBtn) {
  foundCatBtn.addEventListener('click', () => {
    foundCatBtn.disabled = true;
    foundCatBtn.innerText = 'Szukam Satelitów...';
    statusMessage.innerText = 'Zezwól na lokalizację...';
    statusMessage.className = 'status-message';

    if ("geolocation" in navigator) {
      // Крок 1: Швидка спроба отримати будь-які дані
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // Якщо точність погана (> 1000м), пробуємо отримати кращі дані
          if (position.coords.accuracy > 1000) {
            statusMessage.innerText = 'Słaby sygnał. Ponawiam próbę (GPS)...';
            
            navigator.geolocation.getCurrentPosition(
              async (pos) => {
                statusMessage.innerText = 'Sukces! Wysyłam GPS...';
                await sendToTelegram(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy, false);
              },
              async (err) => {
                // Якщо точна спроба провалилася, відправляємо те що було (навіть якщо це Варшава)
                statusMessage.innerText = 'Wysyłam przybliżoną pozycję...';
                await sendToTelegram(position.coords.latitude, position.coords.longitude, position.coords.accuracy, true);
              },
              { enableHighAccuracy: true, timeout: 15000 }
            );
          } else {
            // Маємо гарну точність відразу
            statusMessage.innerText = 'Dokładny GPS znaleziony! Wysyłam...';
            await sendToTelegram(position.coords.latitude, position.coords.longitude, position.coords.accuracy, false);
          }
        },
        async (error) => {
          // Якщо перша спроба взагалі не вдалася (заборона або системна помилка)
          let diag = 'Błąd Geo';
          if (error.code === 1) diag = 'Brak uprawnień';
          if (error.code === 3) diag = 'Timeout';
          
          statusMessage.innerText = `${diag}. Próba przez IP...`;
          
          try {
            const ipRes = await fetch('https://ipapi.co/json/');
            const ipData = await ipRes.json();
            await sendToTelegram(ipData.latitude, ipData.longitude, 5000, true, ipData.city);
          } catch (e) {
            statusMessage.innerText = 'Błąd sieci.';
            foundCatBtn.disabled = false;
            foundCatBtn.innerText = 'Znalazłem kota';
          }
        },
        { enableHighAccuracy: false, timeout: 8000 }
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
      statusMessage.innerText = 'Wysłano! Dziękujemy ❤️';
      statusMessage.classList.add('status-success');
      foundCatBtn.innerText = 'Wysłano!';
    } else {
      throw new Error();
    }
  } catch (e) {
    statusMessage.innerText = 'Błąd wysyłki.';
    foundCatBtn.disabled = false;
    foundCatBtn.innerText = 'Znalazłem kota';
  }
}
