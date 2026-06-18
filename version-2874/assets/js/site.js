(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      mobilePanel.hidden = isOpen;
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function render(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        render(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        render(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        render(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        render(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    render(0);
    start();
  }

  document.querySelectorAll('[data-filter-area]').forEach(function (area) {
    const input = area.querySelector('[data-filter-input]');
    const buttons = Array.from(area.querySelectorAll('[data-filter-value]'));
    const grid = document.querySelector('[data-card-grid]');
    const cards = grid ? Array.from(grid.querySelectorAll('[data-card]')) : [];
    let activeValue = '';

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      const query = normalize(input ? input.value : '');
      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.keywords
        ].join(' '));
        const matchesText = !query || haystack.includes(query);
        const matchesButton = !activeValue || haystack.includes(normalize(activeValue));
        card.hidden = !(matchesText && matchesButton);
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeValue = button.dataset.filterValue || '';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilter();
      });
    });
  });

  const searchPage = document.querySelector('[data-search-page]');
  if (searchPage && typeof movieIndex !== 'undefined') {
    const params = new URLSearchParams(location.search);
    const input = searchPage.querySelector('[data-search-input]');
    const results = searchPage.querySelector('[data-search-results]');
    const initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
      input.addEventListener('input', function () {
        renderResults(input.value);
      });
    }

    function text(value) {
      return String(value || '').replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    function card(movie) {
      const tags = (movie.tags || []).slice(0, 4).map(function (tag) {
        return '<span>' + text(tag) + '</span>';
      }).join('');
      return '<article class="movie-card">' +
        '<a class="poster" href="' + text(movie.url) + '">' +
        '<img src="' + text(movie.poster) + '" alt="' + text(movie.title) + ' 海报" loading="lazy" decoding="async" onerror="this.style.display=\'none\';">' +
        '<span class="poster-year">' + text(movie.year) + '</span>' +
        '</a>' +
        '<div class="card-body">' +
        '<div class="card-meta"><a href="' + text(movie.categoryUrl) + '">' + text(movie.category) + '</a><span>' + text(movie.region) + '</span><span>' + text(movie.type) + '</span></div>' +
        '<h2 class="card-title"><a href="' + text(movie.url) + '">' + text(movie.title) + '</a></h2>' +
        '<p>' + text(movie.summary) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</article>';
    }

    function renderResults(query) {
      const normalized = String(query || '').trim().toLowerCase();
      if (!results) {
        return;
      }
      const matches = movieIndex.filter(function (movie) {
        const haystack = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          movie.summary,
          (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();
        return !normalized || haystack.includes(normalized);
      }).slice(0, 120);
      results.innerHTML = '<div class="movie-grid catalog-grid">' + matches.map(card).join('') + '</div>';
    }

    renderResults(initialQuery);
  }
})();
