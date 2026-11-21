const navigation = document.querySelector('.mobile-nav');
if (navigation) {
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !navigation.open) return;
    navigation.open = false;
    navigation.querySelector('summary').focus();
  });
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
