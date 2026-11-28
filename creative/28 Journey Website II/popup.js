/* The announcement that opens when the page loads: next stop, San Francisco, and how to sponsor it.
   Everything it needs is in this file and popup.css. It stores nothing, so it opens again on every visit.
   A native <dialog> opened with showModal(): Escape closes it, focus stays inside, the page behind is inert. */
(() => {
  'use strict';
  const query = new URLSearchParams(location.search);
  if (!window.HTMLDialogElement || query.has('hold') || query.has('nopopup')) return;   // ?hold is used to photograph a single shot

  const SUBJECT = 'Sponsorship enquiry | Running Hackathon San Francisco';
  const BODY = [
    'Hi Running Hackathon team,', '',
    "I'm [your name] from [company]. We'd like to hear more about sponsoring Running Hackathon San Francisco in spring 2027.", '',
    'What we have in mind: [a line or two]',
    'Best person to speak to: [name, role]', '',
    'Could you send over the sponsor deck and a few times to talk?', '',
    'Thanks,', '[your name]',
  ].join('\n');
  const GMAIL = 'https://mail.google.com/mail/?view=cm&fs=1&to=runninghackathon@gmail.com&su=' + encodeURIComponent(SUBJECT) + '&body=' + encodeURIComponent(BODY);

  const d = document.createElement('dialog');
  d.className = 'announce';
  d.setAttribute('aria-labelledby', 'announce-title');
  d.innerHTML = `
    <div class="announce-pic"><img src="../../assets/deck/15-jump.jpg" alt="Three people jumping for the camera on the London track, the stands behind them." width="1920" height="1080"></div>
    <div class="announce-text">
      <div class="announce-top">
        <p class="announce-label">london → barcelona → san-francisco</p>
        <button type="button" class="announce-x" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg></button>
      </div>
      <h2 id="announce-title">Next stop,<br>San Francisco.</h2>
      <p class="announce-body">Spring 2027. We are looking for sponsors now.</p>
      <a class="announce-go" href="${GMAIL.replace(/&/g, '&amp;')}" target="_blank" rel="noopener noreferrer">Join as a sponsor<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18L18 6M8 6h10v10"/></svg></a>
      <p class="announce-mail">runninghackathon@gmail.com</p>
      <button type="button" class="announce-stay">See London and Barcelona first</button>
    </div>`;
  document.body.append(d);

  let before = null;
  const close = () => { if (d.open) d.close(); };
  d.addEventListener('close', () => {
    const back = before && before !== document.body && document.contains(before) ? before : document.querySelector('.topcta');
    if (back && back.focus) back.focus({ preventScroll: true });
  });
  d.querySelector('.announce-x').addEventListener('click', close);
  d.querySelector('.announce-stay').addEventListener('click', close);
  d.addEventListener('click', e => { if (e.target === d) close(); });   // a press on the backdrop, outside the box

  const open = () => {
    if (d.open || document.querySelector('dialog[open]')) return;
    before = document.activeElement;
    d.showModal();
    d.querySelector('.announce-go').focus({ preventScroll: true });
  };
  // after the first screen has painted, so the cover is seen behind it
  const start = () => setTimeout(open, 700);
  if (document.readyState === 'complete') start(); else addEventListener('load', start, { once: true });
})();
