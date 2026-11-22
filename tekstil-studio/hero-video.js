const video = document.querySelector('.portfolio-hero-video');
const toggle = document.querySelector('.portfolio-video-toggle');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const picture = video.previousElementSibling;
let visible = false;
let pausedByVisitor = false;

function updateButton() {
  const playing = !video.paused;
  toggle.setAttribute('aria-label', playing ? 'Videonu dayandır' : 'Videonu oynat');
  toggle.firstElementChild.textContent = playing ? 'Ⅱ' : '▶';
}

function syncPlayback() {
  if (video.error || !visible || document.hidden || reduced.matches || pausedByVisitor) {
    video.pause();
    return;
  }
  if (!video.hasAttribute('src')) {
    video.muted = true;
    video.src = video.dataset.src;
  }
  toggle.hidden = false;
  video.play().catch(updateButton);
}

video.addEventListener('playing', () => {
  video.classList.add('video-visible');
  picture.setAttribute('aria-hidden', 'true');
  updateButton();
});
video.addEventListener('pause', updateButton);
video.addEventListener('error', () => {
  toggle.hidden = true;
  video.classList.remove('video-visible');
  picture.removeAttribute('aria-hidden');
});
toggle.addEventListener('click', () => {
  pausedByVisitor = !video.paused;
  syncPlayback();
});
reduced.addEventListener('change', () => {
  if (reduced.matches) {
    video.classList.remove('video-visible');
    picture.removeAttribute('aria-hidden');
    toggle.hidden = true;
  }
  syncPlayback();
});
document.addEventListener('visibilitychange', syncPlayback);

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.intersectionRatio >= .15;
    syncPlayback();
  }, { threshold: .15 });
  observer.observe(video.closest('.portfolio-entrance'));
} else {
  visible = true;
  syncPlayback();
}
