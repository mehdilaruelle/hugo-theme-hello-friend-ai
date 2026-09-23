// Restores a stored theme choice before first paint: the served HTML carries
// params.defaultTheme for every visitor, because it is cached. A file rather
// than an inline script, so a strict CSP needs no hash and no 'unsafe-inline'.
// Wrapped so `stored` is not a global a site's customJS could collide with.
(function () {
  try {
    var stored = window.localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch (e) {
    // Storage throws in some privacy modes; the served theme stands.
  }
})();
