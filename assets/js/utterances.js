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

  // Before the frame exists, the client reads the attribute instead.
  function sync() {
    const theme = current();
    if (theme === sent) return;
    sent = theme;
    script.setAttribute('theme', theme);
    const frame = mount.querySelector('iframe.utterances-frame') || document.querySelector('iframe.utterances-frame');
    if (frame && frame.contentWindow) {
      frame.contentWindow.postMessage({ type: 'set-theme', theme: theme }, 'https://utteranc.es');
    }
  }

  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  if (system.addEventListener) system.addEventListener('change', sync);
  else if (system.addListener) system.addListener(sync);
})();
