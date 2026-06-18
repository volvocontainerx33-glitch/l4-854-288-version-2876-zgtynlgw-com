(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playOverlay");
    if (!video || !overlay) {
      return;
    }

    var source = overlay.getAttribute("data-play") || video.getAttribute("data-play");
    var started = false;
    var hlsInstance = null;

    function bindSource() {
      if (started || !source) {
        return;
      }
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function playMovie() {
      bindSource();
      overlay.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }

    overlay.addEventListener("click", playMovie);
    video.addEventListener("click", function () {
      if (!started) {
        playMovie();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
