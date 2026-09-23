/**
 * Theming.
 *
 * Supports the preferred color scheme of the operating system as well as
 * the theme choice of the user.
 *
 * Wrapped, like every other script in the bundle. The files concatenate into
 * one classic script, so a top-level const lands in the global lexical
 * environment the page shares with params.customJS: a site declaring the same
 * name made the whole bundle a SyntaxError.
 */

(function () {
  const themeToggle = document.querySelector(".theme-toggle");
  // params.defaultTheme, as rendered. theme-init.js replaces it only when a
  // stored choice exists, and this is read only when none does.
  const defaultTheme = document.documentElement.getAttribute("data-theme");

  // localStorage can throw (privacy modes); treat that as no storage.
  function withStorage(use) {
    try {
      return use(window.localStorage);
    } catch (e) {
      return null;
    }
  }

  const readStoredTheme = () => withStorage((s) => s.getItem("theme"));
  const storeTheme = (theme) => withStorage((s) => s.setItem("theme", theme));
  const forgetTheme = () => withStorage((s) => s.removeItem("theme"));

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    // The button is labelled "Dark theme" and pressed when the dark theme is on,
    // so a screen reader announces the state rather than a label that changes
    // under the reader every time it is used. Set here rather than in
    // switchTheme, so the first paint is described correctly too: the theme can
    // come from storage, from params.defaultTheme or from the system, and this
    // is the one place all three arrive at.
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    }
  }

  // Read on every call: a choice made since page load has to win.
  function detectOSColorTheme() {
    const chosen = readStoredTheme();

    if (chosen === "dark" || chosen === "light") {
      applyTheme(chosen);
    } else if (defaultTheme) {
      applyTheme(defaultTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      applyTheme("dark");
    } else {
      applyTheme("light");
    }
  }

  // Switch the theme, applying it to the page rather than reloading it.
  function switchTheme() {
    const next =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";

    storeTheme(next);
    applyTheme(next);
  }

  // Event listener
  if (themeToggle) {
    themeToggle.addEventListener("click", switchTheme, false);
    // Rendered disabled, so that a page served without this script does not put
    // a control in the tab order that cannot do anything. Enabled only now that
    // it can.
    themeToggle.removeAttribute("disabled");
    // Follow the system only while the visitor has expressed no preference.
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => !readStoredTheme() && detectOSColorTheme());
    window
      .matchMedia("(prefers-color-scheme: light)")
      .addEventListener("change", () => !readStoredTheme() && detectOSColorTheme());

    detectOSColorTheme();
  } else {
    forgetTheme();
  }
})();
