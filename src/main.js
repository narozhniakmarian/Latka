const foundCatBtn = document.getElementById('foundCatBtn');
const statusMessage = document.getElementById('statusMessage');

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
            
            // Звертаємося до нашої Vercel API функції
            const response = await fetch('/api/found-cat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ latitude, longitude, accuracy })
            });

            if (response.ok) {
              statusMessage.innerText = 'Lokalizacja została wysłana! Dziękujemy ❤️';
              statusMessage.classList.add('status-success');
              foundCatBtn.innerText = 'Wysłano!';
            } else {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Server error');
            }
          } catch (error) {
            console.error(error);
            statusMessage.innerText = 'Błąd wysyłki до Telegrama.';
            statusMessage.classList.add('status-error');
            foundCatBtn.disabled = false;
            foundCatBtn.innerText = originalText;
          }
        },
        (error) => {
          console.error('Geo error:', error);
          let msg = 'Nie udało się pobrać lokalizacji.';
          if (error.code === 1) msg = 'Proszę zezwolić на доступ до локації в налаштуваннях.';
          if (error.code === 3) msg = 'Czas oczekiwania minął. Spróbuj ponownie.';
          
          statusMessage.innerText = msg;
          statusMessage.classList.add('status-error');
          foundCatBtn.disabled = false;
          foundCatBtn.innerText = originalText;
        },
        { 
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 30000
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
