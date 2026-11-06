// Appends the current section to the logo (params.logo.logoCursorPathname).

(function () {
  const logo = document.querySelector(".logo__pathname");
  if (!logo) return;

  window.addEventListener("load", () => {
    // Encoded like location.pathname (/caf%C3%A9/).
    const base = new URL(logo.dataset.base || "/", window.location.href).pathname;
    // uglyURLs: the home is .../index.html.
    const path = window.location.pathname.replace(/\/index\.html$/, "/");
    const rest = path.startsWith(base) ? path.slice(base.length) : path.replace(/^\//, "");
    const section = rest.split("/").filter(Boolean)[0] || "";
    let text = section;
    try { text = decodeURIComponent(section); } catch { /* leave it encoded */ }
    logo.textContent += text;
  });
})();
