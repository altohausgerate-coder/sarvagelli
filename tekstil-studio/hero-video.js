const video = document.querySelector('.portfolio-hero-video');
const hero = video.closest('.portfolio-entrance');
const toggle = document.querySelector('.portfolio-video-toggle');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const wideScreen = matchMedia('(min-width: 1440px)');
const picture = video.previousElementSibling;
const src = video.dataset.src;
const src4k = video.getAttribute('data-src-4k');
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
    video.src = src4k && wideScreen.matches && !navigator.connection?.saveData ? src4k : src;
  }
  toggle.hidden = false;
  video.play().catch(updateButton);
}

video.addEventListener('playing', () => {
  video.classList.add('video-visible');
  hero.classList.add('hero-film-ready');
  picture.setAttribute('aria-hidden', 'true');
  updateButton();
});
video.addEventListener('pause', updateButton);
video.addEventListener('error', () => {
  toggle.hidden = true;
  video.classList.remove('video-visible');
  hero.classList.remove('hero-film-ready');
  picture.removeAttribute('aria-hidden');
  if (src4k && video.getAttribute('src') === src4k) {
    video.src = src;
    video.load();
    syncPlayback();
  }
});
toggle.addEventListener('click', () => {
  pausedByVisitor = !video.paused;
  syncPlayback();
});
reduced.addEventListener('change', () => {
  if (reduced.matches) {
    video.classList.remove('video-visible');
    hero.classList.remove('hero-film-ready');
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
  observer.observe(hero);
} else {
  visible = true;
  syncPlayback();
}
