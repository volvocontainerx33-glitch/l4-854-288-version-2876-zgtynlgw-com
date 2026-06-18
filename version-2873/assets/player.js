(function () {
    function initMoviePlayer(source) {
        var video = document.getElementById('movieVideo');
        var layer = document.getElementById('playLayer');
        if (!video || !layer || !source) {
            return;
        }

        var hls = null;
        var ready = false;
        var requested = false;
        var attached = false;

        function hideLayer() {
            layer.classList.add('is-hidden');
        }

        function playVideo() {
            var result = video.play();
            if (result && typeof result.then === 'function') {
                result.then(hideLayer).catch(function () {});
            } else {
                hideLayer();
            }
        }

        function attachSource() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                ready = true;
                if (requested) {
                    playVideo();
                }
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    ready = true;
                    if (requested) {
                        playVideo();
                    }
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal || !hls) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
                return;
            }
            video.src = source;
            ready = true;
        }

        function requestPlay() {
            requested = true;
            attachSource();
            if (ready) {
                playVideo();
            }
        }

        layer.addEventListener('click', requestPlay);
        video.addEventListener('click', function () {
            if (video.paused) {
                requestPlay();
            }
        });
        video.addEventListener('play', hideLayer);
        video.addEventListener('ended', function () {
            layer.classList.remove('is-hidden');
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
