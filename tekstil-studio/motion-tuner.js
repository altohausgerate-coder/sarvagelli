export function mountTuner(config, refresh) {
  const root = document.documentElement;
  const cssFields = [
    ['Görünmə müddəti (ms)', '--reveal-duration', 'ms', 0, 3000],
    ['Hərəkət məsafəsi (px)', '--reveal-distance', 'px', 0, 150],
    ['Ardıcıl gecikmə (ms)', '--stagger', 'ms', 0, 350],
    ['Şəkil açılması (ms)', '--mask-duration', 'ms', 0, 3000],
    ['Şəkil miqyası (ms)', '--img-scale-duration', 'ms', 0, 3500],
    ['Başlıq hərəkəti (ms)', '--header-hide', 'ms', 0, 1500],
    ['Səhifə keçidi (ms)', '--page-transition', 'ms', 0, 1500],
  ];
  const drawer = document.createElement('aside');
  drawer.className = 'motion-tuner';
  drawer.setAttribute('aria-label', 'Animasiya tənzimləmələri');
  drawer.innerHTML = '<details><summary>Animasiya tənzimləmələri</summary><div class="tuner-fields"></div><button type="button">Dəyərləri kopyala</button><p role="status"></p><textarea rows="8" aria-label="Tənzimləmə dəyərləri" readonly hidden></textarea></details>';
  const list = drawer.querySelector('.tuner-fields');
  const status = drawer.querySelector('[role="status"]');
  const output = drawer.querySelector('textarea');

  function addNumber(title, value, min, max, step, change) {
    const label = document.createElement('label');
    label.textContent = title;
    const input = document.createElement('input');
    input.type = 'number';
    Object.assign(input, { min, max, step, value });
    const slider = document.createElement('input');
    slider.type = 'range';
    Object.assign(slider, { min, max, step, value });
    slider.setAttribute('aria-label', title + ' üçün sürgü');
    input.addEventListener('input', () => {
      if (!input.validity.valid || input.value === '') return;
      slider.value = input.value;
      change(input.valueAsNumber);
      refresh();
    });
    slider.addEventListener('input', () => {
      input.value = slider.value;
      change(slider.valueAsNumber);
      refresh();
    });
    label.append(input);
    list.append(label, slider);
  }
  for (const [label, name, unit, min, max] of cssFields) {
    addNumber(label, parseFloat(getComputedStyle(root).getPropertyValue(name)), min, max, 1,
      value => root.style.setProperty(name, value + unit));
  }
  addNumber('Parallaks gücü', config.parallaxMaxShift, 0, .08, .01, value => { config.parallaxMaxShift = value; });
  addNumber('Giriş miqyası', config.hero.scaleTo, 1, 1.3, .01, value => { config.hero.scaleTo = value; });
  addNumber('Təkər yumşaltması', config.smoothLerp, .01, 1, .01, value => { config.smoothLerp = value; });
  const smooth = document.createElement('label');
  smooth.textContent = 'Təkər animasiyası';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = config.smoothScroll;
  checkbox.addEventListener('change', () => { config.smoothScroll = checkbox.checked; refresh(); });
  smooth.append(checkbox);
  list.append(smooth);

  drawer.querySelector('button').addEventListener('click', async () => {
    const computed = getComputedStyle(root);
    const sheet = [...document.styleSheets].find(style => style.href && new URL(style.href).pathname.endsWith('/motion.css'));
    const tokens = [...(sheet?.cssRules ?? [])].find(rule => rule.selectorText === ':root')?.style;
    const names = Array.from(tokens ?? []);
    const lines = names.map(name => '  ' + name + ': ' + computed.getPropertyValue(name).trim() + ';');
    const result = ':root {\n' + lines.join('\n') + '\n}\n\nconst CONFIG = ' + JSON.stringify(config, null, 2) + ';';
    try {
      await navigator.clipboard.writeText(result);
      status.textContent = 'Dəyərlər kopyalandı.';
    } catch {
      output.hidden = false;
      output.value = result;
      output.focus();
      output.select();
      status.textContent = 'Dəyərlər seçildi.';
    }
  });
  document.body.append(drawer);
}
