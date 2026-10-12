// utterances in the page's theme. Its own preferred-color-scheme follows the
// system, which params.defaultTheme and the toggle can contradict.

(function () {
  const mount = document.querySelector('.utterances-follow');
  if (!mount) return;

  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const current = () => {
    const theme = root.getAttribute('data-theme') || (system.matches ? 'dark' : 'light');
    return theme === 'dark' ? 'github-dark' : 'github-light';
  };

  const script = document.createElement('script');
  script.src = 'https://utteranc.es/client.js';
  script.async = true;
  script.crossOrigin = 'anonymous';
  for (const attr of mount.attributes) {
    if (attr.name.startsWith('data-')) script.setAttribute(attr.name.slice(5), attr.value);
  }
  let sent = current();
  script.setAttribute('theme', sent);
  mount.appendChild(script);

  // The frame loads lazily and drops messages until then: hold the theme until
  // it first posts to the page, and before the client runs, it reads the attribute.
  let ready = false;
  let shown = sent;
  const frameOf = () => mount.querySelector('iframe.utterances-frame') || document.querySelector('iframe.utterances-frame');
  function deliver() {
    if (!ready || shown === sent) return;
    const frame = frameOf();
    if (!frame || !frame.contentWindow) return;
    frame.contentWindow.postMessage({ type: 'set-theme', theme: sent }, 'https://utteranc.es');
    shown = sent;
  }
  function sync() {
    const theme = current();
    if (theme === sent) return;
    sent = theme;
    script.setAttribute('theme', theme);
    if (!frameOf()) shown = theme;
    deliver();
  }

  window.addEventListener('message', (event) => {
    if (event.origin !== 'https://utteranc.es') return;
    ready = true;
    deliver();
  });
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  if (system.addEventListener) system.addEventListener('change', sync);
  else if (system.addListener) system.addListener(sync);
})();
