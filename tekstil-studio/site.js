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
  new IntersectionObserver(([entry]) => {
    masthead.classList.toggle('over-entrance', entry.isIntersecting);
  }, { rootMargin: '-76px 0px 0px' }).observe(entrance);
}

const film = document.querySelector('.entrance-film');
const player = document.querySelector('.entrance-player');
if (film && typeof player?.showModal === 'function') {
  const frame = player.querySelector('.player-frame');
  film.setAttribute('aria-haspopup', 'dialog');
  film.addEventListener('click', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault();
    const iframe = document.createElement('iframe');
    iframe.src = new URL('embed/', film.href).href;
    iframe.title = 'Bakı, Azərbaycan — @suleiman.mov';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.replaceChildren(iframe);
    player.showModal();
  });
  player.addEventListener('close', () => frame.replaceChildren());
}

if ('IntersectionObserver' in window && matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('seen');
      observer.unobserve(entry.target);
    }
  }, { threshold: .08 });

  document.body.classList.add('motion');
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}

const tools = document.querySelector('.project-tools');
if (tools) {
  const projects = [...document.querySelectorAll('.project-index [data-category]')];
  const { category, query } = tools.elements;
  const count = tools.querySelector('output');

  function filterProjects() {
    const term = query.value.trim().toLocaleLowerCase('az');
    let visible = 0;
    for (const project of projects) {
      const matchesCategory = !category.value || project.dataset.category === category.value;
      const matchesTerm = project.dataset.search.toLocaleLowerCase('az').includes(term);
      project.hidden = !(matchesCategory && matchesTerm);
      if (!project.hidden) visible++;
    }
    count.value = visible ? visible + ' layihə' : 'Layihə tapılmadı';
  }

  tools.hidden = false;
  tools.addEventListener('submit', event => event.preventDefault());
  tools.addEventListener('input', filterProjects);
  filterProjects();
}
