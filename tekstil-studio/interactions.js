const editorialHeader = document.querySelector('.masthead');
const desktopLinks = editorialHeader?.querySelector('.desktop-nav');

if (editorialHeader && desktopLinks && typeof HTMLDialogElement !== 'undefined') {
  const drawer = document.createElement('dialog');
  drawer.className = 'editorial-drawer';
  drawer.setAttribute('aria-labelledby', 'editorial-menu-title');
  drawer.innerHTML = `
    <div class="drawer-top">
      <nav class="drawer-primary" aria-label="Sayt bölmələri"></nav>
      <button type="button" class="drawer-close" aria-label="Menyunu bağla" autofocus>Bağla <span aria-hidden="true">×</span></button>
    </div>
    <div class="drawer-panel">
      <h2 id="editorial-menu-title">Menyu</h2>
      <nav class="drawer-links" aria-label="Alt bölmələr"></nav>
    </div>`;
  document.body.append(drawer);
  drawer.querySelector('.drawer-top').prepend(editorialHeader.querySelector('.brand').cloneNode(true));

  const groups = {
    'layiheler.html': [
      ['Bütün layihələr', 'layiheler.html', 'Layihə növləri'],
      ['Hotel və istirahət', 'layiheler.html?category=hospitality', 'Layihə növləri'],
      ['İctimai məkan', 'layiheler.html?category=public', 'Layihə növləri'],
      ['Restoran və ticarət', 'layiheler.html?category=retail', 'Layihə növləri'],
      ...['Bakı', 'Nardaran', 'Bilgəh', 'Laçın', 'Xankəndi', 'Zəngilan', 'Şəki'].map(location =>
        [location, `layiheler.html?location=${encodeURIComponent(location)}`, 'Layihə məkanları']),
    ],
    'mehsullar.html': [
      ['Bütün məhsullar', 'mehsullar.html'], ['Pərdələr', 'mehsul-perde.html'],
      ['Jalüzlər', 'mehsul-jaluz.html'], ['Karnizlər', 'mehsul-karniz.html'],
      ['Motor sistemləri', 'mehsul-motor.html'], ['Mebel parçaları və dərilər', 'mehsul-uzluk.html'],
      ['Akustik tekstil', 'mehsul-akustika.html'], ['Hotel tekstili', 'mehsul-hotel.html'],
      ['Dizayn parçaları', 'mehsul-dizayn.html'], ['Açıq məkan tekstili', 'mehsul-outdoor.html'],
      ['ZIP sistemləri', 'mehsul-zip.html'],
    ],
    'haqqimizda.html': [
      ['Sarvagelli haqqında', 'haqqimizda.html'], ['Komanda', 'komanda.html'],
      ['Tarixçə', 'tarixce.html'], ['Karyera', 'karyera.html'],
      ['Perspektivlər', 'perspektivler.html'], ['Əlaqə', 'elaqe.html'],
    ],
    technical: [
      ['Motor sistemləri', 'mehsul-motor.html', 'İdarəetmə'],
      ['Karniz və relslər', 'mehsul-karniz.html', 'Quraşdırma'],
      ['Akustik parçalar və panellər', 'mehsul-akustika.html', 'Akustika'],
      ['ZIP sistemləri', 'mehsul-zip.html', 'Kölgələmə'],
    ],
  };

  const title = drawer.querySelector('h2');
  const primary = drawer.querySelector('.drawer-primary');
  const panel = drawer.querySelector('.drawer-panel');
  const secondary = drawer.querySelector('.drawer-links');
  const menuButton = document.createElement('button');
  menuButton.type = 'button';
  menuButton.className = 'editorial-menu-button';
  menuButton.textContent = 'Menyu';
  menuButton.setAttribute('aria-haspopup', 'dialog');
  let trigger;
  const siteLinks = [...desktopLinks.querySelectorAll('a')].map(link => [link.textContent, link.getAttribute('href')]);

  function showGroup(key, label) {
    for (const button of primary.querySelectorAll('button')) {
      button.setAttribute('aria-expanded', String(button.dataset.group === key));
    }
    title.textContent = label || 'Sarvagelli';
    drawer.dataset.panel = key || 'main';
    secondary.classList.toggle('drawer-columns', key === 'layiheler.html');
    secondary.replaceChildren();
    const sections = new Map();
    for (const [text, href, heading] of groups[key] || siteLinks) {
      if (heading && !sections.has(heading)) {
        const section = document.createElement('div');
        const headingElement = document.createElement('h3');
        headingElement.textContent = heading;
        section.className = 'drawer-link-group';
        section.append(headingElement);
        secondary.append(section);
        sections.set(heading, section);
      }
      const link = document.createElement('a');
      link.href = href;
      link.textContent = text;
      if (link.pathname === location.pathname && link.search === location.search) link.setAttribute('aria-current', 'page');
      (sections.get(heading) || secondary).append(link);
    }
    panel.scrollTop = 0;
  }

  function openMenu(button, group, label) {
    trigger = button;
    showGroup(group, label);
    drawer.showModal();
  }

  function createGroupButton(label, key) {
    const groupButton = document.createElement('button');
    groupButton.type = 'button';
    groupButton.dataset.group = key;
    groupButton.textContent = label;
    groupButton.setAttribute('aria-expanded', 'false');
    groupButton.addEventListener('click', () => {
      showGroup(key, label);
      secondary.querySelector('a').focus();
    });
    return groupButton;
  }

  for (const link of desktopLinks.querySelectorAll('a')) {
    const key = link.getAttribute('href');
    if (!groups[key]) {
      primary.append(link.cloneNode(true));
      continue;
    }
    const label = link.textContent;
    primary.append(createGroupButton(label, key));
    const expand = document.createElement('button');
    expand.className = 'editorial-expand';
    expand.type = 'button';
    expand.setAttribute('aria-label', `${label} bölmələrini aç`);
    expand.setAttribute('aria-haspopup', 'dialog');
    expand.addEventListener('click', () => openMenu(expand, key, label));
    const group = document.createElement('div');
    group.className = 'editorial-menu-group';
    link.before(group);
    group.append(link, expand);
  }
  const technicalButton = createGroupButton('Texniki həllər', 'technical');
  primary.insertBefore(technicalButton, primary.lastElementChild);
  const technicalMenu = document.createElement('button');
  technicalMenu.type = 'button';
  technicalMenu.className = 'editorial-section-button';
  technicalMenu.textContent = 'Həllər';
  technicalMenu.setAttribute('aria-haspopup', 'dialog');
  technicalMenu.addEventListener('click', () => openMenu(technicalMenu, 'technical', 'Texniki həllər'));
  desktopLinks.insertBefore(technicalMenu, desktopLinks.lastElementChild);

  editorialHeader.append(menuButton);
  editorialHeader.classList.add('has-editorial-menu');
  menuButton.addEventListener('click', () => openMenu(menuButton));
  drawer.querySelector('.drawer-close').addEventListener('click', () => drawer.close());
  drawer.addEventListener('click', event => {
    if (event.target === drawer) drawer.close();
  });
  drawer.addEventListener('close', () => trigger?.focus());
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
