const reelLink = document.querySelector('.studio-reel-link');
const reelDialog = document.querySelector('.studio-reel');
const reelPlayer = reelDialog?.querySelector('.studio-reel-player');

if (reelLink && reelPlayer && typeof reelDialog.showModal === 'function') {
  reelLink.setAttribute('aria-haspopup', 'dialog');
  reelLink.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const player = document.createElement('iframe');
    player.title = 'Bakı, Azərbaycan — Instagram videosu, @suleiman.mov';
    player.src = new URL('embed/', reelLink.href).href;
    player.allow = 'fullscreen; encrypted-media; picture-in-picture';
    player.allowFullscreen = true;
    reelPlayer.replaceChildren(player);
    reelDialog.showModal();
  });
  reelDialog.addEventListener('close', () => reelPlayer.replaceChildren());
}
