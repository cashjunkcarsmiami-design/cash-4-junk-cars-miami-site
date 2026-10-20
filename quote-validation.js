const quoteStyle = document.createElement('style');
quoteStyle.textContent = '.content form[action="/api/contact"]{position:static!important;align-self:start;scroll-margin-top:110px}.quote-status{margin:0;font-weight:700;color:#a31319}.quote-status:empty{display:none}';
document.head.appendChild(quoteStyle);
document.querySelectorAll('form[action="/api/contact"]').forEach(form => {
  const phone = form.elements.namedItem('Phone');
  if (!phone) return;
  const validate = () => {
    const value = phone.value.trim();
    const digits = value.replace(/\D/g, '');
    const valid = /^[+0-9\s().-]+$/.test(value) && (digits.length === 10 || (digits.length === 11 && digits.startsWith('1')));
    phone.setCustomValidity(value && !valid ? 'Enter a 10-digit phone number, optionally with country code 1. / Ingresa un teléfono de 10 dígitos, con código 1 opcional.' : '');
  };
  phone.addEventListener('input', validate);
  phone.addEventListener('change', validate);
  validate();
  const button = form.querySelector('button[type="submit"]');
  if (!button) return;
  const originalText = button.textContent;
  const status = document.createElement('p');
  status.className = 'quote-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  button.before(status);
  form.addEventListener('invalid', () => {
    status.textContent = 'Please complete the highlighted field. / Completa el campo indicado para enviar tu solicitud.';
  }, true);
  form.addEventListener('input', () => { status.textContent = ''; });
  let sending = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    sending = true;
    window.cash4TrackContact?.('quote_submit_attempt', {contact_method:'form'});
    status.textContent = 'Sending your request… / Enviando tu solicitud…';
    button.textContent = 'Sending… / Enviando…';
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: {'Accept':'application/json'},
        body: new URLSearchParams(new FormData(form)),
        signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || result.accepted !== true) throw new Error('Not accepted');
      window.cash4TrackContact?.('generate_lead', {contact_method:'form'});
      window.location.assign('/thank-you');
    } catch {
      window.cash4TrackContact?.('quote_submit_error', {contact_method:'form'});
      status.textContent = 'We could not confirm delivery. Please call 305-457-0817 before retrying. / No pudimos confirmar el envío. Llama al 305-457-0817 antes de reintentar.';
      button.textContent = originalText;
      button.disabled = false;
      form.removeAttribute('aria-busy');
      sending = false;
    } finally {
      clearTimeout(timeout);
    }
  });
  window.addEventListener('pageshow', () => {
    button.textContent = originalText;
    status.textContent = '';
    form.removeAttribute('aria-busy');
    button.disabled = false;
    sending = false;
  });
});
