(function () {
  const libraryUrl = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
  let libraryPromise = null;

  function loadLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (libraryPromise) {
      return libraryPromise;
    }

    libraryPromise = new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = libraryUrl;
      script.async = true;
      script.onload = function () {
        if (window.Hls) {
          resolve(window.Hls);
        } else {
          reject(new Error('HLS load failed'));
        }
      };
      script.onerror = function () {
        reject(new Error('HLS load failed'));
      };
      document.head.appendChild(script);
    });

    return libraryPromise;
  }

  function showMessage(box, message) {
    const messageNode = box.querySelector('[data-player-message]');
    if (!messageNode) {
      return;
    }
    messageNode.textContent = message;
    messageNode.classList.add('show');
    setTimeout(function () {
      messageNode.classList.remove('show');
    }, 3200);
  }

  function playVideo(box) {
    const video = box.querySelector('video[data-stream-url]');
    if (!video) {
      return;
    }

    const streamUrl = video.getAttribute('data-stream-url');
    if (!streamUrl) {
      showMessage(box, '视频暂时不可用');
      return;
    }

    box.classList.add('playing');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== streamUrl) {
        video.src = streamUrl;
      }
      video.play().catch(function () {
        box.classList.remove('playing');
        showMessage(box, '请再次点击播放');
      });
      return;
    }

    loadLibrary().then(function (Hls) {
      if (!Hls.isSupported()) {
        box.classList.remove('playing');
        showMessage(box, '视频暂时不可用');
        return;
      }

      if (!video.hlsInstance) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        video.hlsInstance = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            box.classList.remove('playing');
            showMessage(box, '请再次点击播放');
          });
        });
        hls.on(Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            box.classList.remove('playing');
            showMessage(box, '视频暂时不可用');
          }
        });
      } else {
        video.play().catch(function () {
          box.classList.remove('playing');
          showMessage(box, '请再次点击播放');
        });
      }
    }).catch(function () {
      box.classList.remove('playing');
      showMessage(box, '视频暂时不可用');
    });
  }

  document.querySelectorAll('[data-player]').forEach(function (box) {
    const button = box.querySelector('[data-play-button]');
    const video = box.querySelector('video');

    if (button) {
      button.addEventListener('click', function () {
        playVideo(box);
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        box.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          box.classList.remove('playing');
        }
      });
    }
  });
})();
