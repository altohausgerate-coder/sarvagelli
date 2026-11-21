const editorialHeader = document.querySelector('.masthead');
const desktopLinks = editorialHeader?.querySelector('.desktop-nav');

if (editorialHeader && desktopLinks && typeof HTMLDialogElement !== 'undefined') {
  const menu = {
    main: { label: 'Menyu', items: [['Ana səhifə', 'index.html'], ['Layihələr', 'layiheler.html'], ['Məhsullar', 'mehsullar.html'], ['Haqqımızda', 'haqqimizda.html'], ['Perspektivlər', 'perspektivler.html'], ['Əlaqə', 'elaqe.html']] },
    products: { label: 'Məhsullar', items: [
      ['Bütün məhsullar', 'mehsullar.html'], ['Pərdələr', 'mehsul-perde.html'],
      ['Jalüzlər', 'mehsul-jaluz.html'], ['Karnizlər', 'mehsul-karniz.html'],
      ['Motor sistemləri', 'mehsul-motor.html'], ['Mebel parçaları və dərilər', 'mehsul-uzluk.html'],
      ['Akustik tekstil', 'mehsul-akustika.html'], ['Hotel tekstili', 'mehsul-hotel.html'],
      ['Dizayn parçaları', 'mehsul-dizayn.html'], ['Açıq məkan tekstili', 'mehsul-outdoor.html'],
      ['ZIP sistemləri', 'mehsul-zip.html'],
    ] },
    company: { label: 'Haqqımızda', items: [
      ['Sarvagelli haqqında', 'haqqimizda.html'], ['Tarixçə', 'tarixce.html'],
      ['Komanda', 'komanda.html'], ['Perspektivlər', 'perspektivler.html'],
      ['Karyera', 'karyera.html'], ['Əlaqə', 'elaqe.html'],
    ] },
    locations: { label: 'Məkanlar', columns: true, items: [
      ...['Bakı', 'Nardaran', 'Bilgəh', 'Laçın', 'Xankəndi', 'Zəngilan', 'Şəki'].map(place =>
        [place, 'layiheler.html?location=' + encodeURIComponent(place), 'Layihə məkanları']),
      ['Hotel və istirahət', 'layiheler.html?category=hospitality', 'Layihə növləri'],
      ['İctimai məkan', 'layiheler.html?category=public', 'Layihə növləri'],
      ['Restoran və ticarət', 'layiheler.html?category=retail', 'Layihə növləri'],
    ] },
    technical: { label: 'Həllər', items: [
      ['Motor sistemləri', 'mehsul-motor.html', 'İdarəetmə'],
      ['Karniz və relslər', 'mehsul-karniz.html', 'Quraşdırma'],
      ['Akustik parçalar və panellər', 'mehsul-akustika.html', 'Akustika'],
      ['ZIP sistemləri', 'mehsul-zip.html', 'Kölgələmə'],
    ] },
    search: { label: 'Axtarış', items: [] },
  };
  const headerItems = [['Layihələr', 'layiheler.html'], 'products', 'company', 'locations', 'technical', ['Əlaqə', 'elaqe.html']];
  const drawer = document.createElement('dialog');
  drawer.id = 'sarvagelli-menu';
  drawer.className = 'editorial-drawer';
  drawer.setAttribute('aria-label', 'Sarvagelli menyusu');
  drawer.innerHTML = '<div class="drawer-scrim"></div><div class="drawer-top"><nav class="drawer-primary" aria-label="Əsas bölmələr"></nav><div class="drawer-actions"></div></div><button type="button" class="drawer-circle" aria-label="Yan paneli bağla"></button>';
  const cloneBrand = editorialHeader.querySelector('.brand').cloneNode(true);
  drawer.querySelector('.drawer-top').prepend(cloneBrand);
  document.body.append(drawer);
  const primary = drawer.querySelector('.drawer-primary');
  const headerActions = document.createElement('div');
  headerActions.className = 'editorial-actions';
  const drawerActions = drawer.querySelector('.drawer-actions');
  const roundClose = drawer.querySelector('.drawer-circle');
  const scrim = drawer.querySelector('.drawer-scrim');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let activeKey;
  let activePanel;
  let opener;
  let closing;
  let resizeDelay;

  function token(name) {
    return getComputedStyle(drawer).getPropertyValue(name).trim();
  }

  function makeButton(text, className, label) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = text;
    if (label) button.setAttribute('aria-label', label);
    return button;
  }

  function makeLink(label, href) {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    if (link.pathname === location.pathname && link.search === location.search) link.setAttribute('aria-current', 'page');
    return link;
  }

  function alignPanel(panel) {
    const anchor = primary.querySelector('[data-group="' + panel.dataset.panel + '"] .label');
    const inset = parseFloat(token('--menu-inset'));
    const minimum = parseFloat(token('--menu-min-width'));
    const desktop = matchMedia('(min-width: 1024px)').matches;
    const left = desktop ? Math.max(0, Math.min(anchor ? anchor.getBoundingClientRect().left - inset : innerWidth * .38, drawer.clientWidth - minimum)) : 0;
    panel.style.setProperty('--panel-left', left + 'px');
    drawer.style.setProperty('--panel-left', left + 'px');
  }

  function buildPanel(key) {
    const { label, columns, items } = menu[key];
    const panel = document.createElement('section');
    panel.className = 'drawer-panel';
    panel.dataset.panel = key;
    panel.id = 'sarvagelli-panel-' + key;
    const content = document.createElement('div');
    content.className = 'drawer-content';
    const heading = document.createElement('h2');
    heading.textContent = label;
    heading.id = panel.id + '-title';
    panel.setAttribute('aria-labelledby', heading.id);
    content.append(heading);
    const list = document.createElement('nav');
    list.className = columns ? 'drawer-links drawer-columns' : 'drawer-links';
    list.setAttribute('aria-label', label);
    const sections = new Map();
    for (const [index, [name, href, group]] of items.entries()) {
      if (group && !sections.has(group)) {
        const section = document.createElement('div');
        section.className = 'drawer-link-group';
        const groupName = document.createElement('h3');
        groupName.textContent = group;
        section.append(groupName);
        list.append(section);
        sections.set(group, section);
      }
      const link = makeLink(name, href);
      link.style.setProperty('--menu-index', index);
      (sections.get(group) || list).append(link);
    }
    if (key === 'search') {
      const form = document.createElement('form');
      form.className = 'drawer-search';
      form.action = 'layiheler.html';
      form.innerHTML = '<label for="drawer-query">Layihə adı və ya məkan</label><input id="drawer-query" name="query" type="search" required><button type="submit">Layihələrdə axtar <span aria-hidden="true">↗</span></button>';
      content.append(form);
    } else {
      content.append(list);
    }
    panel.append(content);
    return panel;
  }

  function syncTriggers() {
    for (const trigger of document.querySelectorAll('.has-editorial-menu [data-group], .editorial-drawer [data-group]')) {
      trigger.setAttribute('aria-expanded', String(trigger.dataset.group === activeKey && !closing));
    }
  }

  function closeMenu() {
    if (!drawer.open || closing) return;
    closing = true;
    syncTriggers();
    drawer.classList.add('drawer-closing');
    const animation = activePanel.animate(
      motion.matches ? [{ opacity: 1 }, { opacity: 0 }] : [{ transform: 'none' }, { transform: 'translateX(100%)' }],
      { duration: parseFloat(token(motion.matches ? '--menu-reduced-duration' : '--menu-close-duration')), easing: token('--menu-ease'), fill: 'both' },
    );
    animation.finished.then(() => drawer.close(), () => drawer.close());
  }

  function openMenu(key, trigger) {
    if (closing) return;
    if (drawer.open && key === activeKey) {
      closeMenu();
      return;
    }
    if (!drawer.open) opener = trigger;
    const previous = activePanel;
    activeKey = key;
    drawer.querySelector('#sarvagelli-panel-' + key)?.remove();
    const panel = buildPanel(key);
    activePanel = panel;
    if (previous) previous.inert = true;
    drawer.append(panel);
    if (!drawer.open) drawer.showModal();
    alignPanel(panel);
    syncTriggers();
    const entrance = panel.animate(
      motion.matches ? [{ opacity: 0 }, { opacity: 1 }] : [{ transform: 'translateX(100%)' }, { transform: 'none' }],
      { duration: parseFloat(token(motion.matches ? '--menu-reduced-duration' : '--menu-open-duration')), easing: token('--menu-ease') },
    );
    entrance.finished.then(() => previous?.remove(), () => previous?.remove());
    (panel.querySelector('input, a') || roundClose).focus({ preventScroll: true });
  }

  function groupButton(key, text, className = 'editorial-section-button') {
    const button = makeButton('', className, key === 'search' ? 'Layihələrdə axtar' : null);
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = text;
    button.append(label);
    button.dataset.group = key;
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', drawer.id);
    button.addEventListener('click', () => openMenu(key, button));
    return button;
  }

  desktopLinks.replaceChildren(...headerItems.map(item => typeof item === 'string'
    ? groupButton(item, menu[item].label) : makeLink(...item)));
  primary.append(...headerItems.map(item => typeof item === 'string'
    ? groupButton(item, menu[item].label) : makeLink(...item)));
  headerActions.append(groupButton('main', 'Menyu', 'editorial-menu-button'), groupButton('search', '', 'menu-search'));
  const closeText = makeButton('Bağla', 'drawer-text-close', 'Menyunu bağla');
  drawerActions.append(closeText, groupButton('search', '', 'menu-search'));
  editorialHeader.append(headerActions);
  editorialHeader.classList.add('has-editorial-menu');

  for (const element of [scrim, roundClose, closeText]) element.addEventListener('click', closeMenu);
  drawer.addEventListener('click', event => {
    if (event.target.closest('a') && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) drawer.close();
  });
  drawer.addEventListener('cancel', event => { event.preventDefault(); closeMenu(); });
  drawer.addEventListener('close', () => {
    drawer.querySelectorAll('.drawer-panel').forEach(panel => panel.remove());
    drawer.classList.remove('drawer-closing');
    activePanel = undefined;
    activeKey = undefined;
    closing = false;
    syncTriggers();
    const returnTo = opener?.getClientRects().length ? opener : headerActions.querySelector('button');
    returnTo?.focus({ preventScroll: true });
  });
  window.addEventListener('resize', () => {
    clearTimeout(resizeDelay);
    resizeDelay = setTimeout(() => { if (activePanel) alignPanel(activePanel); }, 100);
  }, { passive: true });
}

const projectGallery = document.querySelector('.project-gallery');
if (projectGallery && typeof HTMLDialogElement !== 'undefined') {
  const viewer = document.createElement('dialog');
  viewer.className = 'project-viewer';
  viewer.setAttribute('aria-label', 'Layihə təfərrüatları');
  viewer.innerHTML = `
    <header class="viewer-bar"><a class="action viewer-page" href="layiheler.html" target="_blank" rel="noopener">Ayrıca səhifədə aç <span aria-hidden="true">↗</span></a>
      <button type="button" class="drawer-close" aria-label="Layihəni bağla" autofocus>Bağla <span aria-hidden="true">×</span></button></header>
    <div class="viewer-body"></div>`;
  document.body.append(viewer);
  const viewerBody = viewer.querySelector('.viewer-body');
  const close = viewer.querySelector('button');
  let sourceLink;
  let request;

  async function loadProject(url, mode) {
    request?.abort();
    request = new AbortController();
    const { signal } = request;
    try {
      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error('Project unavailable');
      const page = new DOMParser().parseFromString(await response.text(), 'text/html');
      const article = page.querySelector('.project-detail');
      if (!article) throw new Error('Project unavailable');
      if (signal.aborted) return;
      article.querySelector('.back')?.remove();
      viewerBody.replaceChildren(article);
      viewer.querySelector('.viewer-page').href = url;
      if (mode === 'push') history.pushState({ projectViewer: true }, '', url);
      if (mode === 'replace') history.replaceState({ projectViewer: true }, '', url);
      if (!viewer.open) viewer.showModal();
      viewerBody.scrollTop = 0;
      close.focus();
    } catch (error) {
      if (!signal.aborted) location.assign(url);
    }
  }

  function ordinaryClick(event) {
    return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
  }

  projectGallery.addEventListener('click', event => {
    const tile = event.target.closest('a.project-tile');
    if (!tile || !ordinaryClick(event)) return;
    event.preventDefault();
    sourceLink = tile;
    loadProject(tile.href, viewer.open ? 'replace' : 'push');
  });
  viewer.addEventListener('click', event => {
    const link = event.target.closest('.project-neighbours a');
    if (!link || !ordinaryClick(event)) return;
    event.preventDefault();
    loadProject(link.href, 'replace');
  });
  close.addEventListener('click', () => viewer.close());
  viewer.addEventListener('close', () => {
    request?.abort();
    if (history.state?.projectViewer) history.back();
    sourceLink?.focus({ preventScroll: true });
  });
  window.addEventListener('popstate', () => {
    if (history.state?.projectViewer) {
      loadProject(location.href);
    } else {
      request?.abort();
      if (viewer.open) viewer.close();
    }
  });
}
