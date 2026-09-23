// Runs KaTeX over the page once its scripts have loaded.
//
// Kept in a file rather than an onload attribute: an inline handler would force
// every site using this feature to allow script-src 'unsafe-inline', which is
// the whole XSS boundary. Deferred scripts run in document order, so KaTeX and
// its auto-render extension are both defined by the time this executes.

document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderMathInElement !== 'function') return;

  renderMathInElement(document.body, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      // Doubled on purpose: '\[' is not an escape sequence, so JavaScript
      // drops the backslash and the delimiter becomes a bare bracket, which
      // never matches the \[ and \( the page actually contains.
      { left: '\\[', right: '\\]', display: true },
      { left: '\\(', right: '\\)', display: false }
    ],
    throwOnError: false
  });
});
