// js/ui.js (consolidado e corrigido)
import { getWeatherIcon } from "./api.js";

/* DOM */
const el = {
  cityInput: document.getElementById("cityInput"),
  searchBtn: document.getElementById("searchBtn"),
  loading: document.getElementById("loading"),
  error: document.getElementById("error"),
  weatherInfo: document.getElementById("weatherInfo"),
  location: document.getElementById("location"),
  temperature: document.getElementById("temperature"),
  humidity: document.getElementById("humidity"),
  windSpeed: document.getElementById("windSpeed"),
  precipitation: document.getElementById("precipitation"),
  pressure: document.getElementById("pressure"),
  forecastContainer: document.getElementById("forecastContainer"),
  canvas: document.getElementById("bg-canvas"),
  suggestions: document.getElementById("suggestions"),
  titleNext7: document.getElementById("titleNext7"),
  titleHourly: document.getElementById("titleHourly"),
  lblHumidity: document.getElementById("lblHumidity"),
  lblWind: document.getElementById("lblWind"),
  lblPrec: document.getElementById("lblPrec"),
  lblPress: document.getElementById("lblPress"),
};

/* Loading/erro */
export function showLoading() {
  el.loading.classList.add("show");
  el.error.classList.remove("show");
  el.weatherInfo.classList.remove("show");
}
export function hideLoading() {
  el.loading.classList.remove("show");
}
export function showError(msg) {
  el.error.textContent = msg;
  el.error.classList.add("show");
  el.weatherInfo.classList.remove("show");
}
export function hideError() {
  el.error.classList.remove("show");
}

/* Tema por WMO */
export function themeFromWMO(code) {
  if (code === 0) return "sunny";
  if ([1, 2, 3, 45, 48].includes(code)) return "cloudy";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return "rainy";
  if ([95, 96, 99].includes(code)) return "storm";
  return "cloudy";
}

/* Datas */
function formatDate(d) {
  const date = new Date(d);
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  return {
    dayName: days[date.getDay()],
    dateFormatted: `${date.getDate()} ${months[date.getMonth()]}`,
  };
}

/* Card diário */
function createForecastCard(dayData, index) {
  const { dayName, dateFormatted } = formatDate(dayData.date);
  const weatherInfo = getWeatherIcon(dayData.weatherCode);
  const label = index === 0 ? "Hoje" : dayName;
  const precip = Number.isFinite(dayData.precipitation)
    ? `${Math.round(dayData.precipitation)}%`
    : "—";
  return `
    <div class="forecast-card">
      <div class="forecast-day">${label}</div>
      <div class="forecast-date">${dateFormatted}</div>
      <div class="forecast-icon">${weatherInfo.icon}</div>
      <div class="forecast-temp-max">${Math.round(dayData.tempMax)}°</div>
      <div class="forecast-temp-min">${Math.round(dayData.tempMin)}°</div>
      <div class="forecast-precipitation">💧 ${precip}</div>
    </div>
  `;
}

/* Render 7 dias */
function displayForecast(daily) {
  const html = daily.time
    .map((date, i) =>
      createForecastCard(
        {
          date,
          weatherCode: daily.weather_code[i],
          tempMax: daily.temperature_2m_max[i],
          tempMin: daily.temperature_2m_min[i],
          precipitation: daily.precipitation_probability_max
            ? daily.precipitation_probability_max[i]
            : null,
        },
        i
      )
    )
    .join("");
  el.forecastContainer.innerHTML = html;
}

/* ===== Canvas Background Animator ===== */
class BackgroundAnimator {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.theme = "sunny";
    this.particles = [];
    this.clouds = [];
    this.running = false;
    this.dropIntensity = 0;
    this.windX = 0;
    this.onResize = this.onResize.bind(this);
    window.addEventListener("resize", this.onResize);
    this.onResize();
  }
  onResize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssW = this.canvas.clientWidth || window.innerWidth;
    const cssH = this.canvas.clientHeight || window.innerHeight;
    this.canvas.width = Math.max(1, Math.floor(cssW * dpr));
    this.canvas.height = Math.max(1, Math.floor(cssH * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  setTheme(theme) {
    this.theme = theme;
    this.particles = [];
    this.clouds = [];
    if (theme === "sunny") this.createClouds(2);
    if (theme === "cloudy") this.createClouds(8);
    if (theme === "rainy") {
      this.dropIntensity = 0.9;
      this.windX = -2.5;
    }
    if (theme === "storm") {
      this.dropIntensity = 1.4;
      this.windX = -4.5;
    }
    if (!this.running) {
      this.running = true;
      requestAnimationFrame(this.loop);
    }
  }
  createClouds(n) {
    const w = this.canvas.clientWidth,
      h = this.canvas.clientHeight;
    for (let i = 0; i < n; i++) {
      this.clouds.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.4,
        w: 220 + Math.random() * 240,
        h: 50 + Math.random() * 32,
        speed: 0.08 + Math.random() * 0.28,
        opacity: 0.22 + Math.random() * 0.25,
      });
    }
  }
  spawnRaindrop() {
    const w = this.canvas.clientWidth;
    const speed = 10 + Math.random() * 12;
    this.particles.push({
      x: Math.random() * w,
      y: -20,
      vy: speed,
      len: 12 + Math.random() * 10,
      alpha: 0.6 + Math.random() * 0.3,
    });
    if (this.particles.length > 900)
      this.particles.splice(0, this.particles.length - 900);
  }
  drawSunny() {
    const { ctx, canvas } = this;
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#87CEFA");
    g.addColorStop(1, "#E6F3FF");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const rg = ctx.createRadialGradient(
      w * 0.16,
      h * 0.2,
      20,
      w * 0.16,
      h * 0.2,
      180
    );
    rg.addColorStop(0, "rgba(255,211,77,0.9)");
    rg.addColorStop(1, "rgba(255,211,77,0)");
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(w * 0.16, h * 0.2, 180, 0, Math.PI * 2);
    ctx.fill();
    this.drawCloudsOverlay(0.05);
  }
  drawCloudsBase() {
    const { ctx, canvas } = this;
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#9fb3c8");
    g.addColorStop(1, "#cfd8dc");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (const c of this.clouds) {
      c.x -= c.speed;
      if (c.x < -c.w - 100) c.x = w + Math.random() * 200;
      ctx.globalAlpha = c.opacity;
      ctx.fillStyle = "white";
      this.roundCloud(c.x, c.y, c.w, c.h);
      ctx.globalAlpha = 1;
    }
  }
  drawRain(darken = false) {
    const ctx = this.ctx,
      w = this.canvas.clientWidth,
      h = this.canvas.clientHeight;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    if (darken) {
      g.addColorStop(0, "#455A64");
      g.addColorStop(1, "#1C2331");
    } else {
      g.addColorStop(0, "#5C6BC0");
      g.addColorStop(1, "#90A4AE");
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const base = (w * h) / (1280 * 720);
    const dropsThisFrame = Math.max(
      8,
      Math.floor(this.dropIntensity * 28 * base)
    );
    for (let i = 0; i < dropsThisFrame; i++) this.spawnRaindrop();
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + this.windX, p.y + p.len);
      p.y += p.vy;
      p.x += this.windX * 0.3;
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    this.particles = this.particles.filter((p) => p.y < h + 40);
  }
  roundCloud(x, y, w, h) {
    const { ctx } = this;
    ctx.beginPath();
    const r1 = h * 0.6,
      r2 = h * 0.7,
      r3 = h * 0.5;
    ctx.arc(x, y, r1, Math.PI * 0.9, Math.PI * 1.7);
    ctx.arc(x + w * 0.25, y - h * 0.1, r2, Math.PI, Math.PI * 1.85);
    ctx.arc(x + w * 0.55, y, r3, Math.PI * 1.1, Math.PI * 0.1, true);
    ctx.closePath();
    ctx.fill();
  }
  drawCloudsOverlay(speed) {
    const { ctx, canvas } = this;
    for (const c of this.clouds) {
      c.x -= speed;
      if (c.x < -c.w - 100) c.x = canvas.clientWidth + Math.random() * 200;
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "white";
      this.roundCloud(c.x, c.y * 1.05, c.w * 0.9, c.h * 0.9);
      ctx.globalAlpha = 1;
    }
  }
  loop = () => {
    const w = this.canvas.clientWidth,
      h = this.canvas.clientHeight;
    this.ctx.clearRect(0, 0, w, h);
    if (this.theme === "sunny") this.drawSunny();
    else if (this.theme === "cloudy") this.drawCloudsBase();
    else if (this.theme === "rainy") this.drawRain(false);
    else if (this.theme === "storm") this.drawRain(true);
    if (this.running) requestAnimationFrame(this.loop);
  };
}

let bgAnimator = null;
export function initBackground() {
  const canvas = el.canvas;
  if (!canvas) return;
  bgAnimator = new BackgroundAnimator(canvas);
  bgAnimator.onResize();
  requestAnimationFrame(() => bgAnimator.setTheme("sunny"));
}
export function setThemeBackground(theme) {
  if (!bgAnimator) return;
  bgAnimator.setTheme(theme);
}

/* Helpers de unidades */
function tempUnit() {
  return (localStorage.getItem("skyview:units") || "metric") === "imperial"
    ? "°F"
    : "°C";
}
function windUnit() {
  return (localStorage.getItem("skyview:units") || "metric") === "imperial"
    ? "mph"
    : "km/h";
}
function precipUnit() {
  return (localStorage.getItem("skyview:units") || "metric") === "imperial"
    ? "in"
    : "mm";
}

/* Exibir dados e tema (única) */
export function displayWeather(data) {
  const { location, current, daily } = data;
  const theme = themeFromWMO(current.weather_code);
  setThemeBackground(theme);

  const locText = `${location.name}${
    location.admin1 ? ", " + location.admin1 : ""
  }${location.country ? ", " + location.country : ""}`;
  el.location.textContent = locText;

  el.temperature.textContent = `${Math.round(
    current.temperature_2m
  )}${tempUnit()}`;
  el.humidity.textContent = `${current.relative_humidity_2m}%`;
  el.windSpeed.textContent = `${Math.round(
    current.wind_speed_10m
  )} ${windUnit()}`;
  el.precipitation.textContent = `${current.precipitation} ${precipUnit()}`;
  el.pressure.textContent = `${Math.round(current.pressure_msl)} hPa`;

  displayForecast(daily);
  el.weatherInfo.classList.add("show");
}

/* Hourly mini-charts (com re-render em resize) */
let lastHourly = null;
function drawLine(canvasId, labels, values, color, minPad = 6) {
  const c = document.getElementById(canvasId);
  if (!c) return;
  const ctx = c.getContext("2d");
  const W = Math.max(c.clientWidth, labels.length * 24);
  c.width = W;
  c.height = c.height;
  const H = c.height;
  const min = Math.min(...values),
    max = Math.max(...values);
  const range = Math.max(1, max - min);
  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = "#eef2ff";
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = i * (W / (values.length - 1));
    const y = H - ((v - min) / range) * (H - minPad) - 2;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}
export function renderHourly(hourly) {
  if (!hourly || !hourly.time) return;
  lastHourly = hourly;
  const hours = hourly.time.slice(0, 24).map((t) => new Date(t).getHours());
  const temps = hourly.temperature_2m.slice(0, 24).map((v) => Math.round(v));
  const rains = (hourly.precipitation_probability || [])
    .slice(0, 24)
    .map((v) => v ?? 0);
  drawLine("hourlyTemp", hours, temps, "#667eea");
  drawLine("hourlyRain", hours, rains, "#22c55e");
}
window.addEventListener("resize", () => {
  if (lastHourly) renderHourly(lastHourly);
});

/* Alertas (chuva próxima e UV alto) */
export function renderAlerts(hourly) {
  const box = document.getElementById("alerts");
  if (!box) return;
  box.innerHTML = "";
  if (!hourly || !hourly.time) return;
  const next6 = hourly.time.slice(0, 6).map((t, i) => ({
    prob: (hourly.precipitation_probability || [])[i] ?? 0,
    uv: (hourly.uv_index || [])[i] ?? 0,
  }));
  const rainSoon = next6.some((h) => (h.prob || 0) >= 60);
  const uvHigh = next6.some((h) => (h.uv || 0) >= 6);
  if (rainSoon) {
    const item = document.createElement("div");
    item.className = "alert";
    item.textContent = "🌧️ Chuva provável nas próximas horas";
    box.appendChild(item);
  }
  if (uvHigh) {
    const item = document.createElement("div");
    item.className = "alert";
    item.textContent = "☀️ Índice UV alto — use protetor solar";
    box.appendChild(item);
  }
}

/* ----- Tip engine ----- */
const TIPS = {
  uv: [
    "Use protetor solar de amplo espectro e reaplique a cada 2 horas.",
    "Óculos com proteção UV reduzem danos oculares.",
    "Prefira sombra entre 10h e 16h para reduzir exposição.",
  ],
  rain: [
    "Leve guarda-chuva ou capa; tênis impermeável ajuda.",
    "Planeje rotas cobertas e reserve tempo extra.",
    "Proteja eletrônicos em sacos zip ou compartimentos impermeáveis.",
  ],
  wind: [
    "Prefira jaqueta corta‑vento e evite guarda-chuva frágil.",
    "Atenção a objetos soltos em varandas e janelas.",
    "Ciclistas: reduza a área frontal e ajuste a trajetória.",
  ],
  cold: [
    "Use camadas: base térmica, isolante e corta‑vento.",
    "Hidrate-se e proteja extremidades (mãos, pés, orelhas).",
    "Bebidas quentes ajudam a manter o conforto térmico.",
  ],
  heat: [
    "Beba água regularmente e evite sol prolongado.",
    "Roupas leves e claras ajudam na dissipação do calor.",
    "Evite exercícios intensos nos horários de pico.",
  ],
  night: [
    "Leve uma camada extra: à noite costuma esfriar.",
    "Cheque nascer/pôr do sol para planejar atividades.",
    "Use iluminação adequada em deslocamentos noturnos.",
  ],
  clear: [
    "Dia aberto: ótimo para atividades ao ar livre.",
    "Aproveite para ventilar a casa.",
    "Boa luz natural para fotos cedo de manhã.",
  ],
};
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function buildTipContext(current, hourly) {
  const nowHour = new Date().getHours();
  const uvNext = hourly?.uv_index?.[0] ?? 0;
  const rainProbNext = hourly?.precipitation_probability?.[0] ?? 0;
  const wind = current?.wind_speed_10m ?? 0;
  const temp = current?.temperature_2m ?? 0;
  const code = current?.weather_code ?? 0;
  const night = nowHour >= 19 || nowHour < 6;
  return { uvNext, rainProbNext, wind, temp, code, night };
}
function categoryFromContext(ctx) {
  if (ctx.rainProbNext >= 60) return "rain";
  if (ctx.uvNext >= 6 && !ctx.night) return "uv";
  if (
    ctx.wind >=
    ((localStorage.getItem("skyview:units") || "metric") === "imperial"
      ? 18
      : 30)
  )
    return "wind";
  if (
    ctx.temp <=
    ((localStorage.getItem("skyview:units") || "metric") === "imperial"
      ? 50
      : 10)
  )
    return "cold";
  if (
    ctx.temp >=
    ((localStorage.getItem("skyview:units") || "metric") === "imperial"
      ? 86
      : 30)
  )
    return "heat";
  if (ctx.night) return "night";
  if ([0, 1].includes(ctx.code)) return "clear";
  return "clear";
}
export function showTip(current, hourly) {
  const card = document.getElementById("tipCard");
  const text = document.getElementById("tipText");
  const next = document.getElementById("tipNext");
  const close = document.getElementById("tipClose");
  if (!card || !text || !next || !close) return;
  const ctx = buildTipContext(current, hourly);
  let cat = categoryFromContext(ctx);
  let tip = pick(TIPS[cat]);
  text.textContent = tip;
  card.hidden = false;
  next.onclick = () => {
    let newTip;
    do {
      newTip = pick(TIPS[cat]);
    } while (newTip === tip && TIPS[cat].length > 1);
    tip = newTip;
    text.textContent = tip;
  };
  close.onclick = () => {
    card.hidden = true;
  };
}

/* Helpers */
export function getCityInput() {
  return el.cityInput.value.trim();
}
export function clearCityInput() {
  el.cityInput.value = "";
}
export function getElements() {
  return el;
}
