(() => {
  const root = document.documentElement;
  const lab = document.querySelector('.light-lab');
  const track = document.querySelector('.track-demo');
  const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
  function update() {
    const max = document.documentElement.scrollHeight - innerHeight;
    root.style.setProperty('--scroll', (max ? scrollY / max * 100 : 0) + '%');
    if (lab) {
      const r = lab.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - innerHeight));
      root.style.setProperty('--lab', (p * 100).toFixed(2));
    }
    if (track) {
      const r = track.getBoundingClientRect();
      const p = clamp(1 - (r.top - innerHeight * .7) / (innerHeight * .75));
      root.style.setProperty('--track', (5 + p * 90).toFixed(2) + '%');
    }
  }
  addEventListener('scroll', update, {passive:true});
  addEventListener('resize', update);
  update();
})();
