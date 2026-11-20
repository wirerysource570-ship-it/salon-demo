/* =========================================================
   Общий код: шапка, подвал, секции из data.js, интерактив.
   Работает без сборки и сервера (можно открыть index.html).
   ========================================================= */
(function () {
  'use strict';
  var S = window.SALON;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var page = document.body.getAttribute('data-page');

  /* ---------- Подстройка под конкретный салон (js/salon.js) ---------- */
  (function applySalon() {
    if (S.cats && S.cats.length) {
      var has = function (c) { return S.cats.indexOf(c) >= 0; };
      window.CATEGORIES = window.CATEGORIES.filter(function (c) { return has(c.id); });
      window.SERVICES = window.SERVICES.filter(function (s) { return has(s.cat); });
      window.MASTERS = window.MASTERS.map(function (m) {
        var c = m.cats.filter(has); if (!c.length) return null;
        var copy = {}; for (var k in m) copy[k] = m[k]; copy.cats = c; return copy;
      }).filter(Boolean);
      window.REVIEWS = window.REVIEWS.filter(function (r) { return has(r.cat); });
      window.PORTFOLIO = window.PORTFOLIO.filter(function (p) { return has(p.cat); });
      window.BEFORE_AFTER = window.BEFORE_AFTER.filter(function (b) { return has(b.cat); });
    }
    if (S.theme) Object.keys(S.theme).forEach(function (k) { document.documentElement.style.setProperty('--' + k, S.theme[k]); });
    document.title = document.title.replace(/Пудра/g, S.name);
  })();

  /* ---------- Утилиты ---------- */
  var rub = function (n) { return n.toLocaleString('ru-RU') + ' ₽'; };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var hash = function (s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };
  var tones = ['#f2e1df', '#eed9d2', '#ebe0d8', '#f1e7e2', '#e8d6d1', '#efe3dc'];
  var catById = function (id) { return window.CATEGORIES.filter(function (c) { return c.id === id; })[0]; };
  var masterById = function (id) { return window.MASTERS.filter(function (m) { return m.id === id; })[0]; };
  var minPrice = function (cat) { return Math.min.apply(null, window.SERVICES.filter(function (s) { return s.cat === cat && !s.addon; }).map(function (s) { return s.price; })); };
  var plural = function (n, a, b, c) { var m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? b : c; };
  var duration = function (min) { var h = Math.floor(min / 60), m = min % 60; return (h ? h + ' ч' : '') + (h && m ? ' ' : '') + (m ? m + ' мин' : ''); };

  var I = {
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    photo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.8 7L3 21l2-6A8 8 0 1 1 21 12z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3c.2-.6.2-1.1.2-1.3-.1-.1-.2-.2-.5-.3z"/></svg>',
    tg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3l-3.2 15.2c-.2 1-.9 1.3-1.7.8l-4.8-3.6-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.5 13.2l-4.7-1.5c-1-.3-1-1 .2-1.5L20.5 3c.9-.3 1.6.2 1.4 1.3z"/></svg>',
    vk: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.8 17.5C6.7 17.5 3.2 13.3 3 6.4h3c.1 5 2.4 7.2 4.2 7.7V6.4h2.9v4.3c1.8-.2 3.6-2.2 4.3-4.3h2.8a8.4 8.4 0 0 1-3.9 5.4 8.8 8.8 0 0 1 4.6 5.7h-3.1a5.5 5.5 0 0 0-4.7-4v4h-.3z"/></svg>',
    star: '★',
    arrows: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/></svg>'
  };
  var logoMark = '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" style="fill:var(--accent-light)"/><path d="M16 8c3.5 3 5 5.6 5 8.2a5 5 0 0 1-10 0C11 13.6 12.5 11 16 8z" style="fill:var(--accent-dark)"/></svg>';
  var stars = function (n) { var s = ''; for (var i = 0; i < 5; i++) s += i < n ? '★' : '☆'; return '<span class="stars" aria-label="Оценка ' + n + ' из 5">' + s + '</span>'; };

  /* Картинка с плейсхолдером: если файла нет — мягкий фон с подписью */
  function media(src, alt, ratio, extra) {
    var tone = tones[hash(src || alt) % tones.length];
    return '<div class="media ' + (extra || '') + '" style="--ph:' + tone + (ratio ? ';--r:' + ratio : '') + '">' +
      (src ? '<img src="' + esc(src) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async">' : '') +
      '<div class="media__ph" aria-hidden="true">' + I.photo + '<span>' + esc(alt) + '</span></div></div>';
  }
  function bindMedia(root) {
    $$('.media img', root).forEach(function (img) {
      var fail = function () { var m = img.parentNode; if (!m) return; m.classList.add('is-empty'); var card = m.closest('.cat-card'); if (card) card.classList.add('no-photo'); img.remove(); };
      if (img.complete && img.naturalWidth === 0) fail(); else img.addEventListener('error', fail, { once: true });
    });
    $$('.media', root).forEach(function (m) { if (!m.querySelector('img')) m.classList.add('is-empty'); });
  }

  /* ---------- Тост ---------- */
  var toastEl, toastTimer;
  function toast(text) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = text;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2600);
  }

  /* ---------- Модальное окно ---------- */
  var modalEl, lastFocus, onModalClose;
  function openModal(opts) {
    closeModal(true);
    lastFocus = document.activeElement;
    modalEl = document.createElement('div');
    modalEl.className = 'modal' + (opts.wide ? ' modal--wide' : '');
    modalEl.innerHTML = '<div class="modal__overlay" data-close></div>' +
      '<div class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
      '<div class="modal__head"><h2 class="modal__title" id="modal-title">' + esc(opts.title) + '</h2>' +
      '<button class="modal__close" type="button" data-close aria-label="Закрыть">' + I.close + '</button></div>' +
      '<div class="modal__content" style="display:flex;flex-direction:column;min-height:0;flex:1"></div></div>';
    document.body.appendChild(modalEl);
    document.body.classList.add('modal-open');
    onModalClose = opts.onClose;
    modalEl.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closeModal(); });
    var content = $('.modal__content', modalEl);
    if (opts.html) { content.innerHTML = opts.html; bindMedia(content); }
    setTimeout(function () { var f = $('.modal__close', modalEl); if (f) f.focus(); }, 30);
    return content;
  }
  function closeModal(silent) {
    if (!modalEl) return;
    modalEl.remove(); modalEl = null;
    document.body.classList.remove('modal-open');
    if (!silent && onModalClose) onModalClose();
    onModalClose = null;
    if (!silent && lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener('keydown', function (e) {
    if (!modalEl) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab') {
      var f = $$('button:not([disabled]), a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])', modalEl).filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  window.UI = { openModal: openModal, closeModal: closeModal, toast: toast, media: media, bindMedia: bindMedia, rub: rub, esc: esc, hash: hash, icons: I, duration: duration, plural: plural };

  /* ---------- Шапка, подвал, плавающие кнопки ---------- */
  var nav = [
    ['services', 'services.html', 'Услуги и цены'],
    ['masters', 'masters.html', 'Мастера'],
    ['portfolio', 'portfolio.html', 'Портфолио'],
    ['about', 'about.html', 'О салоне'],
    ['contacts', 'contacts.html', 'Контакты']
  ];
  var logo = '<a class="logo' + (S.name.length > 13 ? ' logo--long' : '') + '" href="index.html" aria-label="' + esc(S.name) + ' — на главную">' + logoMark +
    '<span><span class="logo__name">' + esc(S.name) + '</span><span class="logo__kind">' + esc(S.kind) + '</span></span></a>';
  var navLinks = nav.map(function (n) { return '<a href="' + n[1] + '"' + (page === n[0] ? ' aria-current="page"' : '') + '>' + n[2] + '</a>'; }).join('');

  var header = $('#site-header');
  if (header) {
    header.outerHTML = '<header class="header" id="header"><div class="container header__inner">' + logo +
      '<nav class="nav" aria-label="Основное меню">' + navLinks + '</nav>' +
      '<a class="header__phone" href="tel:' + S.phoneHref + '">' + esc(S.phone) + '</a>' +
      '<button class="btn btn--primary btn--sm header__cta" type="button" data-book>Записаться</button>' +
      '<button class="burger" type="button" aria-label="Открыть меню" aria-expanded="false" aria-controls="mobile-menu"><span></span></button>' +
      '</div></header>' +
      '<div class="mobile-menu" id="mobile-menu">' + nav.map(function (n) { return '<a href="' + n[1] + '">' + n[2] + '</a>'; }).join('') +
      '<a class="mobile-menu__phone" href="tel:' + S.phoneHref + '">' + esc(S.phone) + '</a>' +
      '<button class="btn btn--primary btn--block" type="button" data-book>Записаться онлайн</button></div>';
  }
  var burger = $('.burger');
  if (burger) burger.addEventListener('click', function () {
    var open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  $$('.mobile-menu a, .mobile-menu button').forEach(function (a) { a.addEventListener('click', function () { document.body.classList.remove('menu-open'); }); });
  var headerEl = $('#header');
  var onScroll = function () { if (headerEl) headerEl.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var socialLink = function (id, label) { return '<a href="#" data-demo-link aria-label="' + label + '">' + I[id] + '</a>'; };
  var footer = $('#site-footer');
  if (footer) {
    footer.outerHTML = '<footer class="footer"><div class="container"><div class="footer__grid">' +
      '<div>' + logo + '<p style="margin-top:16px;max-width:280px">' + esc(S.about || window.CATEGORIES.map(function (c) { return c.name; }).join(', ') + ' — в одном месте.') + '</p>' +
      '<div class="socials">' + S.social.map(function (s) { return socialLink(s.id, s.label); }).join('') + '</div></div>' +
      '<div><h4>Разделы</h4><ul>' + nav.map(function (n) { return '<li><a href="' + n[1] + '">' + n[2] + '</a></li>'; }).join('') + '</ul></div>' +
      '<div><h4>Контакты</h4><ul><li>' + esc(S.address) + '</li><li><a href="tel:' + S.phoneHref + '">' + esc(S.phone) + '</a></li>' + (S.email ? '<li><a href="mailto:' + S.email + '">' + esc(S.email) + '</a></li>' : '') + '</ul></div>' +
      '<div><h4>Режим работы</h4><ul>' + S.hours.map(function (h) { return '<li>' + h.days + ': ' + h.time + '</li>'; }).join('') + '</ul></div>' +
      '</div><div class="footer__bottom"><span>© ' + new Date().getFullYear() + ' ' + esc(S.kind[0].toUpperCase() + S.kind.slice(1)) + ' «' + esc(S.name) + '»</span>' +
      '<a href="#" data-demo-link data-demo-text="Здесь будет политика конфиденциальности">Политика конфиденциальности</a></div></div></footer>' +
      '<div class="mobile-bar"><a class="icon-btn" href="tel:' + S.phoneHref + '" aria-label="Позвонить">' + I.phone + '</a>' +
      '<a class="icon-btn" href="#" data-demo-link aria-label="Написать в WhatsApp">' + I.wa + '</a>' +
      '<button class="btn btn--primary" type="button" data-book>Записаться</button></div>' +
      '<div class="chat-fab"><div class="chat-fab__menu" id="chat-menu">' +
      '<a href="#" data-demo-link>' + I.wa + 'WhatsApp</a><a href="#" data-demo-link>' + I.tg + 'Telegram</a>' +
      '<a href="tel:' + S.phoneHref + '">' + I.phone + 'Позвонить</a></div>' +
      '<button class="chat-fab__btn" type="button" aria-label="Написать нам" aria-expanded="false" aria-controls="chat-menu">' + I.chat + '</button></div>';
  }
  var fab = $('.chat-fab');
  if (fab) {
    var fabBtn = $('.chat-fab__btn', fab);
    fabBtn.addEventListener('click', function (e) { e.stopPropagation(); var o = fab.classList.toggle('is-open'); fabBtn.setAttribute('aria-expanded', o); });
    document.addEventListener('click', function (e) { if (!e.target.closest('.chat-fab')) { fab.classList.remove('is-open'); fabBtn.setAttribute('aria-expanded', 'false'); } });
  }

  /* Демо-ссылки на мессенджеры и соцсети */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-demo-link]');
    if (a) { e.preventDefault(); toast(a.getAttribute('data-demo-text') || 'Здесь откроется чат с салоном'); return; }
    var b = e.target.closest('[data-book]');
    if (b && window.openBooking) { e.preventDefault(); window.openBooking({ service: b.getAttribute('data-service'), master: b.getAttribute('data-master') }); }
  });

  /* Контактные данные в разметке: <span data-salon="phone"></span> */
  $$('[data-salon]').forEach(function (el) {
    var k = el.getAttribute('data-salon');
    if (k === 'phone') { el.textContent = S.phone; if (el.tagName === 'A') el.href = 'tel:' + S.phoneHref; }
    else if (k === 'email') { if (!S.email) { var row = el.closest('.contact-row'); if (row) row.remove(); return; } el.textContent = S.email; if (el.tagName === 'A') el.href = 'mailto:' + S.email; }
    else if ((k === 'howToGet' || k === 'eyebrow' || k === 'heroText') && !S[k]) { if (k === 'howToGet') el.remove(); }
    else if (k === 'hours') el.innerHTML = S.hours.map(function (h) { return '<li><span>' + h.days + '</span><span>' + h.time + '</span></li>'; }).join('');
    else if (k === 'rating') el.textContent = String(S.rating.value).replace('.', ',');
    else if (k === 'rating-count') el.textContent = S.rating.count + ' ' + plural(S.rating.count, 'отзыв', 'отзыва', 'отзывов');
    else if (S[k] != null) el.textContent = S[k];
  });

  /* ---------- Секции ---------- */
  function catCards(el) {
    /* Одно направление — показываем его популярные услуги вместо единственной карточки */
    if (window.CATEGORIES.length === 1) {
      var list = window.SERVICES.filter(function (s) { return !s.addon; }).slice(0, 5);
      var pics = window.PORTFOLIO.length ? window.PORTFOLIO : [{ img: window.CATEGORIES[0].img }];
      el.style.setProperty('--cols', Math.min(list.length, 5));
      el.innerHTML = list.map(function (s, i) {
        return '<a class="cat-card reveal" href="services.html#' + s.cat + '">' + media(pics[i % pics.length].img, s.name, '3 / 4') +
          '<div class="cat-card__body"><h3>' + esc(s.name) + '</h3><div class="cat-card__price">от ' + rub(s.price) + '</div></div></a>';
      }).join('');
      return;
    }
    el.style.setProperty('--cols', Math.min(window.CATEGORIES.length, 5));
    el.innerHTML = window.CATEGORIES.map(function (c) {
      return '<a class="cat-card reveal" href="services.html#' + c.id + '">' + media(c.img, c.name, '3 / 4') +
        '<div class="cat-card__body"><h3>' + c.name + '</h3><div class="cat-card__price">от ' + rub(minPrice(c.id)) + '</div></div></a>';
    }).join('');
  }
  function masterCard(m) {
    return '<article class="master-card reveal">' + media(m.img, m.name, '4 / 4.4') + '<div class="master-card__body">' +
      '<h3>' + esc(m.name) + '</h3><div class="master-card__role">' + esc(m.role) + ' · стаж ' + esc(m.exp) + '</div>' +
      '<ul>' + m.strengths.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
      '<div class="master-card__actions"><button class="btn btn--ghost btn--sm" type="button" data-master-info="' + m.id + '">Подробнее</button>' +
      '<button class="btn btn--primary btn--sm" type="button" data-book data-master="' + m.id + '">Записаться</button></div></div></article>';
  }
  function reviewCard(r) {
    var m = masterById(r.master);
    return '<article class="review">' + stars(r.rating) + '<p class="review__text" style="margin-top:12px">' + esc(r.text) + '</p>' +
      '<div class="review__foot"><div class="avatar" aria-hidden="true">' + esc(r.name[0]) + '</div><div><div class="review__name">' + esc(r.name) + '</div>' +
      '<div class="review__meta">' + esc(r.service) + (m ? ' · ' + esc(m.name.split(' ')[0]) : '') + '</div></div></div></article>';
  }
  function workBtn(p, i) {
    return '<button class="work" type="button" data-work="' + i + '" aria-label="Открыть фото: ' + esc(p.title) + '">' + media(p.img, p.title, '1 / 1') + '<div class="work__title">' + esc(p.title) + '</div></button>';
  }
  function baSlider(b) {
    return '<div><div class="ba">' + media(b.before, 'До', null, 'ba__before') + media(b.after, 'После', null, 'ba__after') +
      '<div class="ba__line"><div class="ba__knob">' + I.arrows + '</div></div><span class="ba__label ba__label--before">До</span><span class="ba__label ba__label--after">После</span>' +
      '<input class="ba__range" type="range" min="0" max="100" value="50" aria-label="Сравнить до и после: ' + esc(b.title) + '"></div><div class="ba-title">' + esc(b.title) + '</div></div>';
  }

  var el;
  if ((el = $('#home-cats'))) catCards(el);
  if ((el = $('#home-masters'))) el.innerHTML = window.MASTERS.slice(0, 6).map(masterCard).join('');
  if ((el = $('#home-works'))) el.innerHTML = window.PORTFOLIO.slice(0, 8).map(workBtn).join('');
  if ((el = $('#home-ba'))) { if (window.BEFORE_AFTER.length) el.innerHTML = baSlider(window.BEFORE_AFTER[0]); else el.closest('.split').remove(); }
  if (!window.BEFORE_AFTER.length && (el = $('#ba-list'))) el.closest('section').remove();
  if ((el = $('#hero-text')) && S.heroText) el.textContent = S.heroText;
  if ((el = $('#hero-eyebrow')) && S.eyebrow) el.textContent = S.eyebrow;
  if ((el = $('#reviews'))) el.innerHTML = window.REVIEWS.map(reviewCard).join('');
  if ((el = $('#ba-list'))) el.innerHTML = window.BEFORE_AFTER.map(baSlider).join('');
  if ((el = $('#faq'))) el.innerHTML = window.FAQ.map(function (f) { return '<details><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>'; }).join('');
  if ((el = $('#stats'))) el.innerHTML = S.stats.map(function (s) { return '<div class="stat reveal"><strong>' + esc(s.value) + '</strong><span>' + esc(s.label) + '</span></div>'; }).join('');
  if ((el = $('#promo-title'))) el.textContent = S.promo.title;
  if ((el = $('#promo-text'))) el.textContent = S.promo.text;

  /* Страница услуг */
  if ((el = $('#services-list'))) {
    var tabs = $('#service-tabs');
    tabs.innerHTML = window.CATEGORIES.map(function (c, i) { return '<a class="chip" href="#' + c.id + '" data-tab="' + c.id + '" style="display:inline-flex;align-items:center;text-decoration:none"' + (i === 0 ? ' aria-selected="true"' : '') + '>' + c.name + '</a>'; }).join('');
    el.innerHTML = window.CATEGORIES.map(function (c) {
      var list = window.SERVICES.filter(function (s) { return s.cat === c.id; });
      return '<section class="price-group" id="' + c.id + '"><div class="price-group__intro"><div><h2>' + c.name + '</h2><p>' + c.short + '</p></div>' +
        '<div class="price-legend"><span>Цена у мастера / у топ-мастера</span></div></div><ul class="price-list">' +
        list.map(function (s) {
          return '<li class="price-item"><div><div class="price-item__name">' + esc(s.name) + '</div><div class="price-item__desc">' + esc(s.desc) + '</div>' +
            '<div class="price-item__dur">' + I.clock + duration(s.dur) + '</div></div>' +
            '<div class="price-item__price">' + rub(s.price) + '<small>топ: ' + rub(s.priceTop) + '</small></div>' +
            '<button class="btn btn--ghost btn--sm" type="button" data-book data-service="' + s.id + '">Записаться</button></li>';
        }).join('') + '</ul></section>';
    }).join('');
    var groups = $$('.price-group');
    var setTab = function (id) { $$('[data-tab]', tabs).forEach(function (t) { var on = t.getAttribute('data-tab') === id; t.setAttribute('aria-selected', on); if (on && t.scrollIntoView && tabs.scrollWidth > tabs.clientWidth) tabs.scrollTo({ left: t.offsetLeft - 16, behavior: 'smooth' }); }); };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) { entries.forEach(function (en) { if (en.isIntersecting) setTab(en.target.id); }); }, { rootMargin: '-40% 0px -55% 0px' });
      groups.forEach(function (g) { io.observe(g); });
    }
  }

  /* Страница мастеров */
  var mGrid = $('#masters-grid');
  if (mGrid) {
    var mf = $('#masters-filter');
    var renderMasters = function (cat) {
      var list = window.MASTERS.filter(function (m) { return cat === 'all' || m.cats.indexOf(cat) >= 0; });
      mGrid.innerHTML = list.map(masterCard).join('');
      bindMedia(mGrid); reveal(mGrid, true);
    };
    mf.innerHTML = '<button class="chip" type="button" data-f="all" aria-pressed="true">Все</button>' + window.CATEGORIES.map(function (c) { return '<button class="chip" type="button" data-f="' + c.id + '" aria-pressed="false">' + c.name + '</button>'; }).join('');
    mf.addEventListener('click', function (e) { var b = e.target.closest('[data-f]'); if (!b) return; $$('[data-f]', mf).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); renderMasters(b.getAttribute('data-f')); });
    renderMasters('all');
  }

  /* Портфолио */
  var lbItems = window.PORTFOLIO.slice(0, 8);
  var pGrid = $('#portfolio-grid');
  if (pGrid) {
    var pf = $('#portfolio-filter');
    var renderPortfolio = function (cat) {
      lbItems = window.PORTFOLIO.filter(function (p) { return cat === 'all' || p.cat === cat; });
      pGrid.innerHTML = lbItems.map(workBtn).join('');
      bindMedia(pGrid);
    };
    pf.innerHTML = '<button class="chip" type="button" data-f="all" aria-pressed="true">Все</button>' + window.CATEGORIES.map(function (c) { return '<button class="chip" type="button" data-f="' + c.id + '" aria-pressed="false">' + c.name + '</button>'; }).join('');
    pf.addEventListener('click', function (e) { var b = e.target.closest('[data-f]'); if (!b) return; $$('[data-f]', pf).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); renderPortfolio(b.getAttribute('data-f')); });
    renderPortfolio('all');
  }

  /* Интерьер на странице «О салоне» */
  if ((el = $('#interior'))) el.innerHTML = ['Зал парикмахеров', 'Ногтевой сервис', 'Кабинет косметолога', 'Зона ожидания', 'Ресепшен'].map(function (t, i) { return media('img/interior-' + (i + 1) + '.webp', t, '4 / 3'); }).join('');
  if ((el = $('#brands'))) el.innerHTML = ['BRAND', 'MAISON', 'NOVA', 'LUMEN', 'TERRA'].map(function (b) { return '<div class="brand">' + b + '</div>'; }).join('');

  /* Карта (ленивая загрузка) */
  $$('[data-map]').forEach(function (box) {
    var load = function () {
      if (box.dataset.loaded) return; box.dataset.loaded = '1';
      var m = S.map, f = document.createElement('iframe');
      f.src = 'https://yandex.ru/map-widget/v1/?ll=' + m.lon + '%2C' + m.lat + '&z=' + m.zoom + '&pt=' + m.lon + '%2C' + m.lat + '%2Cpm2rdm';
      f.title = 'Карта: ' + S.address; f.loading = 'lazy'; f.allowFullscreen = true;
      box.appendChild(f);
    };
    if ('IntersectionObserver' in window) { var o = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { load(); o.disconnect(); } }, { rootMargin: '300px' }); o.observe(box); } else load();
  });
  $$('[data-route]').forEach(function (a) { a.href = 'https://yandex.ru/maps/?rtext=~' + S.map.lat + '%2C' + S.map.lon; a.target = '_blank'; a.rel = 'noopener'; });

  /* ---------- Карусели ---------- */
  $$('[data-carousel]').forEach(function (c) {
    var track = $('.carousel__track', c), prev = $('[data-prev]', c.parentNode), next = $('[data-next]', c.parentNode), dots = $('.dots', c);
    var items = function () { return Array.prototype.slice.call(track.children); };
    var step = function () { var it = items()[0]; return it ? it.getBoundingClientRect().width + 16 : 300; };
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    if (dots) {
      dots.innerHTML = items().map(function (_, i) { return '<button type="button" aria-label="Слайд ' + (i + 1) + '"></button>'; }).join('');
      $$('button', dots).forEach(function (d, i) { d.addEventListener('click', function () { track.scrollTo({ left: items()[i].offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft), behavior: 'smooth' }); }); });
    }
    var update = function () {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
      if (dots) {
        var idx = Math.round(track.scrollLeft / step());
        if (track.scrollLeft >= max) idx = items().length - 1;
        $$('button', dots).forEach(function (d, i) { d.setAttribute('aria-current', i === idx); });
      }
    };
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update); update();
  });

  /* ---------- До / после ---------- */
  document.addEventListener('input', function (e) {
    if (e.target.classList.contains('ba__range')) e.target.closest('.ba').style.setProperty('--pos', e.target.value + '%');
  });

  /* ---------- Lightbox ---------- */
  var lb, lbIndex = 0;
  function renderLb() {
    var p = lbItems[lbIndex];
    $('.lightbox__stage', lb).innerHTML = media(p.img, p.title, '1 / 1');
    bindMedia(lb);
    $('.lightbox__count', lb).textContent = (lbIndex + 1) + ' / ' + lbItems.length;
    $('.lightbox__caption', lb).textContent = p.title;
  }
  function openLb(i) {
    if (!lb) {
      lb = document.createElement('div'); lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Просмотр фото');
      lb.innerHTML = '<div class="lightbox__top"><span class="lightbox__count"></span><button class="icon-btn" type="button" data-lb-close aria-label="Закрыть">' + I.close + '</button></div>' +
        '<div class="lightbox__stage"></div><div class="lightbox__bottom"><button class="icon-btn" type="button" data-lb-prev aria-label="Предыдущее фото">' + I.left + '</button>' +
        '<span class="lightbox__caption" style="align-self:center;min-width:120px;text-align:center"></span><button class="icon-btn" type="button" data-lb-next aria-label="Следующее фото">' + I.right + '</button></div>';
      document.body.appendChild(lb);
      lb.addEventListener('click', function (e) {
        if (e.target.closest('[data-lb-close]') || e.target === lb || e.target.classList.contains('lightbox__stage')) closeLb();
        else if (e.target.closest('[data-lb-prev]')) moveLb(-1);
        else if (e.target.closest('[data-lb-next]')) moveLb(1);
      });
      var x0 = null;
      lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      lb.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) moveLb(dx < 0 ? 1 : -1); x0 = null; });
    }
    lbIndex = i; renderLb();
    lb.classList.add('is-open'); document.body.classList.add('modal-open');
    $('[data-lb-close]', lb).focus();
  }
  function moveLb(d) { lbIndex = (lbIndex + d + lbItems.length) % lbItems.length; renderLb(); }
  function closeLb() { lb.classList.remove('is-open'); document.body.classList.remove('modal-open'); }
  document.addEventListener('click', function (e) { var w = e.target.closest('[data-work]'); if (w) openLb(+w.getAttribute('data-work')); });
  document.addEventListener('keydown', function (e) {
    if (!lb || !lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') moveLb(-1); if (e.key === 'ArrowRight') moveLb(1);
  });

  /* ---------- Карточка мастера ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-master-info]'); if (!b) return;
    var m = masterById(b.getAttribute('data-master-info'));
    var works = window.PORTFOLIO.filter(function (p) { return m.cats.indexOf(p.cat) >= 0; }).slice(0, 4);
    var revs = window.REVIEWS.filter(function (r) { return r.master === m.id; });
    openModal({
      title: m.name, wide: true,
      html: '<div class="modal__body"><div class="master-modal">' + media(m.img, m.name, '4 / 5') + '<div>' +
        '<div class="tags">' + m.cats.map(function (c) { return '<span class="tag">' + catById(c).name + '</span>'; }).join('') + '<span class="tag">стаж ' + esc(m.exp) + '</span></div>' +
        '<p class="muted" style="margin-bottom:6px">' + esc(m.role) + '</p><p>' + esc(m.about) + '</p>' +
        '<h3 style="font-size:20px;margin:20px 0 0">Работы мастера</h3><div class="master-modal__works">' + works.map(function (p) { return media(p.img, p.title, '1 / 1'); }).join('') + '</div>' +
        (revs.length ? '<h3 style="font-size:20px;margin:20px 0 10px">Отзывы</h3>' + revs.map(function (r) { return '<blockquote>' + stars(r.rating) + '<div style="margin-top:6px">' + esc(r.text) + '</div><footer>' + esc(r.name) + ', ' + esc(r.service) + '</footer></blockquote>'; }).join('') : '') +
        '</div></div></div><div class="modal__foot"><button class="btn btn--primary btn--block" type="button" data-book data-master="' + m.id + '">Записаться к мастеру</button></div>'
    });
  });

  /* ---------- Форма «Перезвоните мне» ---------- */
  window.phoneMask = function (input) {
    input.addEventListener('input', function () {
      var d = input.value.replace(/\D/g, '');
      if (d[0] === '8' || d[0] === '7') d = d.slice(1);
      d = d.slice(0, 10);
      var out = '+7';
      if (d.length) out += ' (' + d.slice(0, 3);
      if (d.length >= 3) out += ')';
      if (d.length > 3) out += ' ' + d.slice(3, 6);
      if (d.length > 6) out += '-' + d.slice(6, 8);
      if (d.length > 8) out += '-' + d.slice(8, 10);
      input.value = d.length ? out : '';
    });
  };
  window.validateField = function (field, ok) { field.classList.toggle('is-invalid', !ok); return ok; };
  var cb = $('#callback-form');
  if (cb) {
    window.phoneMask($('#cb-phone'));
    cb.addEventListener('submit', function (e) {
      e.preventDefault();
      var okName = window.validateField($('#cb-name').closest('.field'), $('#cb-name').value.trim().length > 1);
      var okPhone = window.validateField($('#cb-phone').closest('.field'), $('#cb-phone').value.replace(/\D/g, '').length === 11);
      var consent = $('#cb-consent'); var okC = consent.checked; consent.closest('.check').classList.toggle('is-invalid', !okC);
      if (okName && okPhone && okC) {
        cb.innerHTML = '<div class="success"><div class="success__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>' +
          '<h3>Спасибо!</h3><p class="muted">Администратор перезвонит вам в течение 15 минут в рабочее время.</p></div>';
      }
    });
  }

  /* ---------- Появление при прокрутке ---------- */
  function reveal(root, instant) {
    var els = $$('.reveal:not(.is-visible)', root);
    if (instant || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-visible'); }); return; }
    var io = new IntersectionObserver(function (entries) { entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }
  bindMedia(document);
  reveal(document);
})();
