const CONFIG = {
  smoothScroll: false,
  smoothLerp: .1,
  settleDistance: .75,
  lineWheelPixels: 16,
  resizeDelay: 120,
  parallaxMaxShift: .08,
  parallaxMinWidth: 768,
  parallaxLerp: .12,
  hero: { scaleTo: 1.08, overlayTo: .45, captionFadeEnd: .3, captionLift: 20 },
  header: { solidAfter: 80, hideAfter: 120, directionSlop: 4 },
  project: { desktopInset: 9, mobileInset: 4.5, entryHold: .17, captionVisible: .58, captionHandoff: .47, shade: .56, scale: .04 },
  rowTolerance: 4,
  infinite: { batch: 12, rootMargin: '0px 0px 800px 0px', maxWait: 650, placeholders: 3 },
  scrollToTopDuration: 1200,
};

const page = document.querySelector('[data-scroll-motion]');
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const hero = page.querySelector('.portfolio-entrance');
const header = page.querySelector('.masthead');
const sequence = page.querySelector('.project-sequence');
const stacks = [...page.querySelectorAll('.project-stack')].map(stack => [...stack.querySelectorAll('.project-frame')]);
const layers = [...page.querySelectorAll('[data-parallax]')].map(node => ({ node, offset: 0 }));
const targets = [...page.querySelectorAll('[data-reveal], [data-img-reveal]')];
let previousScroll = scrollY;
let frameRequest = 0;
let resizeTimer;
let revealObserver;
let anchor;
let wheelTarget;

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const ease = value => value < .5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;

for (const heading of page.querySelectorAll('[data-reveal="lines"]')) {
  const lines = [...heading.querySelectorAll('[data-line]')].map(line => line.textContent.trim());
  if (!lines.length) lines.push(heading.textContent.trim());
  heading.setAttribute('aria-label', lines.join(' '));
  heading.replaceChildren(...lines.map((line, index) => {
    const wrapper = document.createElement('span');
    const text = document.createElement('span');
    wrapper.className = 'motion-line';
    wrapper.style.setProperty('--motion-line', index);
    wrapper.setAttribute('aria-hidden', 'true');
    text.textContent = line;
    wrapper.append(text);
    return wrapper;
  }));
}

function watchReveals() {
  revealObserver?.disconnect();
  if (!('IntersectionObserver' in window) || reduced.matches) return;
  const inset = parseFloat(getComputedStyle(root).getPropertyValue('--motion-reveal-trigger')) / 100;
  revealObserver = new IntersectionObserver(entries => {
    const rows = new Map();
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = entry.target;
      const group = element.parentElement.closest('[data-reveal-group]');
      if (group && !rows.has(group)) {
        let priorTop = -Infinity;
        let position = 0;
        for (const child of group.children) {
          if (child.hidden) continue;
          const top = child.offsetTop;
          position = Math.abs(top - priorTop) <= CONFIG.rowTolerance ? position + 1 : 0;
          rows.set(child, position);
          priorTop = top;
        }
        rows.set(group, true);
      }
    }
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const card = entry.target.closest('[data-reveal-group] > *');
      entry.target.style.setProperty('--motion-item', rows.get(card) ?? 0);
      entry.target.classList.add('motion-seen');
      revealObserver.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -' + Math.round(innerHeight * inset) + 'px 0px' });
  for (const target of targets) if (!target.classList.contains('motion-seen')) revealObserver.observe(target);
}

function schedule() {
  if (!frameRequest) frameRequest = requestAnimationFrame(paint);
}

function paint(timestamp) {
  frameRequest = 0;
  const y = scrollY;
  const viewport = innerHeight;
  const active = !reduced.matches;
  const canParallax = active && innerWidth >= CONFIG.parallaxMinWidth;
  const heroHeight = hero?.offsetHeight;
  const geometry = active ? stacks.map(stack => stack.map(frame => frame.getBoundingClientRect())) : [];
  const rectangles = canParallax ? layers.map(layer => layer.node.getBoundingClientRect()) : [];
  let unsettled = false;

  if (hero) {
    header.classList.toggle('over-entrance', y < CONFIG.header.solidAfter);
    if (active && heroHeight) {
      const progress = clamp(y / heroHeight);
      const caption = clamp(progress / CONFIG.hero.captionFadeEnd);
      hero.style.setProperty('--motion-hero-scale', 1 + (CONFIG.hero.scaleTo - 1) * progress);
      hero.style.setProperty('--motion-hero-shade', CONFIG.hero.overlayTo * progress);
      hero.style.setProperty('--motion-caption-alpha', 1 - caption);
      hero.style.setProperty('--motion-caption-y', -caption * CONFIG.hero.captionLift + 'px');
    }
  }
  const direction = y - previousScroll;
  if (!active || y <= CONFIG.header.hideAfter || header.contains(document.activeElement) || document.querySelector('dialog[open]')) {
    header.classList.remove('header-away');
  } else if (Math.abs(direction) >= CONFIG.header.directionSlop) {
    header.classList.toggle('header-away', direction > 0);
  }
  if (Math.abs(direction) >= CONFIG.header.directionSlop) previousScroll = y;

  for (const [i, stack] of geometry.entries()) {
    if (stack.at(-1).bottom <= 0 || stack[0].top >= viewport) continue;
    for (const [j, rect] of stack.entries()) {
      const element = stacks[i][j];
      const next = stack[j + 1];
      const shown = Math.max(0, Math.min(rect.bottom, viewport) - Math.max(rect.top, 0));
      const handoff = next ? clamp(1 - next.top / viewport) : 0;
      const entry = clamp(1 - rect.top / viewport);
      const unfold = clamp((entry - CONFIG.project.entryHold) / (1 - CONFIG.project.entryHold));
      const inset = innerWidth >= CONFIG.parallaxMinWidth ? CONFIG.project.desktopInset : CONFIG.project.mobileInset;
      element.classList.toggle('caption-in-view', shown >= Math.min(rect.height, viewport) * CONFIG.project.captionVisible && handoff < CONFIG.project.captionHandoff);
      element.style.setProperty('--project-light', 1 - CONFIG.project.shade * handoff);
      element.style.setProperty('--project-scale', 1 + CONFIG.project.scale * handoff);
      if (j) element.style.setProperty('--project-inset', inset * (1 - unfold * unfold * (3 - 2 * unfold)) + '%');
    }
  }
  for (const [i, layer] of layers.entries()) {
    const rect = rectangles[i];
    const visible = Boolean(rect && rect.bottom > 0 && rect.top < viewport);
    layer.node.classList.toggle('parallax-active', canParallax);
    if (!visible) continue;
    const progress = clamp((viewport - rect.top) / (viewport + rect.height));
    const target = (progress - .5) * 2 * rect.height * CONFIG.parallaxMaxShift;
    const difference = target - layer.offset;
    layer.offset = Math.abs(difference) < CONFIG.settleDistance ? target : layer.offset + difference * CONFIG.parallaxLerp;
    layer.node.style.setProperty('--motion-parallax-y', layer.offset + 'px');
    unsettled ||= layer.offset !== target;
  }

  if (anchor) {
    anchor.started ??= timestamp;
    const progress = clamp((timestamp - anchor.started) / CONFIG.scrollToTopDuration);
    window.scrollTo(0, anchor.from + (anchor.to - anchor.from) * ease(progress));
    if (progress === 1) {
      const destination = anchor.element;
      if (!destination.hasAttribute('tabindex')) destination.setAttribute('tabindex', '-1');
      destination.focus({ preventScroll: true });
      anchor = undefined;
    } else unsettled = true;
  } else if (wheelTarget !== undefined) {
    const remaining = wheelTarget - y;
    if (Math.abs(remaining) < CONFIG.settleDistance) {
      window.scrollTo(0, wheelTarget);
      wheelTarget = undefined;
    } else {
      const movement = Math.max(1, Math.abs(remaining * CONFIG.smoothLerp));
      window.scrollTo(0, y + Math.sign(remaining) * movement);
      unsettled = true;
    }
  }
  if (unsettled) schedule();
}

function stopScroll() {
  anchor = undefined;
  wheelTarget = undefined;
}

function viewportChanged() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { watchReveals(); schedule(); }, CONFIG.resizeDelay);
}

function syncMotion() {
  root.classList.toggle('motion-ready', !reduced.matches && 'IntersectionObserver' in window);
  sequence?.classList.toggle('scroll-projects', !reduced.matches);
  if (reduced.matches) stopScroll();
  watchReveals();
  schedule();
}

page.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || reduced.matches || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
  const element = document.getElementById(link.hash.slice(1));
  if (!element) return;
  event.preventDefault();
  const y = scrollY;
  const position = element.getBoundingClientRect().top + y;
  const to = element.id === 'content' ? 0 : Math.max(0, position - header.offsetHeight);
  history.pushState(history.state, '', link.hash);
  anchor = { from: y, to, element };
  wheelTarget = undefined;
  schedule();
});
function bindWheel() {
  window.removeEventListener('wheel', stopScrollIfNative);
  window.addEventListener('wheel', stopScrollIfNative, { passive: !CONFIG.smoothScroll });
}
bindWheel();
function stopScrollIfNative(event) {
  anchor = undefined;
  if (!CONFIG.smoothScroll || reduced.matches || event.ctrlKey || event.shiftKey ||
      Math.abs(event.deltaX) > Math.abs(event.deltaY) || document.querySelector('dialog[open]') ||
      !getSelection()?.isCollapsed || event.target.closest('input, textarea, select, [contenteditable]')) return;
  for (let parent = event.target; parent instanceof HTMLElement && parent !== document.body; parent = parent.parentElement) {
    if (parent.scrollHeight > parent.clientHeight && /auto|scroll/.test(getComputedStyle(parent).overflowY)) return;
  }
  event.preventDefault();
  const units = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? CONFIG.lineWheelPixels
    : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? innerHeight : 1;
  wheelTarget = clamp((wheelTarget ?? scrollY) + event.deltaY * units, 0, root.scrollHeight - innerHeight);
  schedule();
}
window.addEventListener('keydown', stopScroll);
window.addEventListener('touchstart', stopScroll, { passive: true });
window.addEventListener('pointerdown', stopScroll, { passive: true });
window.addEventListener('resize', viewportChanged, { passive: true });
window.addEventListener('scroll', schedule, { passive: true });
reduced.addEventListener('change', syncMotion);
syncMotion();

const gallery = page.querySelector('.project-gallery');
if (gallery) {
  const projects = [...gallery.querySelectorAll('.project-tile')];
  const controls = page.querySelector('.project-batch-controls');
  const more = controls.querySelector('button');
  const status = controls.querySelector('[role="status"]');
  const skeletons = page.querySelector('.project-loading');
  const sentinel = page.querySelector('.project-sentinel');
  let listed = [];
  let count = 0;
  let generation = 0;
  let busy = false;
  let observer;

  function updateControls() {
    more.hidden = count >= listed.length;
    more.disabled = busy;
    if (!listed.length) status.textContent = '';
  }

  function reset(matches) {
    generation++;
    busy = false;
    listed = matches;
    count = Math.min(CONFIG.infinite.batch, matches.length);
    const shown = new Set(matches.slice(0, count));
    projects.forEach(project => { project.hidden = !shown.has(project); });
    skeletons.hidden = true;
    skeletons.replaceChildren();
    status.textContent = count && count === listed.length ? 'Bütün uyğun layihələr göstərilir.' : '';
    observer?.unobserve(sentinel);
    if (count < listed.length) observer?.observe(sentinel);
    updateControls();
  }

  async function loadBatch(event) {
    if (busy || count >= listed.length) return;
    const initialGeneration = generation;
    const next = listed.slice(count, count + CONFIG.infinite.batch);
    busy = true;
    skeletons.hidden = false;
    skeletons.replaceChildren(...next.slice(0, CONFIG.infinite.placeholders).map(() => {
      const shape = document.createElement('div');
      shape.className = 'project-placeholder';
      return shape;
    }));
    updateControls();
    let timeout;
    await Promise.race([
      Promise.allSettled(next.flatMap(project => [...project.querySelectorAll('img')].map(image => {
        image.loading = 'eager';
        return image.decode();
      }))),
      new Promise(resolve => { timeout = setTimeout(resolve, CONFIG.infinite.maxWait); }),
    ]);
    clearTimeout(timeout);
    if (generation !== initialGeneration) return;
    next.forEach(project => { project.hidden = false; });
    count += next.length;
    busy = false;
    skeletons.hidden = true;
    skeletons.replaceChildren();
    status.textContent = next.length + ' layihə əlavə olundu.' + (count === listed.length ? ' Bütün uyğun layihələr göstərilir.' : '');
    updateControls();
    if (event) next[0].focus();
    observer?.unobserve(sentinel);
    if (count < listed.length) observer?.observe(sentinel);
  }

  if ('IntersectionObserver' in window) observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) loadBatch();
  }, { rootMargin: CONFIG.infinite.rootMargin });
  controls.hidden = false;
  more.addEventListener('click', loadBatch);
  gallery.addEventListener('project-filter', event => reset(event.detail));
  reset(projects.filter(project => !project.hidden));
}

if (new URLSearchParams(location.search).get('tune') === '1') {
  import('./motion-tuner.js?v=1').then(({ mountTuner }) => mountTuner(CONFIG, () => {
    bindWheel();
    if (!CONFIG.smoothScroll) wheelTarget = undefined;
    watchReveals();
    schedule();
  }));
}
