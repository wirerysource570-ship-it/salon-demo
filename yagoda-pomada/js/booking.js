/* =========================================================
   Демо онлайн-записи: услуга → мастер → дата и время →
   контакты → подтверждение. Данные никуда не отправляются.
   Для боевого сайта замените submit() на виджет CRM
   (YCLIENTS, Dikidi и т. п.) или отправку в Telegram-бот.
   ========================================================= */
(function () {
  'use strict';
  var U = window.UI, S = window.SALON, rub = U.rub, esc = U.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  var STEP_NAMES = ['Услуга', 'Мастер', 'Дата и время', 'Контакты', 'Готово'];
  var st, root;

  var svc = function (id) { return window.SERVICES.filter(function (s) { return s.id === id; })[0]; };
  var mst = function (id) { return window.MASTERS.filter(function (m) { return m.id === id; })[0]; };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var iso = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var toMin = function (t) { var p = t.split(':'); return +p[0] * 60 + +p[1]; };
  var toTime = function (m) { return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
  var dateText = function (s) { var d = new Date(s + 'T12:00:00'); return d.getDate() + ' ' + MONTHS[d.getMonth()] + ', ' + WD[d.getDay()]; };

  function chosen() { return st.services.map(svc); }
  function needCats() { var c = []; chosen().forEach(function (s) { if (c.indexOf(s.cat) < 0) c.push(s.cat); }); return c; }
  function eligible() { var need = needCats(); return window.MASTERS.filter(function (m) { return need.every(function (c) { return m.cats.indexOf(c) >= 0; }); }); }
  function totalDur() { return chosen().reduce(function (a, s) { return a + s.dur; }, 0); }
  function totalPrice(masterId) {
    var m = mst(masterId);
    return chosen().reduce(function (a, s) { return a + (m && m.level === 'top' ? s.priceTop : s.price); }, 0);
  }
  /* «Занятые» слоты стабильны: зависят от даты, времени и мастера */
  function busy(date, time, mid) { return U.hash(date + time + mid) % 10 < 3; }
  function free(date, time) {
    if (st.master && st.master !== 'any') return !busy(date, time, st.master);
    var list = eligible(); if (!list.length) return !busy(date, time, 'any');
    return list.some(function (m) { return !busy(date, time, m.id); });
  }
  function slotsFor(date) {
    var bh = S.bookingHours, out = [], now = new Date();
    var isToday = date === iso(now), nowMin = now.getHours() * 60 + now.getMinutes() + 60;
    for (var t = toMin(bh.from); t <= toMin(bh.to); t += bh.step) {
      if (isToday && t < nowMin) continue;
      var time = toTime(t); out.push({ time: time, free: free(date, time) });
    }
    return out;
  }
  function days() {
    var out = [], d = new Date();
    for (var i = 0; i < 14; i++) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i); out.push(x); }
    return out;
  }

  window.openBooking = function (opts) {
    opts = opts || {};
    st = { step: 1, services: [], cat: window.CATEGORIES[0].id, master: null, date: null, time: null, name: '', phone: '', comment: '', consent: false };
    if (opts.master && mst(opts.master)) { st.master = opts.master; st.fromMaster = opts.master; st.cat = mst(opts.master).cats[0]; }
    if (opts.service && svc(opts.service)) { st.services = [opts.service]; st.cat = svc(opts.service).cat; st.step = 2; }
    if (st.master && st.services.length && eligible().indexOf(mst(st.master)) < 0) st.master = null;
    if (st.master && st.services.length) st.step = 3;
    root = U.openModal({ title: 'Онлайн-запись' });
    render();
  };

  function go(step) { st.step = step; render(); var b = $('.modal__body', root); if (b) b.scrollTop = 0; }

  function render() {
    var html = '<div class="step-label">Шаг ' + Math.min(st.step, 5) + ' из 5 · ' + STEP_NAMES[st.step - 1] + '</div>' +
      '<div class="steps" aria-hidden="true">' + STEP_NAMES.map(function (_, i) { return '<span class="' + (i < st.step ? 'is-done' : '') + '"></span>'; }).join('') + '</div>';
    html += [null, step1, step2, step3, step4, step5][st.step]();
    root.innerHTML = html;
    U.bindMedia(root);
    bind();
  }

  function footer(left, nextLabel, enabled, back) {
    return '<div class="modal__foot">' + (back ? '<button class="back-btn" type="button" data-back>← Назад</button>' : '') +
      '<div class="total">' + (left || '') + '</div>' +
      '<button class="btn btn--primary" type="button" data-next' + (enabled ? '' : ' disabled') + '>' + nextLabel + '</button></div>';
  }
  function totalLine() {
    if (!st.services.length) return 'Выберите одну или несколько услуг';
    var m = st.master && st.master !== 'any' ? st.master : null;
    return st.services.length + ' ' + U.plural(st.services.length, 'услуга', 'услуги', 'услуг') + ' · ' + U.duration(totalDur()) +
      '<strong>' + (m ? '' : 'от ') + rub(totalPrice(m)) + '</strong>';
  }

  /* Шаг 1 — услуги */
  function step1() {
    var list = window.SERVICES.filter(function (s) { return s.cat === st.cat; });
    /* Запись из карточки мастера — только его направления */
    var fm = st.fromMaster && mst(st.fromMaster);
    var cats = window.CATEGORIES.filter(function (c) { return !fm || fm.cats.indexOf(c.id) >= 0; });
    return '<div class="modal__body">' + (fm ? '<p class="muted" style="margin:0 0 12px;font-size:14px">Запись к мастеру: <strong style="color:var(--text)">' + esc(fm.name) + '</strong></p>' : '') +
      '<div class="filters booking-cats" role="tablist" aria-label="Направления">' +
      cats.map(function (c) {
        var n = st.services.filter(function (id) { return svc(id).cat === c.id; }).length;
        return '<button class="chip" type="button" role="tab" data-cat="' + c.id + '" aria-selected="' + (c.id === st.cat) + '">' + c.name + (n ? ' · ' + n : '') + '</button>';
      }).join('') + '</div><div class="option-list">' +
      list.map(function (s) {
        var on = st.services.indexOf(s.id) >= 0;
        return '<button class="option' + (on ? ' is-selected' : '') + '" type="button" data-svc="' + s.id + '" aria-pressed="' + on + '"><span class="option__mark"></span>' +
          '<span><span class="option__name">' + esc(s.name) + '</span><br><span class="option__meta">' + U.duration(s.dur) + '</span></span>' +
          '<span class="option__price">от ' + rub(s.price) + '</span></button>';
      }).join('') + '</div></div>' + footer(totalLine(), 'Далее', st.services.length > 0, false);
  }

  /* Шаг 2 — мастер */
  function step2() {
    var list = eligible();
    var anyMeta = list.length ? 'Подберём мастера на удобное время' : 'Подберём мастеров на каждую услугу';
    var opt = function (id, name, meta, price, avatar, extra) {
      var on = st.master === id;
      return '<button class="option option--radio' + (extra || '') + (on ? ' is-selected' : '') + '" type="button" data-mst="' + id + '" aria-pressed="' + on + '">' +
        '<span class="option__avatar">' + avatar + '</span><span><span class="option__name">' + esc(name) + '</span><br><span class="option__meta">' + esc(meta) + '</span></span>' +
        '<span class="option__price">' + price + '</span></button>';
    };
    return '<div class="modal__body"><div class="option-list">' +
      opt('any', 'Любой свободный мастер', anyMeta, 'от ' + rub(totalPrice(null)), '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5"/><path d="M16 5.2a3 3 0 0 1 0 5.6M18.5 14.8c1.3.9 2.2 2.6 2.5 5.2"/></svg>', ' option--any') +
      list.map(function (m) { return opt(m.id, m.name, m.role + (m.level === 'top' ? ' · топ-мастер' : ''), rub(totalPrice(m.id)), U.media(m.img, m.name, '1 / 1')); }).join('') +
      '</div></div>' + footer(totalLine(), 'Далее', !!st.master, true);
  }

  /* Шаг 3 — дата и время */
  function step3() {
    var ds = days();
    if (!st.date) { for (var i = 0; i < ds.length; i++) { if (slotsFor(iso(ds[i])).some(function (s) { return s.free; })) { st.date = iso(ds[i]); break; } } }
    var slots = st.date ? slotsFor(st.date) : [];
    var freeCount = slots.filter(function (s) { return s.free; }).length;
    return '<div class="modal__body"><div class="days" role="listbox" aria-label="Дата">' + ds.map(function (d) {
      var v = iso(d), has = slotsFor(v).some(function (s) { return s.free; });
      return '<button class="day' + (v === st.date ? ' is-selected' : '') + (has ? '' : ' is-off') + '" type="button" data-day="' + v + '" aria-label="' + dateText(v) + '"' + (has ? '' : ' disabled') + '><small>' + WD[d.getDay()] + '</small><strong>' + d.getDate() + '</strong></button>';
    }).join('') + '</div>' +
      (st.date ? '<p class="slots-title">' + dateText(st.date) + ' · свободно ' + freeCount + ' ' + U.plural(freeCount, 'окно', 'окна', 'окон') + '</p>' : '') +
      (slots.length ? '<div class="slots">' + slots.map(function (s) {
        return '<button class="slot' + (s.time === st.time ? ' is-selected' : '') + '" type="button" data-time="' + s.time + '"' + (s.free ? '' : ' disabled aria-label="' + s.time + ', занято"') + '>' + s.time + '</button>';
      }).join('') + '</div>' : '<div class="empty">На этот день свободного времени нет</div>') +
      '</div>' + footer(st.time ? dateText(st.date) + '<strong>' + st.time + '</strong>' : 'Выберите время', 'Далее', !!st.time, true);
  }

  /* Шаг 4 — контакты */
  function step4() {
    return '<div class="modal__body"><form class="form" id="bk-form" novalidate>' +
      '<div class="field"><label for="bk-name">Ваше имя</label><input class="input" id="bk-name" autocomplete="given-name" value="' + esc(st.name) + '"><span class="field__error">Укажите имя</span></div>' +
      '<div class="field"><label for="bk-phone">Телефон</label><input class="input" id="bk-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" value="' + esc(st.phone) + '"><span class="field__error">Введите номер полностью</span></div>' +
      '<div class="field"><label for="bk-comment">Комментарий <span class="muted" style="font-weight:400">— необязательно</span></label><textarea class="input" id="bk-comment" placeholder="Например, длина волос или пожелания">' + esc(st.comment) + '</textarea></div>' +
      '<label class="check"><input type="checkbox" id="bk-consent"' + (st.consent ? ' checked' : '') + '><span>Соглашаюсь на обработку персональных данных и с <a href="#" data-demo-link data-demo-text="Здесь будет политика конфиденциальности">политикой конфиденциальности</a></span></label>' +
      '</form></div>' + footer(totalLine(), 'Записаться', true, true);
  }

  /* Шаг 5 — подтверждение */
  function step5() {
    var m = st.master && st.master !== 'any' ? mst(st.master) : null;
    return '<div class="modal__body"><div class="success"><div class="success__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>' +
      '<h3>' + esc(st.name) + ', вы записаны!</h3><p class="muted">Мы отправим напоминание за день до визита. Если планы изменятся — просто напишите нам.</p></div>' +
      '<ul class="summary">' +
      '<li><span>' + (st.services.length > 1 ? 'Услуги' : 'Услуга') + '</span><span>' + chosen().map(function (s) { return esc(s.name); }).join('<br>') + '</span></li>' +
      '<li><span>Мастер</span><span>' + (m ? esc(m.name) : 'Подберём свободного') + '</span></li>' +
      '<li><span>Когда</span><span>' + dateText(st.date) + ', ' + st.time + '</span></li>' +
      '<li><span>Где</span><span>' + esc(S.address) + '</span></li>' +
      '<li><span>Итого</span><span>' + (m ? '' : 'от ') + rub(totalPrice(m ? m.id : null)) + '</span></li></ul></div>' +
      '<div class="modal__foot"><button class="btn btn--ghost" type="button" data-ics style="flex:1">В календарь</button><button class="btn btn--primary" type="button" data-close style="flex:1">Готово</button></div>';
  }

  function ics() {
    var start = st.date.replace(/-/g, '') + 'T' + st.time.replace(':', '') + '00';
    var endMin = toMin(st.time) + totalDur();
    var end = st.date.replace(/-/g, '') + 'T' + pad(Math.floor(endMin / 60) % 24) + pad(endMin % 60) + '00';
    var text = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//' + S.name + '//RU', 'BEGIN:VEVENT', 'UID:' + Date.now() + '@demo',
      'DTSTART:' + start, 'DTEND:' + end, 'SUMMARY:' + S.name + ': ' + chosen().map(function (s) { return s.name; }).join(', '),
      'LOCATION:' + S.address, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/calendar' }));
    a.download = 'zapis-' + st.date + '.ics';
    document.body.appendChild(a); a.click(); a.remove();
  }

  function bind() {
    root.onclick = function (e) {
      var t;
      if ((t = e.target.closest('[data-cat]'))) { st.cat = t.getAttribute('data-cat'); render(); return; }
      if ((t = e.target.closest('[data-svc]'))) {
        var id = t.getAttribute('data-svc'), i = st.services.indexOf(id);
        if (i >= 0) st.services.splice(i, 1); else st.services.push(id);
        if (st.master && st.master !== 'any' && eligible().indexOf(mst(st.master)) < 0) st.master = null;
        st.time = null; render(); return;
      }
      if ((t = e.target.closest('[data-mst]'))) { st.master = t.getAttribute('data-mst'); st.date = null; st.time = null; render(); return; }
      if ((t = e.target.closest('[data-day]'))) { st.date = t.getAttribute('data-day'); st.time = null; render(); return; }
      if ((t = e.target.closest('[data-time]'))) { st.time = t.getAttribute('data-time'); render(); return; }
      if (e.target.closest('[data-back]')) { saveForm(); go(st.step - 1); return; }
      if (e.target.closest('[data-ics]')) { ics(); return; }
      if (e.target.closest('[data-next]')) {
        if (st.step === 4) { submit(); return; }
        if (st.step === 1 && st.master && st.master !== 'any' && eligible().indexOf(mst(st.master)) >= 0) { go(2); return; }
        go(st.step + 1);
      }
    };
    var ph = $('#bk-phone', root);
    if (ph) window.phoneMask(ph);
    var selDay = $('.day.is-selected', root);
    if (selDay) {
      var strip = selDay.parentNode, x = selDay.offsetLeft - strip.offsetLeft;
      if (x + selDay.offsetWidth > strip.clientWidth) strip.scrollLeft = x - 8;
    }
  }
  function saveForm() {
    if (st.step !== 4) return;
    st.name = $('#bk-name', root).value; st.phone = $('#bk-phone', root).value; st.comment = $('#bk-comment', root).value; st.consent = $('#bk-consent', root).checked;
  }
  function submit() {
    saveForm();
    var okN = window.validateField($('#bk-name', root).closest('.field'), st.name.trim().length > 1);
    var okP = window.validateField($('#bk-phone', root).closest('.field'), st.phone.replace(/\D/g, '').length === 11);
    $('#bk-consent', root).closest('.check').classList.toggle('is-invalid', !st.consent);
    if (!(okN && okP && st.consent)) { var bad = $('.is-invalid input, .is-invalid textarea', root); if (bad) bad.focus(); return; }
    st.name = st.name.trim();
    go(5);
  }
})();
