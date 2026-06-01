const foundCatBtn = document.getElementById('foundCatBtn');
const statusMessage = document.getElementById('statusMessage');

if (foundCatBtn) {
  foundCatBtn.addEventListener('click', () => {
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    
    if (!isSecure) {
      statusMessage.innerText = 'BŁĄD: GPS wymaga HTTPS. Używam IP...';
    }

    foundCatBtn.disabled = true;
    foundCatBtn.innerText = 'Szukam GPS...';
    statusMessage.className = 'status-message';

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          statusMessage.innerText = 'Sukces! Wysyłam GPS...';
          await sendToTelegram(position.coords.latitude, position.coords.longitude, position.coords.accuracy, false);
        },
        async (error) => {
          let reason = 'Błąd GPS';
          if (error.code === 1) reason = 'Brak uprawnień (Zablokowane)';
          if (error.code === 2) reason = 'Pozycja niedostępna (GPS wyłączony?)';
          if (error.code === 3) reason = 'Timeout (Satelity milczą)';
          
          statusMessage.innerText = `${reason}. Wysyłam IP...`;
          
          try {
            const ipRes = await fetch('https://ipapi.co/json/');
            const ipData = await ipRes.json();
            await sendToTelegram(ipData.latitude, ipData.longitude, 5000, true, ipData.city);
          } catch (e) {
            statusMessage.innerText = 'Błąd sieci.';
            statusMessage.classList.add('status-error');
            foundCatBtn.disabled = false;
            foundCatBtn.innerText = 'Znalazłem kota';
          }
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
    } else {
      statusMessage.innerText = 'Brak obsługi Geo.';
      foundCatBtn.disabled = false;
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
    statusMessage.innerText = 'Błąd serwera.';
    statusMessage.classList.add('status-error');
    foundCatBtn.disabled = false;
    foundCatBtn.innerText = 'Znalazłem kota';
  }
}
