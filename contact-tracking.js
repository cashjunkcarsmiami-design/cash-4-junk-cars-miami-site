/* Contact clicks are intent, not completed calls or WhatsApp conversations. */
(() => {
  if (window.cash4ContactTracking) return;
  window.cash4ContactTracking = true;
  const page = location.pathname;
  const send = (name, extra = {}) => {
    if (typeof window.gtag === 'function') window.gtag('event', name, {
      event_category: 'contact',
      event_label: page,
      source_page: page,
      site_name: 'Cash 4 Junk Cars Miami',
      transport_type: 'beacon',
      ...extra
    });
  };
  window.cash4TrackContact = send;
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    let url;
    try { url = new URL(link.href, location.href); } catch { return; }
    const phone = url.protocol === 'tel:';
    const whatsapp = url.hostname === 'wa.me' && url.pathname === '/13054570817';
    if (!phone && !whatsapp) return;
    const placement = link.closest('.sticky-mobile-actions') ? 'sticky'
      : link.closest('.hero') ? 'hero'
      : link.closest('header') ? 'header'
      : link.closest('footer') ? 'footer'
      : link.closest('form') ? 'form' : 'content';
    send(phone ? 'phone_click' : 'whatsapp_click', {
      contact_method: phone ? 'phone' : 'whatsapp',
      contact_placement: placement
    });
  });
  document.querySelectorAll('form[action="/api/contact"]').forEach(form => {
    let started = false;
    form.addEventListener('input', () => {
      if (!started) {
        started = true;
        send('quote_start', {contact_method:'form'});
      }
    });
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'source_page';
    input.value = page;
    form.appendChild(input);
  });
})();
