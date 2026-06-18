(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function bindMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(text) {
    return (text || "").toString().trim().toLowerCase();
  }

  function bindCatalogFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-catalog]"));
    scopes.forEach(function (scope) {
      var search = scope.querySelector(".movie-search");
      var year = scope.querySelector(".movie-year-filter");
      var type = scope.querySelector(".movie-type-filter");
      var category = scope.querySelector(".movie-category-filter");
      var items = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-item"));
      var empty = scope.querySelector(".empty-state");

      function apply() {
        var query = normalize(search && search.value);
        var yearValue = normalize(year && year.value);
        var typeValue = normalize(type && type.value);
        var categoryValue = normalize(category && category.value);
        var visible = 0;

        items.forEach(function (item) {
          var text = normalize([
            item.dataset.title,
            item.dataset.region,
            item.dataset.type,
            item.dataset.year,
            item.dataset.genre,
            item.dataset.tags,
            item.dataset.category
          ].join(" "));
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchYear = !yearValue || normalize(item.dataset.year) === yearValue;
          var matchType = !typeValue || normalize(item.dataset.type).indexOf(typeValue) !== -1;
          var matchCategory = !categoryValue || normalize(item.dataset.category) === categoryValue;
          var ok = matchQuery && matchYear && matchType && matchCategory;
          item.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (search && window.location.pathname.indexOf("search.html") !== -1) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");
        if (initialQuery) {
          search.value = initialQuery;
        }
      }

      [search, year, type, category].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function attachHls(video) {
    if (!video) {
      return;
    }
    var sourceEl = video.querySelector("source");
    var src = sourceEl ? sourceEl.getAttribute("src") : video.getAttribute("src");
    if (!src) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      video._hls = hls;
    }
  }

  function bindPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (frame) {
      var video = frame.querySelector("video");
      var overlay = frame.querySelector(".play-overlay");
      if (!video) {
        return;
      }
      attachHls(video);

      function startPlayback() {
        frame.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            frame.classList.remove("is-playing");
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", startPlayback);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener("play", function () {
        frame.classList.add("is-playing");
      });
      video.addEventListener("ended", function () {
        frame.classList.remove("is-playing");
      });
    });
  }

  ready(function () {
    bindMenu();
    bindHero();
    bindCatalogFilters();
    bindPlayers();
  });
})();
