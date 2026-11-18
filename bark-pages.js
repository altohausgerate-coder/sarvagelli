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
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    const category = button.dataset.projectFilter;
    cards.forEach(card => { card.hidden = category !== 'all' && card.dataset.project !== category; });
  }));
  cards.forEach(card => card.addEventListener('click', () => {
    title.textContent = card.dataset.title || '';
    location.textContent = card.dataset.location || '';
    solution.textContent = card.dataset.solution || '';
    image.src = card.dataset.detailImage || card.dataset.image || '';
    image.alt = card.querySelector('img')?.alt || title.textContent;
    image.classList.toggle('is-hidden', !image.getAttribute('src'));
    dialog.showModal();
  }));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
})();
