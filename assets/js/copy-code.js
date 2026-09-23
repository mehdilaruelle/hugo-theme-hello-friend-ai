// A copy button on every code block.
//
// No dependency: navigator.clipboard covers every browser this theme targets.
// Where it is absent — an insecure origin, mainly — no button is added, rather
// than one that does nothing when pressed.

(function () {
  if (!navigator.clipboard) return;

  const script = document.currentScript;
  const label = (script && script.dataset.label) || 'Copy';
  const done = (script && script.dataset.labelDone) || 'Copied';
  const failed = (script && script.dataset.labelFailed) || 'Press Ctrl+C';

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('pre').forEach((pre) => {
      // Mermaid renders into a pre, and there is no source worth copying there.
      if (pre.classList.contains('mermaid') || !pre.querySelector('code')) return;

      // The wrapper render-codeblock.html puts around every fenced block.
      // closest, not parentElement: Hugo puts a div.highlight in between
      // whenever it highlights the block. An indented block never reaches that
      // hook at all, so make a wrapper here rather than leave its button
      // anchored to the scrolling pre.
      let wrap = pre.closest('.code-block');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.className = 'code-block';
        pre.parentNode.insertBefore(wrap, pre);
        wrap.appendChild(pre);
      }

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-code';
      button.textContent = label;
      // No aria-label. It would win over the text and freeze the name at
      // "Copy", so neither the confirmation nor the fallback instruction ever
      // reached a screen reader. aria-live announces the change instead.
      button.setAttribute('aria-live', 'polite');

      function flash(text, className) {
        button.textContent = text;
        button.classList.add(className);
        setTimeout(() => {
          button.textContent = label;
          button.classList.remove(className);
        }, 1600);
      }

      button.addEventListener('click', () => {
        // The code is read from the code element, not the pre: the button is a
        // sibling of the pre now, but reading the block itself would still pick
        // up a line-number gutter on a site that turns one on.
        //
        // textContent, not innerText. Chroma wraps each line of a highlighted
        // block in a span it styles display: flex, which makes every line a
        // block-level box, and innerText inserts a line break at each of those
        // boundaries on top of the newline already in the source. That put a
        // blank line between every line of copied code. It only showed once
        // Prism was gone: Prism used to replace the block's markup with its
        // own, flex spans included. textContent reads the source as written.
        const code = pre.querySelector('code').textContent;

        navigator.clipboard.writeText(code).then(
          () => {
            flash(done, 'copy-code--done');
          },
          () => {
            // No permission, or the document lost focus. Say so instead of
            // looking like it worked, and select the code so it can still be
            // copied by hand.
            flash(failed, 'copy-code--failed');
            const range = document.createRange();
            range.selectNodeContents(pre.querySelector('code'));
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
          }
        );
      });

      // On the wrapper, not the pre: inside the scroller the button scrolled
      // away with the code.
      wrap.appendChild(button);
    });
  });
})();
