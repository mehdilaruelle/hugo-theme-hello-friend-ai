// prefers-reduced-motion for an autoplaying video. No stylesheet can do this
// one: autoplay is an HTML attribute. The controls come from the markup, so a
// visitor without this script still has a pause button.

(function () {
  const query = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!query) return;

  function settle() {
    if (!query.matches) return;
    const videos = document.querySelectorAll('video[autoplay]');
    for (let i = 0; i < videos.length; i++) {
      const v = videos[i];
      v.autoplay = false;
      v.loop = false;
      v.removeAttribute('autoplay');
      v.removeAttribute('loop');
      // load(), not currentTime = 0: once playback has begun only a reset
      // brings the poster back, and a rewind shows the first frame instead.
      if (!v.paused) v.pause();
      try { v.load(); } catch {}
    }
  }

  settle();
  document.addEventListener('DOMContentLoaded', settle);
  // The preference can change while the page is open.
  if (query.addEventListener) query.addEventListener('change', settle);
  else if (query.addListener) query.addListener(settle);
})();
