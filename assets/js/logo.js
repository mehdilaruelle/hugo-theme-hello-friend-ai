// Appends the current section to the logo (params.logo.logoCursorPathname).

(function () {
  const logo = document.querySelector(".logo__pathname");
  if (!logo) return;

  window.addEventListener("load", () => {
    // data-base: subpath plus language directory.
    const base = logo.dataset.base || "/";
    const path = window.location.pathname;
    const rest = path.startsWith(base) ? path.slice(base.length) : path.replace(/^\//, "");
    const section = rest.split("/").filter(Boolean)[0] || "";
    let text = section;
    try { text = decodeURIComponent(section); } catch { /* leave it encoded */ }
    logo.textContent += text;
  });
})();
