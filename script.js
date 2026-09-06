document.addEventListener('DOMContentLoaded', () => {

  // ============== AMBIENT PETALS ==============
  const petalsContainer = document.getElementById('petals');
  const PETAL_COUNT = 14;
  for (let i = 0; i < PETAL_COUNT; i++) {
    const petal = document.createElement('div');
    petal.className = 'petal';
    petal.style.left = Math.random() * 100 + 'vw';
    petal.style.animationDuration = (10 + Math.random() * 10) + 's';
    petal.style.animationDelay = (Math.random() * 10) + 's';
    petal.style.opacity = (0.25 + Math.random() * 0.35).toFixed(2);
    const size = 5 + Math.random() * 5;
    petal.style.width = size + 'px';
    petal.style.height = size + 'px';
    petalsContainer.appendChild(petal);
  }

  // ============== COUNTDOWN ==============
  const EVENT_DATE = new Date('2026-10-02T12:00:00+06:00').getTime();

  const elDays = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMin = document.getElementById('cd-min');
  const elSec = document.getElementById('cd-sec');

  function pad(n) { return String(n).padStart(2, '0'); }

  function updateCountdown() {
    const now = Date.now();
    const diff = EVENT_DATE - now;

    if (diff <= 0) {
      elDays.textContent = '00';
      elHours.textContent = '00';
      elMin.textContent = '00';
      elSec.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMin.textContent = pad(minutes);
    elSec.textContent = pad(seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ============== GUEST COUNT STEPPER ==============
  const guestCountInput = document.getElementById('guestCount');
  const stepMinus = document.getElementById('stepMinus');
  const stepPlus = document.getElementById('stepPlus');

  stepMinus.addEventListener('click', () => {
    const val = Math.max(1, parseInt(guestCountInput.value || '1', 10) - 1);
    guestCountInput.value = val;
  });
  stepPlus.addEventListener('click', () => {
    const val = Math.min(20, parseInt(guestCountInput.value || '1', 10) + 1);
    guestCountInput.value = val;
  });

  // ============== TELEGRAM FORM SUBMISSION ==============
  const form = document.getElementById('rsvpForm');
  const thankYouBlock = document.getElementById('thankYou');
  const formStatus = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const nameInput = document.getElementById('guestName');
      const attendanceValue = document.querySelector('input[name="attendance"]:checked')?.value || 'Белгисиз';
      const messageValue = document.getElementById('message')?.value || '';
      const guestsCount = guestCountInput?.value || '1';

      if (!nameInput || !nameInput.value.trim()) {
        formStatus.textContent = 'Сиздин аты-жөнүңүздү жазыңыз.';
        nameInput.focus();
        return;
      }

      const botToken = '8846631652:AAF5B2zl6pn15az7HIRdDKqgNLPzfeN0WtM';

      // Chat IDs that should receive RSVP notifications
      const chatIds = ['6956101864'];

      const submitButton = form.querySelector('.submit-btn');

      try {
        submitButton.disabled = true;
        submitButton.textContent = 'Жөнөтүлүүдө...';
        formStatus.textContent = '';

        const requests = chatIds.map((chatId) => {
          const payload = {
            chat_id: chatId,
            parse_mode: 'Markdown',
            text: `Кыз узатууга жаңы жооп!\n\nАты-жөнү: ${nameInput.value.trim()}\nКатышуусу: ${attendanceValue}\nАдам саны: ${guestsCount}\nКаалоо-тилек: ${messageValue || 'Жок'}`
          };

          return fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).then(res => res.json());
        });

        const results = await Promise.all(requests);
        const isSuccess = results.some(result => result.ok);

        if (!isSuccess) {
          throw new Error('Бир дагы чатка жөнөтүлгөн жок');
        }

        form.classList.add('hidden');
        thankYouBlock.classList.remove('hidden');
      } catch (error) {
        console.error('Telegram error:', error);
        formStatus.textContent = 'Жөнөтүү мүмкүн эмес. Кайра аракет кылып көрүңүз.';
        submitButton.disabled = false;
        submitButton.textContent = 'Жөнөтүү';
      }
    });
  }
});