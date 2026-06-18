(() => {
    const header = document.querySelector(".site-header");
    const menuToggle = document.querySelector(".menu-toggle");

    if (header && menuToggle) {
        menuToggle.addEventListener("click", () => {
            const opened = header.classList.toggle("nav-open");
            menuToggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    document.querySelectorAll("[data-hero]").forEach((hero) => {
        const slides = Array.from(hero.querySelectorAll(".hero-slide"));
        const dots = Array.from(hero.querySelectorAll(".hero-dot"));
        let current = 0;
        let timer = null;

        const show = (index) => {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("active", dotIndex === current);
            });
        };

        const start = () => {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(() => show(current + 1), 5200);
        };

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                show(index);
                start();
            });
        });

        if (slides.length > 1) {
            start();
        }
    });

    document.querySelectorAll("[data-filter-scope]").forEach((scope) => {
        const searchInput = scope.querySelector("[data-filter-search]");
        const yearSelect = scope.querySelector("[data-filter-year]");
        const regionSelect = scope.querySelector("[data-filter-region]");
        const typeSelect = scope.querySelector("[data-filter-type]");
        const parent = scope.parentElement || document;
        const cards = Array.from(parent.querySelectorAll(".movie-card"));
        const empty = parent.querySelector(".no-result");

        const apply = () => {
            const query = (searchInput?.value || "").trim().toLowerCase();
            const year = yearSelect?.value || "";
            const region = regionSelect?.value || "";
            const type = typeSelect?.value || "";
            let visible = 0;

            cards.forEach((card) => {
                const haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.tags,
                    card.dataset.year
                ].join(" ").toLowerCase();
                const matched = (!query || haystack.includes(query)) &&
                    (!year || card.dataset.year === year) &&
                    (!region || card.dataset.region === region) &&
                    (!type || card.dataset.type === type);

                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        };

        [searchInput, yearSelect, regionSelect, typeSelect].forEach((control) => {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    });

    document.querySelectorAll(".video-shell").forEach((shell) => {
        const video = shell.querySelector("video");
        const overlay = shell.querySelector(".player-overlay");
        const startButton = shell.querySelector(".player-start");

        if (!video) {
            return;
        }

        const stream = video.getAttribute("data-stream");
        let hls = null;

        const prepare = () => {
            if (!stream || video.dataset.ready === "1") {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }

            video.dataset.ready = "1";
        };

        const play = () => {
            prepare();
            shell.classList.add("is-playing");
            video.controls = true;
            const result = video.play();

            if (result && typeof result.catch === "function") {
                result.catch(() => {
                    shell.classList.remove("is-playing");
                });
            }
        };

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        if (startButton) {
            startButton.addEventListener("click", (event) => {
                event.stopPropagation();
                play();
            });
        }

        video.addEventListener("click", () => {
            if (video.paused) {
                play();
            }
        });

        window.addEventListener("pagehide", () => {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    });
})();
