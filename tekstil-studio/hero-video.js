const video = document.querySelector('.portfolio-hero-video');
const hero = video.closest('.portfolio-entrance');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const highResolutionScreen = matchMedia('(min-width: 1440px), (min-width: 1100px) and (min-resolution: 2dppx)');
const portraitScreen = matchMedia('(max-width: 767px) and (orientation: portrait)');
const picture = video.previousElementSibling;
const src = video.dataset.src;
const src4k = video.getAttribute('data-src-4k');
const srcPortrait = video.dataset.srcPortrait;
const failedSources = new Set();
let visible = false;

function showPoster() {
  video.classList.remove('video-visible');
  hero.classList.remove('hero-film-ready');
  picture.removeAttribute('aria-hidden');
}

function syncPlayback() {
  if (!visible || document.hidden || reduced.matches) {
    video.pause();
    return;
  }
  const preferred = portraitScreen.matches ? srcPortrait
    : highResolutionScreen.matches && !navigator.connection?.saveData ? src4k : src;
  const nextSource = [preferred, src].find(source => source && !failedSources.has(source));
  if (!nextSource) return;
  if (video.getAttribute('src') !== nextSource) {
    showPoster();
    video.muted = true;
    video.src = nextSource;
    video.load();
  }
  video.play().catch(() => {});
}

video.addEventListener('playing', () => {
  video.classList.add('video-visible');
  hero.classList.add('hero-film-ready');
  picture.setAttribute('aria-hidden', 'true');
});
video.addEventListener('error', () => {
  failedSources.add(video.getAttribute('src'));
  showPoster();
  syncPlayback();
});
reduced.addEventListener('change', () => {
  if (reduced.matches) showPoster();
  syncPlayback();
});
portraitScreen.addEventListener('change', syncPlayback);
highResolutionScreen.addEventListener('change', syncPlayback);
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
