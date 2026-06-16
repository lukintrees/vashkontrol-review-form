(function () {
  var regions = [];
  var organizations = [];
  var selectedType = "all";
  var selectedRegionId = null;
  var regionHighlightIndex = -1;
  var regionMatches = [];

  function init() {
    bindEvents();
    loadData();
  }

  function loadData() {
    document.getElementById("ratingsCount").textContent = "Загрузка...";
    Promise.all([
      fetch("./data/regions.json").then(function (r) { return r.json(); }),
      fetch("./data/organizations.json").then(function (r) { return r.json(); })
    ]).then(function (results) {
      regions = results[0];
      organizations = results[1];
      render();
    }).catch(function () {
      document.getElementById("ratingsCount").textContent = "Ошибка загрузки данных";
    });
  }

  function getFiltered() {
    return organizations.filter(function (org) {
      if (selectedType !== "all" && org.type !== selectedType) return false;
      if (selectedRegionId) {
        var region = regions.find(function (r) { return r.id === selectedRegionId; });
        if (region) {
          if (normalize(org.region) !== normalize(region.region)) return false;
          if (region.city && region.type === "city" && normalize(org.city) !== normalize(region.city)) return false;
        }
      }
      return true;
    });
  }

  function normalize(v) {
    return String(v || "").toLowerCase().replace(/ё/g, "е").replace(/[«»"'.!?()№:;\/-]/g, " ").replace(/\s+/g, " ").trim();
  }

  function sortItems(items, order) {
    var sorted = items.slice();
    switch (order) {
      case "rating-asc":
        sorted.sort(function (a, b) { return (a.rating || 0) - (b.rating || 0) || (b.reviews || 0) - (a.reviews || 0); });
        break;
      case "reviews-desc":
        sorted.sort(function (a, b) { return (b.reviews || 0) - (a.reviews || 0) || (b.rating || 0) - (a.rating || 0); });
        break;
      case "name":
        sorted.sort(function (a, b) { return (a.name || "").localeCompare(b.name || "", "ru"); });
        break;
      default:
        sorted.sort(function (a, b) { return (b.rating || 0) - (a.rating || 0) || (b.reviews || 0) - (a.reviews || 0); });
    }
    return sorted;
  }

  function renderStars(rating) {
    var full = Math.round(rating || 0);
    var html = "";
    for (var i = 1; i <= 5; i++) {
      html += '<svg viewBox="0 0 24 24"' + (i <= full ? "" : " class=\"is-empty\"") + ">" +
        '<path d="m12 2.8 2.82 5.72 6.31.92-4.57 4.45 1.08 6.29L12 17.22l-5.64 2.96 1.08-6.29-4.57-4.45 6.31-.92L12 2.8Z"/></svg>';
    }
    return html;
  }

  function render() {
    var order = document.getElementById("sortOrder").value;
    var filtered = getFiltered();
    var sorted = sortItems(filtered, order);
    var list = document.getElementById("ratingsList");
    var count = document.getElementById("ratingsCount");

    count.textContent = "Показано " + sorted.length + " из " + filtered.length + " организаций";

    if (!sorted.length) {
      list.innerHTML = '<div class="ratings-empty">Нет организаций, соответствующих фильтрам.</div>';
      return;
    }

    list.innerHTML = sorted.map(function (org, index) {
      var rank = index + 1;
      var rankClass = rank <= 3 ? " rank-" + rank : "";

      return '<div class="rating-card">' +
        '<div class="rating-card__rank' + rankClass + '">' + rank + '</div>' +
        '<div class="rating-card__info">' +
          '<div class="rating-card__name">' + escapeHtml(org.name) + '</div>' +
          '<div class="rating-card__meta">' +
            '<span class="tag tag--green">' + (org.type === "mfc" ? "МФЦ" : "Ведомство") + '</span>' +
            '<span class="tag">' + escapeHtml(org.region) + '</span>' +
            (org.city ? '<span class="tag">' + escapeHtml(org.city) + '</span>' : "") +
          '</div>' +
        '</div>' +
        '<div class="rating-card__score">' +
          '<div class="rating-card__stars">' + renderStars(org.rating) + '</div>' +
          '<div class="rating-card__numeric">' + (org.rating || "—") + '</div>' +
        '</div>' +
        '<div class="rating-card__reviews">' +
          '<div class="rating-card__reviews-count">' + (org.reviews || 0) + '</div>' +
          '<div class="rating-card__reviews-label">отзывов</div>' +
        '</div>' +
      '</div>';
    }).join("");
  }

  function escapeHtml(v) {
    return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function bindEvents() {
    document.getElementById("typeFilter").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-type]");
      if (!btn) return;
      document.querySelectorAll("#typeFilter .segmented-btn").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      selectedType = btn.dataset.type;
      render();
    });

    document.getElementById("sortOrder").addEventListener("change", render);

    var regionInput = document.getElementById("ratingsRegionInput");
    var regionDropdown = document.getElementById("ratingsRegionDropdown");

    regionInput.addEventListener("input", function () {
      selectedRegionId = null;
      renderRegionDropdown(regionInput.value);
    });

    regionInput.addEventListener("focus", function () {
      renderRegionDropdown(regionInput.value);
    });

    regionInput.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); if (regionDropdown.hidden) renderRegionDropdown(regionInput.value); moveHighlight(1); }
      if (e.key === "ArrowUp") { e.preventDefault(); if (regionDropdown.hidden) renderRegionDropdown(regionInput.value); moveHighlight(-1); }
      if (e.key === "Enter" && !regionDropdown.hidden) {
        e.preventDefault();
        var r = regionMatches[regionHighlightIndex];
        if (r) selectRegion(r);
      }
      if (e.key === "Escape") closeRegionDropdown();
    });

    regionDropdown.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-region-id]");
      if (!btn) return;
      var region = regions.find(function (r) { return r.id === btn.dataset.regionId; });
      if (region) selectRegion(region);
    });

    document.getElementById("clearRatingsRegion").addEventListener("click", function () {
      selectedRegionId = null;
      regionInput.value = "";
      closeRegionDropdown();
      render();
      regionInput.focus();
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest("#ratingsRegionField")) closeRegionDropdown();
    });
  }

  function renderRegionDropdown(query) {
    var q = normalize(query);
    regionMatches = regions.map(function (r) {
      return { region: r, score: scoreRegion(r, q) };
    }).filter(function (item) { return item.score >= 0; })
      .sort(function (a, b) { return b.score - a.score || (b.region.popularity || 0) - (a.region.popularity || 0); })
      .slice(0, 10)
      .map(function (item) { return item.region; });

    regionHighlightIndex = regionMatches.length ? 0 : -1;

    var dd = document.getElementById("ratingsRegionDropdown");
    if (!regionMatches.length) {
      dd.innerHTML = '<div class="combo-empty">Ничего не найдено</div>';
    } else {
      dd.innerHTML = regionMatches.map(function (r, i) {
        return '<button class="combo-option' + (i === regionHighlightIndex ? " is-active" : "") + '" type="button" data-region-id="' + r.id + '">' +
          '<strong>' + escapeHtml(r.title) + '</strong>' +
          '<small>' + (r.type === "city" ? "Город" : "Регион") + '</small>' +
        '</button>';
      }).join("");
    }
    dd.hidden = false;
    document.getElementById("ratingsRegionInput").setAttribute("aria-expanded", "true");
  }

  function scoreRegion(region, query) {
    if (!query) return region.popularity || 0;
    var title = normalize(region.title);
    var words = title.split(" ");
    if (title === query) return 100000;
    if (title.startsWith(query)) return 90000;
    if (words.some(function (w) { return w.startsWith(query); })) return 80000;
    if (title.includes(query)) return 60000;
    return -1;
  }

  function selectRegion(region) {
    selectedRegionId = region.id;
    document.getElementById("ratingsRegionInput").value = region.title;
    closeRegionDropdown();
    render();
  }

  function moveHighlight(delta) {
    if (!regionMatches.length) return;
    regionHighlightIndex = (regionHighlightIndex + delta + regionMatches.length) % regionMatches.length;
    document.querySelectorAll("#ratingsRegionDropdown .combo-option").forEach(function (btn, i) {
      btn.classList.toggle("is-active", i === regionHighlightIndex);
    });
  }

  function closeRegionDropdown() {
    var dd = document.getElementById("ratingsRegionDropdown");
    dd.hidden = true;
    document.getElementById("ratingsRegionInput").setAttribute("aria-expanded", "false");
  }

  init();
})();
