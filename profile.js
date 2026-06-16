(function () {
  var REVIEWS_KEY = "vashkontrol-review-count";
  var HISTORY_KEY = "vashkontrol-review-history";

  // ---------------------------------------------------------------------------
  // Звания — линейная прогрессия за общую активность
  // ---------------------------------------------------------------------------
  var ranks = [
    { min: 0,  title: "Новичок",           desc: "Начните оценивать качество госуслуг" },
    { min: 1,  title: "Наблюдатель",       desc: "Вы оставили первый отзыв" },
    { min: 5,  title: "Общественный деятель", desc: "Регулярно участвуете в оценке услуг" },
    { min: 15, title: "Инспектор",         desc: "Внимательно следите за качеством" },
    { min: 30, title: "Контролёр",         desc: "Ваше мнение формирует картину качества" },
    { min: 60, title: "Главный контролёр",  desc: "Вы — опора системы общественного контроля" }
  ];

  // ---------------------------------------------------------------------------
  // Достижения — конкретные действия
  // ---------------------------------------------------------------------------
  var achievementsDef = [
    { id: "first",       title: "Первый отзыв",           desc: "Оставлен первый отзыв",                    icon: "star",    rare: "18% пользователей" },
    { id: "comment",     title: "Детально",               desc: "Написан развёрнутый комментарий",         icon: "pen",     rare: "12% пользователей" },
    { id: "photo",       title: "Фотофакт",               desc: "Приложено фото к отзыву",                 icon: "camera",  rare: "6% пользователей" },
    { id: "both-types",  title: "Разносторонний",         desc: "Оценены и МФЦ, и ведомство",             icon: "mix",     rare: "8% пользователей" },
    { id: "two-regions", title: "Путешественник",         desc: "Отзывы в двух и более регионах",          icon: "map",     rare: "4% пользователей" },
    { id: "five-orgs",   title: "Знаток",                 desc: "Оценено 5 разных организаций",            icon: "buildings", rare: "3% пользователей" },
    { id: "official",    title: "Официально",             desc: "Запрошен официальный ответ ведомства",    icon: "document", rare: "10% пользователей" },
    { id: "perfect",     title: "Отлично",                desc: "Все пятёрки в одном отзыве",              icon: "crown",   rare: "15% пользователей" },
    { id: "ten-reviews", title: "Эксперт",                desc: "Оставлено 10 отзывов",                    icon: "expert",  rare: "1.5% пользователей" }
  ];

  var achievementIcons = {
    star: '<svg viewBox="0 0 48 48"><path d="M24 6 30 18l13 2-9.5 9 2.5 13L24 35 12 42l2.5-13L5 20l13-2Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>',
    pen: '<svg viewBox="0 0 48 48"><path d="M10 34v6h6l24-24-6-6-24 24Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="m34 6 8 8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
    camera: '<svg viewBox="0 0 48 48"><path d="M8 18a4 4 0 0 1 4-4h4l3-4h10l3 4h4a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V18Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><circle cx="24" cy="27" r="7" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>',
    mix: '<svg viewBox="0 0 48 48"><path d="M8 14h16M8 24h12M8 34h20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="36" cy="14" r="5" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="34" r="5" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>',
    map: '<svg viewBox="0 0 48 48"><path d="M24 6c-6 0-12 5-12 12 0 8 12 24 12 24s12-16 12-24c0-7-6-12-12-12Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><circle cx="24" cy="18" r="3" fill="currentColor"/></svg>',
    buildings: '<svg viewBox="0 0 48 48"><path d="M14 14h6v22h-6zM26 20h6v16h-6zM38 8h4v28h-4zM6 30h4v6H6z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>',
    document: '<svg viewBox="0 0 48 48"><path d="M10 6v36h28V20L26 6H10Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M26 6v14h14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M17 26h14M17 33h14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
    crown: '<svg viewBox="0 0 48 48"><path d="M8 36V12l10 8 6-12 6 12 10-8v24H8Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><circle cx="16" cy="18" r="2" fill="currentColor"/><circle cx="24" cy="10" r="2" fill="currentColor"/><circle cx="32" cy="18" r="2" fill="currentColor"/></svg>',
    expert: '<svg viewBox="0 0 48 48"><path d="M24 4 30 10l8-2-2 8 6 6-8 2 2 8-8-2-6 6 2-8-8-2 8-2-2-8 8 2 6-6Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>'
  };

  // ---------------------------------------------------------------------------
  // Заполнение демо-данными при первом запуске
  // ---------------------------------------------------------------------------
  seedExampleData();

  function seedExampleData() {
    if (localStorage.getItem(REVIEWS_KEY)) return;

    var examples = [
      { date: "2026-06-10T14:30:00Z", orgName: "ГАУ «МФЦ» Оренбургской области",  orgType: "mfc",     serviceName: "Выдача или замена паспорта гражданина РФ",         regionTitle: "Оренбургская область", avgRating: 5, comment: "Отличный МФЦ. Всё сделали быстро и вежливо. Очереди не было.",             hasPhoto: false, officialAnswer: false },
      { date: "2026-06-08T11:00:00Z", orgName: "Центр госуслуг района Арбат",       orgType: "mfc",     serviceName: "Оформление заграничного паспорта",               regionTitle: "Москва",              avgRating: 4, comment: "Хороший центр, сотрудники внимательные. Немного долго ждал.",             hasPhoto: true,  officialAnswer: false },
      { date: "2026-06-05T16:45:00Z", orgName: "МФЦ города Оренбурга (Дзержинский)", orgType: "mfc",   serviceName: "Государственный кадастровый учёт и регистрация прав", regionTitle: "Оренбургская область", avgRating: 4, comment: "Получил выписку быстро. Информации на стендах не хватает.",               hasPhoto: false, officialAnswer: true },
      { date: "2026-06-01T09:15:00Z", orgName: "Отдел ЗАГС Оренбургской области",   orgType: "department", serviceName: "Регистрация рождения",                       regionTitle: "Оренбургская область", avgRating: 5, comment: "Огромное спасибо! Зарегистрировали ребёнка без проблем.",               hasPhoto: false, officialAnswer: false },
      { date: "2026-05-28T12:30:00Z", orgName: "Единый портал государственных услуг", orgType: "department", serviceName: "Получение или замена водительского удостоверения", regionTitle: "Федеральный уровень",  avgRating: 4, comment: "Удобно записаться через Госуслуги.",                                     hasPhoto: false, officialAnswer: true },
      { date: "2026-05-20T15:00:00Z", orgName: "Управление Росреестра по Оренбургской области", orgType: "department", serviceName: "Государственный кадастровый учёт и регистрация прав", regionTitle: "Оренбургская область", avgRating: 3, comment: "Долго ждал приёма. Очередь была большая.",                                 hasPhoto: true,  officialAnswer: true },
      { date: "2026-05-10T10:00:00Z", orgName: "ГАУ «МФЦ» Оренбургской области",  orgType: "mfc",     serviceName: "Регистрация в системе индивидуального учёта и выдача СНИЛС", regionTitle: "Оренбургская область", avgRating: 5, comment: "МФЦ как всегда на высоте. Без очереди.",                                  hasPhoto: false, officialAnswer: false },
      { date: "2026-05-05T13:20:00Z", orgName: "Центр госуслуг района Хамовники",  orgType: "mfc",     serviceName: "Выдача или замена паспорта гражданина РФ",         regionTitle: "Москва",              avgRating: 4, comment: "Хороший центр, чисто и удобно.",                                         hasPhoto: false, officialAnswer: false }
    ];

    localStorage.setItem(REVIEWS_KEY, String(examples.length));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(examples));
  }

  // ---------------------------------------------------------------------------
  // Вспомогательные функции
  // ---------------------------------------------------------------------------
  function getReviewCount() {
    return Number(localStorage.getItem(REVIEWS_KEY)) || 0;
  }

  function getReviewHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
    catch (e) { return []; }
  }

  function getRank(reviewCount) {
    var current = ranks[0];
    for (var i = ranks.length - 1; i >= 0; i--) {
      if (reviewCount >= ranks[i].min) { current = ranks[i]; break; }
    }
    return current;
  }

  function getNextRank(reviewCount) {
    for (var i = 0; i < ranks.length; i++) {
      if (reviewCount < ranks[i].min) return ranks[i];
    }
    return null;
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function starsSvg(rating) {
    var s = "";
    for (var i = 1; i <= 5; i++) {
      s += '<svg viewBox="0 0 24 24"' + (i <= rating ? "" : ' class="is-empty"') + '><path d="m12 2.8 2.82 5.72 6.31.92-4.57 4.45 1.08 6.29L12 17.22l-5.64 2.96 1.08-6.29-4.57-4.45 6.31-.92L12 2.8Z"/></svg>';
    }
    return s;
  }

  // ---------------------------------------------------------------------------
  // Рендер звания
  // ---------------------------------------------------------------------------
  var rankSvgs = [
    // Новичок
    '<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="28" fill="none" stroke="currentColor" stroke-width="2"/><path d="M40 16c-4 0-8 8-8 18s8 18 8 18 8-8 8-18-4-18-8-18Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><circle cx="40" cy="30" r="3" fill="currentColor"/></svg>',
    // Наблюдатель
    '<svg viewBox="0 0 80 80"><path d="M40 6c16 0 28 8 34 20 0 0-8 14-34 22-26-8-34-22-34-22C12 14 24 6 40 6Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><circle cx="40" cy="30" r="8" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="40" cy="30" r="3" fill="currentColor"/></svg>',
    // Общественный деятель
    '<svg viewBox="0 0 80 80"><path d="M22 54V30c0-10 8-18 18-18s18 8 18 18v24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><circle cx="40" cy="24" r="3" fill="currentColor"/><path d="M18 54c0-6 4-10 10-10h24c6 0 10 4 10 10v4H18v-4Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>',
    // Инспектор
    '<svg viewBox="0 0 80 80"><path d="M40 2 56 14l20-4-12 16 5 20-18-6-18 6 5-20L4 10l20 4Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="m28 34 8 8 16-16" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    // Контролёр
    '<svg viewBox="0 0 80 80"><path d="M40 4 56 14l20-2-12 16 5 20-18-6-18 6 5-20L4 12l20 2Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M30 34h20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M30 42h16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="40" cy="24" r="4" fill="currentColor"/></svg>',
    // Главный контролёр
    '<svg viewBox="0 0 80 80"><path d="M40 2 56 14l20-4-12 16 5 20-18-6-18 6 5-20L4 10l20 4Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="m24 34 10 10 20-20" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="40" cy="20" r="3" fill="currentColor"/><path d="M32 50c0-4 4-7 8-7s8 3 8 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  ];

  function getTopPercentile(reviewCount) {
    if (reviewCount >= 60) return "Топ 0.3%";
    if (reviewCount >= 30) return "Топ 1%";
    if (reviewCount >= 15) return "Топ 2%";
    if (reviewCount >= 8) return "Топ 5%";
    if (reviewCount >= 3) return "Топ 10%";
    if (reviewCount >= 1) return "Топ 20%";
    return "—";
  }

  function renderRank() {
    var count = getReviewCount();
    var current = getRank(count);
    var next = getNextRank(count);
    var rankIndex = ranks.indexOf(current);

    document.getElementById("rankLevel").textContent = "УРОВЕНЬ " + (rankIndex + 1) + " / " + ranks.length;
    document.getElementById("rankTitleText").textContent = current.title;
    document.getElementById("rankDesc").textContent = current.desc;

    var icon = document.getElementById("rankIcon");
    icon.innerHTML = rankSvgs[Math.min(rankIndex, rankSvgs.length - 1)];

    var colors = ["#999", "#cd7f32", "#a8a8a8", "#ffd700", "#50c878", "#b22222"];
    icon.style.color = colors[Math.min(rankIndex, colors.length - 1)];

    var fill = document.getElementById("rankProgressFill");
    var label = document.getElementById("rankProgressLabel");

    if (next) {
      var pct = ((count - current.min) / (next.min - current.min)) * 100;
      fill.style.width = Math.min(100, Math.max(0, pct)) + "%";
      fill.style.background = colors[Math.min(rankIndex + 1, colors.length - 1)];
      label.textContent = "До звания «" + next.title + "»: осталось " + (next.min - count) + " отзывов";
    } else {
      fill.style.width = "100%";
      label.textContent = "Вы достигли высшего звания!";
    }

    var topEl = document.getElementById("rankTop");
    if (topEl) {
      topEl.textContent = getTopPercentile(count);
    }
  }

  // ---------------------------------------------------------------------------
  // Рендер достижений
  // ---------------------------------------------------------------------------
  function computeAchievements(history) {
    var count = history.length;
    var orgs = {};
    var types = {};
    var regions = {};
    var hasComment = false;
    var hasPhoto = false;
    var hasOfficial = false;
    var hasPerfect = false;

    history.forEach(function (item) {
      if (item.orgName) orgs[item.orgName] = true;
      if (item.orgType) types[item.orgType] = true;
      if (item.regionTitle) regions[item.regionTitle] = true;
      if (item.hasPhoto) hasPhoto = true;
      if (item.officialAnswer) hasOfficial = true;
      if (item.comment && item.comment.length > 20) hasComment = true;
      if (item.avgRating && Math.round(item.avgRating) === 5) hasPerfect = true;
    });

    var orgCount = Object.keys(orgs).length;
    var regionCount = Object.keys(regions).length;
    var hasBothTypes = types["mfc"] && types["department"];

    var earned = {};
    if (count >= 1) earned["first"] = true;
    if (hasComment) earned["comment"] = true;
    if (hasPhoto) earned["photo"] = true;
    if (hasBothTypes) earned["both-types"] = true;
    if (regionCount >= 2) earned["two-regions"] = true;
    if (orgCount >= 5) earned["five-orgs"] = true;
    if (hasOfficial) earned["official"] = true;
    if (hasPerfect) earned["perfect"] = true;
    if (count >= 10) earned["ten-reviews"] = true;

    return earned;
  }

  function renderAchievements() {
    var history = getReviewHistory();
    var earned = computeAchievements(history);
    var grid = document.getElementById("achievementsGrid");

    grid.innerHTML = achievementsDef.map(function (ach) {
      var isEarned = earned[ach.id];
      var iconHtml = achievementIcons[ach.icon] || "";
      return '<div class="achievement ' + (isEarned ? "is-earned" : "is-locked") + '">' +
        '<div class="achievement__icon">' + iconHtml + '</div>' +
        '<div class="achievement__info">' +
          '<span class="achievement__title">' + ach.title + '</span>' +
          '<span class="achievement__desc">' + (isEarned ? ach.desc : "???") + '</span>' +
          (isEarned ? '<span class="achievement__rare">Есть у ' + ach.rare + '</span>' : '') +
        '</div>' +
        (isEarned ? '<span class="achievement__check">✓</span>' : '<span class="achievement__lock">🔒</span>') +
      '</div>';
    }).join("");
  }

  // ---------------------------------------------------------------------------
  // Рендер статистики
  // ---------------------------------------------------------------------------
  function renderStats() {
    var count = getReviewCount();
    var history = getReviewHistory();
    var orgNames = {}, regionNames = {}, totalRating = 0;
    var officialCount = 0, photoCount = 0;

    history.forEach(function (item) {
      if (item.orgName) orgNames[item.orgName] = true;
      if (item.regionTitle) regionNames[item.regionTitle] = true;
      if (item.avgRating) totalRating += item.avgRating;
      if (item.officialAnswer) officialCount++;
      if (item.hasPhoto) photoCount++;
    });

    document.getElementById("statReviews").textContent = count;
    document.getElementById("statOrgs").textContent = Object.keys(orgNames).length;
    document.getElementById("statRegions").textContent = Object.keys(regionNames).length;
    document.getElementById("statOfficialAnswers").textContent = officialCount;
    document.getElementById("statPhotos").textContent = photoCount;

    var avg = count > 0 ? (totalRating / count).toFixed(1) : "—";
    document.getElementById("statAvgRating").textContent = avg;
  }

  // ---------------------------------------------------------------------------
  // Рендер истории
  // ---------------------------------------------------------------------------
  function renderHistory() {
    var history = getReviewHistory();
    var container = document.getElementById("reviewHistory");

    if (!history.length) {
      container.innerHTML = '<div class="empty-result">Отзывов пока нет. Отправьте первый отзыв через форму.</div>';
      return;
    }

    container.innerHTML = history.slice().reverse().map(function (item) {
      var dateStr = item.date
        ? new Date(item.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
        : "";
      var tags = [];
      if (item.officialAnswer) tags.push("Официальный ответ");
      if (item.hasPhoto) tags.push("С фото");

      return '<div class="history-item">' +
        '<div class="history-item__head">' +
          '<div>' +
            '<div class="history-item__org">' + escapeHtml(item.orgName || "Организация") + '</div>' +
            '<div class="history-item__service">' + escapeHtml(item.serviceName || "Услуга") + '</div>' +
          '</div>' +
          '<div class="history-item__rating">' + starsSvg(item.avgRating || 0) + '</div>' +
        '</div>' +
        '<div class="history-item__meta">' +
          '<span class="history-item__date">' + dateStr + '</span>' +
          (tags.length ? tags.map(function (t) { return '<span class="tag tag--green">' + t + '</span>'; }).join("") : "") +
        '</div>' +
        (item.comment ? '<div class="history-item__comment">' + escapeHtml(item.comment) + '</div>' : '') +
      '</div>';
    }).join("");
  }

  // ---------------------------------------------------------------------------
  // Запуск
  // ---------------------------------------------------------------------------
  renderRank();
  renderAchievements();
  renderStats();
  renderHistory();
})();
