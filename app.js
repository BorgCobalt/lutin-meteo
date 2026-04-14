/* ============================================
   LE LUTIN METEO - App principale
   ============================================ */

// --- CONFIG ---
const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const NOTIF_HOUR_KEY = 'lutin_notif_hour';
const NOTIF_MIN_KEY = 'lutin_notif_min';
const LOCATION_KEY = 'lutin_location';

// --- LUTIN TEMPERATURE PERCEPTION ---
const LUTIN_FEELINGS = [
  {
    max: 5,
    label: 'Glacial Absolu',
    emoji: '🥶',
    quote: 'Le Lutin grelotte... Il faut TOUT sortir du placard !',
    color: '#5b7fa5'
  },
  {
    max: 10,
    label: 'Glacial',
    emoji: '❄️',
    quote: 'Le Lutin a besoin de son armure de chaleur !',
    color: '#6a8fb5'
  },
  {
    max: 15,
    label: 'Froid',
    emoji: '🍂',
    quote: 'Le Lutin frissonne... des couches, des couches !',
    color: '#8b7355'
  },
  {
    max: 20,
    label: 'Frais',
    emoji: '🌿',
    quote: 'Le Lutin veut rester au chaud, mais avec style.',
    color: '#5a8a5a'
  },
  {
    max: 25,
    label: 'Presque Parfait',
    emoji: '🌸',
    quote: 'Le Lutin commence a sourire... presque le bonheur.',
    color: '#c07a8a'
  },
  {
    max: 30,
    label: 'Perfection',
    emoji: '☀️',
    quote: 'Le Lutin est au paradis ! Temperature ideale.',
    color: '#c9a84c'
  },
  {
    max: 99,
    label: 'Fournaise',
    emoji: '🔥',
    quote: 'Meme le Lutin frileux trouve qu\'il fait chaud !',
    color: '#c25a3a'
  }
];

// --- WARDROBE & OUTFIT ENGINE ---
const OUTFITS = {
  glacial_absolu: {
    layers: [
      { icon: '👕', name: 'Top', detail: 'Sous-vetement du haut, toujours', layer: 'Base' },
      { icon: '🧶', name: 'Pull-over bien doux', detail: 'Le plus chaud et moelleux', layer: 'Milieu' },
      { icon: '🧥', name: 'Manteau chaud', detail: 'Le gros manteau d\'hiver', layer: 'Dessus' },
      { icon: '👖', name: 'Pantalon en coton epais', detail: 'Ou jean moulant avec collants', layer: 'Bas' },
      { icon: '👢', name: 'Bottes chaudes', detail: 'Bien fermees, bien isolees', layer: 'Pieds' }
    ],
    accessories: [
      { icon: '🧣', name: 'Echarpe' },
      { icon: '🧤', name: 'Gants' },
      { icon: '🎩', name: 'Bonnet' }
    ]
  },
  glacial: {
    layers: [
      { icon: '👕', name: 'Top', detail: 'Sous-vetement du haut', layer: 'Base' },
      { icon: '🧶', name: 'Pull-over doux', detail: 'Chaud et elegant', layer: 'Milieu' },
      { icon: '🧥', name: 'Manteau', detail: 'Manteau bien chaud', layer: 'Dessus' },
      { icon: '👖', name: 'Jean moulant', detail: 'Ou pantalon en coton chaud', layer: 'Bas' },
      { icon: '👢', name: 'Chaussures fermees', detail: 'Chaudes et elegantes', layer: 'Pieds' }
    ],
    accessories: [
      { icon: '🧣', name: 'Echarpe' },
      { icon: '🧤', name: 'Gants' }
    ]
  },
  froid: {
    layers: [
      { icon: '👕', name: 'Top', detail: 'Sous-vetement du haut', layer: 'Base' },
      { icon: '🧶', name: 'Pull-over doux', detail: 'Moelleux et chic', layer: 'Milieu' },
      { icon: '🧥', name: 'Veste chaude', detail: 'Veste elegante ou manteau leger', layer: 'Dessus' },
      { icon: '👖', name: 'Pantalon en coton', detail: 'Ou jean moulant', layer: 'Bas' },
      { icon: '👟', name: 'Chaussures fermees', detail: 'Confortables et chaudes', layer: 'Pieds' }
    ],
    accessories: [
      { icon: '🧣', name: 'Echarpe legere' }
    ]
  },
  frais: {
    layers: [
      { icon: '👕', name: 'Top', detail: 'Sous-vetement du haut', layer: 'Base' },
      { icon: '👔', name: 'Chemise ou pull leger', detail: 'Chemise elegante ou pull fin', layer: 'Milieu' },
      { icon: '🧥', name: 'Veste', detail: 'Veste legere pour les couches', layer: 'Dessus' },
      { icon: '👖', name: 'Jean moulant ou jupe', detail: 'Avec collants si jupe', layer: 'Bas' },
      { icon: '👟', name: 'Chaussures de saison', detail: 'Elegantes et confortables', layer: 'Pieds' }
    ],
    accessories: []
  },
  presque_parfait: {
    layers: [
      { icon: '👕', name: 'Top', detail: 'Sous-vetement du haut', layer: 'Base' },
      { icon: '👔', name: 'Chemise legere', detail: 'Ou pull-over fin et doux', layer: 'Haut' },
      { icon: '👖', name: 'Jean moulant ou jupe', detail: 'Pantalon coton ou jupe elegante', layer: 'Bas' },
      { icon: '👟', name: 'Chaussures legeres', detail: 'Ou sandales si beau temps', layer: 'Pieds' }
    ],
    accessories: [
      { icon: '🧥', name: 'Petite veste (au cas ou)' }
    ]
  },
  perfection: {
    layers: [
      { icon: '👕', name: 'Top leger', detail: 'Sous-vetement du haut', layer: 'Base' },
      { icon: '👗', name: 'Robe ou chemise legere', detail: 'Robe elegante ou shorty + haut', layer: 'Haut' },
      { icon: '🩳', name: 'Shorty ou jupe', detail: 'Si pas de robe, shorty chic', layer: 'Bas' },
      { icon: '🩴', name: 'Sandales', detail: 'Pieds libres, bonheur !', layer: 'Pieds' }
    ],
    accessories: []
  },
  fournaise: {
    layers: [
      { icon: '👕', name: 'Top le plus leger', detail: 'Le minimum, avec grace', layer: 'Base' },
      { icon: '👗', name: 'Robe legere', detail: 'Ou shorty + top aere', layer: 'Haut' },
      { icon: '🩴', name: 'Sandales', detail: 'Aeration maximale', layer: 'Pieds' }
    ],
    accessories: [
      { icon: '🕶️', name: 'Lunettes de soleil' },
      { icon: '💧', name: 'Bouteille d\'eau !' }
    ]
  }
};

const OUTFIT_KEYS = [
  'glacial_absolu', 'glacial', 'froid', 'frais',
  'presque_parfait', 'perfection', 'fournaise'
];

// Rain/wind modifiers
const RAIN_ITEMS = [
  { icon: '🌂', name: 'Parapluie' },
  { icon: '🧥', name: 'Impermeable' }
];

const WIND_ITEMS = [
  { icon: '💨', name: 'Coupe-vent' }
];

// --- WEATHER CODE MAPPING ---
function weatherCodeToInfo(code) {
  const map = {
    0: { icon: '☀️', desc: 'Ciel degage' },
    1: { icon: '🌤️', desc: 'Peu nuageux' },
    2: { icon: '⛅', desc: 'Partiellement nuageux' },
    3: { icon: '☁️', desc: 'Couvert' },
    45: { icon: '🌫️', desc: 'Brouillard' },
    48: { icon: '🌫️', desc: 'Brouillard givrant' },
    51: { icon: '🌦️', desc: 'Bruine legere' },
    53: { icon: '🌦️', desc: 'Bruine' },
    55: { icon: '🌧️', desc: 'Bruine dense' },
    61: { icon: '🌧️', desc: 'Pluie legere' },
    63: { icon: '🌧️', desc: 'Pluie' },
    65: { icon: '🌧️', desc: 'Forte pluie' },
    66: { icon: '🌧️', desc: 'Pluie verglacante' },
    67: { icon: '🌧️', desc: 'Pluie verglacante forte' },
    71: { icon: '🌨️', desc: 'Neige legere' },
    73: { icon: '🌨️', desc: 'Neige' },
    75: { icon: '❄️', desc: 'Forte neige' },
    77: { icon: '🌨️', desc: 'Grains de neige' },
    80: { icon: '🌦️', desc: 'Averses legeres' },
    81: { icon: '🌧️', desc: 'Averses' },
    82: { icon: '⛈️', desc: 'Averses violentes' },
    85: { icon: '🌨️', desc: 'Averses de neige' },
    86: { icon: '🌨️', desc: 'Fortes averses de neige' },
    95: { icon: '⛈️', desc: 'Orage' },
    96: { icon: '⛈️', desc: 'Orage avec grele' },
    99: { icon: '⛈️', desc: 'Orage violent avec grele' }
  };
  return map[code] || { icon: '🌤️', desc: 'Variable' };
}

function isRainy(code) {
  return [51,53,55,61,63,65,66,67,80,81,82,95,96,99].includes(code);
}

function isSnowy(code) {
  return [71,73,75,77,85,86].includes(code);
}

// --- LUTIN ENGINE ---
function getLutinFeeling(temp) {
  for (const f of LUTIN_FEELINGS) {
    if (temp < f.max) return f;
  }
  return LUTIN_FEELINGS[LUTIN_FEELINGS.length - 1];
}

function getOutfitKey(temp) {
  if (temp < 5) return 'glacial_absolu';
  if (temp < 10) return 'glacial';
  if (temp < 15) return 'froid';
  if (temp < 20) return 'frais';
  if (temp < 25) return 'presque_parfait';
  if (temp < 30) return 'perfection';
  return 'fournaise';
}

function buildRecommendation(temp, weatherCode, windSpeed) {
  const key = getOutfitKey(temp);
  const outfit = OUTFITS[key];
  const feeling = getLutinFeeling(temp);
  const rain = isRainy(weatherCode);
  const snow = isSnowy(weatherCode);
  const windy = windSpeed > 30;

  const accessories = [...outfit.accessories];
  if (rain) accessories.push(...RAIN_ITEMS);
  if (windy) accessories.push(...WIND_ITEMS);
  if (snow) accessories.push({ icon: '🥾', name: 'Bottes impermeables' });

  return {
    feeling,
    layers: outfit.layers,
    accessories,
    rain,
    snow,
    windy
  };
}

// --- GEOLOCATION ---
async function getLocation() {
  const saved = localStorage.getItem(LOCATION_KEY);
  if (saved) return JSON.parse(saved);

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalisation non disponible'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        localStorage.setItem(LOCATION_KEY, JSON.stringify(loc));
        resolve(loc);
      },
      err => reject(err),
      { enableHighAccuracy: false, timeout: 15000 }
    );
  });
}

// --- WEATHER API ---
async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
    hourly: 'temperature_2m,weather_code,wind_speed_10m',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max',
    timezone: 'auto',
    forecast_days: 2
  });

  const res = await fetch(`${OPEN_METEO_URL}?${params}`);
  if (!res.ok) throw new Error('Erreur API meteo');
  return res.json();
}

async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=fr`);
    const data = await res.json();
    return data.address?.city || data.address?.town || data.address?.village || 'Foret enchantee';
  } catch {
    return 'Foret enchantee';
  }
}

// --- RENDERING ---
function renderWeatherSection(data, cityName) {
  const current = data.current;
  const temp = Math.round(current.temperature_2m);
  const apparent = Math.round(current.apparent_temperature);
  const humidity = current.relative_humidity_2m;
  const wind = Math.round(current.wind_speed_10m);
  const code = current.weather_code;
  const wInfo = weatherCodeToInfo(code);
  const feeling = getLutinFeeling(temp);

  return `
    <div class="card">
      <div class="card-title"><span class="icon">🌍</span> ${cityName} - Maintenant</div>
      <div class="weather-main">
        <div class="weather-icon">${wInfo.icon}</div>
        <div class="weather-info">
          <div class="weather-temp">${temp}<span class="unit">°C</span></div>
          <div class="weather-desc">${wInfo.desc}</div>
          <div class="weather-feeling" style="background:${feeling.color}">${feeling.emoji} ${feeling.label}</div>
        </div>
      </div>
      <div class="weather-details">
        <div class="weather-detail">
          <span class="detail-icon">🌡️</span>
          <div class="detail-value">${apparent}°</div>
          <div class="detail-label">Ressenti</div>
        </div>
        <div class="weather-detail">
          <span class="detail-icon">💧</span>
          <div class="detail-value">${humidity}%</div>
          <div class="detail-label">Humidite</div>
        </div>
        <div class="weather-detail">
          <span class="detail-icon">💨</span>
          <div class="detail-value">${wind} km/h</div>
          <div class="detail-label">Vent</div>
        </div>
      </div>
    </div>
  `;
}

function renderLutinFeeling(temp) {
  const feeling = getLutinFeeling(temp);
  return `
    <div class="lutin-feeling">
      <span class="feeling-emoji">${feeling.emoji}</span>
      <div class="feeling-text">"${feeling.quote}"</div>
    </div>
  `;
}

function renderOutfit(rec, label) {
  let html = `
    <div class="card">
      <div class="card-title"><span class="icon">👔</span> Tenue ${label}</div>
      <div class="outfit-section">
        <div class="outfit-occasion">SUGGESTION DU LUTIN</div>
        <div class="outfit-items">
  `;

  for (const item of rec.layers) {
    html += `
      <div class="outfit-item">
        <div class="item-icon">${item.icon}</div>
        <div class="item-info">
          <div class="item-name">${item.name}</div>
          <div class="item-detail">${item.detail}</div>
        </div>
        <div class="item-layer">${item.layer}</div>
      </div>
    `;
  }

  html += '</div>';

  if (rec.accessories.length > 0) {
    html += '<div class="accessories">';
    for (const a of rec.accessories) {
      html += `<div class="accessory-tag">${a.icon} ${a.name}</div>`;
    }
    html += '</div>';
  }

  if (rec.rain) {
    html += '<div style="margin-top:12px;padding:8px 12px;background:rgba(90,130,180,0.1);border-radius:10px;font-size:0.85rem;">🌧️ <strong>Pluie prevue !</strong> Le Lutin doit penser au parapluie.</div>';
  }
  if (rec.snow) {
    html += '<div style="margin-top:8px;padding:8px 12px;background:rgba(180,200,220,0.15);border-radius:10px;font-size:0.85rem;">🌨️ <strong>Neige !</strong> Bottes impermeables et prudence.</div>';
  }

  html += '</div></div>';
  return html;
}

function renderHourlyForecast(data) {
  const now = new Date();
  const hourly = data.hourly;
  let html = '<div class="hourly-scroll">';

  let count = 0;
  for (let i = 0; i < hourly.time.length && count < 12; i++) {
    const dt = new Date(hourly.time[i]);
    if (dt <= now) continue;
    const h = dt.getHours().toString().padStart(2, '0') + 'h';
    const temp = Math.round(hourly.temperature_2m[i]);
    const wInfo = weatherCodeToInfo(hourly.weather_code[i]);
    html += `
      <div class="hourly-item">
        <div class="hour">${h}</div>
        <span class="h-icon">${wInfo.icon}</span>
        <div class="h-temp">${temp}°</div>
      </div>
    `;
    count++;
  }

  html += '</div>';
  return html;
}

function renderTomorrow(data) {
  const daily = data.daily;
  const tomorrowMax = Math.round(daily.temperature_2m_max[1]);
  const tomorrowMin = Math.round(daily.temperature_2m_min[1]);
  const tomorrowCode = daily.weather_code[1];
  const tomorrowWind = Math.round(daily.wind_speed_10m_max[1]);
  const wInfo = weatherCodeToInfo(tomorrowCode);
  const avgTemp = Math.round((tomorrowMax + tomorrowMin) / 2);
  const rec = buildRecommendation(avgTemp, tomorrowCode, tomorrowWind);
  const feeling = getLutinFeeling(avgTemp);

  let html = `
    <div class="card">
      <div class="card-title"><span class="icon">🔮</span> Demain</div>
      <div class="tomorrow-header">
        <div class="tomorrow-weather">
          <div class="tomorrow-icon">${wInfo.icon}</div>
          <div class="tomorrow-temps">
            <div class="temp-max">${tomorrowMax}°</div>
            <div class="temp-min">${tomorrowMin}° min</div>
          </div>
        </div>
        <div class="weather-feeling" style="background:${feeling.color}">${feeling.emoji} ${feeling.label}</div>
      </div>
      <div class="lutin-feeling" style="margin-bottom:0">
        <span class="feeling-emoji">${feeling.emoji}</span>
        <div class="feeling-text">"${feeling.quote}"</div>
      </div>
    </div>
  `;

  html += renderOutfit(rec, 'pour Demain');
  return html;
}

function renderNotifCard() {
  const hour = localStorage.getItem(NOTIF_HOUR_KEY) || '20';
  const min = localStorage.getItem(NOTIF_MIN_KEY) || '00';
  const timeVal = `${hour.padStart(2,'0')}:${min.padStart(2,'0')}`;

  return `
    <div class="card">
      <div class="card-title"><span class="icon">🔔</span> Rappel du soir</div>
      <div class="notif-card">
        <div class="notif-text">
          <h3>Notification quotidienne</h3>
          <p>Le Lutin te rappellera de preparer ta tenue pour demain !</p>
        </div>
      </div>
      <div class="time-picker-row">
        <input type="time" id="notif-time" value="${timeVal}">
        <button class="btn btn-small" onclick="saveNotifTime()">Enregistrer</button>
        <button class="btn btn-small btn-golden" onclick="requestNotifPermission()">Activer</button>
      </div>
    </div>
  `;
}

// --- NOTIFICATIONS ---
async function requestNotifPermission() {
  if (!('Notification' in window)) {
    alert('Les notifications ne sont pas supportees sur ce navigateur.');
    return;
  }
  const perm = await Notification.requestPermission();
  if (perm === 'granted') {
    new Notification('Le Lutin Meteo 🍄', {
      body: 'Les notifications sont activees ! Le Lutin te rappellera chaque soir.',
      icon: 'assets/icon-192.png'
    });
    scheduleNotification();
  }
}

function saveNotifTime() {
  const input = document.getElementById('notif-time');
  if (!input) return;
  const [h, m] = input.value.split(':');
  localStorage.setItem(NOTIF_HOUR_KEY, h);
  localStorage.setItem(NOTIF_MIN_KEY, m);
  scheduleNotification();
  alert(`Rappel programme a ${h}h${m} !`);
}

function scheduleNotification() {
  if (window._notifTimer) clearTimeout(window._notifTimer);

  const hour = parseInt(localStorage.getItem(NOTIF_HOUR_KEY) || '20');
  const min = parseInt(localStorage.getItem(NOTIF_MIN_KEY) || '00');

  const now = new Date();
  const target = new Date();
  target.setHours(hour, min, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);

  const delay = target - now;
  window._notifTimer = setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification('Le Lutin Meteo 🍄', {
        body: 'C\'est l\'heure de preparer ta tenue pour demain ! Ouvre l\'app pour voir les conseils.',
        icon: 'assets/icon-192.png',
        tag: 'lutin-evening'
      });
    }
    scheduleNotification();
  }, delay);
}

// --- MUSHROOM DECORATIONS ---
function createMushroomSVG(color1, color2, size) {
  return `<svg class="mushroom-svg" width="${size}" height="${size}" viewBox="0 0 60 70">
    <ellipse cx="30" cy="30" rx="25" ry="20" fill="${color1}" />
    <ellipse cx="30" cy="30" rx="25" ry="20" fill="url(#mshade)" opacity="0.3"/>
    <circle cx="20" cy="24" r="4" fill="white" opacity="0.7"/>
    <circle cx="35" cy="20" r="3" fill="white" opacity="0.6"/>
    <circle cx="28" cy="32" r="2.5" fill="white" opacity="0.5"/>
    <rect x="25" y="38" width="10" height="22" rx="4" fill="${color2}"/>
    <ellipse cx="30" cy="60" rx="14" ry="4" fill="#3d5a3a" opacity="0.3"/>
  </svg>`;
}

function addDecorations() {
  const container = document.querySelector('.forest-bg');
  if (!container) return;

  // Fireflies
  for (let i = 0; i < 12; i++) {
    const fly = document.createElement('div');
    fly.className = 'firefly';
    fly.style.left = Math.random() * 100 + '%';
    fly.style.top = Math.random() * 80 + '%';
    fly.style.animationDelay = (Math.random() * 6) + 's';
    fly.style.animationDuration = (4 + Math.random() * 4) + 's';
    container.appendChild(fly);
  }

  // Mushrooms on sides
  const mushPositions = [
    { left: '2%', bottom: '15%', size: 40, rot: -10, c1: '#c25a3a', c2: '#e8c9a0' },
    { right: '3%', bottom: '25%', size: 35, rot: 8, c1: '#8b6914', c2: '#d4a574' },
    { left: '5%', bottom: '45%', size: 28, rot: -5, c1: '#c07a8a', c2: '#e8c9a0' },
    { right: '1%', bottom: '60%', size: 32, rot: 12, c1: '#c25a3a', c2: '#d4a574' },
  ];

  for (const p of mushPositions) {
    const div = document.createElement('div');
    div.className = 'mushroom-deco';
    div.style.position = 'fixed';
    if (p.left) div.style.left = p.left;
    if (p.right) div.style.right = p.right;
    div.style.bottom = p.bottom;
    div.style.transform = `rotate(${p.rot}deg)`;
    div.innerHTML = createMushroomSVG(p.c1, p.c2, p.size);
    container.appendChild(div);
  }
}

// --- MAIN APP ---
async function init() {
  const app = document.getElementById('app');
  const loading = document.getElementById('loading');

  addDecorations();

  try {
    const loc = await getLocation();
    const [weather, city] = await Promise.all([
      fetchWeather(loc.lat, loc.lon),
      reverseGeocode(loc.lat, loc.lon)
    ]);

    const currentTemp = Math.round(weather.current.temperature_2m);
    const currentCode = weather.current.weather_code;
    const currentWind = Math.round(weather.current.wind_speed_10m);
    const rec = buildRecommendation(currentTemp, currentCode, currentWind);

    let html = '';

    // Refresh bar
    const now = new Date();
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    html += `<div class="refresh-bar">
      <div class="last-update">Mis a jour a ${timeStr}</div>
      <button class="btn btn-small" onclick="location.reload()">🔄 Actualiser</button>
    </div>`;

    // Current weather
    html += renderWeatherSection(weather, city);

    // Lutin feeling
    html += renderLutinFeeling(currentTemp);

    // Hourly forecast
    html += `<div class="card">
      <div class="card-title"><span class="icon">🕐</span> Heures a venir</div>
      ${renderHourlyForecast(weather)}
    </div>`;

    // Today outfit
    html += renderOutfit(rec, 'Aujourd\'hui');

    // Tomorrow
    html += renderTomorrow(weather);

    // Notification
    html += renderNotifCard();

    // Footer
    html += `<div style="text-align:center;padding:20px 0 40px;color:rgba(255,248,240,0.4);font-size:0.75rem;font-family:'Playfair Display',serif;font-style:italic;">
      🍄 Fait avec amour pour le Lutin 🍄
    </div>`;

    app.innerHTML = html;
    loading.classList.add('hidden');

    // Schedule notification if permission granted
    if (Notification.permission === 'granted') {
      scheduleNotification();
    }

  } catch (err) {
    console.error(err);
    loading.classList.add('hidden');
    app.innerHTML = `
      <div class="error-msg">
        <div class="error-icon">🍄</div>
        <h2>Oh non !</h2>
        <p>${err.message || 'Le Lutin n\'arrive pas a trouver la meteo...'}</p>
        <p>Verifie que la geolocalisation est activee et reessaie.</p>
        <button class="btn" onclick="localStorage.removeItem('${LOCATION_KEY}');location.reload()">🔄 Reessayer</button>
      </div>
    `;
  }
}

// Register service worker (only works over HTTP/HTTPS, not file://)
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// Launch
document.addEventListener('DOMContentLoaded', init);
