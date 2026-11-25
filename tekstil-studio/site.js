const navigation = document.querySelector('.mobile-nav');
if (navigation) {
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !navigation.open) return;
    navigation.open = false;
    navigation.querySelector('summary').focus();
  });
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
  const gallery = document.querySelector('.project-gallery');
  const projects = [...gallery.querySelectorAll('[data-category]')];
  const { category, location, query } = tools.elements;
  const count = tools.querySelector('output');
  const pageUrl = new URL(window.location.href);
  for (const field of [category, location, query].filter(Boolean)) {
    const saved = pageUrl.searchParams.get(field.name);
    if (saved !== null) field.value = saved;
  }

  function filterProjects() {
    const term = query.value.trim().toLocaleLowerCase('az');
    const matches = [];
    for (const project of projects) {
      const matchesCategory = !category.value || project.dataset.category === category.value;
      const matchesLocation = !location?.value || project.dataset.location === location.value;
      const matchesTerm = project.dataset.search.toLocaleLowerCase('az').includes(term);
      const visible = matchesCategory && matchesLocation && matchesTerm;
      if (!visible) continue;
      matches.push(project);
    }
    count.value = matches.length ? matches.length + ' layihə' : 'Layihə tapılmadı';
    const matched = new Set(matches);
    projects.forEach(project => { project.hidden = !matched.has(project); });
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
