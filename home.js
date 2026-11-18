(() => {
  const hero = document.querySelector('.editorial-hero');
  if (!hero) return;
  const image = hero.querySelector('.hero-image');
  const eyebrow = hero.querySelector('.hero-copy .eyebrow');
  const title = hero.querySelector('h1');
  const lead = hero.querySelector('.hero-lead');
  const count = hero.querySelector('.hero-count');
  const slides = [
    { image: 'assets/sarvagelli-hero.jpg', alt: 'Sarvagelli üçün yaradılmış, gün işığında yumşaq pərdəli interyer', kicker: 'Məkan üçün düşünülmüş tekstil · 1979-dan', title: 'İşıq, tekstura<br>və rahatlıq.', lead: 'Pərdədən motorlu sistemə, interyer parçasından outdoor həllərə qədər — məkanın xarakterinə uyğun seçim.' },
    { image: 'assets/interior.jpg', alt: 'İşığı yumşaldan parçalar və interyer', kicker: 'Materialı toxunaraq seçin', title: 'Faktura ilə<br>başlayan hekayə.', lead: 'Mebel, pərdə və dekor üçün parçaları rəng, toxunuş və istifadə məqsədinə görə müqayisə edin.' },
    { image: 'assets/showroom.jpg', alt: 'Geniş pəncərəli məkanda pərdə sistemi', kicker: 'Layihədən quraşdırmaya', title: 'Hər ölçüyə<br>öz yanaşması.', lead: 'Yaşayış və qonaqpərvərlik məkanları üçün pərdə, jalüz və idarəetmə sistemlərini birlikdə planlayın.' }
  ];
  let active = 0;
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(next) {
    active = (next + slides.length) % slides.length;
    hero.classList.add('is-changing');
    window.setTimeout(() => {
      const slide = slides[active];
      image.src = slide.image;
      image.alt = slide.alt;
      eyebrow.textContent = slide.kicker;
      title.innerHTML = slide.title;
      lead.textContent = slide.lead;
      count.innerHTML = String(active + 1).padStart(2, '0') + ' <i></i> 03';
      hero.classList.remove('is-changing');
    }, 240);
  }
  hero.querySelector('.hero-prev').addEventListener('click', () => show(active - 1));
  hero.querySelector('.hero-next').addEventListener('click', () => show(active + 1));
  if (!prefersReduced) window.setInterval(() => show(active + 1), 6500);
})();
