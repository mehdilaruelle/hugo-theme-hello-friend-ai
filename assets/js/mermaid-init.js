// Initialises Mermaid on pages that carry a diagram, and re-draws it when the
// reader changes theme.
//
// In a file rather than an inline module, so a site with a strict CSP does not
// have to allow script-src 'unsafe-inline' for its diagram pages. The import is
// dynamic because this file is only fetched where a diagram exists, and the
// library should be too.

(function () {
  const script = document.currentScript;
  const src = script && script.dataset.mermaidSrc;
  if (!src) return;

  const root = document.documentElement;

  function isDark() {
    return root.dataset.theme === 'dark' ||
      (!root.dataset.theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  // The source is kept because Mermaid replaces it with the SVG, leaving
  // nothing to draw a second time.
  //
  // innerHTML and not textContent: the render hook emits the block through
  // safeHTML, so a label may carry markup, and Mermaid reads innerHTML for
  // exactly that reason. Flattening it would redraw a different diagram,
  // turning one<br>two into onetwo on the first theme change.
  const blocks = [].slice.call(document.querySelectorAll('.mermaid'));
  const sources = blocks.map((el) => { return el.innerHTML; });

  import(src).then((module) => {
    const mermaid = module.default;

    // What is on screen, as opposed to what the page now asks for. null until
    // the first draw, so the first sync always renders.
    let rendered = null;
    let running = false;

    function sync() {
      if (running) return;
      const want = isDark();
      if (rendered === want) return;
      running = true;

      if (rendered !== null) {
        blocks.forEach((el, i) => {
          el.removeAttribute('data-processed');
          el.innerHTML = sources[i];
        });
      }

      // startOnLoad hangs off DOMContentLoaded, which has already fired by the
      // time a dynamic import resolves — the diagram would never be drawn.
      // Render explicitly instead.
      mermaid.initialize({
        startOnLoad: false,
        theme: want ? 'dark' : 'base',
        darkMode: want,
        // The edge-label pill masks the line behind the text, so it has to be the
        // surface colour. Mermaid's dark default is a mid grey that leaves the
        // label at 4.43 on it — the only sub-AA element in a dark diagram.
        themeVariables: want
          ? { tertiaryColor: '#dee3ed', edgeLabelBackground: '#3b3d42' }
          : { tertiaryColor: '#dee3ed' }
      });

      mermaid.run()
        // A diagram that does not parse is Mermaid's to report, and it draws
        // its own error into the block. Swallowing the rejection is what keeps
        // one bad diagram from freezing every other one at whichever theme the
        // page happened to load in.
        .catch(() => {})
        .then(() => {
          rendered = want;
          running = false;
          // The theme may have changed while that was in flight.
          sync();
        });
    }

    // Observed before the first draw rather than after it. A reader switching
    // during the initial render would otherwise change the attribute with
    // nothing listening, and the diagram would sit at the wrong theme until
    // the next switch.
    //
    // An observer rather than a hook into main.js: it also catches a site that
    // sets data-theme some other way, and this file keeps knowing nothing
    // about the toggle.
    new MutationObserver(sync).observe(root, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    // And the system preference, for a page that never gets the attribute.
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    if (query.addEventListener) {
      query.addEventListener('change', () => {
        if (!root.dataset.theme) sync();
      });
    }

    sync();
  });
})();
