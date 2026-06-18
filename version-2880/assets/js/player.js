function initMoviePlayer(sourceUrl) {
  const video = document.querySelector('[data-player-video]');
  const cover = document.querySelector('[data-player-cover]');
  const button = document.querySelector('[data-player-button]');
  let ready = false;
  let hls = null;

  if (!video || !sourceUrl) {
    return;
  }

  function attachSource() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = sourceUrl;
  }

  function beginPlayback() {
    attachSource();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    video.controls = true;
    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        video.controls = true;
      });
    }
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      beginPlayback();
    });
  }

  if (cover) {
    cover.addEventListener('click', function () {
      beginPlayback();
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      beginPlayback();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
