(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.getElementById('heroCarousel');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        schedule();
      });
    }

    schedule();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters(root) {
    var input = root.querySelector('[data-filter-input]');
    var region = root.querySelector('[data-filter-region]');
    var year = root.querySelector('[data-filter-year]');
    var type = root.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('.search-item'));

    if (!cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');

    if (initial && input) {
      input.value = initial;
    }

    function apply() {
      var q = normalize(input && input.value);
      var r = normalize(region && region.value);
      var y = normalize(year && year.value);
      var t = normalize(type && type.value);

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        var ok = true;

        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (r && normalize(card.getAttribute('data-region')) !== r) {
          ok = false;
        }
        if (y && normalize(card.getAttribute('data-year')) !== y) {
          ok = false;
        }
        if (t && normalize(card.getAttribute('data-type')) !== t) {
          ok = false;
        }

        card.classList.toggle('is-filtered-out', !ok);
      });
    }

    [input, region, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  document.querySelectorAll('[data-filter-bar]').forEach(function (bar) {
    setupFilters(bar.closest('section') || document);
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById('movieVideo');
  var overlay = document.getElementById('playOverlay');
  var shell = document.getElementById('playerShell');
  var started = false;
  var hls = null;

  if (!video || !streamUrl) {
    return;
  }

  function beginPlayback() {
    if (started) {
      video.play().catch(function () {});
      return;
    }

    started = true;

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {});
      }, { once: true });
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
    } else {
      video.src = streamUrl;
      video.play().catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      beginPlayback();
    });
  }

  if (shell) {
    shell.addEventListener('click', function (event) {
      if (!started && event.target !== video) {
        beginPlayback();
      }
    });
  }

  video.addEventListener('click', function () {
    if (!started) {
      beginPlayback();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
