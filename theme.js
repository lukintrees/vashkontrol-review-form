(function () {
  const KEY = "vashkontrol-color-theme";
  function apply(theme) {
    document.body.classList.toggle("theme-official", theme === "official");
    document.body.classList.toggle("theme-classic", theme !== "official");
    document.querySelectorAll("[data-theme-option]").forEach(function (btn) {
      var active = btn.dataset.themeOption === theme;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  }
  var saved = localStorage.getItem(KEY);
  if (saved === "official" || saved === "classic") apply(saved);
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-theme-option]");
    if (!btn) return;
    var theme = btn.dataset.themeOption;
    if (theme !== "official" && theme !== "classic") return;
    localStorage.setItem(KEY, theme);
    apply(theme);
  });
})();
