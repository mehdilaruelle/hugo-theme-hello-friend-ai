// Mobile menu
//
// Wrapped for the same reason as main.js: the bundle is one classic script,
// and a top-level const would be shared with the page's own scripts.

(function () {
  const menuTrigger = document.querySelector(".menu-trigger");
  const menu = document.querySelector(".menu");
  const languageSwitcher = document.querySelector(".language-switcher");
  const mobileQuery = getComputedStyle(document.body).getPropertyValue(
    "--phoneWidth"
  );
  const isMobile = () => window.matchMedia(mobileQuery).matches;
  // aria-expanded says whether the panel is open, so the button announces its
  // own state rather than only its name.
  const setExpanded = () =>
    menuTrigger &&
    menu &&
    menuTrigger.setAttribute(
      "aria-expanded",
      String(!menu.classList.contains("hidden"))
    );

  // Crossings only: a phone fires resize when the URL bar folds away or the
  // keyboard opens, which is not a request to close the menu.
  let wasMobile = null;
  const isMobileMenu = () => {
    const mobile = isMobile();
    if (mobile === wasMobile) return;
    wasMobile = mobile;
    menuTrigger && menuTrigger.classList.toggle("hidden", !mobile);
    menu && menu.classList.toggle("hidden", mobile);
    setExpanded();
  };

  isMobileMenu();

  // Rendered disabled, so a page served without this script does not offer a
  // control that cannot work.
  menuTrigger && menuTrigger.removeAttribute("disabled");

  const closeLanguageSwitcher = () => {
    if (languageSwitcher) languageSwitcher.open = false;
  };

  menuTrigger &&
    menuTrigger.addEventListener("click", () => {
      // Both open into the same corner, so opening one closes the other.
      closeLanguageSwitcher();
      menu && menu.classList.toggle("hidden");
      setExpanded();
    });

  window.addEventListener("resize", isMobileMenu);

  // The language switcher below gets Escape and click-outside for free from
  // being a <details>. The menu is a plain div in the same corner on the same
  // breakpoint, so it needs them spelled out.
  const closeMenu = () => {
    if (!menu || menu.classList.contains("hidden")) return;
    menu.classList.add("hidden");
    // Or the trigger goes on claiming a menu that is no longer open.
    setExpanded();
  };

  document.addEventListener("click", (event) => {
    // Desktop is the permanent navigation, not a panel: nothing to dismiss.
    if (!isMobile()) return;
    // The trigger's own click has already toggled the menu open by the time
    // this runs, and closing here would undo it on every press.
    if (menuTrigger && menuTrigger.contains(event.target)) return;
    if (menu && menu.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !isMobile()) return;
    if (!menu || menu.classList.contains("hidden")) return;
    closeMenu();
    // Focus would otherwise be left inside a hidden panel. Back to the control
    // that opened it, the way the switcher returns focus to its summary.
    menuTrigger && menuTrigger.focus();
  });

  // The switcher is a details element and opens on its own. Only what a details
  // cannot do for itself is added here.
  if (languageSwitcher) {
    languageSwitcher.addEventListener("toggle", () => {
      if (!languageSwitcher.open || !menu || !isMobile()) return;
      // Folding the menu away here has to keep the trigger's aria-expanded in
      // step, or it goes on claiming a menu that is no longer open.
      menu.classList.add("hidden");
      setExpanded();
    });

    document.addEventListener("click", (event) => {
      if (languageSwitcher.open && !languageSwitcher.contains(event.target)) {
        closeLanguageSwitcher();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !languageSwitcher.open) return;
      closeLanguageSwitcher();
      const summary = languageSwitcher.querySelector("summary");
      if (summary) summary.focus();
    });
  }
})();
