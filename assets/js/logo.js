// The section after the logo text, for params.logo.logoCursorPathname. It lived
// at the end of menu.js, with which it shares nothing but the bundle.

(function () {
  const logo = document.querySelector(".logo__pathname");
  if (!logo) return;

  window.addEventListener("load", () => {
    // Where this site starts: the deployment prefix and the language directory
    // in one string. Taking the first segment of location.pathname named the
    // prefix under a subpath, and the old unanchored language strip matched
    // "en/" inside a section called "green" and printed "grex".
    const base = logo.dataset.base || "/";
    const path = window.location.pathname;
    const rest = path.startsWith(base) ? path.slice(base.length) : path.replace(/^\//, "");
    // The home page has no section to name, and adds nothing.
    const section = rest.split("/").filter(Boolean)[0] || "";
    // pathname is percent-encoded, so a non-ASCII section read as
    // "d%C3%A9veloppement". decodeURIComponent throws on a stray "%".
    let text = section;
    try { text = decodeURIComponent(section); } catch { /* leave it encoded */ }
    logo.textContent += text;
  });
})();
