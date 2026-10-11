// utterances, in the theme the page is in.
//
// Left to its own preferred-color-scheme, utterances follows the system, which
// is not always the page: params.defaultTheme and the toggle can both say
// otherwise, and the comments came out light under a dark article. So the
// client is loaded from here, with the page's theme, and told of every change.
// A site that names a theme of its own gets the plain script tag instead, and
// none of this.

(function () {
  const mount = document.querySelector('.utterances-follow');
  if (!mount) return;

  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  // data-theme when main.js or theme-init.js has set it, the system otherwise.
  const current = () => {
    const theme = root.getAttribute('data-theme') || (system.matches ? 'dark' : 'light');
    return theme === 'dark' ? 'github-dark' : 'github-light';
  };

  const script = document.createElement('script');
  script.src = 'https://utteranc.es/client.js';
  script.async = true;
  script.crossOrigin = 'anonymous';
  // repo, issue-term and label, as the template wrote them.
  for (const attr of mount.attributes) {
    if (attr.name.startsWith('data-')) script.setAttribute(attr.name.slice(5), attr.value);
  }
  let sent = current();
  script.setAttribute('theme', sent);
  mount.appendChild(script);

  // utterances listens for this message on its frame. Before the frame exists,
  // the attribute is what the client will read.
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
