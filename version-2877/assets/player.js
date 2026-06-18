(function () {
  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function playerScriptUrl() {
    var script = document.querySelector('script[src$="player.js"]');
    return script ? script.src : './assets/player.js';
  }

  function hlsModuleUrl() {
    return new URL('video-player-dru42stk.js', playerScriptUrl()).href;
  }

  function resolveHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    return import(hlsModuleUrl())
      .then(function (module) {
        return module.H || module.default || null;
      })
      .catch(function () {
        return loadScript('https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js')
          .then(function () {
            return window.Hls || null;
          })
          .catch(function () {
            return null;
          });
      });
  }

  function bindPlayer(source) {
    var video = document.querySelector('.movie-player');
    var cover = document.querySelector('.player-cover');

    if (!video || !source) {
      return;
    }

    while (video.firstChild) {
      video.removeChild(video.firstChild);
    }

    function showVideo() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    }

    function startPlayback() {
      showVideo();
      var action = video.play();

      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      resolveHls().then(function (Hls) {
        if (Hls && Hls.isSupported && Hls.isSupported()) {
          var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          window.addEventListener('pagehide', function () {
            hls.destroy();
          });
        } else {
          video.src = source;
        }
      });
    }

    if (cover) {
      cover.addEventListener('click', startPlayback);
    }

    video.addEventListener('play', showVideo);
  }

  window.initMoviePlayer = bindPlayer;
})();
