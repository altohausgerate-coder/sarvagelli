const navigation = document.querySelector('.mobile-nav');
if (navigation) {
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !navigation.open) return;
    navigation.open = false;
    navigation.querySelector('summary').focus();
  });
}

const entrance = document.querySelector('.entrance');
const masthead = document.querySelector('.masthead');
if (entrance && masthead && 'IntersectionObserver' in window) {
  const photoSections = [entrance, ...document.querySelectorAll('.project-stack, .photo-directory')];
  let headerObserver;
  function observeHeader() {
    headerObserver?.disconnect();
    const visible = new Set();
    const band = Math.round(masthead.offsetHeight / 2);
    const below = Math.max(0, window.innerHeight - band - 1);
    headerObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      masthead.classList.toggle('over-entrance', visible.size > 0);
    }, { rootMargin: `-${band}px 0px -${below}px 0px` });
    photoSections.forEach(section => headerObserver.observe(section));
  }
  observeHeader();
  window.addEventListener('resize', observeHeader, { passive: true });
}

if ('IntersectionObserver' in window && matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('seen');
      observer.unobserve(entry.target);
    }
  }, { threshold: .15 });

  document.body.classList.add('motion');
  document.querySelectorAll('.practice-grid, .insight-grid').forEach(grid => {
    [...grid.children].forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `calc(${index % 3} * var(--photo-reveal-stagger))`);
    });
  });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}

const solutions = document.querySelector('.solution-browser');
if (solutions) {
  const panel = solutions.querySelector('.solution-panel');
  const description = panel.querySelector('p');
  const photo = panel.querySelector('img');
  const details = panel.querySelector('a');
  let active;

  for (const link of solutions.querySelectorAll('.solution-list a')) {
    const option = document.createElement('button');
    option.type = 'button';
    option.textContent = link.textContent;
    option.setAttribute('aria-controls', panel.id);
    option.setAttribute('aria-pressed', String(active === undefined));
    if (!active) active = option;
    option.addEventListener('click', () => {
      if (option === active) return;
      active.setAttribute('aria-pressed', 'false');
      option.setAttribute('aria-pressed', 'true');
      active = option;
      description.textContent = link.dataset.description;
      photo.src = link.dataset.image;
      photo.alt = link.dataset.alt;
      details.href = link.href;
      details.setAttribute('aria-label', `${link.textContent} — ətraflı bax`);
      if (matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        panel.animate([{ opacity: .48, transform: 'translateY(7px)' }, { opacity: 1, transform: 'none' }],
          { duration: 320, easing: 'cubic-bezier(.22, 1, .36, 1)' });
      }
    });
    link.replaceWith(option);
  }
}

for (const slider of document.querySelectorAll('[data-editorial-slider]')) {
  const track = slider.querySelector('.editorial-track');
  const controls = slider.querySelector('.editorial-controls');
  const [previous, next] = controls.querySelectorAll('button');
  function updateSliderControls() {
    previous.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
  }
  for (const button of [previous, next]) {
    button.addEventListener('click', () => {
      const card = track.firstElementChild;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const step = card.getBoundingClientRect().width + gap;
      track.scrollBy({
        left: Number(button.dataset.step) * step,
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    });
  }
  controls.hidden = false;
  track.addEventListener('scroll', updateSliderControls, { passive: true });
  window.addEventListener('resize', updateSliderControls, { passive: true });
  updateSliderControls();
}

const tools = document.querySelector('.project-tools');
if (tools) {
  const projects = [...document.querySelectorAll('.project-gallery [data-category]')];
  const { category, location, query } = tools.elements;
  const count = tools.querySelector('output');
  const pageUrl = new URL(window.location.href);
  for (const field of [category, location, query].filter(Boolean)) {
    const saved = pageUrl.searchParams.get(field.name);
    if (saved !== null) field.value = saved;
  }

  function filterProjects() {
    const term = query.value.trim().toLocaleLowerCase('az');
    let visible = 0;
    for (const project of projects) {
      const matchesCategory = !category.value || project.dataset.category === category.value;
      const matchesLocation = !location?.value || project.dataset.location === location.value;
      const matchesTerm = project.dataset.search.toLocaleLowerCase('az').includes(term);
      project.hidden = !(matchesCategory && matchesLocation && matchesTerm);
      if (!project.hidden) {
        project.style.setProperty('--tile-delay', `${(visible % 3) * 65}ms`);
        visible++;
      }
    }
    count.value = visible ? visible + ' layihə' : 'Layihə tapılmadı';
  }

  tools.hidden = false;
  tools.addEventListener('submit', event => event.preventDefault());
  tools.addEventListener('input', () => {
    filterProjects();
    for (const field of [category, location, query].filter(Boolean)) {
      if (field.value.trim()) pageUrl.searchParams.set(field.name, field.value.trim());
      else pageUrl.searchParams.delete(field.name);
    }
    history.replaceState(history.state, '', pageUrl);
  });
  filterProjects();
}

const inquiry = document.querySelector('.inquiry-form');
if (inquiry) {
  inquiry.hidden = false;
  inquiry.addEventListener('submit', event => {
    event.preventDefault();
    const fields = new FormData(inquiry);
    const subject = `Sarvagelli · ${fields.get('topic') || 'Layihə sorğusu'}`;
    const body = `Ad: ${fields.get('name')}\nE-poçt: ${fields.get('email')}\n\n${fields.get('message')}`;
    window.location.href = `mailto:info@sarvagelli.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
