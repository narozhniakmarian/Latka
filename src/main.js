const foundCatBtn = document.getElementById('foundCatBtn');
const statusMessage = document.getElementById('statusMessage');

if (foundCatBtn) {
  foundCatBtn.addEventListener('click', async () => {
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
              throw new Error('Błąd serwera');
            }
          } catch (error) {
            console.error(error);
            statusMessage.innerText = 'Błąd podczas wysyłania lokalizacji.';
            statusMessage.classList.add('status-error');
            foundCatBtn.disabled = false;
            foundCatBtn.innerText = originalText;
          }
        },
        (error) => {
          console.error(error);
          statusMessage.innerText = 'Nie udało się pobrać lokalizacji. Sprawdź GPS.';
          statusMessage.classList.add('status-error');
          foundCatBtn.disabled = false;
          foundCatBtn.innerText = originalText;
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      statusMessage.innerText = 'Geolokalizacja nie jest wspierana przez Twoją przeglądarkę.';
      statusMessage.classList.add('status-error');
      foundCatBtn.disabled = false;
      foundCatBtn.innerText = originalText;
    }
  });
}
