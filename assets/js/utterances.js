// utterances in the page's theme: its own preferred-color-scheme follows the system.

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
  for (const name of ['repo', 'issue-term', 'label']) {
    const value = mount.getAttribute('data-' + name);
    if (value) script.setAttribute(name, value);
  }
  let sent = current();
  script.setAttribute('theme', sent);
  mount.appendChild(script);

  // The frame drops messages until it has posted one.
  let ready = false;
  let shown = sent;
  const frameOf = () => mount.querySelector('iframe.utterances-frame');
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
