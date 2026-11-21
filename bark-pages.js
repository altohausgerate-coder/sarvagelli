(() => {
  const cards = [...document.querySelectorAll('.project-card')];
  const filters = [...document.querySelectorAll('[data-project-filter]')];
  const dialog = document.querySelector('.project-dialog');
  if (!cards.length || !dialog) return;
  const title = dialog.querySelector('#project-dialog-title');
  const location = dialog.querySelector('.dialog-location');
  const solution = dialog.querySelector('.dialog-solution');
  const image = dialog.querySelector('.dialog-image');
  const close = dialog.querySelector('.dialog-close');
  const search = document.querySelector('#project-search');
  const count = document.querySelector('.studio-project-count');
  const galleryControls = dialog.querySelector('.studio-gallery-controls');
  const photoButtons = [...dialog.querySelectorAll('[data-project-photo]')];
  let activeCategory = 'all';
  let activeCard;

  function filterProjects() {
    const query = search?.value.trim().toLocaleLowerCase('az') ?? '';
    let visible = 0;
    cards.forEach(card => {
      const label = (card.dataset.title + ' ' + card.dataset.location).toLocaleLowerCase('az');
      card.hidden = (activeCategory !== 'all' && card.dataset.project !== activeCategory) || !label.includes(query);
      if (!card.hidden) visible++;
    });
    if (count) count.textContent = visible ? visible + ' layihə' : 'Layihə tapılmadı';
  }

  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    activeCategory = button.dataset.projectFilter;
    filterProjects();
  }));
  if (search) {
    search.closest('.studio-project-search').hidden = false;
    search.addEventListener('input', filterProjects);
    filterProjects();
  }

  function setProjectPhoto(kind) {
    const isDetail = kind === 'interior' && activeCard.dataset.detailImage;
    image.src = isDetail ? activeCard.dataset.detailImage : activeCard.dataset.image;
    image.alt = isDetail ? activeCard.dataset.title + ' — əlavə foto' : activeCard.querySelector('img').alt;
    photoButtons.forEach(button =>
      button.setAttribute('aria-pressed', String(button.dataset.projectPhoto === kind)));
  }

  function showProject(card) {
    activeCard = card;
    title.textContent = card.dataset.title || '';
    location.textContent = card.dataset.location || '';
    solution.textContent = card.dataset.solution || '';
    if (galleryControls) galleryControls.hidden = !card.dataset.detailImage;
    setProjectPhoto(card.dataset.detailImage ? 'interior' : 'exterior');
    dialog.showModal();
  }
  cards.forEach(card => card.addEventListener('click', () => showProject(card)));
  photoButtons.forEach(button => button.addEventListener('click', () => setProjectPhoto(button.dataset.projectPhoto)));
  const projectSlug = new URLSearchParams(window.location.search).get('layihe');
  const linkedCard = cards.find(card => card.id && card.id === projectSlug);
  if (linkedCard) showProject(linkedCard);
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
})();
