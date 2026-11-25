const CONFIG = {
  smoothScroll: true,
  smoothLerp: .1,
  wheelSettleMs: 1100,
  wheelStep: 50,
  wheelPixelMultiples: [40, 50, 53],
  settleDistance: .75,
  lineWheelPixels: 16,
  resizeDelay: 120,
  parallaxMaxShift: .08,
  parallaxMinWidth: 768,
  parallaxLerp: .12,
  touchParallaxRatio: .45,
  timelineStart: .88,
  revealInsetPercent: 12,
  hero: { scaleTo: 1.035, overlayTo: .26, captionLift: 28, drift: .12 },
  header: { solidAfter: 80, hideAfter: 120, directionSlop: 4 },
  project: { desktopInset: 8, mobileInset: 3, desktopTop: 5, mobileTop: 2, shade: .22, scale: .02 },
  projectImageLead: '1600px 0px',
  rowTolerance: 4,
  infinite: { batch: 12, rootMargin: '0px 0px 800px 0px', maxWait: 650, placeholders: 3 },
  scrollToTopDuration: 1200,
  selectors: {
    reveal: 'main .reveal, main .project-tile, main .editorial-track > *, main .timeline > li, main .project-text :is(p, .action), main .portfolio-overview-copy > *, main .manifesto > div > *, main .section-head > .action',
    lines: 'main h2, main h3',
    mask: 'main .image-window, main .detail-photo,.about-visual > div, main .insight-card > div:first-child:has(> img), main .practice-card > div:first-child:has(> img)',
    wrapImage: 'main .project-frame > img, main .photo-directory > img, main .project-photos > figure > img, main .insight-card > img, main .practice-card > img, main .team-track > article > img',
    parallax: '.project-frame--quiet:not(:first-child) > .motion-scene-image, .photo-directory > .motion-scene-image',
    groups: '.project-gallery:not(.project-loading), .product-grid, .editorial-track, .insight-grid, .practice-grid',
    footer: '.footer:not(.home-footer) > *, .home-footer-grid > *',
  },
};

const page = document.body;
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const hero = page.querySelector('.portfolio-entrance:not([data-no-motion], [data-no-motion] *)');
const header = page.querySelector('.masthead');
const sequence = page.querySelector('.project-sequence');
const touchLayout = matchMedia('(hover: none)');
const finePointer = matchMedia('(any-pointer: fine)');
const menus = [...page.querySelectorAll('.editorial-drawer, .mobile-nav')];
const stacks = [...page.querySelectorAll('.project-stack')].map(node => ({
  node,
  frames: [...node.querySelectorAll('.project-frame')],
}));
const find = selector => [...page.querySelectorAll(selector)].filter(node => !node.closest('[data-no-motion]'));
const eligible = !reduced.matches && 'IntersectionObserver' in window;
const css = name => getComputedStyle(root).getPropertyValue(name).trim();
const ms = name => parseFloat(css(name));
markTargets();
loadProjectFrames();
const closingImage = page.querySelector('[data-motion-closing-image]');
const timelines = find('.timeline');
const layers = find('[data-parallax]').map(node => ({ node, offset: 0 }));
const targets = find('[data-reveal], [data-img-reveal]');
const headings = new Map();
const counters = new Map();
const pendingCounts = new Map();
const heroTitle = hero?.querySelector('h1');
let previousScroll = scrollY;
let frameRequest = 0;
let resizeTimer;
let revealObserver;
let anchor;
let wheelTarget;
let wheelStarted;
let lastHeroProgress;

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const ease = value => value < .5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;
const smoothstep = value => value * value * (3 - 2 * value);

function markTargets() {
  for (const item of find(CONFIG.selectors.reveal)) if (!item.hasAttribute('data-reveal')) item.dataset.reveal = '';
  for (const heading of find(CONFIG.selectors.lines)) {
    if (!heading.children.length && !heading.hasAttribute('data-reveal')) heading.dataset.reveal = 'lines';
  }
  for (const grid of find(CONFIG.selectors.groups)) grid.dataset.staggerGroup = '';
  for (const item of find(CONFIG.selectors.mask)) item.dataset.imgReveal = '';
  for (const image of find(CONFIG.selectors.wrapImage)) {
    if (image.parentElement.hasAttribute('data-img-reveal')) continue;
    const parent = image.parentElement;
    const wrapper = document.createElement('div');
    wrapper.dataset.imgReveal = '';
    wrapper.className = parent.matches('.project-frame, .photo-directory') ? 'motion-scene-image' : 'motion-detail-mask';
    if (parent.matches('.photo-directory')) {
      wrapper.dataset.motionClosingImage = '';
      if (parent.hasAttribute('data-parallax')) {
        wrapper.dataset.parallax = parent.dataset.parallax;
        delete parent.dataset.parallax;
      }
    }
    image.before(wrapper);
    wrapper.append(image);
  }
  for (const layer of find(CONFIG.selectors.parallax)) if (!layer.hasAttribute('data-parallax')) layer.dataset.parallax = '';
  for (const item of find(CONFIG.selectors.footer)) {
    item.dataset.reveal = '';
    item.classList.add('motion-footer-item');
    item.style.setProperty('--motion-item', [...item.parentElement.children].indexOf(item));
  }
  for (const counter of find('[data-count]')) if (!counter.closest('.timeline strong')) counter.dataset.reveal = '';
}

function loadProjectFrames() {
  const frames = stacks.flatMap(stack => stack.frames).filter(frame => frame.querySelector('img'));
  if (!frames.length) return;

  async function showFrame(frame) {
    const image = frame.querySelector('img');
    image.loading = 'eager';
    try {
      await image.decode();
    } catch {
      try {
        if (!image.hasAttribute('srcset')) throw new Error('No alternate project source');
        image.removeAttribute('srcset');
        await image.decode();
      } catch {
        if (frame.dataset.projectPreview) image.src = frame.dataset.projectPreview;
        await image.decode().catch(() => {});
      }
    } finally {
      frame.classList.remove('project-image-pending');
      schedule();
    }
  }

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const {target, isIntersecting} of entries) {
      if (!isIntersecting) continue;
      observer.unobserve(target);
      showFrame(target);
    }
  }, { rootMargin: CONFIG.projectImageLead }) : null;
  for (const frame of frames) {
    frame.classList.add('project-image-pending');
    if (observer) observer.observe(frame);
    else showFrame(frame);
  }
}

for (const heading of [...find('[data-reveal="lines"]'), ...find('.portfolio-title')]) {
  headings.set(heading, {
    source: [...heading.childNodes],
    label: heading.getAttribute('aria-label') || heading.textContent.trim(),
    explicit: [...heading.querySelectorAll(':scope > [data-line]')],
  });
}
for (const item of find('[data-count]')) {
  const value = Number(item.dataset.count);
  if (!Number.isFinite(value) || item.closest('.timeline strong') || item.children.length) continue;
  const original = item.textContent;
  const visual = document.createElement('span');
  visual.className = 'motion-count-value';
  visual.setAttribute('aria-hidden', 'true');
  visual.textContent = original;
  item.setAttribute('aria-label', original);
  item.replaceChildren(visual);
  counters.set(item, {visual, original, value});
}

function wrapLines(heading, lines, label) {
  heading.setAttribute('aria-label', label);
  heading.replaceChildren(...lines.flatMap((line, index) => {
    const wrapper = document.createElement('span');
    const text = document.createElement('span');
    wrapper.className = 'motion-line';
    wrapper.style.setProperty('--motion-line', index);
    wrapper.setAttribute('aria-hidden', 'true');
    text.textContent = line;
    wrapper.append(text);
    return index ? [' ', wrapper] : [wrapper];
  }));
}

function splitHeadings() {
  for (const [heading, entry] of headings) {
    if (!eligible && !root.classList.contains('js')) continue;
    if (reduced.matches) {
      heading.replaceChildren(...entry.source);
      continue;
    }
    if (heading === heroTitle || entry.explicit.length) {
      if (heading.querySelector('.motion-line')) continue;
      const spans = entry.explicit.length ? entry.explicit : entry.source.filter(node => node.nodeType === 1);
      wrapLines(heading, spans.map(part => part.textContent.trim()), entry.label);
      continue;
    }
    if (heading.offsetWidth === entry.width) continue;
    entry.width = heading.offsetWidth;
    heading.replaceChildren(...entry.source);
    const text = heading.firstChild;
    if (heading.childNodes.length !== 1 || text?.nodeType !== Node.TEXT_NODE || !entry.width) continue;
    const range = new Range();
    const lines = [];
    let lastTop;
    for (const word of text.data.matchAll(/\S+/g)) {
      range.setStart(text, word.index);
      range.setEnd(text, word.index + word[0].length);
      const top = range.getBoundingClientRect().top;
      if (top !== lastTop) lines.push(word[0]);
      else lines[lines.length - 1] += ' ' + word[0];
      lastTop = top;
    }
    if (lines.length) wrapLines(heading, lines, entry.label);
  }
}

function watchReveals() {
  revealObserver?.disconnect();
  if (!('IntersectionObserver' in window) || reduced.matches) return;
  const configuredInset = parseFloat(css('--reveal-trigger'));
  const insetPercent = Number.isFinite(configuredInset) ? configuredInset : CONFIG.revealInsetPercent;
  const bottomMargin = -Math.round(innerHeight * insetPercent / 100);
  const masksByFrame = new Map();
  revealObserver = new IntersectionObserver(entries => {
    const rows = new Map();
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = masksByFrame.get(entry.target) ?? entry.target;
      const group = element.parentElement.closest('[data-stagger-group], [data-reveal-group]');
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
      const target = masksByFrame.get(entry.target) ?? entry.target;
      const card = target.closest('[data-stagger-group] > *, [data-reveal-group] > *');
      if (rows.has(card)) target.style.setProperty('--motion-item', rows.get(card));
      target.classList.add('motion-seen');
      if (target.hasAttribute('data-img-reveal')) {
        const start = event => {
          if (event.target !== target || event.propertyName !== 'clip-path') return;
          target.classList.add('motion-mask-active');
          target.removeEventListener('transitionrun', start);
        };
        const settled = event => {
          if (event.target !== target || event.propertyName !== 'clip-path') return;
          target.classList.remove('motion-mask-active');
          target.removeEventListener('transitionend', settled);
          target.removeEventListener('transitioncancel', settled);
        };
        target.addEventListener('transitionrun', start);
        target.addEventListener('transitionend', settled);
        target.addEventListener('transitioncancel', settled);
        const image = target.querySelector('img');
        image?.addEventListener('transitionend', event => {
          if (event.propertyName === 'scale') target.classList.add('motion-settled');
        }, {once: true});
      }
      if (counters.has(target)) {
        pendingCounts.set(target, { ...counters.get(target), duration: ms('--timeline-count') });
        schedule();
      }
      revealObserver.unobserve(entry.target);
    }
  }, { rootMargin: `0px 0px ${bottomMargin}px 0px` });
  for (const target of targets) {
    if (target.classList.contains('motion-seen')) continue;
    if (target.matches('.project-frame > .motion-scene-image')) {
      masksByFrame.set(target.parentElement, target);
      revealObserver.observe(target.parentElement);
    } else revealObserver.observe(target);
  }
}

function schedule() {
  if (!frameRequest) frameRequest = requestAnimationFrame(paint);
}

function paint(timestamp) {
  frameRequest = 0;
  const y = scrollY;
  const viewport = innerHeight;
  const heroHeight = hero?.offsetHeight;
  const active = !reduced.matches;
  const compact = touchLayout.matches || innerWidth < CONFIG.parallaxMinWidth;
  const canParallax = active;
  const portfolio = active && sequence?.getBoundingClientRect();
  const geometry = portfolio?.top < viewport && portfolio?.bottom > 0
    ? stacks.flatMap(({ node, frames }) => {
      const rect = node.getBoundingClientRect();
      return rect.top < viewport && rect.bottom > 0
        ? [{ frames, rects: frames.map(frame => frame.getBoundingClientRect()) }] : [];
    }) : [];
  const rectangles = canParallax ? layers.map(layer => layer.node.getBoundingClientRect()) : [];
  const timelineRects = active ? timelines.map(node => node.getBoundingClientRect()) : [];
  const closingRect = active && closingImage?.getBoundingClientRect();
  const coverVisible = closingRect && closingRect.top < viewport && closingRect.bottom > 0;
  const coverStart = coverVisible ? parseFloat(css('--img-start')) : 1;
  let unsettled = false;
  const compactHeader = Boolean(hero && header.classList.contains('has-editorial-menu') && y > heroHeight * .28);
  header.classList.toggle('header-compact', compactHeader);

  if (hero) {
    header.classList.toggle('over-entrance', y < Math.max(CONFIG.header.solidAfter, heroHeight - 75));
    const progress = clamp(y / heroHeight);
    if (active && heroHeight && progress !== lastHeroProgress) {
      lastHeroProgress = progress;
      const caption = smoothstep(clamp((progress - .05) / .49));
      const strength = compact ? .45 : 1;
      hero.style.setProperty('--motion-hero-scale', 1 + (CONFIG.hero.scaleTo - 1) * progress * strength);
      hero.style.setProperty('--motion-hero-y', `${progress * heroHeight * CONFIG.hero.drift * strength}px`);
      hero.style.setProperty('--motion-hero-shade', CONFIG.hero.overlayTo * progress);
      hero.style.setProperty('--motion-caption-alpha', 1 - caption);
      hero.style.setProperty('--motion-caption-y', -caption * CONFIG.hero.captionLift + 'px');
    }
  }
  const direction = y - previousScroll;
  if (compactHeader || !active || header.matches('[data-no-motion], [data-no-motion] *') || y <= CONFIG.header.hideAfter || header.contains(document.activeElement) || menus.some(menu => menu.open)) {
    header.classList.remove('header-away');
  } else if (Math.abs(direction) >= CONFIG.header.directionSlop) {
    header.classList.toggle('header-away', direction > 0);
  }
  if (Math.abs(direction) >= CONFIG.header.directionSlop) previousScroll = y;

  for (const { frames, rects } of geometry) {
    for (const [j, rect] of rects.entries()) {
      const element = frames[j];
      const next = frames[j + 1]?.classList.contains('project-image-pending') ? undefined : rects[j + 1];
      const shown = Math.max(0, Math.min(rect.bottom, viewport) - Math.max(rect.top, 0));
      const handoff = next ? clamp(1 - next.top / viewport) : 0;
      const entry = clamp(1 - rect.top / viewport);
      const inset = compact ? CONFIG.project.mobileInset : CONFIG.project.desktopInset;
      const coverage = shown / Math.min(rect.height, viewport);
      const captionIn = smoothstep(clamp((coverage - .52) / .34));
      const captionOut = smoothstep(clamp((handoff - .12) / .40));
      const caption = captionIn * (1 - captionOut);
      element.style.setProperty('--project-caption-alpha', caption.toFixed(3));
      element.style.setProperty('--project-caption-y', `${(12 * (1 - caption)).toFixed(2)}px`);
      element.style.setProperty('--project-light', (1 - CONFIG.project.shade * handoff).toFixed(3));
      element.style.setProperty('--project-scale', (1 + CONFIG.project.scale * handoff).toFixed(3));
      const remaining = 1 - smoothstep(entry);
      const topInset = compact ? CONFIG.project.mobileTop : CONFIG.project.desktopTop;
      element.style.setProperty('--project-inset', (inset * remaining).toFixed(2) + '%');
      element.style.setProperty('--project-inset-top', (topInset * remaining).toFixed(2) + '%');
    }
  }
  for (const [i, layer] of layers.entries()) {
    const rect = rectangles[i];
    const visible = Boolean(rect && rect.bottom > 0 && rect.top < viewport);
    layer.node.classList.toggle('parallax-active', canParallax);
    if (!visible) continue;
    const progress = clamp((viewport - rect.top) / (viewport + rect.height));
    const strength = layer.node.dataset.parallax === '' ? CONFIG.parallaxMaxShift
      : clamp(Number(layer.node.dataset.parallax) || 0, 0, CONFIG.parallaxMaxShift);
    const target = (progress - .5) * 2 * rect.height * strength * (compact ? CONFIG.touchParallaxRatio : 1);
    const difference = target - layer.offset;
    layer.offset = Math.abs(difference) < CONFIG.settleDistance ? target : layer.offset + difference * CONFIG.parallaxLerp;
    layer.node.style.setProperty('--motion-parallax-y', layer.offset + 'px');
    unsettled ||= layer.offset !== target;
  }
  for (const [index, rect] of timelineRects.entries()) {
    timelines[index].style.setProperty('--timeline-progress', clamp((viewport * CONFIG.timelineStart - rect.top) / rect.height));
  }
  if (coverVisible) {
    const progress = clamp((viewport - closingRect.top) / (viewport + closingRect.height));
    closingImage.style.setProperty('--motion-scene-scale', coverStart - (coverStart - 1) * progress);
  }
  for (const [node, counter] of pendingCounts) {
    counter.start ??= timestamp;
    const progress = clamp((timestamp - counter.start) / counter.duration);
    if (progress === 1 || !active) {
      counter.visual.textContent = counter.original;
      pendingCounts.delete(node);
    } else {
      counter.visual.textContent = Math.round(counter.value * ease(progress)).toLocaleString('az');
      unsettled = true;
    }
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
    if (Math.abs(remaining) < CONFIG.settleDistance || timestamp - wheelStarted > CONFIG.wheelSettleMs) {
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
  resizeTimer = setTimeout(() => {
    lastHeroProgress = undefined;
    splitHeadings();
    watchReveals();
    schedule();
  }, CONFIG.resizeDelay);
}

function syncMotion() {
  const animate = !reduced.matches && 'IntersectionObserver' in window;
  root.classList.toggle('js', animate);
  lastHeroProgress = undefined;
  sequence?.classList.toggle('scroll-projects', animate);
  for (const timeline of timelines) timeline.classList.toggle('motion-timeline', animate);
  for (const heading of headings.values()) heading.width = undefined;
  splitHeadings();
  if (reduced.matches) stopScroll();
  watchReveals();
  schedule();
}

page.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
  let id;
  try { id = decodeURIComponent(link.hash.slice(1)); } catch { return; }
  const element = document.getElementById(id);
  if (!element) return;
  if (link.matches('.skip')) {
    if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '-1');
    element.focus({ preventScroll: true });
    return;
  }
  if (reduced.matches || link.closest('[data-no-motion]')) return;
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
  if (hero) return;
  window.addEventListener('wheel', stopScrollIfNative, { passive: !CONFIG.smoothScroll || reduced.matches || !finePointer.matches });
}
bindWheel();
function stopScrollIfNative(event) {
  anchor = undefined;
  if (!CONFIG.smoothScroll || reduced.matches || !finePointer.matches) return;
  const magnitude = Math.abs(event.deltaY);
  const discrete = event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL ||
    (magnitude >= CONFIG.wheelStep && CONFIG.wheelPixelMultiples.some(step => magnitude % step === 0));
  if (!discrete || !event.cancelable || event.ctrlKey || event.shiftKey ||
      Math.abs(event.deltaX) > Math.abs(event.deltaY) || document.querySelector('dialog[open], .mobile-nav[open]') ||
      !getSelection()?.isCollapsed || event.target.closest('input, textarea, select, [contenteditable], [data-no-motion]')) {
    wheelTarget = undefined;
    return;
  }
  for (let parent = event.target; parent instanceof HTMLElement && parent !== document.body; parent = parent.parentElement) {
    if (parent.scrollHeight > parent.clientHeight && /auto|scroll/.test(getComputedStyle(parent).overflowY)) return;
  }
  const units = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? CONFIG.lineWheelPixels
    : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? innerHeight : 1;
  const start = wheelTarget ?? scrollY;
  const target = clamp(start + event.deltaY * units, 0, Math.max(0, root.scrollHeight - innerHeight));
  if (target === start && wheelTarget === undefined) return;
  event.preventDefault();
  wheelStarted = performance.now();
  wheelTarget = target;
  schedule();
}
window.addEventListener('keydown', stopScroll);
window.addEventListener('touchstart', stopScroll, { passive: true });
window.addEventListener('pointerdown', stopScroll, { passive: true });
window.addEventListener('resize', viewportChanged, { passive: true });
window.addEventListener('scroll', schedule, { passive: true });
reduced.addEventListener('change', () => { bindWheel(); syncMotion(); });
finePointer.addEventListener('change', () => { stopScroll(); bindWheel(); });
syncMotion();
document.fonts?.ready.then(() => {
  for (const data of headings.values()) data.width = undefined;
  splitHeadings();
  schedule();
});

const solutions = page.querySelector('.solution-browser:not([data-no-motion] *)');
if (solutions) {
  const source = solutions.querySelector('.solution-panel');
  const stack = document.createElement('div');
  const options = [];
  const entries = [];
  const previews = [];
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  let active = 0;
  stack.className = 'motion-solution-stack';
  source.before(stack);

  function choose(index) {
    if (active === index) return;
    const link = entries[index];
    const panel = previews[index];
    const image = panel.querySelector('img');
    if (!image.hasAttribute('src')) image.src = link.dataset.image;
    previews[active].inert = true;
    options[active].setAttribute('aria-pressed', 'false');
    panel.inert = false;
    options[index].setAttribute('aria-pressed', 'true');
    active = index;
  }

  for (const [index, link] of [...solutions.querySelectorAll('.solution-list a')].entries()) {
    const option = document.createElement('button');
    const panel = index ? source.cloneNode(true) : source;
    if (index) {
      panel.id = source.id + '-' + index;
      panel.querySelector('p').textContent = link.dataset.description;
      const image = panel.querySelector('img');
      image.removeAttribute('src');
      image.alt = link.dataset.alt;
      const details = panel.querySelector('a');
      details.href = link.href;
      details.setAttribute('aria-label', `${link.textContent} — ətraflı bax`);
    }
    panel.inert = index !== 0;
    stack.append(panel);
    previews.push(panel);
    entries.push(link);
    options.push(option);
    option.type = 'button';
    option.textContent = link.textContent;
    option.setAttribute('aria-controls', panel.id);
    option.setAttribute('aria-pressed', String(index === 0));
    option.addEventListener('click', () => choose(index));
    option.addEventListener('pointerenter', event => { if (hover.matches && event.pointerType === 'mouse') choose(index); });
    option.addEventListener('focus', () => choose(index));
    option.addEventListener('keydown', event => {
      const step = ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : ['ArrowUp', 'ArrowLeft'].includes(event.key) ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      options[(index + step + options.length) % options.length].focus();
    });
    link.replaceWith(option);
  }
}

for (const type of ['pageswap', 'pagereveal']) {
  window.addEventListener(type, ({ viewTransition }) => {
    if (!viewTransition) return;
    // A navigation can finish before the browser is able to animate it.
    viewTransition.ready.catch(() => {});
    if (type === 'pageswap' && document.querySelector('dialog[open]')) viewTransition.skipTransition();
  });
}
if (!('onpagereveal' in window) && !reduced.matches) root.classList.add('motion-page-fallback');

for (const label of find('.inquiry-form label')) {
  const field = label.querySelector('input, select, textarea');
  const text = label.firstChild;
  if (!field || text?.nodeType !== Node.TEXT_NODE) continue;
  const caption = document.createElement('span');
  caption.className = 'motion-field-label';
  text.replaceWith(caption);
  caption.append(text);
  const sync = () => label.toggleAttribute('data-filled', field.value !== '');
  sync();
  field.addEventListener('input', sync);
}

const gallery = page.querySelector('.project-gallery, .product-grid');
if (gallery) {
  const productList = gallery.matches('.product-grid');
  const noun = productList ? 'məhsul' : 'layihə';
  const projects = [...gallery.querySelectorAll('.project-tile, .product-card')];
  if (productList) {
    const area = page.querySelector('.motion-product-tools');
    const select = area.querySelector('select');
    const categories = projects.map(card => card.querySelector('p').textContent.trim());
    for (const value of new Set(categories)) select.add(new Option(value, value));
    select.addEventListener('change', () => filter(projects.filter((_, index) => !select.value || categories[index] === select.value)));
    area.hidden = false;
  }
  let controls = page.querySelector('.project-batch-controls');
  if (!controls) {
    controls = document.createElement('div');
    controls.className = 'wrap project-batch-controls';
    controls.innerHTML = '<button type="button">Daha çox məhsul</button><p role="status" aria-live="polite"></p>';
    gallery.after(controls);
  }
  const more = controls.querySelector('button');
  const status = controls.querySelector('[role="status"]');
  const skeletons = page.querySelector('.project-loading') || document.createElement('div');
  const sentinel = page.querySelector('.project-sentinel') || document.createElement('div');
  if (!skeletons.isConnected) {
    skeletons.className = 'wrap product-grid project-loading';
    sentinel.className = 'project-sentinel';
    skeletons.setAttribute('aria-hidden', 'true');
    sentinel.setAttribute('aria-hidden', 'true');
    controls.before(skeletons);
    controls.after(sentinel);
  }
  let listed = [];
  let count = 0;
  let generation = 0;
  let busy = false;
  let observer;
  let exit;

  function updateControls() {
    more.disabled = busy || count >= listed.length;
    if (!listed.length) status.textContent = '';
  }

  function reset(matches, filtered = false) {
    generation++;
    busy = false;
    listed = matches;
    count = Math.min(CONFIG.infinite.batch, matches.length);
    const shown = new Set(matches.slice(0, count));
    projects.forEach(project => {
      project.hidden = !shown.has(project);
      project.classList.remove('motion-filter-in');
    });
    if (filtered && !reduced.matches) {
      matches.slice(0, count).forEach((project, index) => {
        project.classList.add('motion-filter-in');
        project.style.setProperty('--motion-filter-item', index % (productList ? 2 : 3));
      });
    }
    splitHeadings();
    skeletons.hidden = true;
    skeletons.replaceChildren();
    status.textContent = count && count === listed.length ? 'Siyahının sonu' : '';
    observer?.unobserve(sentinel);
    if (count < listed.length) observer?.observe(sentinel);
    updateControls();
  }

  function filter(matches) {
    const opacity = exit ? getComputedStyle(gallery).opacity : 1;
    exit?.cancel();
    if (reduced.matches) {
      reset(matches);
      return;
    }
    observer?.unobserve(sentinel);
    const run = gallery.animate([{opacity}, {opacity: 0}], {
      duration: ms('--filter-out'), easing: css('--ease-hover'), fill: 'forwards',
    });
    exit = run;
    run.finished.then(() => {
      if (exit !== run) return;
      reset(matches, true);
      run.cancel();
      exit = undefined;
    }, () => {});
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
    splitHeadings();
    count += next.length;
    busy = false;
    skeletons.hidden = true;
    skeletons.replaceChildren();
    status.textContent = next.length + ' ' + noun + ' əlavə olundu.' + (count === listed.length ? ' Siyahının sonu.' : '');
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
  gallery.dataset.paged = 'true';
  gallery.addEventListener('project-filter', event => filter(event.detail));
  reset(gallery.projectMatches ?? projects.filter(project => !project.hidden));
}

if (new URLSearchParams(location.search).get('tune') === '1') {
  import('./motion-tuner.js?v=3').then(({ mountTuner }) => mountTuner(CONFIG, () => {
    bindWheel();
    if (!CONFIG.smoothScroll) wheelTarget = undefined;
    watchReveals();
    lastHeroProgress = undefined;
    schedule();
  }));
}
