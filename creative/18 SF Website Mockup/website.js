const filmURL = 'https://djjr1drlf4hlxylk.public.blob.vercel-storage.com/videos/runhack-overview-20260912-1080p.mp4';
const film = document.querySelector('#london-film');
const playButton = document.querySelector('#play-film');
const message = document.querySelector('#video-message');
const messageText = document.querySelector('#video-message-text');
function showVideoMessage(text) { messageText.textContent=text; message.hidden=false; }
playButton.addEventListener('click', () => {
  if (!film.getAttribute('src')) film.src=filmURL;
  film.hidden=false;
  playButton.hidden=true;
  message.hidden=true;
  film.focus();
  film.play().catch(() => showVideoMessage('Press play in the video controls to start the film.'));
});
film.addEventListener('error', () => showVideoMessage('The film couldn’t load. Try opening it directly.'));
