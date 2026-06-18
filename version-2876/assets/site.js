(function () {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      const isOpen = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-hidden');
    });
  });

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let heroIndex = 0;

  function activateSlide(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === heroIndex);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === heroIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      activateSlide(Number(dot.getAttribute('data-slide') || 0));
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      activateSlide(heroIndex + 1);
    }, 5200);
  }

  const filterList = document.querySelector('.filter-list');
  if (filterList) {
    const searchInput = document.querySelector('.page-search');
    const selects = Array.from(document.querySelectorAll('.filter-select'));
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function readFilters() {
      const values = {
        query: searchInput ? searchInput.value.trim().toLowerCase() : ''
      };
      selects.forEach(function (select) {
        values[select.getAttribute('data-filter')] = select.value.trim().toLowerCase();
      });
      return values;
    }

    function filterItems() {
      const values = readFilters();
      const cards = Array.from(filterList.children);
      cards.forEach(function (card) {
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        const year = (card.getAttribute('data-year') || '').toLowerCase();
        const type = (card.getAttribute('data-type') || '').toLowerCase();
        const region = (card.getAttribute('data-region') || '').toLowerCase();
        const genre = (card.getAttribute('data-genre') || '').toLowerCase();
        const text = [title, year, type, region, genre, card.textContent.toLowerCase()].join(' ');
        const queryMatch = !values.query || text.indexOf(values.query) !== -1;
        const yearMatch = !values.year || year.indexOf(values.year) !== -1;
        const typeMatch = !values.type || type.indexOf(values.type) !== -1;
        const genreMatch = !values.genre || text.indexOf(values.genre) !== -1;
        card.classList.toggle('is-filtered-out', !(queryMatch && yearMatch && typeMatch && genreMatch));
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', filterItems);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', filterItems);
    });
    filterItems();
  }
}());
