(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var toggle = qs('.mobile-toggle');
        var panel = qs('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var isHidden = panel.hasAttribute('hidden');
            if (isHidden) {
                panel.removeAttribute('hidden');
                toggle.setAttribute('aria-expanded', 'true');
                toggle.textContent = '×';
            } else {
                panel.setAttribute('hidden', '');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.textContent = '☰';
            }
        });
    }

    function setupSearchForms() {
        qsa('form.site-search').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = qs('input[name="q"]', form);
                var value = input ? input.value.trim() : '';
                var url = './search.html';
                if (value) {
                    url += '?q=' + encodeURIComponent(value);
                }
                window.location.href = url;
            });
        });
    }

    function setupHeroCarousel() {
        var carousel = qs('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = qsa('.hero-slide', carousel);
        var dots = qsa('.hero-dots button', carousel);
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide') || 0));
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function getQueryValue() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    function setupFilters() {
        var list = qs('[data-card-list]');
        var input = qs('#movieSearchInput');
        var category = qs('#categorySelect');
        var year = qs('#yearSelect');
        if (!list || (!input && !category && !year)) {
            return;
        }
        var cards = qsa('.movie-card', list);
        var initialQuery = getQueryValue();
        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function applyFilters() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var categoryValue = category ? category.value : '';
            var yearValue = year ? year.value : '';
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                var cardCategory = card.getAttribute('data-category') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var visible = true;
                if (query && text.indexOf(query) === -1) {
                    visible = false;
                }
                if (categoryValue && cardCategory !== categoryValue) {
                    visible = false;
                }
                if (yearValue && cardYear !== yearValue) {
                    visible = false;
                }
                card.classList.toggle('is-hidden', !visible);
            });
        }

        [input, category, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
        applyFilters();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupSearchForms();
        setupHeroCarousel();
        setupFilters();
    });
})();
