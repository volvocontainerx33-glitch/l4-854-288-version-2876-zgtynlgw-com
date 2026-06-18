(function () {
  "use strict";

  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function openMobileMenu() {
    var panel = one("[data-mobile-panel]");
    if (!panel) {
      return;
    }
    var isOpen = panel.classList.toggle("is-open");
    document.body.classList.toggle("menu-open", isOpen);
  }

  function setupMobileMenu() {
    all("[data-mobile-toggle]").forEach(function (button) {
      button.addEventListener("click", openMobileMenu);
    });
  }

  function setupHero() {
    var slides = all("[data-hero-slide]");
    var dots = all("[data-hero-dot]");
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function cardMatches(card, filters) {
    var textValue = normalize(card.getAttribute("data-search"));
    var yearValue = normalize(card.getAttribute("data-year"));
    var regionValue = normalize(card.getAttribute("data-region"));
    var typeValue = normalize(card.getAttribute("data-type"));
    var keywordOk = !filters.keyword || textValue.indexOf(filters.keyword) !== -1;
    var yearOk = !filters.year || yearValue === filters.year;
    var regionOk = !filters.region || regionValue.indexOf(filters.region) !== -1;
    var typeOk = !filters.type || typeValue.indexOf(filters.type) !== -1;
    return keywordOk && yearOk && regionOk && typeOk;
  }

  function setupFilters() {
    all("[data-filter-form]").forEach(function (form) {
      var scope = form.closest("[data-filter-scope]") || document;
      var cards = all("[data-movie-card]", scope);
      var result = one("[data-result-count]", scope);

      function readFilters() {
        return {
          keyword: normalize((one('[data-filter="keyword"]', form) || {}).value),
          year: normalize((one('[data-filter="year"]', form) || {}).value),
          region: normalize((one('[data-filter="region"]', form) || {}).value),
          type: normalize((one('[data-filter="type"]', form) || {}).value)
        };
      }

      function apply() {
        var filters = readFilters();
        var visible = 0;
        cards.forEach(function (card) {
          var matched = cardMatches(card, filters);
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (result) {
          result.textContent = String(visible);
        }
      }

      all("input, select", form).forEach(function (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      });

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      var keyword = one('[data-filter="keyword"]', form);
      if (q && keyword && !keyword.value) {
        keyword.value = q;
      }
      apply();
    });
  }

  function setupBackTop() {
    var button = one("[data-back-top]");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupBackTop();
  });
})();
