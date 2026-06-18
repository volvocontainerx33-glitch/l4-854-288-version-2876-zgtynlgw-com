(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let slideIndex = 0;
  let slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    slideIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, currentIndex) {
      slide.classList.toggle('is-active', currentIndex === slideIndex);
    });

    dots.forEach(function (dot, currentIndex) {
      dot.classList.toggle('is-active', currentIndex === slideIndex);
    });
  }

  function startSlider() {
    if (slides.length < 2) {
      return;
    }

    slideTimer = window.setInterval(function () {
      showSlide(slideIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      if (slideTimer) {
        window.clearInterval(slideTimer);
      }

      showSlide(index);
      startSlider();
    });
  });

  showSlide(0);
  startSlider();

  const searchInput = document.querySelector('[data-filter-search]');
  const yearSelect = document.querySelector('[data-filter-year]');
  const regionSelect = document.querySelector('[data-filter-region]');
  const typeSelect = document.querySelector('[data-filter-type]');
  const status = document.querySelector('[data-filter-status]');
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
  const emptyState = document.querySelector('[data-empty-state]');

  function normalized(value) {
    return String(value || '').trim().toLowerCase();
  }

  function cardMatches(card, keyword, year, region, type) {
    const searchText = [
      card.dataset.title,
      card.dataset.genre,
      card.dataset.region,
      card.dataset.type,
      card.dataset.tags,
      card.dataset.year
    ].join(' ').toLowerCase();

    const keywordMatch = !keyword || searchText.includes(keyword);
    const yearMatch = !year || card.dataset.year === year;
    const regionMatch = !region || card.dataset.region === region;
    const typeMatch = !type || card.dataset.type === type;

    return keywordMatch && yearMatch && regionMatch && typeMatch;
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    const keyword = normalized(searchInput && searchInput.value);
    const year = yearSelect ? yearSelect.value : '';
    const region = regionSelect ? regionSelect.value : '';
    const type = typeSelect ? typeSelect.value : '';
    let visibleCount = 0;

    cards.forEach(function (card) {
      const matches = cardMatches(card, keyword, year, region, type);
      card.style.display = matches ? '' : 'none';
      if (matches) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visibleCount === 0);
    }

    if (status) {
      status.textContent = visibleCount > 0 ? '列表已按当前条件更新。' : '没有找到匹配影片。';
    }
  }

  [searchInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });
})();
