(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        schedule();
      });
    }

    show(0);
    schedule();
  }

  function initSearchForms() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-search-form]'), function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });
  }

  function initFilters() {
    var grid = document.querySelector('[data-filter-grid]');
    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var searchInput = document.querySelector('.catalog-search');
    var selects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
    var counter = document.querySelector('[data-result-count]');
    var emptyState = document.querySelector('.empty-state');
    var query = new URLSearchParams(window.location.search).get('q');

    if (query && searchInput) {
      searchInput.value = query;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year')
        ].join(' '));

        var matched = !keyword || haystack.indexOf(keyword) !== -1;

        selects.forEach(function (select) {
          var key = select.getAttribute('data-filter');
          var value = normalize(select.value);
          if (value && normalize(card.getAttribute('data-' + key)) !== value) {
            matched = false;
          }
        });

        card.hidden = !matched;
        if (matched) {
          visibleCount += 1;
        }
      });

      if (counter) {
        counter.textContent = String(visibleCount);
      }
      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    applyFilters();
  }

  function initPlayers() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-player]'), function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-player-start]');
      var message = player.querySelector('[data-player-message]');
      var hlsInstance = null;

      if (!video || !button) {
        return;
      }

      function showMessage(text) {
        if (!message) {
          return;
        }
        message.hidden = false;
        message.textContent = text;
      }

      function playVideo() {
        var src = video.getAttribute('data-src');
        if (!src) {
          showMessage('当前视频源暂不可用。');
          return;
        }

        button.classList.add('is-hidden');
        message && (message.hidden = true);

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.play().catch(function () {
            showMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
            button.classList.remove('is-hidden');
          });
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              showMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
              button.classList.remove('is-hidden');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showMessage('播放源加载失败，请稍后重试。');
              button.classList.remove('is-hidden');
            }
          });
          return;
        }

        video.src = src;
        video.play().catch(function () {
          showMessage('当前浏览器不支持 HLS 播放。');
          button.classList.remove('is-hidden');
        });
      }

      button.addEventListener('click', playVideo);
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearchForms();
    initFilters();
    initPlayers();
  });
})();
