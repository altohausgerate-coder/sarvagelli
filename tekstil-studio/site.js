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
if (masthead && document.querySelector('.project-sequence') && 'ResizeObserver' in window) {
  new ResizeObserver(() => {
    document.documentElement.style.setProperty('--masthead-height', `${masthead.offsetHeight}px`);
  }).observe(masthead);
}
if (entrance && masthead && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    masthead.classList.toggle('over-entrance', entry.isIntersecting);
  }, { rootMargin: '-76px 0px 0px' }).observe(entrance);
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
