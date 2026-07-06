/* ==========================================================================
   JUICEBAR ADMIN — THEME TOGGLE
   Persists the admin's dark/light choice in localStorage and syncs every
   .theme-toggle-btn on the page (icon + body class).
   ========================================================================== */

(function () {
  var STORAGE_KEY = "juicebar-admin-theme";

  function setIcon(btn, isDark) {
    var icon = btn.querySelector("i");
    if (!icon) return;
    icon.classList.toggle("bi-moon-fill", !isDark);
    icon.classList.toggle("bi-sun-fill", isDark);
  }

  function applyTheme(isDark) {
    document.body.classList.toggle("dark-mode", isDark);
    document.querySelectorAll(".theme-toggle-btn").forEach(function (btn) {
      setIcon(btn, isDark);
    });
  }

  var storedTheme = localStorage.getItem(STORAGE_KEY);
  applyTheme(storedTheme === "dark");

  document.querySelectorAll(".theme-toggle-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var nowDark = !document.body.classList.contains("dark-mode");
      applyTheme(nowDark);
      localStorage.setItem(STORAGE_KEY, nowDark ? "dark" : "light");
    });
  });
})();