const editorialHeader = document.querySelector('.masthead');
const desktopLinks = editorialHeader?.querySelector('.desktop-nav');

if (editorialHeader && desktopLinks && typeof HTMLDialogElement !== 'undefined') {
  const hoverIntentMs = 140;
  const menu = {
    main: { label: 'Menyu', items: [['Ana səhifə', 'index.html'], ['Layihələr', 'layiheler.html'], ['Məhsullar', 'mehsullar.html'], ['Brendlər', 'brendler.html'], ['Haqqımızda', 'haqqimizda.html'], ['Perspektivlər', 'perspektivler.html'], ['Əlaqə', 'elaqe.html']] },
    projects: { label: 'Layihələr', items: [
      ['Bütün layihələr', 'layiheler.html'],
      ['Hotel və istirahət', 'layiheler.html?category=hospitality'],
      ['İctimai məkan', 'layiheler.html?category=public'],
      ['Restoran və ticarət', 'layiheler.html?category=retail'],
    ] },
    products: { label: 'Məhsullar', columns: true, items: [
      ['Bütün məhsullar', 'mehsullar.html'],
      ['Pərdələr', 'mehsul-perde.html', 'Pəncərə sistemləri'],
      ['Jalüzlər', 'mehsul-jaluz.html', 'Pəncərə sistemləri'],
      ['Karnizlər', 'mehsul-karniz.html', 'Pəncərə sistemləri'],
      ['Motor sistemləri', 'mehsul-motor.html', 'Pəncərə sistemləri'],
      ['ZIP sistemləri', 'mehsul-zip.html', 'Pəncərə sistemləri'],
      ['Mebel parçaları və dərilər', 'mehsul-uzluk.html', 'Tekstil'],
      ['Akustik tekstil', 'mehsul-akustika.html', 'Tekstil'],
      ['Hotel tekstili', 'mehsul-hotel.html', 'Tekstil'],
      ['Dizayn parçaları', 'mehsul-dizayn.html', 'Tekstil'],
      ['Açıq məkan tekstili', 'mehsul-outdoor.html', 'Tekstil'],
    ] },
    company: { label: 'Haqqımızda', items: [
      ['Sarvagelli haqqında', 'haqqimizda.html'], ['Tarixçə', 'tarixce.html'],
      ['Komanda', 'komanda.html'], ['Perspektivlər', 'perspektivler.html'],
      ['Əlaqə', 'elaqe.html'],
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
    brands: { label: 'Brendlər', items: [
      ['Sarvagelli Hospitality', 'brendler.html#sarvagelli-hospitality'],
      ['Atelier Bespoke', 'brendler.html#atelier-bespoke'],
      ['KARTEX', 'brendler.html#kartex'],
      ['Pərdəçi', 'brendler.html#perdeci'],
      ['Melatoni', 'brendler.html#melatoni'],
      ['Bütün brendlər', 'brendler.html'],
    ] },
    perspectives: { label: 'Perspektivlər', items: [
      ['Bütün yazılar', 'perspektivler.html'],
      ['İşığa uyğun pərdə seçimi', 'yazi-isigi-sec.html'],
      ['Üzlükdə toxuma və istifadə', 'yazi-material-sec.html'],
      ['Terasda kölgə və məxfilik', 'yazi-teras-sec.html'],
    ] },
    contact: { label: 'Əlaqə', items: [
      ['Əlaqə və showroom', 'elaqe.html'],
      ['+994 50 555 17 87', 'tel:+994505551787'],
      ['info@sarvagelli.com', 'mailto:info@sarvagelli.com'],
    ] },
    search: { label: 'Axtarış', items: [] },
  };
  const headerItems = ['brands', 'products', 'projects', 'locations', 'company', 'technical', 'perspectives', 'contact'];
  const drawer = document.createElement('dialog');
  drawer.id = 'sarvagelli-menu';
  drawer.className = 'editorial-drawer';
  drawer.setAttribute('aria-label', 'Sarvagelli menyusu');
  drawer.innerHTML = '<div class="drawer-scrim"></div><div class="menu-shell" aria-hidden="true"></div><div class="drawer-top"><nav class="drawer-primary" aria-label="Əsas bölmələr"></nav><div class="drawer-actions"></div></div><button type="button" class="drawer-circle" aria-label="Yan paneli bağla"></button>';
  if (!window.CSS?.registerProperty) drawer.classList.add('menu-edge-fallback');
  const cloneBrand = editorialHeader.querySelector('.brand').cloneNode(true);
  drawer.querySelector('.drawer-top').prepend(cloneBrand);
  document.body.append(drawer);
  const primary = drawer.querySelector('.drawer-primary');
  const headerActions = document.createElement('div');
  headerActions.className = 'editorial-actions';
  const drawerActions = drawer.querySelector('.drawer-actions');
  const roundClose = drawer.querySelector('.drawer-circle');
  const scrim = drawer.querySelector('.drawer-scrim');
  const desktop = matchMedia('(min-width: 1024px)');
  const panels = new Map();
  const positions = new Map();
  const buttons = [];
  let activeKey;
  let opener;
  let closeTransition;
  let measureFrame;
  let hoverTimer;
  let openedByHover = false;

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

  function measurePanels() {
    measureFrame = undefined;
    const nav = drawer.open ? primary : desktopLinks;
    const styles = getComputedStyle(drawer);
    const inset = parseFloat(styles.getPropertyValue('--menu-inset'));
    const minimum = parseFloat(styles.getPropertyValue('--menu-min-width'));
    const width = drawer.open ? drawer.clientWidth : document.documentElement.clientWidth;
    const measured = [...panels.keys()].map(key => {
      const label = nav.querySelector('[data-group="' + key + '"] .label');
      const desired = label ? label.getBoundingClientRect().left - inset : width * .38;
      const edge = desktop.matches ? Math.max(width * .21, Math.min(desired, width - minimum)) : 0;
      return [key, edge];
    });
    for (const [key, edge] of measured) {
      positions.set(key, edge + 'px');
      panels.get(key).style.setProperty('--content-left', edge + inset + 'px');
    }
    if (activeKey) drawer.style.setProperty('--shell-target', positions.get(activeKey));
  }

  function scheduleMeasure() {
    measureFrame ??= requestAnimationFrame(measurePanels);
  }

  function buildPanel(key) {
    const { label, columns, items } = menu[key];
    const panel = document.createElement('section');
    panel.className = 'menu-content';
    panel.dataset.panel = key;
    panel.id = 'sarvagelli-panel-' + key;
    panel.inert = true;
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
    for (const trigger of buttons) {
      trigger.setAttribute('aria-expanded', String(trigger.dataset.group === activeKey));
    }
  }

  function selectPanel(key) {
    if (activeKey) panels.get(activeKey).inert = true;
    activeKey = key;
    if (key) {
      panels.get(key).inert = false;
      drawer.style.setProperty('--shell-target', positions.get(key));
      drawer.style.setProperty('--shell-bg', 'var(--menu-' + (key === 'search' ? 'main' : key) + ')');
    }
    syncTriggers();
  }

  function closeMenu() {
    clearTimeout(hoverTimer);
    if (!drawer.open || drawer.dataset.phase === 'closing') return;
    drawer.dataset.phase = 'closing';
    selectPanel(undefined);
    const fades = scrim.getAnimations().map(animation => animation.finished);
    const transition = Promise.allSettled(fades);
    closeTransition = transition;
    transition.then(() => { if (closeTransition === transition) drawer.close(); });
  }

  function openMenu(key, trigger, fromHover = false) {
    if (drawer.open && key === activeKey) {
      if (fromHover) return;
      if (openedByHover) {
        openedByHover = false;
        focusPanel(key);
        return;
      }
      closeMenu();
      return;
    }
    openedByHover = fromHover;
    const firstOpen = !drawer.open;
    closeTransition = undefined;
    if (firstOpen) opener = trigger;
    else if (trigger.closest('.drawer-top')) {
      const matchingTrigger = buttons.find(button => button.dataset.group === key && editorialHeader.contains(button));
      if (matchingTrigger?.getClientRects().length) opener = matchingTrigger;
    }
    drawer.dataset.phase = firstOpen ? 'opening' : 'switching';
    selectPanel(key);
    if (firstOpen) {
      drawer.showModal();
      scheduleMeasure();
    }
    if (!fromHover) focusPanel(key);
  }

  function focusPanel(key) {
    (panels.get(key).querySelector('input, a') || roundClose).focus({ preventScroll: true });
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
    buttons.push(button);
    button.addEventListener('click', () => {
      clearTimeout(hoverTimer);
      openMenu(key, button);
    });
    if (headerItems.includes(key)) {
      button.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'mouse' || activeKey === key || drawer.dataset.phase === 'closing') return;
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => openMenu(key, button, true), hoverIntentMs);
      });
      button.addEventListener('pointerleave', () => clearTimeout(hoverTimer));
    }
    return button;
  }

  desktopLinks.replaceChildren(...headerItems.map(key => groupButton(key, menu[key].label)));
  primary.append(...headerItems.map(key => groupButton(key, menu[key].label)));
  headerActions.append(groupButton('main', 'Menyu', 'editorial-menu-button'), groupButton('search', '', 'menu-search'));
  const closeText = makeButton('Bağla', 'drawer-text-close', 'Menyunu bağla');
  drawerActions.append(closeText, groupButton('search', '', 'menu-search'));
  editorialHeader.append(headerActions);
  editorialHeader.classList.add('has-editorial-menu');
  for (const key of Object.keys(menu)) panels.set(key, buildPanel(key));
  drawer.append(...panels.values());
  measurePanels();
  document.fonts?.ready.then(scheduleMeasure);

  for (const element of [scrim, roundClose, closeText]) element.addEventListener('click', closeMenu);
  drawer.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...drawer.querySelectorAll('a[href], button:not([disabled]), input:not([disabled])')]
      .filter(control => control.getClientRects().length && !control.closest('[inert]'));
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey ? document.activeElement === first : document.activeElement === last) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  });
  drawer.addEventListener('click', event => {
    if (event.target.closest('a') && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) drawer.close();
  });
  drawer.addEventListener('cancel', event => { event.preventDefault(); closeMenu(); });
  drawer.addEventListener('close', () => {
    if (drawer.open) return;
    closeTransition = undefined;
    delete drawer.dataset.phase;
    selectPanel(undefined);
    const returnTo = opener?.getClientRects().length ? opener : headerActions.querySelector('button');
    returnTo?.focus({ preventScroll: true });
  });
  window.addEventListener('resize', scheduleMeasure, { passive: true });
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
