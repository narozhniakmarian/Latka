document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('found-cat-btn');

    if (!btn) return;

    btn.addEventListener('click', async () => {
        btn.disabled = true;
        const originalText = btn.textContent;
        btn.textContent = 'Wysyłam lokalizację...';

        if (!('geolocation' in navigator)) {
            alert('Twoje urządzenie nie obsługuje geolokalizacji.');
            btn.disabled = false;
            btn.textContent = originalText;
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async position => {
                const { latitude, longitude, accuracy } = position.coords;

                try {
                    const res = await fetch('/api/found-cat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ latitude, longitude, accuracy }),
                    });

                    if (!res.ok) {
                        throw new Error('Błąd odpowiedzi serwera');
                    }

                    const data = await res.json();
                    if (data.success) {
                        alert('Dziękuję! Lokalizacja została wysłana do właściciela.');
                    } else {
                        alert('Nie udało się wysłać lokalizacji. Spróbuj ponownie.');
                    }
                } catch (err) {
                    console.error(err);
                    alert('Wystąpił błąd podczas wysyłania lokalizacji.');
                } finally {
                    btn.disabled = false;
                    btn.textContent = originalText;
                }
            },
            error => {
                console.error(error);
                if (error.code === error.PERMISSION_DENIED) {
                    alert('Nie udzielono zgody na dostęp do lokalizacji.');
                } else {
                    alert('Nie udało się pobrać lokalizacji urządzenia.');
                }
                btn.disabled = false;
                btn.textContent = originalText;
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    });
});
