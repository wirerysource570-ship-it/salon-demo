/* Демо для «Перманент Хабаровск, школа-студия» — собрано из карточки 2ГИС https://2gis.ru/firm/70000001039458327 */
Object.assign(window.SALON, {
  "name": "Перманент Хабаровск",
  "kind": "школа-студия",
  "phone": "+7 (909) 804-66-55",
  "phoneHref": "+79098046655",
  "email": "",
  "address": "Хабаровск, улица Гайдара, 12",
  "howToGet": "",
  "hours": [
    {
      "days": "Пн–Вс",
      "time": "10:00–20:00"
    }
  ],
  "bookingHours": {
    "from": "10:00",
    "to": "19:00",
    "step": 30
  },
  "map": {
    "lon": 135.073203,
    "lat": 48.485985,
    "zoom": 17
  },
  "social": [
    {
      "id": "wa",
      "label": "WhatsApp"
    },
    {
      "id": "tg",
      "label": "Telegram"
    }
  ],
  "rating": {
    "value": 4.9,
    "count": 101
  },
  "cats": [
    "brows",
    "pmu"
  ],
  "theme": {
    "accent": "#c4a28a",
    "accent-dark": "#8a6a55",
    "accent-darker": "#745746",
    "accent-light": "#f1e6dd",
    "bg-soft": "#faf6f2"
  },
  "eyebrow": "Школа-студия в Хабаровске",
  "heroText": "Брови и ресницы, перманентный макияж в Хабаровске. Опытные мастера, профессиональная косметика и запись онлайн за одну минуту.",
  "stats": [
    {
      "value": "4,9",
      "label": "рейтинг в 2ГИС"
    },
    {
      "value": "101",
      "label": "отзыв в 2ГИС"
    },
    {
      "value": "2",
      "label": "направления"
    },
    {
      "value": "7+",
      "label": "услуг"
    }
  ]
});
window.CATEGORIES.push({ id: 'pmu', name: 'Перманентный макияж', short: 'Брови, губы и межресничка — до 2 лет без ежедневного макияжа', img: 'img/work-14.webp' });
window.SERVICES.push(
  { id: 'p1', cat: 'pmu', name: 'Перманент бровей', desc: 'Пудровое напыление или волосковая техника', dur: 150, price: 9000, priceTop: 12000 },
  { id: 'p2', cat: 'pmu', name: 'Перманент губ', desc: 'Акварельная техника, естественный оттенок', dur: 150, price: 9000, priceTop: 12000 },
  { id: 'p3', cat: 'pmu', name: 'Межресничная стрелка', desc: 'Визуально густые ресницы без макияжа', dur: 120, price: 7000, priceTop: 9000 }
);
window.MASTERS.forEach(function (m) { if (m.id === 'dasha' || m.id === 'alina') m.cats.push('pmu'); });
window.PORTFOLIO.push({ id: 'p19', cat: 'pmu', title: 'Пудровые брови', img: 'img/work-03.webp' }, { id: 'p20', cat: 'pmu', title: 'Перманент губ', img: 'img/work-04.webp' });
window.REVIEWS.push({ cat: 'pmu', name: 'Ирина', rating: 5, service: 'Перманент бровей', master: 'dasha', text: 'Брови выглядят как свои, только идеальные. Утром больше не трачу время на макияж.' });
