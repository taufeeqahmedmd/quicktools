(function () {
  const KEY = "creator-studio-theme";
  const LEGACY_KEY = "sheetfusion-theme";
  const root = document.documentElement;

  function storedTheme() {
    try {
      const saved = localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY);
      return saved === "light" || saved === "dark" ? saved : "dark";
    } catch (error) {
      return "dark";
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(KEY, theme);
      localStorage.setItem(LEGACY_KEY, theme);
    } catch (error) {
      /* Theme still applies for the current page when storage is unavailable. */
    }
  }

  function updateControls(theme) {
    const nextLabel = theme === "light" ? "Dark mode" : "Light mode";
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
      button.setAttribute("title", nextLabel);
    });
    document.querySelectorAll("[data-theme-label]").forEach((label) => {
      label.textContent = nextLabel;
    });
    document.querySelectorAll("[data-theme-icon]").forEach((icon) => {
      icon.textContent = theme === "light" ? "D" : "L";
    });

    const legacyIcon = document.getElementById("themeIcon");
    const legacyLabel = document.getElementById("themeLabel");
    if (legacyIcon) legacyIcon.textContent = theme === "light" ? "D" : "L";
    if (legacyLabel) legacyLabel.textContent = theme === "light" ? "LIGHT" : "DARK";
  }

  function applyTheme(theme) {
    const normalized = theme === "light" ? "light" : "dark";
    root.setAttribute("data-theme", normalized);
    saveTheme(normalized);
    updateControls(normalized);
  }

  function toggleTheme() {
    applyTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light");
  }

  window.CreatorStudioTheme = {
    apply: applyTheme,
    toggle: toggleTheme,
    get: function () {
      return root.getAttribute("data-theme") || storedTheme();
    }
  };

  applyTheme(storedTheme());

  document.addEventListener("DOMContentLoaded", function () {
    updateControls(window.CreatorStudioTheme.get());
    document.querySelectorAll("[data-theme-toggle], #themeBtn").forEach((button) => {
      button.addEventListener("click", toggleTheme);
    });
  });
}());
